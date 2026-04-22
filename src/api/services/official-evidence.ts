import path from "node:path";
import { Prisma } from "@prisma/client";
import { db } from "../../lib/db.js";
import { certificationSources } from "../../lib/certification-sources.js";
import { normalizeLookupKey } from "../../engine/claim-classifier.js";
import type {
  CertificationEvidenceStatus,
  CertificationSourceEntry,
  CertificationSourceRegistryPayload,
  EvidenceFreshness,
  EvidenceLookupMode,
  OfficialEvidenceItem,
  OfficialEvidenceSummary,
  ProductSourceDetails
} from "../../types/index.js";
import type { ProductWithRelations } from "./verification-data.js";
import {
  createOfficialEvidenceConnector,
  type ConnectorEvidenceRecord,
  type OfficialCertificationConnector,
  type OfficialEvidenceConnectorFactoryOptions,
  type SourceSector
} from "./official-evidence-connectors.js";

const EVIDENCE_STALE_WINDOW_MS = 1000 * 60 * 60 * 24 * 30;
const DEFAULT_RUNTIME_SNAPSHOT_DIRECTORY = path.resolve("data", "official-evidence-snapshots");
const REQUEST_TIME_SOURCE_IDS_BY_SECTOR: Record<SourceSector, string[]> = {
  cosmetics: [
    "cosmetics-made-safe",
    "cosmetics-ewg-verified",
    "cosmetics-leaping-bunny",
    "cosmetics-cosmos-ecocert",
    "cosmetics-usda-organic"
  ],
  fashion: [
    "fashion-gots",
    "fashion-oeko-tex",
    "fashion-fairtrade-textile",
    "fashion-grs"
  ],
  household: [
    "household-green-seal",
    "household-epa-safer-choice",
    "household-ecologo",
    "household-usda-biobased"
  ]
};
const CROSS_SECTOR_REQUEST_TIME_SOURCE_IDS = [
  "cosmetics-made-safe",
  "cosmetics-ewg-verified",
  "cosmetics-leaping-bunny",
  "fashion-gots",
  "household-green-seal",
  "household-epa-safer-choice"
];

interface MatchContext {
  brandId: number | null;
  productId: number | null;
  matchedVia: string;
  confidence: number;
  status: CertificationEvidenceStatus;
}

interface SummaryBuildOptions {
  consultedSources?: string[];
  lastCheckedAt?: string | null;
  freshness?: EvidenceFreshness;
}

export interface OfficialProductDiscoveryCandidate {
  brandName: string;
  existingBrandId: number | null;
  productName: string;
  category: string;
  description: string;
  claimTexts: string[];
  sourceUrl: string | null;
  sourceDetails: ProductSourceDetails;
  productEvidenceIds: number[];
  brandEvidenceIds: number[];
}

type EvidenceRow = Prisma.CertificationEvidenceGetPayload<{
  include: {
    source: true;
    certification: true;
  };
}>;

type BrandMatchGraph = Array<
  Prisma.BrandGetPayload<{
    include: {
      brandAliases: true;
      products: {
        include: {
          productAliases: true;
        };
      };
    };
  }>
>;

export interface OfficialEvidenceServiceOptions extends OfficialEvidenceConnectorFactoryOptions {}

/**
 * Coordinates source registry sync, official evidence ingestion, product-miss lookup, and
 * projection back into the scorer-ready certification join tables.
 */
export class OfficialEvidenceService {
  private readonly connectors = new Map<string, OfficialCertificationConnector>();

  public constructor(options: OfficialEvidenceServiceOptions = {}) {
    const resolvedOptions: OfficialEvidenceServiceOptions = {
      ...(options.snapshotDirectory !== undefined
        ? {
            snapshotDirectory: options.snapshotDirectory
          }
        : {
            snapshotDirectory: process.env.OFFICIAL_EVIDENCE_SNAPSHOT_DIR ?? DEFAULT_RUNTIME_SNAPSHOT_DIRECTORY
          }),
      ...(options.remoteBaseUrl !== undefined
        ? {
            remoteBaseUrl: options.remoteBaseUrl
          }
        : process.env.OFFICIAL_EVIDENCE_REMOTE_BASE_URL
          ? {
              remoteBaseUrl: process.env.OFFICIAL_EVIDENCE_REMOTE_BASE_URL
            }
          : {}),
      ...(options.fetchImpl
        ? {
            fetchImpl: options.fetchImpl
          }
        : typeof fetch === "function"
          ? {
              fetchImpl: fetch
            }
          : {})
    };

    for (const source of certificationSources) {
      this.connectors.set(source.id, createOfficialEvidenceConnector(source, resolvedOptions));
    }
  }

  public buildEmptySummary(): OfficialEvidenceSummary {
    return {
      lookup: "none_found",
      freshness: "unavailable",
      consultedSources: [],
      productEvidence: [],
      brandEvidence: []
    };
  }

  public async listCertificationSources(): Promise<CertificationSourceRegistryPayload> {
    await this.ensureSourceRegistry();
    const entries = await db.certificationSource.findMany({
      orderBy: [{ sector: "asc" }, { priority: "asc" }, { certificationName: "asc" }]
    });
    const typedEntries: CertificationSourceEntry[] = entries.map((entry) => ({
      id: entry.id,
      sector: entry.sector as SourceSector,
      certificationName: entry.certificationName,
      databaseUrl: entry.databaseUrl,
      ...(entry.liveFetchUrl ? { liveFetchUrl: entry.liveFetchUrl } : {}),
      access: entry.access,
      notes: entry.notes,
      ...(entry.coverageHint ? { coverageHint: entry.coverageHint } : {}),
      isOfficial: entry.isOfficial,
      isSupported: entry.isSupported,
      wave: entry.wave,
      priority: entry.priority
    }));
    const bySector = typedEntries.reduce<Record<string, number>>((totals, entry) => {
      totals[entry.sector] = (totals[entry.sector] ?? 0) + 1;
      return totals;
    }, {});

    return {
      totalSources: typedEntries.length,
      bySector,
      entries: typedEntries
    };
  }

  public async ingestAllSources() {
    await this.ensureSourceRegistry();
    const results = [];

    for (const source of certificationSources.filter((entry) => entry.isSupported)) {
      results.push(await this.ingestSource(source.id));
    }

    return results;
  }

  public async ingestSector(sector: SourceSector) {
    await this.ensureSourceRegistry();
    const results = [];

    for (const source of certificationSources.filter((entry) => entry.isSupported && entry.sector === sector)) {
      results.push(await this.ingestSource(source.id));
    }

    return results;
  }

  public async ingestSource(sourceId: string) {
    await this.ensureSourceRegistry();
    const source = await db.certificationSource.findUnique({
      where: {
        id: sourceId
      }
    });

    if (!source) {
      throw new Error(`Unknown certification source: ${sourceId}`);
    }

    const run = await db.certificationIngestionRun.create({
      data: {
        sourceId,
        sector: source.sector,
        mode: "bulk_import",
        status: "running"
      }
    });

    try {
      const connector = this.connectors.get(sourceId);

      if (!connector) {
        throw new Error(`No connector registered for certification source: ${sourceId}`);
      }
      const records = await connector.bulkImport();
      const persisted = await this.persistSourceRecords(sourceId, records, run.id);
      const projected = await this.projectEvidenceRows(persisted.matchedEvidenceIds);

      return db.certificationIngestionRun.update({
        where: {
          id: run.id
        },
        data: {
          status: "completed",
          recordsFetched: records.length,
          recordsMatched: persisted.matchedCount,
          recordsProjected: projected,
          finishedAt: new Date()
        }
      });
    } catch (error) {
      await db.certificationIngestionRun.update({
        where: {
          id: run.id
        },
        data: {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown ingestion error",
          finishedAt: new Date()
        }
      });
      throw error;
    }
  }

  public async resolveEvidenceForProduct(product: ProductWithRelations): Promise<OfficialEvidenceSummary> {
    const existingRows = await this.loadEvidenceRows(product.id, product.brandId);
    return existingRows.length > 0 ? this.buildSummary(existingRows, "cached") : this.buildEmptySummary();
  }

  public async discoverProductByQuery(query: string): Promise<OfficialProductDiscoveryCandidate | null> {
    const normalizedQuery = normalizeLookupKey(query);

    if (!normalizedQuery) {
      return null;
    }

    const preferredSector = this.inferSector(query);
    let evidenceRows = await this.loadDiscoveryRows();
    let bestCandidate = this.pickBestDiscoveryCandidate(evidenceRows, normalizedQuery, preferredSector);

    if (!bestCandidate) {
      const relevantSources = await this.loadLookupSources(preferredSector);
      await this.runLookupAcrossSources(
        normalizedQuery,
        relevantSources,
        {
          brandName: query,
          productName: query,
          sector: preferredSector ?? "cosmetics"
        },
        preferredSector ?? "cross-sector"
      );
      evidenceRows = await this.loadDiscoveryRows();
      bestCandidate = this.pickBestDiscoveryCandidate(evidenceRows, normalizedQuery, preferredSector);
    }

    if (!bestCandidate) {
      return null;
    }

    const relatedBrandRows = await db.certificationEvidence.findMany({
      where: {
        scope: "brand",
        status: "verified",
        externalBrandName: bestCandidate.brandName,
        brandId: null
      },
      include: {
        source: true,
        certification: true
      },
      orderBy: [{ checkedAt: "desc" }, { confidence: "desc" }]
    });
    const certificationLabels = [
      ...new Set(
        [...bestCandidate.rows, ...relatedBrandRows].map((row) => row.certification.name).filter((label) => label.trim().length > 0)
      )
    ];
    const sourceUrl = bestCandidate.rows.find((row) => row.sourceUrl)?.sourceUrl ?? null;

    return {
      brandName: bestCandidate.brandName,
      existingBrandId: bestCandidate.existingBrandId,
      productName: bestCandidate.productName,
      category: this.mapSectorToCategory(bestCandidate.sector),
      description: this.buildDiscoveryDescription(
        bestCandidate.brandName,
        bestCandidate.productName,
        certificationLabels
      ),
      claimTexts: this.buildDiscoveryClaims([...bestCandidate.rows, ...relatedBrandRows]),
      sourceUrl,
      sourceDetails: {
        label: "Official Evidence Import",
        ...(sourceUrl ? { productUrl: sourceUrl } : {}),
        ...(certificationLabels.length > 0 ? { labels: certificationLabels } : {})
      },
      productEvidenceIds: bestCandidate.rows.map((row) => row.id),
      brandEvidenceIds: relatedBrandRows.map((row) => row.id)
    };
  }

  public async linkEvidenceToImportedProduct(
    productId: number,
    brandId: number,
    candidate: Pick<OfficialProductDiscoveryCandidate, "productEvidenceIds" | "brandEvidenceIds">
  ): Promise<void> {
    if (candidate.productEvidenceIds.length > 0) {
      await db.certificationEvidence.updateMany({
        where: {
          id: {
            in: candidate.productEvidenceIds
          }
        },
        data: {
          productId,
          brandId,
          matchedVia: "official_discovery",
          confidence: 0.93,
          status: "verified"
        }
      });
    }

    if (candidate.brandEvidenceIds.length > 0) {
      await db.certificationEvidence.updateMany({
        where: {
          id: {
            in: candidate.brandEvidenceIds
          }
        },
        data: {
          brandId,
          matchedVia: "official_discovery",
          confidence: 0.91,
          status: "verified"
        }
      });
    }

    await this.projectEvidenceRows([...candidate.productEvidenceIds, ...candidate.brandEvidenceIds]);
  }

  private async ensureSourceRegistry() {
    for (const source of certificationSources) {
      await db.certificationSource.upsert({
        where: {
          id: source.id
        },
        update: {
          sector: source.sector,
          certificationName: source.certificationName,
          databaseUrl: source.databaseUrl,
          liveFetchUrl: source.liveFetchUrl ?? null,
          access: source.access,
          notes: source.notes,
          coverageHint: source.coverageHint ?? null,
          isOfficial: source.isOfficial,
          isSupported: source.isSupported,
          wave: source.wave,
          priority: source.priority
        },
        create: {
          id: source.id,
          sector: source.sector,
          certificationName: source.certificationName,
          databaseUrl: source.databaseUrl,
          liveFetchUrl: source.liveFetchUrl ?? null,
          access: source.access,
          notes: source.notes,
          coverageHint: source.coverageHint ?? null,
          isOfficial: source.isOfficial,
          isSupported: source.isSupported,
          wave: source.wave,
          priority: source.priority
        }
      });
    }
  }

  private async persistSourceRecords(sourceId: string, records: ConnectorEvidenceRecord[], ingestionRunId: number) {
    const certificationCatalog = await db.certification.findMany();
    const certificationIdByAcronym = new Map(certificationCatalog.map((entry) => [entry.acronym, entry.id]));
    const matchedEvidenceIds: number[] = [];
    let matchedCount = 0;

    for (const record of records) {
      const certificationId = certificationIdByAcronym.get(record.certificationAcronym);

      if (!certificationId) {
        continue;
      }

      const existingRow = await db.certificationEvidence.findFirst({
        where: {
          sourceId,
          certificationId,
          scope: record.scope,
          externalBrandName: record.externalBrandName,
          externalProductName: record.externalProductName ?? null
        }
      });
      const rawMatchContext = await this.matchEvidenceRecord(record);
      const matchContext = this.chooseStrongerMatchContext(
        existingRow
          ? {
              brandId: existingRow.brandId,
              productId: existingRow.productId,
              matchedVia: existingRow.matchedVia,
              confidence: existingRow.confidence,
              status: existingRow.status
            }
          : null,
        rawMatchContext
      );
      const effectiveStatus =
        record.expiresAt && new Date(record.expiresAt).getTime() < Date.now() ? "expired" : matchContext.status;
      const data = {
        sourceId,
        certificationId,
        scope: record.scope,
        status: effectiveStatus,
        matchedVia: matchContext.matchedVia,
        confidence: matchContext.confidence,
        externalBrandName: record.externalBrandName,
        externalProductName: record.externalProductName ?? null,
        certificateNumber: record.certificateNumber ?? null,
        sourceUrl: record.sourceUrl ?? null,
        rawPayload: (record.rawPayload ?? {}) as Prisma.InputJsonValue,
        checkedAt: new Date(record.checkedAt),
        expiresAt: record.expiresAt ? new Date(record.expiresAt) : null,
        brandId: matchContext.brandId,
        productId: matchContext.productId,
        ingestionRunId
      };

      const evidence = existingRow
        ? await db.certificationEvidence
            .update({
              where: {
                id: existingRow.id
              },
              data
            })
            .catch(() =>
              db.certificationEvidence.create({
                data
              })
            )
        : await db.certificationEvidence.create({
            data
          });

      if (matchContext.brandId || matchContext.productId) {
        matchedCount += 1;
        matchedEvidenceIds.push(evidence.id);
      }
    }

    return {
      matchedCount,
      matchedEvidenceIds
    };
  }

  private async projectEvidenceRows(evidenceIds: number[]): Promise<number> {
    if (evidenceIds.length === 0) {
      return 0;
    }

    const evidenceRows = await db.certificationEvidence.findMany({
      where: {
        id: {
          in: evidenceIds
        },
        status: "verified"
      }
    });
    let projected = 0;

    for (const evidence of evidenceRows) {
      if (evidence.scope === "product" && evidence.productId) {
        await db.productCertification.upsert({
          where: {
            productId_certificationId: {
              productId: evidence.productId,
              certificationId: evidence.certificationId
            }
          },
          update: {
            certificateNumber: evidence.certificateNumber,
            isVerified: true
          },
          create: {
            productId: evidence.productId,
            certificationId: evidence.certificationId,
            certificateNumber: evidence.certificateNumber,
            isVerified: true
          }
        });
        projected += 1;
        continue;
      }

      if (evidence.scope === "brand" && evidence.brandId) {
        await db.brandCertification.upsert({
          where: {
            brandId_certificationId: {
              brandId: evidence.brandId,
              certificationId: evidence.certificationId
            }
          },
          update: {
            certificateNumber: evidence.certificateNumber,
            isValid: true,
            expiryDate: evidence.expiresAt
          },
          create: {
            brandId: evidence.brandId,
            certificationId: evidence.certificationId,
            certificateNumber: evidence.certificateNumber,
            isValid: true,
            expiryDate: evidence.expiresAt
          }
        });
        projected += 1;
      }
    }

    return projected;
  }

  private async loadEvidenceRows(productId: number, brandId: number): Promise<EvidenceRow[]> {
    return db.certificationEvidence.findMany({
      where: {
        OR: [{ productId }, { brandId }]
      },
      include: {
        source: true,
        certification: true
      },
      orderBy: [{ checkedAt: "desc" }, { confidence: "desc" }]
    });
  }

  private async loadDiscoveryRows(): Promise<EvidenceRow[]> {
    return db.certificationEvidence.findMany({
      where: {
        scope: "product",
        status: "verified",
        productId: null,
        externalProductName: {
          not: null
        }
      },
      include: {
        source: true,
        certification: true
      },
      orderBy: [{ checkedAt: "desc" }, { confidence: "desc" }]
    });
  }

  private async loadLookupSources(preferredSector: SourceSector | null) {
    const requestTimeSourceIds = preferredSector
      ? REQUEST_TIME_SOURCE_IDS_BY_SECTOR[preferredSector]
      : CROSS_SECTOR_REQUEST_TIME_SOURCE_IDS;

    let sources = await db.certificationSource.findMany({
      where: {
        id: {
          in: requestTimeSourceIds
        }
      },
      orderBy: [{ priority: "asc" }, { certificationName: "asc" }]
    });

    if (sources.length === 0) {
      await this.ensureSourceRegistry();
      sources = await db.certificationSource.findMany({
        where: {
          id: {
            in: requestTimeSourceIds
          }
        },
        orderBy: [{ priority: "asc" }, { certificationName: "asc" }]
      });
    }
    const sourceOrder = new Map(requestTimeSourceIds.map((sourceId, index) => [sourceId, index]));

    return sources.sort((leftSource, rightSource) => {
      const leftOrder = sourceOrder.get(leftSource.id) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = sourceOrder.get(rightSource.id) ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return leftSource.priority - rightSource.priority;
    });
  }

  private async runLookupAcrossSources(
    lookupQuery: string,
    sources: Prisma.CertificationSourceGetPayload<Record<string, never>>[],
    context: {
      brandName: string;
      productName: string;
      sector: SourceSector;
    },
    recentLookupSector: string,
    options: {
      recordRuns?: boolean;
    } = {}
  ) {
    const shouldRecordRuns = options.recordRuns ?? false;
    const recentLookupRuns = shouldRecordRuns
      ? await this.loadRecentLookupRuns(
          sources.map((source) => source.id),
          recentLookupSector,
          lookupQuery
        )
      : new Map<string, Prisma.CertificationIngestionRunGetPayload<Record<string, never>>>();
    let consultedAnySource = false;
    let skippedSourceLabels: string[] = [];
    let latestSkippedLookupAt: string | null = null;

    for (const source of sources) {
      const connector = this.connectors.get(source.id);

      if (!connector) {
        continue;
      }

      const recentLookupRun = recentLookupRuns.get(source.id);
      if (this.shouldSkipRecentLookup(recentLookupRun)) {
        skippedSourceLabels = [...new Set([...skippedSourceLabels, source.certificationName])];
        latestSkippedLookupAt = this.pickLatestIsoTimestamp(
          latestSkippedLookupAt,
          recentLookupRun?.finishedAt?.toISOString() ?? recentLookupRun?.startedAt.toISOString() ?? null
        );
        continue;
      }

      consultedAnySource = true;
      const run = shouldRecordRuns
        ? await db.certificationIngestionRun.create({
            data: {
              sourceId: source.id,
              sector: recentLookupSector,
              mode: "lookup",
              status: "running",
              query: lookupQuery
            }
          })
        : null;

      try {
        const records = await connector.lookup(lookupQuery, context);
        const persisted = run ? await this.persistSourceRecords(source.id, records, run.id) : null;
        const projected = persisted ? await this.projectEvidenceRows(persisted.matchedEvidenceIds) : 0;

        if (run) {
          await db.certificationIngestionRun.update({
            where: {
              id: run.id
            },
            data: {
              status: "completed",
              recordsFetched: records.length,
              recordsMatched: persisted?.matchedCount ?? 0,
              recordsProjected: projected,
              finishedAt: new Date()
            }
          });
        }

        if (!run && records.length > 0) {
          const transientRun = await db.certificationIngestionRun.create({
            data: {
              sourceId: source.id,
              sector: recentLookupSector,
              mode: "lookup",
              status: "completed",
              query: lookupQuery,
              recordsFetched: records.length,
              recordsMatched: 0,
              recordsProjected: 0,
              finishedAt: new Date()
            }
          });
          const persistedFromTransientRun = await this.persistSourceRecords(source.id, records, transientRun.id);
          const projectedFromTransientRun = await this.projectEvidenceRows(persistedFromTransientRun.matchedEvidenceIds);
          await db.certificationIngestionRun.update({
            where: {
              id: transientRun.id
            },
            data: {
              recordsMatched: persistedFromTransientRun.matchedCount,
              recordsProjected: projectedFromTransientRun
            }
          });
        }
      } catch (error) {
        if (run) {
          await db.certificationIngestionRun.update({
            where: {
              id: run.id
            },
            data: {
              status: "failed",
              errorMessage: error instanceof Error ? error.message : "Lookup failed",
              finishedAt: new Date()
            }
          });
        }
      }
    }

    return {
      consultedAnySource,
      skippedSourceLabels,
      latestSkippedLookupAt
    };
  }

  private async loadRecentLookupRuns(sourceIds: string[], sector: string, normalizedQuery: string) {
    const cutoff = new Date(Date.now() - EVIDENCE_STALE_WINDOW_MS);
    const recentRuns = await db.certificationIngestionRun.findMany({
      where: {
        sourceId: {
          in: sourceIds
        },
        sector,
        mode: "lookup",
        status: "completed",
        query: normalizedQuery,
        startedAt: {
          gte: cutoff
        }
      },
      orderBy: [{ sourceId: "asc" }, { startedAt: "desc" }]
    });
    const runsBySource = new Map<string, (typeof recentRuns)[number]>();

    for (const run of recentRuns) {
      if (run.sourceId && !runsBySource.has(run.sourceId)) {
        runsBySource.set(run.sourceId, run);
      }
    }

    return runsBySource;
  }

  private shouldSkipRecentLookup(
    recentRun:
      | Prisma.CertificationIngestionRunGetPayload<Record<string, never>>
      | undefined
  ): boolean {
    return Boolean(recentRun);
  }

  private pickBestDiscoveryCandidate(
    evidenceRows: EvidenceRow[],
    normalizedQuery: string,
    preferredSector: SourceSector | null
  ) {
    const groupedCandidates = new Map<
      string,
      {
        brandName: string;
        productName: string;
        sector: SourceSector;
        rows: EvidenceRow[];
        score: number;
        existingBrandId: number | null;
      }
    >();

    for (const row of evidenceRows) {
      const productName = row.externalProductName?.trim();
      const sector = row.source.sector as SourceSector;

      if (!productName) {
        continue;
      }

      const key = `${normalizeLookupKey(row.externalBrandName)}::${normalizeLookupKey(productName)}`;
      const existingCandidate = groupedCandidates.get(key);

      if (existingCandidate) {
        existingCandidate.rows.push(row);
        if (row.brandId && !existingCandidate.existingBrandId) {
          existingCandidate.existingBrandId = row.brandId;
        }
        continue;
      }

      groupedCandidates.set(key, {
        brandName: row.externalBrandName,
        productName,
        sector,
        rows: [row],
        score: this.scoreDiscoveryCandidate(
          row.externalBrandName,
          productName,
          normalizedQuery,
          sector,
          preferredSector
        ),
        existingBrandId: row.brandId
      });
    }

    return (
      [...groupedCandidates.values()]
        .filter((candidate) => candidate.score >= 105)
        .sort((leftCandidate, rightCandidate) => {
          if (leftCandidate.score !== rightCandidate.score) {
            return rightCandidate.score - leftCandidate.score;
          }

          return rightCandidate.rows.length - leftCandidate.rows.length;
        })[0] ?? null
    );
  }

  private hasFreshStrongEvidence(rows: EvidenceRow[]): boolean {
    return rows.some(
      (row) =>
        row.status === "verified" &&
        this.isFresh(row.checkedAt) &&
        (row.productId !== null || row.brandId !== null)
    );
  }

  private isFresh(checkedAt: Date): boolean {
    return Date.now() - checkedAt.getTime() <= EVIDENCE_STALE_WINDOW_MS;
  }

  private buildSummary(
    rows: EvidenceRow[],
    lookup: EvidenceLookupMode,
    options?: SummaryBuildOptions
  ): OfficialEvidenceSummary {
    const lastCheckedAt = rows[0]?.checkedAt.toISOString() ?? options?.lastCheckedAt ?? null;
    const freshness: EvidenceFreshness =
      options?.freshness ??
      (!lastCheckedAt
        ? "unavailable"
        : this.isFresh(new Date(lastCheckedAt))
          ? "fresh"
          : "stale");
    const normalizedConsultedSources =
      options?.consultedSources && options.consultedSources.length > 0
        ? options.consultedSources
        : [...new Set(rows.map((row) => row.source.certificationName))];

    return {
      lookup: rows.length === 0 ? "none_found" : lookup,
      freshness,
      ...(lastCheckedAt ? { lastCheckedAt } : {}),
      consultedSources: normalizedConsultedSources,
      productEvidence: rows
        .filter((row) => row.scope === "product")
        .map((row) => this.serializeEvidence(row)),
      brandEvidence: rows
        .filter((row) => row.scope === "brand")
        .map((row) => this.serializeEvidence(row))
    };
  }

  private pickLatestIsoTimestamp(currentValue: string | null, candidate: string | null): string | null {
    if (!candidate) {
      return currentValue;
    }

    if (!currentValue) {
      return candidate;
    }

    return new Date(candidate).getTime() > new Date(currentValue).getTime() ? candidate : currentValue;
  }

  private serializeEvidence(row: EvidenceRow): OfficialEvidenceItem {
    const isProjected =
      row.scope === "product"
        ? row.productId !== null
        : row.brandId !== null;

    return {
      id: row.id,
      sourceId: row.sourceId,
      sourceLabel: row.source.certificationName,
      certificationId: row.certificationId,
      certificationName: row.certification.name,
      certificationAcronym: row.certification.acronym,
      issuingBody: row.certification.issuingBody,
      scope: row.scope as "product" | "brand",
      status: row.status as CertificationEvidenceStatus,
      confidence: Number(row.confidence.toFixed(2)),
      matchedVia: row.matchedVia,
      ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}),
      ...(row.certificateNumber ? { certificateNumber: row.certificateNumber } : {}),
      externalBrandName: row.externalBrandName,
      ...(row.externalProductName ? { externalProductName: row.externalProductName } : {}),
      checkedAt: row.checkedAt.toISOString(),
      ...(row.expiresAt ? { expiresAt: row.expiresAt.toISOString() } : {}),
      rawPayload:
        row.rawPayload && typeof row.rawPayload === "object" && !Array.isArray(row.rawPayload)
          ? (row.rawPayload as Record<string, unknown>)
          : null,
      isProjected
    };
  }

  private scoreDiscoveryCandidate(
    brandName: string,
    productName: string,
    normalizedQuery: string,
    sector: SourceSector,
    preferredSector: SourceSector | null
  ): number {
    const normalizedBrand = normalizeLookupKey(brandName);
    const normalizedProduct = normalizeLookupKey(productName);
    const normalizedComposite = normalizeLookupKey(`${brandName} ${productName}`);
    let score = 0;

    if (normalizedProduct === normalizedQuery) {
      score += 150;
    }

    if (normalizedComposite === normalizedQuery) {
      score += 170;
    }

    if (normalizedProduct.includes(normalizedQuery) || normalizedQuery.includes(normalizedProduct)) {
      score += 110;
    }

    if (normalizedComposite.includes(normalizedQuery) || normalizedQuery.includes(normalizedComposite)) {
      score += 95;
    }

    if (normalizedBrand && normalizedQuery.includes(normalizedBrand)) {
      score += 12;
    }

    score += Math.round(this.calculateSimilarity(normalizedProduct, normalizedQuery) * 80);
    score += Math.round(this.calculateSimilarity(normalizedComposite, normalizedQuery) * 60);

    if (preferredSector && preferredSector === sector) {
      score += 18;
    }

    return score;
  }

  private mapSectorToCategory(sector: SourceSector): string {
    switch (sector) {
      case "cosmetics":
        return "Beauty";
      case "household":
        return "Household";
      case "fashion":
        return "Apparel";
      default:
        return "General";
    }
  }

  private buildDiscoveryDescription(
    brandName: string,
    productName: string,
    certificationLabels: string[]
  ): string {
    const certificationSummary =
      certificationLabels.length === 0
        ? "official certification evidence"
        : `${certificationLabels.join(", ")} evidence`;

    return `${productName} by ${brandName}. Imported from official ${certificationSummary}.`;
  }

  private buildDiscoveryClaims(rows: EvidenceRow[]): string[] {
    const claims = new Set<string>();

    for (const row of rows) {
      switch (row.certification.acronym) {
        case "USDA":
          claims.add("certified organic");
          break;
        case "FTC":
          claims.add("fair trade");
          break;
        case "LB":
          claims.add("cruelty-free");
          claims.add("Leaping Bunny");
          break;
        case "OEKO":
          claims.add("OEKO-TEX");
          break;
        case "BLS":
          claims.add("bluesign approved");
          break;
        case "VEG":
          claims.add("vegan");
          break;
        case "MSAFE":
          claims.add("Made Safe Certified");
          break;
        case "GRS":
          claims.add("recycled");
          claims.add("Global Recycled Standard");
          break;
        case "ROC":
          claims.add("regenerative organic");
          break;
        case "CTS":
          claims.add("carbon neutral");
          break;
        case "EWG":
          claims.add("EWG Verified");
          break;
        case "GS":
          claims.add("Green Seal");
          break;
        case "COSMOS":
          claims.add("COSMOS Organic");
          break;
        case "ECO":
          claims.add("ECOLOGO");
          break;
        case "PETA":
          claims.add("PETA cruelty-free");
          break;
        case "BCI":
          claims.add("Better Cotton");
          break;
        case "NSF":
          claims.add("NSF Certified");
          break;
        case "DFE":
          claims.add("Design for the Environment");
          break;
        case "BIO":
          claims.add("USDA Biobased");
          break;
      }

      claims.add(row.certification.name);
    }

    return [...claims];
  }

  private inferSector(category: string): SourceSector | null {
    const normalizedCategory = normalizeLookupKey(category);

    if (
      /\b(beauty|cosmetic|cosmetics|skin|skincare|hair|personal care|face wash|cleanser|serum|shampoo|conditioner|sunscreen|moisturizer|body wash)\b/i.test(
        normalizedCategory
      )
    ) {
      return "cosmetics";
    }

    if (/\b(household|cleaner|cleaning|dish|dishwash|dishwashing|home|laundry|detergent|disinfectant)\b/i.test(normalizedCategory)) {
      return "household";
    }

    if (/(apparel|fashion|shoe|sneaker|clothing|tee|hoodie|shirt)/i.test(normalizedCategory)) {
      return "fashion";
    }

    return null;
  }

  private async matchEvidenceRecord(record: ConnectorEvidenceRecord): Promise<MatchContext> {
    const normalizedBrand = normalizeLookupKey(record.externalBrandName);
    const normalizedProduct = normalizeLookupKey(record.externalProductName ?? "");
    const brands = await db.brand.findMany({
      include: {
        brandAliases: true,
        products: {
          include: {
            productAliases: true
          }
        }
      }
    });

    const seededMatch = this.findSeededMatch(
      brands,
      record.matchedBrandName ? normalizeLookupKey(record.matchedBrandName) : "",
      record.matchedProductName ? normalizeLookupKey(record.matchedProductName) : ""
    );

    if (seededMatch) {
      return seededMatch;
    }

    const productFirstMatch = this.findProductFirstMatch(brands, normalizedBrand, normalizedProduct);

    if (productFirstMatch) {
      return productFirstMatch;
    }

    const exactBrand = brands.find(
      (brand) =>
        normalizeLookupKey(brand.name) === normalizedBrand ||
        brand.brandAliases.some((alias) => normalizeLookupKey(alias.alias) === normalizedBrand)
    );

    if (exactBrand && normalizedProduct) {
      const exactProduct = exactBrand.products.find(
        (product) =>
          normalizeLookupKey(product.name) === normalizedProduct ||
          product.productAliases.some((alias) => normalizeLookupKey(alias.alias) === normalizedProduct)
      );

      if (exactProduct) {
        return {
          brandId: exactBrand.id,
          productId: exactProduct.id,
          matchedVia: normalizeLookupKey(exactProduct.name) === normalizedProduct ? "exact" : "alias",
          confidence: 0.99,
          status: "verified"
        };
      }

      const fuzzyProduct = this.findBestFuzzyProductMatch(exactBrand.products, normalizedProduct);

      if (fuzzyProduct && fuzzyProduct.confidence >= 0.74) {
        return {
          brandId: exactBrand.id,
          productId: fuzzyProduct.productId,
          matchedVia: "fuzzy",
          confidence: fuzzyProduct.confidence,
          status: fuzzyProduct.confidence >= 0.84 ? "verified" : "manual_review"
        };
      }
    }

    if (exactBrand) {
      return {
        brandId: exactBrand.id,
        productId: null,
        matchedVia: normalizeLookupKey(exactBrand.name) === normalizedBrand ? "exact" : "alias",
        confidence: 0.96,
        status: "verified"
      };
    }

    const fuzzyBrand = this.findBestFuzzyBrandMatch(brands, normalizedBrand);
    if (fuzzyBrand && fuzzyBrand.confidence >= 0.74) {
      return {
        brandId: fuzzyBrand.brandId,
        productId: null,
        matchedVia: "fuzzy",
        confidence: fuzzyBrand.confidence,
        status: fuzzyBrand.confidence >= 0.84 ? "verified" : "manual_review"
      };
    }

    return {
      brandId: null,
      productId: null,
      matchedVia: "unmatched",
      confidence: 0,
      status: "unmatched"
    };
  }

  private findProductFirstMatch(
    brands: BrandMatchGraph,
    normalizedBrand: string,
    normalizedProduct: string
  ): MatchContext | null {
    if (!normalizedProduct) {
      return null;
    }

    const exactProductCandidates = brands.flatMap((brand) =>
      brand.products.flatMap((product) => {
        const exactProductName = normalizeLookupKey(product.name) === normalizedProduct;
        const exactProductAlias = product.productAliases.some(
          (alias) => normalizeLookupKey(alias.alias) === normalizedProduct
        );

        if (!exactProductName && !exactProductAlias) {
          return [];
        }

        return [
          {
            brand,
            product,
            matchedVia: exactProductName ? "exact" : "alias"
          }
        ];
      })
    );

    if (exactProductCandidates.length > 0) {
      const brandMatchedCandidate =
        exactProductCandidates.find(({ brand }) => this.isExactBrandMatch(brand, normalizedBrand)) ??
        (exactProductCandidates.length === 1 ? exactProductCandidates[0] : null);

      if (brandMatchedCandidate) {
        return {
          brandId: brandMatchedCandidate.brand.id,
          productId: brandMatchedCandidate.product.id,
          matchedVia: brandMatchedCandidate.matchedVia,
          confidence: brandMatchedCandidate.matchedVia === "exact" ? 0.99 : 0.97,
          status: "verified"
        };
      }
    }

    const fuzzyProductCandidates = brands.flatMap((brand) =>
      brand.products.map((product) => ({
        brand,
        product,
        confidence: this.calculateProductCandidateConfidence(product, normalizedProduct)
      }))
    );
    const bestFuzzyProductCandidate = fuzzyProductCandidates
      .filter((candidate) => candidate.confidence >= 0.78)
      .sort((leftCandidate, rightCandidate) => {
        const leftBrandMatch = this.isExactBrandMatch(leftCandidate.brand, normalizedBrand) ? 1 : 0;
        const rightBrandMatch = this.isExactBrandMatch(rightCandidate.brand, normalizedBrand) ? 1 : 0;

        if (leftBrandMatch !== rightBrandMatch) {
          return rightBrandMatch - leftBrandMatch;
        }

        return rightCandidate.confidence - leftCandidate.confidence;
      })[0];

    if (!bestFuzzyProductCandidate) {
      return null;
    }

    return {
      brandId: bestFuzzyProductCandidate.brand.id,
      productId: bestFuzzyProductCandidate.product.id,
      matchedVia: "fuzzy",
      confidence: bestFuzzyProductCandidate.confidence,
      status: bestFuzzyProductCandidate.confidence >= 0.88 ? "verified" : "manual_review"
    };
  }

  private findSeededMatch(
    brands: BrandMatchGraph,
    normalizedMatchedBrand: string,
    normalizedMatchedProduct: string
  ): MatchContext | null {
    if (!normalizedMatchedBrand && !normalizedMatchedProduct) {
      return null;
    }

    const directBrand = brands.find((brand) => normalizeLookupKey(brand.name) === normalizedMatchedBrand);
    if (!directBrand) {
      return null;
    }

    if (!normalizedMatchedProduct) {
      return {
        brandId: directBrand.id,
        productId: null,
        matchedVia: "exact",
        confidence: 1,
        status: "verified"
      };
    }

    const directProduct = directBrand.products.find(
      (product) => normalizeLookupKey(product.name) === normalizedMatchedProduct
    );

    if (!directProduct) {
      return {
        brandId: directBrand.id,
        productId: null,
        matchedVia: "exact",
        confidence: 0.98,
        status: "verified"
      };
    }

    return {
      brandId: directBrand.id,
      productId: directProduct.id,
      matchedVia: "exact",
      confidence: 1,
      status: "verified"
    };
  }

  private chooseStrongerMatchContext(
    existingRow: {
      brandId: number | null;
      productId: number | null;
      matchedVia: string;
      confidence: number;
      status: string;
    } | null,
    nextMatchContext: MatchContext
  ): MatchContext {
    if (!existingRow) {
      return nextMatchContext;
    }

    const existingIsVerified = existingRow.status === "verified";
    const nextIsVerified = nextMatchContext.status === "verified";

    if (existingRow.productId && !nextMatchContext.productId) {
      return {
        brandId: existingRow.brandId,
        productId: existingRow.productId,
        matchedVia: existingRow.matchedVia,
        confidence: existingRow.confidence,
        status: existingRow.status as CertificationEvidenceStatus
      };
    }

    if (existingRow.brandId && !nextMatchContext.brandId) {
      return {
        brandId: existingRow.brandId,
        productId: existingRow.productId,
        matchedVia: existingRow.matchedVia,
        confidence: existingRow.confidence,
        status: existingRow.status as CertificationEvidenceStatus
      };
    }

    if (existingIsVerified && !nextIsVerified) {
      return {
        brandId: existingRow.brandId,
        productId: existingRow.productId,
        matchedVia: existingRow.matchedVia,
        confidence: existingRow.confidence,
        status: existingRow.status as CertificationEvidenceStatus
      };
    }

    return nextMatchContext;
  }

  private isExactBrandMatch(
    brand: { name: string; brandAliases: Array<{ alias: string }> },
    normalizedBrand: string
  ): boolean {
    return (
      normalizeLookupKey(brand.name) === normalizedBrand ||
      brand.brandAliases.some((alias) => normalizeLookupKey(alias.alias) === normalizedBrand)
    );
  }

  private calculateProductCandidateConfidence(
    product: { name: string; productAliases: Array<{ alias: string }> },
    normalizedProduct: string
  ): number {
    const candidates = [product.name, ...product.productAliases.map((alias) => alias.alias)];

    return Math.max(
      ...candidates.map((candidate) => this.calculateSimilarity(normalizeLookupKey(candidate), normalizedProduct))
    );
  }

  private findBestFuzzyBrandMatch(
    brands: Array<{ id: number; name: string; brandAliases: Array<{ alias: string }> }>,
    normalizedBrand: string
  ) {
    let bestMatch: { brandId: number; confidence: number } | null = null;

    for (const brand of brands) {
      const candidates = [brand.name, ...brand.brandAliases.map((alias) => alias.alias)];

      for (const candidate of candidates) {
        const confidence = this.calculateSimilarity(normalizeLookupKey(candidate), normalizedBrand);

        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = {
            brandId: brand.id,
            confidence
          };
        }
      }
    }

    return bestMatch;
  }

  private findBestFuzzyProductMatch(
    products: Array<{ id: number; name: string; productAliases: Array<{ alias: string }> }>,
    normalizedProduct: string
  ) {
    let bestMatch: { productId: number; confidence: number } | null = null;

    for (const product of products) {
      const candidates = [product.name, ...product.productAliases.map((alias) => alias.alias)];

      for (const candidate of candidates) {
        const confidence = this.calculateSimilarity(normalizeLookupKey(candidate), normalizedProduct);

        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = {
            productId: product.id,
            confidence
          };
        }
      }
    }

    return bestMatch;
  }

  private calculateSimilarity(left: string, right: string): number {
    if (!left || !right) {
      return 0;
    }

    if (left === right) {
      return 1;
    }

    if (left.includes(right) || right.includes(left)) {
      return 0.9;
    }

    const leftTokens = new Set(left.split(/\s+/).filter(Boolean));
    const rightTokens = new Set(right.split(/\s+/).filter(Boolean));
    const intersectionSize = [...leftTokens].filter((token) => rightTokens.has(token)).length;
    const unionSize = new Set([...leftTokens, ...rightTokens]).size;

    if (unionSize === 0) {
      return 0;
    }

    return intersectionSize / unionSize;
  }
}
