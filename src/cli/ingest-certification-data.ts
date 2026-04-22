import "dotenv/config";
import { db } from "../lib/db.js";
import { OfficialEvidenceService } from "../api/services/official-evidence.js";

function printUsage() {
  console.info("Usage:");
  console.info("  tsx src/cli/ingest-certification-data.ts all");
  console.info("  tsx src/cli/ingest-certification-data.ts sector <fashion|cosmetics|household>");
  console.info("  tsx src/cli/ingest-certification-data.ts source <sourceId>");
  console.info("");
  console.info("Optional env vars:");
  console.info("  OFFICIAL_EVIDENCE_SNAPSHOT_DIR=<path to per-source JSON snapshots>");
  console.info("  OFFICIAL_EVIDENCE_REMOTE_BASE_URL=<base URL serving <sourceId>.json payloads>");
}

async function main() {
  const [, , mode, value] = process.argv;
  const service = new OfficialEvidenceService({
    ...(process.env.OFFICIAL_EVIDENCE_SNAPSHOT_DIR
      ? {
          snapshotDirectory: process.env.OFFICIAL_EVIDENCE_SNAPSHOT_DIR
        }
      : {}),
    ...(process.env.OFFICIAL_EVIDENCE_REMOTE_BASE_URL
      ? {
          remoteBaseUrl: process.env.OFFICIAL_EVIDENCE_REMOTE_BASE_URL
        }
      : {}),
    ...(typeof fetch === "function"
      ? {
          fetchImpl: fetch
        }
      : {})
  });

  if (!mode) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (mode === "all") {
    const runs = await service.ingestAllSources();
    console.info(JSON.stringify(runs, null, 2));
    return;
  }

  if (mode === "sector") {
    if (!value || !["fashion", "cosmetics", "household"].includes(value)) {
      throw new Error("Sector must be one of: fashion, cosmetics, household.");
    }

    const runs = await service.ingestSector(value as "fashion" | "cosmetics" | "household");
    console.info(JSON.stringify(runs, null, 2));
    return;
  }

  if (mode === "source") {
    if (!value) {
      throw new Error("A source id is required for source mode.");
    }

    const run = await service.ingestSource(value);
    console.info(JSON.stringify(run, null, 2));
    return;
  }

  printUsage();
  process.exitCode = 1;
}

main()
  .catch((error: unknown) => {
    console.error("Certification ingestion failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
