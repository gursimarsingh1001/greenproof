import { TEXT_SEGMENT_SEPARATOR } from "../lib/constants.js";
import type { VerificationRecord } from "../types/index.js";

/**
 * Builds a stable text blob for claim extraction and contradiction checks.
 */
export function buildRecordRawText(record: VerificationRecord): string {
  if (record.rawText && record.rawText.trim().length > 0) {
    return record.rawText;
  }

  return [record.product.description, ...record.product.claims]
    .filter((value): value is string => Boolean(value))
    .join(TEXT_SEGMENT_SEPARATOR);
}
