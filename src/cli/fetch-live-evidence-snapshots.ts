import "dotenv/config";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { certificationSources } from "../lib/certification-sources.js";
import { officialEvidenceSeeds } from "../lib/official-evidence-seeds.js";
import type {
  CertificationSourceEntry,
  CertificationSourceSector,
  OfficialEvidenceSeed
} from "../types/index.js";

export const DEFAULT_SNAPSHOT_OUTPUT_DIR = path.resolve("data", "official-evidence-snapshots");
const DEFAULT_REQUEST_DELAY_MS = 200;

export type LiveFetchMode = "all" | "source" | "sector" | "missing";

export interface FetchLiveEvidenceOptions {
  mode?: LiveFetchMode;
  value?: string;
  outputDirectory?: string;
  delayMs?: number;
}

export interface FetchLiveEvidenceResult {
  outputDirectory: string;
  requestedRecords: number;
  fetchedRecords: number;
  snapshotFiles: number;
  sourceIds: string[];
}

interface LiveFetchMetadata {
  fetchedAt: string;
  httpStatus: number;
  contentType: string | null;
  pageTitle: string | null;
  matchedKeywords: string[];
  responseUrl: string;
}

interface SourceSeedGroup {
  source: CertificationSourceEntry;
  seeds: OfficialEvidenceSeed[];
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function extractPageTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = match?.[1];
  return title ? title.replace(/\s+/g, " ").trim() : null;
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isSector(value: string): value is CertificationSourceSector {
  return value === "fashion" || value === "cosmetics" || value === "household";
}

function buildKeywordCandidates(record: OfficialEvidenceSeed) {
  return [
    record.externalBrandName,
    record.externalProductName,
    record.matchedBrandName,
    record.matchedProductName,
    record.certificationAcronym,
    record.certificateNumber
  ].filter((value): value is string => Boolean(value));
}

function resolveFetchUrl(source: CertificationSourceEntry, seeds: OfficialEvidenceSeed[]) {
  return source.liveFetchUrl ?? seeds[0]?.sourceUrl ?? source.databaseUrl;
}

async function fetchLiveSource(
  source: CertificationSourceEntry,
  seeds: OfficialEvidenceSeed[]
): Promise<OfficialEvidenceSeed[] | null> {
  const fetchUrl = resolveFetchUrl(source, seeds);

  try {
    const response = await fetch(fetchUrl, {
      headers: {
        "user-agent": "GreenProofEvidenceBot/1.0 (+https://greenproof.local)",
        accept: "text/html,application/xhtml+xml,application/json,application/pdf;q=0.9,*/*;q=0.8"
      },
      redirect: "follow"
    });

    if (!response.ok) {
      return null;
    }

    const body = await response.text();
    const normalizedBody = stripHtml(body);
    const keywordCandidates = [
      source.certificationName,
      ...seeds.flatMap((seed) => buildKeywordCandidates(seed))
    ];
    const matchedKeywords = [...new Set(keywordCandidates)].filter((keyword) =>
      normalizedBody.includes(keyword.toLowerCase())
    );

    const liveMetadata: LiveFetchMetadata = {
      fetchedAt: new Date().toISOString(),
      httpStatus: response.status,
      contentType: response.headers.get("content-type"),
      pageTitle: extractPageTitle(body),
      matchedKeywords,
      responseUrl: response.url
    };

    return seeds.map((seed) => ({
      ...seed,
      checkedAt: liveMetadata.fetchedAt,
      rawPayload: {
        ...(seed.rawPayload ?? {}),
        liveFetch: {
          ...liveMetadata,
          fetchUrl
        }
      }
    }));
  } catch {
    return null;
  }
}

async function resolveSelectedSourceGroups(
  mode: LiveFetchMode,
  value: string | undefined,
  outputDirectory: string
): Promise<SourceSeedGroup[]> {
  if (mode === "source") {
    if (!value) {
      throw new Error("A source id is required for source mode.");
    }

    const source = certificationSources.find((entry) => entry.id === value);

    if (!source) {
      return [];
    }

    return [
      {
        source,
        seeds: officialEvidenceSeeds.filter((seed) => seed.sourceId === value)
      }
    ];
  }

  if (mode === "sector") {
    if (!value || !isSector(value)) {
      throw new Error("Sector must be one of: fashion, cosmetics, household.");
    }

    return certificationSources
      .filter((source) => source.sector === value)
      .map((source) => ({
        source,
        seeds: officialEvidenceSeeds.filter((seed) => seed.sourceId === source.id)
      }))
      .filter((group) => group.seeds.length > 0);
  }

  if (mode === "missing") {
    const existingFiles = new Set(
      (await readdir(outputDirectory))
        .filter((entry) => entry.endsWith(".json"))
        .map((entry) => entry.replace(/\.json$/i, ""))
    );

    return certificationSources
      .filter((source) => !existingFiles.has(source.id))
      .map((source) => ({
        source,
        seeds: officialEvidenceSeeds.filter((seed) => seed.sourceId === source.id)
      }))
      .filter((group) => group.seeds.length > 0);
  }

  return certificationSources
    .map((source) => ({
      source,
      seeds: officialEvidenceSeeds.filter((seed) => seed.sourceId === source.id)
    }))
    .filter((group) => group.seeds.length > 0);
}

export async function fetchLiveEvidenceSnapshots(
  options: FetchLiveEvidenceOptions = {}
): Promise<FetchLiveEvidenceResult> {
  const mode = options.mode ?? "all";
  const outputDirectory = path.resolve(options.outputDirectory ?? DEFAULT_SNAPSHOT_OUTPUT_DIR);
  const delayMs = options.delayMs ?? Number(process.env.OFFICIAL_EVIDENCE_FETCH_DELAY_MS ?? DEFAULT_REQUEST_DELAY_MS);

  await mkdir(outputDirectory, {
    recursive: true
  });

  const selectedGroups = await resolveSelectedSourceGroups(mode, options.value, outputDirectory);

  if (selectedGroups.length === 0) {
    throw new Error(
      mode === "source"
        ? `No official evidence seeds found for source: ${options.value}`
        : mode === "missing"
          ? "No missing official evidence snapshots were found."
          : "No seeds found."
    );
  }

  const snapshotMap = new Map<string, OfficialEvidenceSeed[]>();
  let fetchedCount = 0;

  for (const group of selectedGroups) {
    const liveRecords = await fetchLiveSource(group.source, group.seeds);

    if (liveRecords) {
      snapshotMap.set(group.source.id, liveRecords);
      fetchedCount += liveRecords.length;
    }

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }

  for (const [sourceId, records] of snapshotMap) {
    const outputPath = path.join(outputDirectory, `${sourceId}.json`);
    await writeFile(
      outputPath,
      JSON.stringify(
        {
          records
        },
        null,
        2
      ),
      "utf8"
    );
  }

  return {
    outputDirectory,
    requestedRecords: selectedGroups.reduce((total, group) => total + group.seeds.length, 0),
    fetchedRecords: fetchedCount,
    snapshotFiles: snapshotMap.size,
    sourceIds: selectedGroups.map((group) => group.source.id)
  };
}

async function main() {
  const [, , rawMode = "all", value] = process.argv;
  const result = await fetchLiveEvidenceSnapshots({
    mode: rawMode as LiveFetchMode,
    ...(value ? { value } : {}),
    ...(process.env.OFFICIAL_EVIDENCE_SNAPSHOT_DIR
      ? { outputDirectory: process.env.OFFICIAL_EVIDENCE_SNAPSHOT_DIR }
      : {}),
    delayMs: Number(process.env.OFFICIAL_EVIDENCE_FETCH_DELAY_MS ?? DEFAULT_REQUEST_DELAY_MS)
  });

  console.info(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error("Live official evidence fetch failed.", error);
    process.exitCode = 1;
  });
}
