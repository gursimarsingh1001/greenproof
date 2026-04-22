import "dotenv/config";
import { db } from "../lib/db.js";
import { OfficialEvidenceService } from "../api/services/official-evidence.js";
import {
  DEFAULT_SNAPSHOT_OUTPUT_DIR,
  fetchLiveEvidenceSnapshots,
  type LiveFetchMode
} from "./fetch-live-evidence-snapshots.js";

async function main() {
  const [, , rawMode = "missing", value] = process.argv;
  const mode = rawMode as LiveFetchMode;
  const snapshotDirectory = process.env.OFFICIAL_EVIDENCE_SNAPSHOT_DIR ?? DEFAULT_SNAPSHOT_OUTPUT_DIR;
  const fetchSummary = await fetchLiveEvidenceSnapshots({
    mode,
    ...(value ? { value } : {}),
    outputDirectory: snapshotDirectory
  });
  const service = new OfficialEvidenceService({
    snapshotDirectory,
    ...(typeof fetch === "function"
      ? {
          fetchImpl: fetch
        }
      : {})
  });
  const ingestionRuns =
    mode === "source" && value
      ? [await service.ingestSource(value)]
      : await Promise.all(fetchSummary.sourceIds.map((sourceId) => service.ingestSource(sourceId)));

  console.info(
    JSON.stringify(
      {
        fetchSummary,
        ingestionRuns
      },
      null,
      2
    )
  );
}

main()
  .catch((error: unknown) => {
    console.error("Live official evidence sync failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
