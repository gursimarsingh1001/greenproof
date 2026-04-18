export const DEFAULT_VAGUE_TERM_PENALTY = -20;
export const DEFAULT_IMPOSSIBLE_CLAIM_PENALTY = -40;
export const BRAND_CERT_ONLY_PENALTY = -15;
export const BRAND_EVIDENCE_ONLY_PENALTY = -10;
export const NO_CERTIFICATION_PENALTY = -30;
export const NO_SUPPORTING_EVIDENCE_PENALTY = -20;
export const NO_SUSTAINABILITY_EVIDENCE_PENALTY = -35;
export const NO_VERIFIABLE_ECO_SIGNALS_PENALTY = -20;
export const MEASURABLE_WITHOUT_DETAILS_PENALTY = -12;
export const VAGUE_WITHOUT_SPECIFICS_PENALTY = -10;
export const FLAGGED_BRAND_PENALTY = -25;
export const LOW_REPUTATION_PENALTY = -10;
export const GOOD_REPUTATION_BONUS = 5;
export const TOO_MANY_ABSOLUTES_PENALTY = -15;
export const CONTRADICTORY_CLAIMS_PENALTY = -10;

export const MODULE_WEIGHTS = {
  certification: 30,
  vagueness: 20,
  impossibility: 25,
  brand: 15,
  consistency: 10
} as const;

export const RATING_COLORS = {
  TRUSTED: "#22c55e",
  MODERATE: "#eab308",
  SUSPICIOUS: "#f97316",
  UNVERIFIED: "#ef4444"
} as const;

export const RATING_EMOJIS = {
  TRUSTED: "✅",
  MODERATE: "⚠️",
  SUSPICIOUS: "🔶",
  UNVERIFIED: "❌"
} as const;

export const TEXT_SEGMENT_SEPARATOR = " %%% ";
