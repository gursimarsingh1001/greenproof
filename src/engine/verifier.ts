import { ClaimExtractor } from "./claim-extractor.js";
import { ExplanationGenerator } from "./explainer.js";
import { AlternativesRecommender } from "./recommender.js";
import { TrustScorer } from "./scorer.js";
import { buildRecordRawText } from "./text-source.js";
import type {
  ExtractedClaim,
  TrustScoreResult,
  VerificationExplanation,
  VerificationOutcome,
  VerificationRecord,
  VerificationReferenceData
} from "../types/index.js";

/**
 * Top-level orchestration class for claim extraction, scoring, explanations, and alternatives.
 */
export class VerificationEngine {
  private readonly claimExtractor: ClaimExtractor;
  private readonly trustScorer: TrustScorer;
  private readonly explanationGenerator: ExplanationGenerator;
  private readonly alternativesRecommender: AlternativesRecommender;

  public constructor() {
    this.claimExtractor = new ClaimExtractor();
    this.trustScorer = new TrustScorer();
    this.explanationGenerator = new ExplanationGenerator();
    this.alternativesRecommender = new AlternativesRecommender(this.claimExtractor, this.trustScorer);
  }

  /**
   * Extracts structured claims from a raw product text blob.
   */
  public extractClaims(rawText: string): ExtractedClaim[] {
    return this.claimExtractor.extractClaims(rawText);
  }

  /**
   * Calculates the trust score for a product record and extracted claims.
   */
  public calculateTrustScore(
    record: VerificationRecord,
    claims: ExtractedClaim[],
    referenceData: VerificationReferenceData
  ): TrustScoreResult {
    return this.trustScorer.calculateTrustScore(record, claims, referenceData);
  }

  /**
   * Generates a human-readable explanation from a score result.
   */
  public generateExplanation(
    result: TrustScoreResult,
    record: VerificationRecord,
    claims: ExtractedClaim[]
  ): VerificationExplanation {
    return this.explanationGenerator.generateExplanation(result, record, claims);
  }

  /**
   * Finds better alternatives from the same category.
   */
  public findAlternatives(
    record: VerificationRecord,
    currentScore: number,
    referenceData: VerificationReferenceData
  ) {
    return this.alternativesRecommender.findAlternatives(record, currentScore, referenceData);
  }

  /**
   * Runs the complete verification workflow for a single product record.
   */
  public verify(record: VerificationRecord, referenceData: VerificationReferenceData): VerificationOutcome {
    const claims = this.claimExtractor.extractClaims(buildRecordRawText(record));
    const result = this.trustScorer.calculateTrustScore(record, claims, referenceData);
    const explanation = this.explanationGenerator.generateExplanation(result, record, claims);
    const alternatives = this.alternativesRecommender.findAlternatives(record, result.score, referenceData);

    return {
      product: record.product,
      brand: record.brand,
      claims,
      result,
      explanation,
      alternatives
    };
  }
}
