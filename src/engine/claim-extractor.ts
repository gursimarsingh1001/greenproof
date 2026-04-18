import { preprocessText } from "./claim-classifier.js";
import { CLAIM_PATTERN_LIBRARY } from "./patterns.js";
import type { ExtractedClaim } from "../types/index.js";

/**
 * Extracts claim matches from a product text blob using the known regex library.
 */
export class ClaimExtractor {
  /**
   * Finds structured claims in raw packaging, marketing, or description text.
   */
  public extractClaims(rawText: string): ExtractedClaim[] {
    const preprocessedText = preprocessText(rawText);
    const extractedClaims = CLAIM_PATTERN_LIBRARY.flatMap((patternDefinition) =>
      this.findPatternMatches(preprocessedText, patternDefinition.pattern, patternDefinition.confidence, patternDefinition.type)
    );

    return extractedClaims.sort(
      (leftClaim, rightClaim) => leftClaim.position.start - rightClaim.position.start
    );
  }

  /**
   * Executes one regex pattern repeatedly against the preprocessed source text.
   */
  private findPatternMatches(
    preprocessedText: string,
    pattern: RegExp,
    confidence: number,
    type: ExtractedClaim["type"]
  ): ExtractedClaim[] {
    const matches: ExtractedClaim[] = [];
    const globalPattern = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);

    let match: RegExpExecArray | null = globalPattern.exec(preprocessedText);
    while (match) {
      const matchedText = match[0].trim();

      if (matchedText.length > 0) {
        matches.push({
          text: matchedText,
          type,
          confidence,
          position: {
            start: match.index,
            end: match.index + match[0].length
          }
        });
      }

      match = globalPattern.exec(preprocessedText);
    }

    return matches;
  }
}
