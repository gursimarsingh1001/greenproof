import {
  CERTIFICATION_CLAIM_MATCHERS,
  CLAIM_PATTERN_LIBRARY,
  type ClaimPatternDefinition
} from "./patterns.js";
import type { ClaimType, VerificationCertification } from "../types/index.js";

/**
 * Preprocesses text by lowercasing and replacing punctuation with spaces while preserving length.
 */
export function preprocessText(rawText: string): string {
  return rawText.toLowerCase().replace(/[^\p{L}\p{N}%]/gu, " ");
}

/**
 * Normalizes text for dictionary and certification lookups.
 */
export function normalizeLookupKey(value: string): string {
  return preprocessText(value).replace(/\s+/g, " ").trim();
}

/**
 * Classifies a single claim-sized text snippet against the known pattern library.
 */
export function classifyClaimText(rawClaimText: string): ClaimPatternDefinition | null {
  const normalizedClaimText = normalizeLookupKey(rawClaimText);

  return (
    CLAIM_PATTERN_LIBRARY.find((patternDefinition) => {
      patternDefinition.pattern.lastIndex = 0;
      return patternDefinition.pattern.test(normalizedClaimText);
    }) ?? null
  );
}

/**
 * Finds a claim type when only the type is needed.
 */
export function getClaimType(rawClaimText: string): ClaimType | null {
  return classifyClaimText(rawClaimText)?.type ?? null;
}

/**
 * Maps a certifiable claim to matching certification ids from the reference catalog.
 */
export function matchClaimToCertificationIds(
  claimText: string,
  certifications: readonly VerificationCertification[]
): number[] {
  const normalizedClaimText = normalizeLookupKey(claimText);
  const candidateAcronyms = CERTIFICATION_CLAIM_MATCHERS.flatMap((matcher) =>
    matcher.pattern.test(normalizedClaimText) ? matcher.certificationAcronyms : []
  );

  return certifications
    .filter((certification) => {
      const normalizedCertificationName = normalizeLookupKey(certification.name);
      const normalizedCertificationAcronym = normalizeLookupKey(certification.acronym);

      return (
        candidateAcronyms.includes(certification.acronym) ||
        normalizedClaimText.includes(normalizedCertificationName) ||
        normalizedClaimText.includes(normalizedCertificationAcronym)
      );
    })
    .map((certification) => certification.id);
}
