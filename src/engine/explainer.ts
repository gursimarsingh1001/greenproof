import type {
  ExtractedClaim,
  VerificationExplanation,
  VerificationRecord,
  TrustScoreResult
} from "../types/index.js";

/**
 * Converts a score result into human-readable explanation content.
 */
export class ExplanationGenerator {
  /**
   * Builds the summary, indicators, and recommendations for a verification result.
   */
  public generateExplanation(
    result: TrustScoreResult,
    record: VerificationRecord,
    claims: ExtractedClaim[]
  ): VerificationExplanation {
    const explanation: VerificationExplanation = {
      summary: this.generateSummary(result, record),
      positiveIndicators: result.bonuses.map((bonus) => ({
        icon: this.getIconForType(bonus.type),
        text: bonus.message
      })),
      negativeIndicators: result.penalties.map((penalty) => ({
        icon: this.getIconForType(penalty.type),
        text: penalty.message,
        impact: penalty.impact
      })),
      recommendations: []
    };

    if (
      result.penalties.some(
        (penalty) => penalty.type === "NO_CERTIFICATION" || penalty.type === "NO_SUPPORTING_EVIDENCE"
      )
    ) {
      explanation.recommendations.push("Ask the brand for specific certification documentation");
    }

    if (result.penalties.some((penalty) => penalty.type === "NO_SUSTAINABILITY_EVIDENCE")) {
      explanation.recommendations.push(
        "Treat this result as a lack-of-proof warning from external catalog data, then verify the product on-pack or on the brand site."
      );
    }

    if (result.penalties.some((penalty) => penalty.type.startsWith("VAGUE"))) {
      explanation.recommendations.push(
        "Look for products with specific, measurable claims instead of vague terms like 'eco-friendly'"
      );
    }

    if (result.penalties.some((penalty) => penalty.type === "FLAGGED_BRAND")) {
      explanation.recommendations.push("Consider switching to a brand with better environmental track record");
    }

    if (result.score < 60) {
      explanation.recommendations.push("Check our recommended alternatives below for better options");
    }

    return explanation;
  }

  /**
   * Creates the headline summary text for the result.
   */
  private generateSummary(result: TrustScoreResult, record: VerificationRecord): string {
    if (
      record.dataSource === "open_food_facts" &&
      result.penalties.some(
        (penalty) => penalty.type === "NO_SUSTAINABILITY_EVIDENCE" || penalty.type === "NO_VERIFIABLE_ECO_SIGNALS"
      )
    ) {
      return `${record.product.name} was identified through external catalog data, but GreenProof found limited sustainability evidence in that source record. This score reflects missing eco-proof and weak verification signals, not a claim that the product is definitively fraudulent.`;
    }

    if (result.score >= 80) {
      return `${record.product.name} appears to have credible sustainability claims backed by verifiable certifications. We found ${result.bonuses.length} positive indicators supporting their claims.`;
    }

    if (result.score >= 60) {
      return `${record.product.name} has some credible elements but also raises some concerns. While certain claims are supported, we found ${result.penalties.length} issues that lower the overall trust score. Review the details below.`;
    }

    if (result.score >= 40) {
      return `${record.product.name} shows significant red flags regarding its sustainability claims. We found ${result.penalties.length} concerning indicators including vague terminology and lack of certification. Proceed with caution.`;
    }

    return `${record.product.name} appears to engage in greenwashing based on our analysis. Multiple claims could not be verified, and the brand has trust issues. We strongly recommend considering alternatives.`;
  }

  /**
   * Maps internal score events to lightweight UI icon tokens.
   */
  private getIconForType(type: string): string {
    if (type.includes("CERT")) {
      return "badge-check";
    }

    if (type.includes("EVIDENCE")) {
      return "shield-alert";
    }

    if (type.includes("VAGUE")) {
      return "alert-triangle";
    }

    if (type.includes("DETAIL")) {
      return "ruler";
    }

    if (type.includes("IMPOSSIBLE") || type.includes("CONTRADICT")) {
      return "flask-conical-off";
    }

    if (type.includes("BRAND") || type.includes("REPUTATION")) {
      return "building-2";
    }

    return "info";
  }
}
