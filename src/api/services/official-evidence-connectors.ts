import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeLookupKey } from "../../engine/claim-classifier.js";
import { officialEvidenceSeeds } from "../../lib/official-evidence-seeds.js";
import type {
  CertificationEvidenceStatus,
  CertificationSourceEntry,
  OfficialEvidenceSeed
} from "../../types/index.js";

export type SourceSector = CertificationSourceEntry["sector"];

export interface ConnectorLookupContext {
  brandName: string;
  productName: string;
  sector: SourceSector;
}

export interface ConnectorEvidenceRecord {
  certificationAcronym: string;
  scope: "product" | "brand";
  externalBrandName: string;
  externalProductName?: string;
  matchedBrandName?: string;
  matchedProductName?: string;
  certificateNumber?: string;
  sourceUrl?: string;
  checkedAt: string;
  expiresAt?: string;
  status: CertificationEvidenceStatus;
  confidence?: number;
  rawPayload?: Record<string, unknown>;
}

export interface OfficialCertificationConnector {
  sourceId: string;
  bulkImport(): Promise<ConnectorEvidenceRecord[]>;
  lookup(query: string, context: ConnectorLookupContext): Promise<ConnectorEvidenceRecord[]>;
}

export interface OfficialEvidenceConnectorFactoryOptions {
  snapshotDirectory?: string | null;
  remoteBaseUrl?: string | null;
  fetchImpl?: typeof fetch;
}

type SnapshotPayload =
  | OfficialEvidenceSeed[]
  | {
      records?: OfficialEvidenceSeed[];
    };

const buildLookupCandidates = (
  record: ConnectorEvidenceRecord,
  context: ConnectorLookupContext
): string[] =>
  [
    record.externalBrandName,
    record.externalProductName,
    record.matchedBrandName,
    record.matchedProductName,
    context.brandName,
    context.productName
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeLookupKey);

function calculateSimilarity(left: string, right: string) {
  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  const leftTokens = left.split(" ").filter(Boolean);
  const rightTokens = right.split(" ").filter(Boolean);
  const overlapCount = leftTokens.filter((token) => rightTokens.includes(token)).length;

  return overlapCount / Math.max(leftTokens.length, rightTokens.length, 1);
}

const recordKey = (record: ConnectorEvidenceRecord) =>
  [
    record.certificationAcronym,
    record.scope,
    normalizeLookupKey(record.externalBrandName),
    normalizeLookupKey(record.externalProductName ?? "")
  ].join("::");

function mapSeedRecord(record: OfficialEvidenceSeed): ConnectorEvidenceRecord {
  return {
    certificationAcronym: record.certificationAcronym,
    scope: record.scope,
    externalBrandName: record.externalBrandName,
    ...(record.externalProductName ? { externalProductName: record.externalProductName } : {}),
    ...(record.matchedBrandName ? { matchedBrandName: record.matchedBrandName } : {}),
    ...(record.matchedProductName ? { matchedProductName: record.matchedProductName } : {}),
    ...(record.certificateNumber ? { certificateNumber: record.certificateNumber } : {}),
    sourceUrl: record.sourceUrl,
    checkedAt: record.checkedAt,
    ...(record.expiresAt ? { expiresAt: record.expiresAt } : {}),
    status: record.status,
    ...(record.confidence !== undefined ? { confidence: record.confidence } : {}),
    ...(record.rawPayload ? { rawPayload: record.rawPayload } : {})
  };
}

function filterRecordsForLookup(
  records: ConnectorEvidenceRecord[],
  query: string,
  context: ConnectorLookupContext
) {
  const normalizedQuery = normalizeLookupKey(query);
  const normalizedBrand = normalizeLookupKey(context.brandName);
  const normalizedProduct = normalizeLookupKey(context.productName);

  return records.filter((record) => {
    const normalizedComposite = normalizeLookupKey(
      `${record.externalBrandName} ${record.externalProductName ?? ""}`
    );

    return buildLookupCandidates(record, context).some((candidate) => {
      if (!candidate) {
        return false;
      }

      if (
        candidate === normalizedQuery ||
        normalizedComposite === normalizedQuery ||
        candidate === normalizedBrand ||
        candidate === normalizedProduct
      ) {
        return true;
      }

      if (
        candidate.length >= 12 &&
        (candidate.includes(normalizedQuery) || normalizedQuery.includes(candidate))
      ) {
        return true;
      }

      return (
        calculateSimilarity(candidate, normalizedQuery) >= 0.74 ||
        calculateSimilarity(normalizedComposite, normalizedQuery) >= 0.78
      );
    });
  });
}

function mergeRecords(
  bootstrapRecords: ConnectorEvidenceRecord[],
  snapshotRecords: ConnectorEvidenceRecord[],
  remoteRecords: ConnectorEvidenceRecord[]
) {
  const merged = new Map<string, ConnectorEvidenceRecord>();

  for (const record of bootstrapRecords) {
    merged.set(recordKey(record), record);
  }

  for (const record of snapshotRecords) {
    merged.set(recordKey(record), record);
  }

  for (const record of remoteRecords) {
    merged.set(recordKey(record), record);
  }

  return [...merged.values()];
}

function normalizeSnapshotPayload(sourceId: string, payload: SnapshotPayload): ConnectorEvidenceRecord[] {
  const records = Array.isArray(payload) ? payload : payload.records ?? [];

  return records
    .filter((record) => record.sourceId === undefined || record.sourceId === sourceId)
    .map((record) =>
      mapSeedRecord({
        ...record,
        sourceId
      })
    );
}

class BootstrapDirectoryConnector implements OfficialCertificationConnector {
  private readonly bootstrapRecords: ConnectorEvidenceRecord[];

  public constructor(public readonly sourceId: string) {
    this.bootstrapRecords = officialEvidenceSeeds
      .filter((record) => record.sourceId === sourceId)
      .map(mapSeedRecord);
  }

  public async bulkImport(): Promise<ConnectorEvidenceRecord[]> {
    return this.bootstrapRecords;
  }

  public async lookup(query: string, context: ConnectorLookupContext): Promise<ConnectorEvidenceRecord[]> {
    return filterRecordsForLookup(this.bootstrapRecords, query, context);
  }

  protected getBootstrapRecords() {
    return this.bootstrapRecords;
  }
}

class SnapshotBackedConnector extends BootstrapDirectoryConnector {
  private mergedRecordsPromise: Promise<ConnectorEvidenceRecord[]> | null = null;

  public constructor(
    sourceId: string,
    private readonly options: OfficialEvidenceConnectorFactoryOptions
  ) {
    super(sourceId);
  }

  public async bulkImport(): Promise<ConnectorEvidenceRecord[]> {
    return this.loadMergedRecords();
  }

  public async lookup(query: string, context: ConnectorLookupContext): Promise<ConnectorEvidenceRecord[]> {
    const records = await this.loadMergedRecords();
    return filterRecordsForLookup(records, query, context);
  }

  private async loadMergedRecords() {
    if (!this.mergedRecordsPromise) {
      this.mergedRecordsPromise = this.hydrateMergedRecords();
    }

    return this.mergedRecordsPromise;
  }

  private async hydrateMergedRecords() {
    const [snapshotRecords, remoteRecords] = await Promise.all([
      this.loadSnapshotRecords(),
      this.loadRemoteRecords()
    ]);

    return mergeRecords(this.getBootstrapRecords(), snapshotRecords, remoteRecords);
  }

  private async loadSnapshotRecords(): Promise<ConnectorEvidenceRecord[]> {
    if (!this.options.snapshotDirectory) {
      return [];
    }

    const snapshotPath = path.join(this.options.snapshotDirectory, `${this.sourceId}.json`);

    try {
      await access(snapshotPath);
      const payload = JSON.parse(await readFile(snapshotPath, "utf8")) as SnapshotPayload;
      return normalizeSnapshotPayload(this.sourceId, payload);
    } catch {
      return [];
    }
  }

  private async loadRemoteRecords(): Promise<ConnectorEvidenceRecord[]> {
    if (!this.options.remoteBaseUrl || !this.options.fetchImpl) {
      return [];
    }

    try {
      const baseUrl = this.options.remoteBaseUrl.replace(/\/+$/, "");
      const response = await this.options.fetchImpl(`${baseUrl}/${this.sourceId}.json`, {
        headers: {
          accept: "application/json"
        }
      });

      if (!response.ok) {
        return [];
      }

      const payload = (await response.json()) as SnapshotPayload;
      return normalizeSnapshotPayload(this.sourceId, payload);
    } catch {
      return [];
    }
  }
}

class UnsupportedConnector implements OfficialCertificationConnector {
  public constructor(public readonly sourceId: string) {}

  public async bulkImport(): Promise<ConnectorEvidenceRecord[]> {
    return [];
  }

  public async lookup(): Promise<ConnectorEvidenceRecord[]> {
    return [];
  }
}

export function createOfficialEvidenceConnector(
  source: CertificationSourceEntry,
  options: OfficialEvidenceConnectorFactoryOptions = {}
): OfficialCertificationConnector {
  if (options.snapshotDirectory || options.remoteBaseUrl) {
    return new SnapshotBackedConnector(source.id, options);
  }

  if (!source.isSupported) {
    return new UnsupportedConnector(source.id);
  }

  return new BootstrapDirectoryConnector(source.id);
}
