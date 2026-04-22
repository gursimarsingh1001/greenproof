import {
  BRAND_CERT_ONLY_PENALTY,
  BRAND_EVIDENCE_ONLY_PENALTY,
  CONTRADICTORY_CLAIMS_PENALTY,
  DEFAULT_IMPOSSIBLE_CLAIM_PENALTY,
  DEFAULT_VAGUE_TERM_PENALTY,
  FLAGGED_BRAND_PENALTY,
  GOOD_REPUTATION_BONUS,
  MEASURABLE_WITHOUT_DETAILS_PENALTY,
  LOW_REPUTATION_PENALTY,
  NO_CERTIFICATION_PENALTY,
  NO_SUSTAINABILITY_EVIDENCE_PENALTY,
  NO_SUPPORTING_EVIDENCE_PENALTY,
  RATING_COLORS,
  RATING_EMOJIS,
  TOO_MANY_ABSOLUTES_PENALTY,
  VAGUE_WITHOUT_SPECIFICS_PENALTY
} from "../lib/constants.js";
import { matchClaimToCertificationIds, normalizeLookupKey, preprocessText } from "./claim-classifier.js";
import { CONTRADICTION_RULES } from "./patterns.js";
import { buildRecordRawText } from "./text-source.js";
import type {
  ExtractedClaim,
  TrustScoreResult,
  VerificationBonus,
  VerificationPenalty,
  VerificationRecord,
  VerificationReferenceData
} from "../types/index.js";

/**
 * Calculates trust scores from extracted claims, brand data, and certification evidence.
 */
export class TrustScorer {
  /**
   * Runs the full scoring algorithm and returns the explainable trust score output.
   */
  public calculateTrustScore(
    record: VerificationRecord,
    claims: ExtractedClaim[],
    referenceData: VerificationReferenceData
  ): TrustScoreResult {
    const score = 100;
    const penalties: VerificationPenalty[] = [];
    const bonuses: VerificationBonus[] = [];
    let evidenceCount = 0;
    const breakdown = { certificationScore: 0, vaguenessScore: 0, impossibilityScore: 0, brandScore: 0, consistencyScore: 0 };
    const certificationNameById = new Map(referenceData.certifications.map((certification) => [certification.id, certification.name]));
    const vagueTermLookup = new Map(referenceData.vagueTerms.map((term) => [normalizeLookupKey(term.term), term]));
    const impossibleClaimLookup = new Map(
      referenceData.impossibleClaims.map((claim) => [normalizeLookupKey(claim.claimPattern), claim])
    );
    const preparedClaims = this.prepareClaimsForScoring(claims);
    const specificClaims = preparedClaims.filter((claim) => claim.type !== "vague");
    const searchableText = preprocessText(buildRecordRawText(record));

    for (const claim of preparedClaims.filter((entry) => entry.type === "certifiable")) {
      const matchingCertificationIds = matchClaimToCertificationIds(claim.text, referenceData.certifications);
      const productCertification = record.productCertifications.find(
        (certification) =>
          certification.productId === record.product.id &&
          certification.isVerified &&
          matchingCertificationIds.includes(certification.certificationId)
      );

      if (productCertification) {
        this.addBonus(bonuses, breakdown, {
          type: "PRODUCT_CERTIFICATION_FOUND",
          module: "certification",
          claim: claim.text,
          impact: 0,
          message: `"${claim.text}" verified by ${certificationNameById.get(productCertification.certificationId) ?? "a recognized certification"}`
        });
        evidenceCount += 3;
        continue;
      }

      const brandCertification = record.brandCertifications.find(
        (certification) =>
          certification.brandId === record.brand.id &&
          certification.isValid &&
          matchingCertificationIds.includes(certification.certificationId)
      );

      if (brandCertification) {
        this.addPenalty(penalties, breakdown, {
          type: "BRAND_CERT_ONLY",
          module: "certification",
          claim: claim.text,
          impact: BRAND_CERT_ONLY_PENALTY,
          message: `"${claim.text}" claimed but only brand-level cert found (not product-specific)`
        });
        evidenceCount += 1;
      } else {
        this.addPenalty(penalties, breakdown, {
          type: "NO_CERTIFICATION",
          module: "certification",
          claim: claim.text,
          impact: NO_CERTIFICATION_PENALTY,
          message: `"${claim.text}" claimed but NO certification found in any database`
        });
      }
    }

    for (const claim of preparedClaims.filter((entry) => entry.type === "measurable" || entry.type === "verifiable")) {
      const evidenceDelta = this.scoreEvidenceBackedClaim(
        record,
        claim,
        referenceData,
        certificationNameById,
        searchableText,
        penalties,
        bonuses,
        breakdown
      );
      evidenceCount += evidenceDelta;
    }

    const vagueClaims = preparedClaims.filter((entry) => entry.type === "vague");

    for (const claim of vagueClaims) {
      const vagueTerm = vagueTermLookup.get(normalizeLookupKey(claim.text));

      this.addPenalty(penalties, breakdown, {
        type: "VAGUE_TERM_USED",
        module: "vagueness",
        claim: claim.text,
        impact: this.normalizePenalty(vagueTerm?.penalty, DEFAULT_VAGUE_TERM_PENALTY),
        message: vagueTerm
          ? `"${claim.text}" is vague and has no legal definition: ${vagueTerm.explanation}`
          : `"${claim.text}" is vague and lacks a clear legal or technical definition`
      });
    }

    if (vagueClaims.length > 0 && specificClaims.length === 0) {
      const uniqueVagueTerms = [...new Set(vagueClaims.map((claim) => claim.text))];
      const summaryTerms =
        uniqueVagueTerms.length > 2
          ? `${uniqueVagueTerms.slice(0, 2).join(", ")}, and more`
          : uniqueVagueTerms.join(", ");

      this.addPenalty(penalties, breakdown, {
        type: "VAGUE_WITHOUT_SPECIFICS",
        module: "vagueness",
        impact: VAGUE_WITHOUT_SPECIFICS_PENALTY,
        message: `Only vague terms used (${summaryTerms}) without any specific verifiable claims`
      });
    }

    for (const claim of preparedClaims.filter((entry) => entry.type === "impossible")) {
      const impossibleClaim = impossibleClaimLookup.get(normalizeLookupKey(claim.text));

      this.addPenalty(penalties, breakdown, {
        type: "IMPOSSIBLE_CLAIM",
        module: "impossibility",
        claim: claim.text,
        impact: this.normalizePenalty(impossibleClaim?.penalty, DEFAULT_IMPOSSIBLE_CLAIM_PENALTY),
        message: impossibleClaim
          ? `"${claim.text}" is scientifically inaccurate or misleading: ${impossibleClaim.reason}`
          : `"${claim.text}" is scientifically inaccurate or misleading based on known greenwashing patterns`
      });
    }

    this.applyImportedCatalogGuardrails(record, preparedClaims, penalties, breakdown);

    if (record.brand.isFlagged) {
      this.addPenalty(penalties, breakdown, {
        type: "FLAGGED_BRAND",
        module: "brand",
        impact: FLAGGED_BRAND_PENALTY,
        message: `Brand "${record.brand.name}" has been flagged: ${record.brand.flagReason ?? "Flag reason unavailable"}`
      });
    } else if (record.brand.reputationScore < 0.5) {
      this.addPenalty(penalties, breakdown, {
        type: "LOW_REPUTATION",
        module: "brand",
        impact: LOW_REPUTATION_PENALTY,
        message: `Brand "${record.brand.name}" has low reputation score (${record.brand.reputationScore})`
      });
    } else if (record.brand.reputationScore > 0.8) {
      this.addBonus(bonuses, breakdown, {
        type: "GOOD_REPUTATION",
        module: "brand",
        impact: GOOD_REPUTATION_BONUS,
        message: `Brand "${record.brand.name}" has strong track record`
      });
      evidenceCount += 1;
    }

    if (preparedClaims.filter((claim) => /\b100%/i.test(claim.text)).length > 2) {
      this.addPenalty(penalties, breakdown, {
        type: "TOO_MANY_ABSOLUTES",
        module: "consistency",
        impact: TOO_MANY_ABSOLUTES_PENALTY,
        message: `Multiple "100%" claims detected - statistically unlikely`
      });
    }

    const contradictionMessage = this.findContradictionMessage(searchableText);
    if (contradictionMessage) {
      this.addPenalty(penalties, breakdown, {
        type: "CONTRADICTORY_CLAIMS",
        module: "consistency",
        impact: CONTRADICTORY_CLAIMS_PENALTY,
        message: contradictionMessage
      });
    }

    const totalPenalties = penalties.reduce((totalImpact, penalty) => totalImpact + penalty.impact, 0);
    const totalBonuses = bonuses.reduce((totalImpact, bonus) => totalImpact + bonus.impact, 0);
    const finalScore = Math.max(0, Math.min(100, score + totalPenalties + totalBonuses));
    const confidenceLevel = evidenceCount >= 5 ? "HIGH" : evidenceCount >= 2 ? "MEDIUM" : "LOW";
    const rating = finalScore >= 80 ? "TRUSTED" : finalScore >= 60 ? "MODERATE" : finalScore >= 40 ? "SUSPICIOUS" : "UNVERIFIED";

    return {
      score: Math.round(finalScore),
      rating,
      color: RATING_COLORS[rating],
      emoji: RATING_EMOJIS[rating],
      confidenceLevel,
      confidencePercentage: Math.min(evidenceCount * 20, 100),
      penalties,
      bonuses,
      breakdown
    };
  }

  /**
   * Ensures seeded penalties behave consistently even if positive values are provided.
   */
  private normalizePenalty(value: number | undefined, fallback: number): number {
    const penaltyValue = value ?? fallback;
    return penaltyValue > 0 ? -penaltyValue : penaltyValue;
  }

  /**
   * Collapses duplicate repeated claims for scoring while keeping the longest overlapping match of the same type.
   */
  private prepareClaimsForScoring(claims: ExtractedClaim[]): ExtractedClaim[] {
    const sortedClaims = [...claims].sort((leftClaim, rightClaim) => {
      if (leftClaim.position.start !== rightClaim.position.start) {
        return leftClaim.position.start - rightClaim.position.start;
      }

      return this.getClaimLength(rightClaim) - this.getClaimLength(leftClaim);
    });
    const uniqueClaims = new Map<string, ExtractedClaim>();

    for (const claim of sortedClaims) {
      const uniqueKey = `${claim.type}:${normalizeLookupKey(claim.text)}`;
      const existingClaim = uniqueClaims.get(uniqueKey);

      if (!existingClaim || claim.position.start < existingClaim.position.start) {
        uniqueClaims.set(uniqueKey, claim);
      }
    }

    const deduplicatedClaims = [...uniqueClaims.values()].sort((leftClaim, rightClaim) => {
      if (leftClaim.position.start !== rightClaim.position.start) {
        return leftClaim.position.start - rightClaim.position.start;
      }

      return this.getClaimLength(rightClaim) - this.getClaimLength(leftClaim);
    });
    const filteredClaims: ExtractedClaim[] = [];

    for (const claim of deduplicatedClaims) {
      const overlappingIndex = filteredClaims.findIndex(
        (existingClaim) => existingClaim.type === claim.type && this.isContainedOverlap(existingClaim, claim)
      );

      if (overlappingIndex === -1) {
        filteredClaims.push(claim);
        continue;
      }

      const overlappingClaim = filteredClaims[overlappingIndex];

      if (overlappingClaim && this.getClaimLength(claim) > this.getClaimLength(overlappingClaim)) {
        filteredClaims[overlappingIndex] = claim;
      }
    }

    return filteredClaims.sort((leftClaim, rightClaim) => leftClaim.position.start - rightClaim.position.start);
  }

  /**
   * Scores measurable and verifiable claims that rely on supporting evidence rather than a direct certification term.
   */
  private scoreEvidenceBackedClaim(
    record: VerificationRecord,
    claim: ExtractedClaim,
    referenceData: VerificationReferenceData,
    certificationNameById: ReadonlyMap<number, string>,
    searchableText: string,
    penalties: VerificationPenalty[],
    bonuses: VerificationBonus[],
    breakdown: TrustScoreResult["breakdown"]
  ): number {
    const matchingCertificationIds = matchClaimToCertificationIds(claim.text, referenceData.certifications);
    const productCertification = record.productCertifications.find(
      (certification) =>
        certification.productId === record.product.id &&
        certification.isVerified &&
        matchingCertificationIds.includes(certification.certificationId)
    );
    const brandCertification = record.brandCertifications.find(
      (certification) =>
        certification.brandId === record.brand.id &&
        certification.isValid &&
        matchingCertificationIds.includes(certification.certificationId)
    );
    let evidenceDelta = 0;

    if (productCertification) {
      this.addBonus(bonuses, breakdown, {
        type: "PRODUCT_CERTIFICATION_FOUND",
        module: "certification",
        claim: claim.text,
        impact: 0,
        message: `"${claim.text}" supported by ${certificationNameById.get(productCertification.certificationId) ?? "recognized evidence"}`
      });
      evidenceDelta += 2;
    } else if (brandCertification) {
      this.addPenalty(penalties, breakdown, {
        type: "BRAND_EVIDENCE_ONLY",
        module: "certification",
        claim: claim.text,
        impact: BRAND_EVIDENCE_ONLY_PENALTY,
        message: `"${claim.text}" has only brand-level supporting evidence and no product-specific proof`
      });
      evidenceDelta += 1;
    } else {
      this.addPenalty(penalties, breakdown, {
        type: "NO_SUPPORTING_EVIDENCE",
        module: "certification",
        claim: claim.text,
        impact: NO_SUPPORTING_EVIDENCE_PENALTY,
        message: `"${claim.text}" was claimed but no supporting evidence or recognized standard was found`
      });
    }

    if (
      claim.type === "measurable" &&
      !this.hasQuantifiedDetail(searchableText, claim.position) &&
      this.requiresSpecificMeasureDetail(claim.text, searchableText, claim.position)
    ) {
      this.addPenalty(penalties, breakdown, {
        type: "MEASURABLE_WITHOUT_DETAILS",
        module: "certification",
        claim: claim.text,
        impact: MEASURABLE_WITHOUT_DETAILS_PENALTY,
        message: `"${claim.text}" sounds measurable but no specific percentage or quantity was provided`
      });
    }

    return evidenceDelta;
  }

  /**
   * Adds conservative evidence penalties for imported OFF products that lack clear eco proof.
   */
  private applyImportedCatalogGuardrails(
    record: VerificationRecord,
    claims: ExtractedClaim[],
    penalties: VerificationPenalty[],
    breakdown: TrustScoreResult["breakdown"]
  ): void {
    if (record.dataSource !== "open_food_facts") {
      return;
    }

    const hasCertificationEvidence =
      record.productCertifications.some((certification) => certification.isVerified) ||
      record.brandCertifications.some((certification) => certification.isValid);
    const hasStrongEcoSignal = claims.some((claim) => claim.type === "certifiable" || claim.type === "verifiable");

    if (!hasStrongEcoSignal && !hasCertificationEvidence) {
      this.addPenalty(penalties, breakdown, {
        type: "NO_SUSTAINABILITY_EVIDENCE",
        module: "certification",
        impact: NO_SUSTAINABILITY_EVIDENCE_PENALTY,
        message: `External catalog data for "${record.product.name}" does not show recognized sustainability proof or certification-backed eco claims.`
      });
      return;
    }
  }

  /**
   * Adds a penalty and updates the matching module subtotal.
   */
  private addPenalty(
    penalties: VerificationPenalty[],
    breakdown: TrustScoreResult["breakdown"],
    penalty: VerificationPenalty
  ): void {
    penalties.push(penalty);
    breakdown[`${penalty.module}Score` as keyof TrustScoreResult["breakdown"]] += penalty.impact;
  }

  /**
   * Adds a bonus and updates the matching module subtotal.
   */
  private addBonus(
    bonuses: VerificationBonus[],
    breakdown: TrustScoreResult["breakdown"],
    bonus: VerificationBonus
  ): void {
    bonuses.push(bonus);
    breakdown[`${bonus.module}Score` as keyof TrustScoreResult["breakdown"]] += bonus.impact;
  }

  /**
   * Returns true when one same-type claim fully contains the other.
   */
  private isContainedOverlap(leftClaim: ExtractedClaim, rightClaim: ExtractedClaim): boolean {
    const overlaps =
      leftClaim.position.start <= rightClaim.position.end && rightClaim.position.start <= leftClaim.position.end;
    const leftContainsRight =
      leftClaim.position.start <= rightClaim.position.start && leftClaim.position.end >= rightClaim.position.end;
    const rightContainsLeft =
      rightClaim.position.start <= leftClaim.position.start && rightClaim.position.end >= leftClaim.position.end;

    return overlaps && (leftContainsRight || rightContainsLeft);
  }

  /**
   * Measures claim span length for overlap resolution.
   */
  private getClaimLength(claim: ExtractedClaim): number {
    return claim.position.end - claim.position.start;
  }

  /**
   * Detects when a measurable claim lacks a nearby number, percent, or quantity.
   */
  private hasQuantifiedDetail(searchableText: string, position: ExtractedClaim["position"]): boolean {
    const contextWindow = searchableText.slice(Math.max(0, position.start - 24), Math.min(searchableText.length, position.end + 24));

    return /\b\d+(?:\s?%|\s?(?:percent|percentage|g|kg|oz|lb|lbs|ml|l|liters?))\b/i.test(contextWindow);
  }

  /**
   * Tightens measurable-claim scrutiny for specific materials or explicit missing-detail cues in the text.
   */
  private requiresSpecificMeasureDetail(
    claimText: string,
    searchableText: string,
    position: ExtractedClaim["position"]
  ): boolean {
    const normalizedClaimText = normalizeLookupKey(claimText);
    const contextWindow = searchableText.slice(Math.max(0, position.start - 8), Math.min(searchableText.length, position.end + 24));

    if (!/\b(recycled|post consumer|pre consumer)\b/i.test(normalizedClaimText)) {
      return false;
    }

    if (/\brecycled\s+(?!materials\b|packaging\b|fiber\b|fibers\b|consumer\b)\w+\b/i.test(contextWindow)) {
      return true;
    }

    return /\b(not obvious|without specifics|without detail|without details|limited certification detail|proof is limited)\b/i.test(
      searchableText
    );
  }

  /**
   * Looks for one basic contradiction across the combined product text.
   */
  private findContradictionMessage(searchableText: string): string | null {

    const matchingRule = CONTRADICTION_RULES.find((rule) => rule.left.test(searchableText) && rule.right.test(searchableText));
    return matchingRule?.message ?? null;
  }
}
