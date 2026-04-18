import type { Prisma } from "@prisma/client";
import type { ProductSourceDetails } from "../types/index.js";

/**
 * Safely normalizes a Prisma JSON claims value into a string array.
 */
export function parseClaims(value: Prisma.JsonValue | null | undefined): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

/**
 * Safely normalizes stored product provenance metadata into a typed source-details object.
 */
export function parseSourceDetails(value: Prisma.JsonValue | null | undefined): Partial<ProductSourceDetails> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const candidate = value as Record<string, Prisma.JsonValue>;
  const labels = parseStringList(candidate.labels);
  const packaging = parseStringList(candidate.packaging);
  const parsedSourceDetails: Partial<ProductSourceDetails> = {};

  if (typeof candidate.label === "string" && candidate.label.trim().length > 0) {
    parsedSourceDetails.label = candidate.label;
  }

  if (typeof candidate.productUrl === "string" && candidate.productUrl.trim().length > 0) {
    parsedSourceDetails.productUrl = candidate.productUrl;
  }

  if (labels.length > 0) {
    parsedSourceDetails.labels = labels;
  }

  if (packaging.length > 0) {
    parsedSourceDetails.packaging = packaging;
  }

  if (typeof candidate.ecoscoreGrade === "string" && candidate.ecoscoreGrade.trim().length > 0) {
    parsedSourceDetails.ecoscoreGrade = candidate.ecoscoreGrade;
  }

  if (typeof candidate.ecoscoreScore === "number") {
    parsedSourceDetails.ecoscoreScore = candidate.ecoscoreScore;
  }

  if (typeof candidate.nutriscoreGrade === "string" && candidate.nutriscoreGrade.trim().length > 0) {
    parsedSourceDetails.nutriscoreGrade = candidate.nutriscoreGrade;
  }

  if (typeof candidate.novaGroup === "number") {
    parsedSourceDetails.novaGroup = candidate.novaGroup;
  }

  return Object.keys(parsedSourceDetails).length > 0 ? parsedSourceDetails : undefined;
}

/**
 * Throws when a list expected to be unique contains duplicates.
 */
export function assertUniqueValues(values: readonly string[], label: string): void {
  const uniqueValueCount = new Set(values).size;

  if (uniqueValueCount !== values.length) {
    throw new Error(`${label} must be unique. Found ${values.length - uniqueValueCount} duplicate value(s).`);
  }
}

/**
 * Converts a JSON value into a de-duplicated list of strings.
 */
function parseStringList(value: Prisma.JsonValue | undefined): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0))]
    : [];
}
