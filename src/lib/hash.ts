import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type NormalizedHashValue =
  | null
  | boolean
  | number
  | string
  | NormalizedHashValue[]
  | { [key: string]: NormalizedHashValue };

/**
 * Computes a SHA-256 digest for a string or binary payload and returns the lowercase hex output.
 * SHA-256 provides deterministic hashing and collision resistance for integrity checking, but it
 * is not a digital signature and does not prove who created the input.
 */
export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Recursively normalizes an object into a stable JSON-safe structure with sorted keys.
 * This makes object hashing independent from JavaScript property insertion order.
 */
export function normalizeForHashing(value: unknown): NormalizedHashValue {
  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => (entry === undefined ? null : normalizeForHashing(entry)));
  }

  switch (typeof value) {
    case "boolean":
    case "string":
      return value;
    case "number":
      return Number.isFinite(value) ? value : String(value);
    case "bigint":
      return value.toString();
    case "undefined":
      return null;
    case "object": {
      const objectValue = value as Record<string, unknown>;
      const normalizedEntries = Object.keys(objectValue)
        .sort()
        .flatMap((key) => {
          const entryValue = objectValue[key];

          if (entryValue === undefined) {
            return [];
          }

          return [[key, normalizeForHashing(entryValue)] as const];
        });

      return Object.fromEntries(normalizedEntries);
    }
    default:
      return String(value);
  }
}

/**
 * Hashes any JSON-like value after recursively normalizing object key order.
 */
export function hashObject(value: unknown): string {
  return sha256(JSON.stringify(normalizeForHashing(value)));
}

/**
 * Compares two SHA-256 hex digests using a timing-safe equality check.
 */
export function verifyIntegrity(candidateHash: string, expectedHash: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(candidateHash) || !/^[a-f0-9]{64}$/i.test(expectedHash)) {
    return false;
  }

  const normalizedCandidate = Buffer.from(candidateHash.toLowerCase(), "hex");
  const normalizedExpected = Buffer.from(expectedHash.toLowerCase(), "hex");

  if (normalizedCandidate.length !== normalizedExpected.length) {
    return false;
  }

  return timingSafeEqual(normalizedCandidate, normalizedExpected);
}

/**
 * Generates a compact 16-character identifier for displaying an integrity record in the UI.
 */
export function generateDisplayId(): string {
  return randomBytes(8).toString("hex").toUpperCase();
}
