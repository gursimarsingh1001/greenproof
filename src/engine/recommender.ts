import { ClaimExtractor } from "./claim-extractor.js";
import { TrustScorer } from "./scorer.js";
import { buildRecordRawText } from "./text-source.js";
import type {
  VerificationAlternative,
  VerificationRecord,
  VerificationReferenceData
} from "../types/index.js";

/**
 * Recommends better products from the same category based on higher trust scores.
 */
export class AlternativesRecommender {
  public constructor(
    private readonly claimExtractor: ClaimExtractor,
    private readonly trustScorer: TrustScorer
  ) {}

  /**
   * Finds up to five better alternatives in the same category.
   */
  public findAlternatives(
    record: VerificationRecord,
    currentScore: number,
    referenceData: VerificationReferenceData
  ): VerificationAlternative[] {
    const scoreCache = new Map<number, number>();

    return (referenceData.catalog ?? [])
      .filter(
        (candidate) =>
          candidate.product.category === record.product.category && candidate.product.id !== record.product.id
      )
      .map((candidate) => {
        const trustScore = candidate.cachedTrustScore ?? this.calculateCandidateScore(candidate, referenceData, scoreCache);

        return {
          product: candidate.product,
          brand: candidate.brand,
          trustScore,
          scoreDifference: trustScore - currentScore,
          whyBetter: this.generateComparisonReason(record, currentScore, candidate, trustScore)
        };
      })
      .filter((candidate) => candidate.scoreDifference > 5)
      .sort((leftAlternative, rightAlternative) => rightAlternative.trustScore - leftAlternative.trustScore)
      .slice(0, 5);
  }

  /**
   * Calculates and caches a candidate score for alternative ranking.
   */
  private calculateCandidateScore(
    candidate: VerificationRecord,
    referenceData: VerificationReferenceData,
    scoreCache: Map<number, number>
  ): number {
    const cachedScore = scoreCache.get(candidate.product.id);

    if (cachedScore !== undefined) {
      return cachedScore;
    }

    const claims = this.claimExtractor.extractClaims(buildRecordRawText(candidate));
    const { certifications, vagueTerms, impossibleClaims } = referenceData;
    const result = this.trustScorer.calculateTrustScore(candidate, claims, {
      certifications,
      vagueTerms,
      impossibleClaims
    });

    scoreCache.set(candidate.product.id, result.score);
    return result.score;
  }

  /**
   * Summarizes why one product outranks the current product.
   */
  private generateComparisonReason(
    currentRecord: VerificationRecord,
    currentScore: number,
    alternativeRecord: VerificationRecord,
    alternativeScore: number
  ): string {
    if (alternativeRecord.productCertifications.some((certification) => certification.isVerified)) {
      return `Verified product-level certifications and a ${alternativeScore - currentScore}-point higher trust score.`;
    }

    if (alternativeRecord.brand.reputationScore > currentRecord.brand.reputationScore) {
      return `Stronger brand reputation and fewer unsupported sustainability claims.`;
    }

    return `Better overall evidence profile with a ${alternativeScore - currentScore}-point score improvement.`;
  }
}
