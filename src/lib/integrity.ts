import type { VerificationSnapshot } from "@prisma/client";
import type {
  IntegrityMetadata,
  VerificationReportPayload,
  VerifyIntegrityPayload
} from "../types/api.js";
import { normalizeForHashing, sha256 } from "./hash.js";

export const HASH_ALGORITHM = "SHA-256" as const;
export const INTEGRITY_ALGORITHM_VERSION = "greenproof-sha256-v1";

const INTEGRITY_CAPABILITIES = [
  "Detects whether the submitted report still matches the stored report hash.",
  "Lets GreenProof recover the original stored output for later review.",
  "Creates a tamper-evident record for each stored analysis result."
] as const;

const INTEGRITY_LIMITATIONS = [
  "This is hash-based verification, not a digital signature.",
  "Anyone with the report data can compute the same SHA-256 hash.",
  "A normal database record is not immutable by itself."
] as const;

export interface PreparedIntegrityRecord {
  algorithm: typeof HASH_ALGORITHM;
  algorithmVersion: string;
  canonicalPayload: ReturnType<typeof normalizeForHashing>;
  resultHash: string;
}

/**
 * Builds the canonical verification payload used for integrity hashing.
 */
export function prepareIntegrityRecord(report: VerificationReportPayload): PreparedIntegrityRecord {
  const canonicalPayload = normalizeForHashing(report);

  return {
    algorithm: HASH_ALGORITHM,
    algorithmVersion: INTEGRITY_ALGORITHM_VERSION,
    canonicalPayload,
    resultHash: sha256(JSON.stringify(canonicalPayload))
  };
}

/**
 * Attaches human-readable integrity metadata to an API verification report.
 */
export function attachIntegrityMetadata<TReport extends VerificationReportPayload>(
  report: TReport,
  snapshot: Pick<VerificationSnapshot, "displayId" | "resultHash" | "algorithmVersion" | "createdAt">
): TReport & { integrity: IntegrityMetadata } {
  return {
    ...report,
    integrity: {
      displayId: snapshot.displayId,
      resultHash: snapshot.resultHash,
      algorithm: HASH_ALGORITHM,
      algorithmVersion: snapshot.algorithmVersion,
      storedAt: snapshot.createdAt instanceof Date ? snapshot.createdAt.toISOString() : snapshot.createdAt,
      capabilities: [...INTEGRITY_CAPABILITIES],
      limitations: [...INTEGRITY_LIMITATIONS]
    }
  };
}

/**
 * Creates the API payload returned by the integrity verification endpoint.
 */
export function buildIntegrityVerificationResponse(options: {
  displayId: string;
  verified: boolean;
  storedHash: string;
  submittedHash: string;
  storedAt: Date | string;
  algorithmVersion: string;
}): VerifyIntegrityPayload {
  return {
    displayId: options.displayId,
    verified: options.verified,
    message: options.verified
      ? "The submitted report still matches the stored GreenProof record."
      : "The submitted report no longer matches the stored GreenProof record.",
    checkedAt: new Date().toISOString(),
    storedAt: options.storedAt instanceof Date ? options.storedAt.toISOString() : options.storedAt,
    storedHash: options.storedHash,
    submittedHash: options.submittedHash,
    algorithm: HASH_ALGORITHM,
    algorithmVersion: options.algorithmVersion,
    capabilities: [...INTEGRITY_CAPABILITIES],
    limitations: [...INTEGRITY_LIMITATIONS]
  };
}
