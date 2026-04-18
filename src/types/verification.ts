export type ClaimType = "certifiable" | "measurable" | "verifiable" | "vague" | "impossible";
export type VerificationConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";
export type VerificationRating = "TRUSTED" | "MODERATE" | "SUSPICIOUS" | "UNVERIFIED";
export type VerificationModule = "certification" | "vagueness" | "impossibility" | "brand" | "consistency";
export type ProductDataSource = "local_seed" | "open_food_facts";

export type VerificationPenaltyType =
  | "BRAND_CERT_ONLY"
  | "BRAND_EVIDENCE_ONLY"
  | "NO_CERTIFICATION"
  | "NO_SUPPORTING_EVIDENCE"
  | "NO_SUSTAINABILITY_EVIDENCE"
  | "NO_VERIFIABLE_ECO_SIGNALS"
  | "MEASURABLE_WITHOUT_DETAILS"
  | "VAGUE_TERM_USED"
  | "VAGUE_WITHOUT_SPECIFICS"
  | "IMPOSSIBLE_CLAIM"
  | "FLAGGED_BRAND"
  | "LOW_REPUTATION"
  | "TOO_MANY_ABSOLUTES"
  | "CONTRADICTORY_CLAIMS";

export type VerificationBonusType = "PRODUCT_CERTIFICATION_FOUND" | "GOOD_REPUTATION";

export interface ClaimPosition {
  start: number;
  end: number;
}

export interface ExtractedClaim {
  text: string;
  type: ClaimType;
  confidence: number;
  position: ClaimPosition;
}

export interface VerificationProduct {
  id: number;
  name: string;
  brandId: number;
  barcode: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  priceCents?: number | null;
  claims: string[];
}

export interface ProductSourceDetails {
  label: string;
  productUrl?: string | null;
  labels?: string[];
  packaging?: string[];
  ecoscoreGrade?: string | null;
  ecoscoreScore?: number | null;
  nutriscoreGrade?: string | null;
  novaGroup?: number | null;
}

export interface VerificationBrand {
  id: number;
  name: string;
  website?: string | null;
  isFlagged: boolean;
  flagReason?: string | null;
  reputationScore: number;
}

export interface VerificationCertification {
  id: number;
  name: string;
  acronym: string;
  issuingBody: string;
  scope: string;
}

export interface VerificationBrandCertification {
  brandId: number;
  certificationId: number;
  certificateNumber?: string | null;
  isValid: boolean;
  expiryDate?: Date | string | null;
}

export interface VerificationProductCertification {
  productId: number;
  certificationId: number;
  certificateNumber?: string | null;
  isVerified: boolean;
}

export interface VerificationVagueTerm {
  term: string;
  category: string;
  penalty: number;
  explanation: string;
}

export interface VerificationImpossibleClaim {
  claimPattern: string;
  reason: string;
  penalty: number;
}

export interface VerificationPenalty {
  type: VerificationPenaltyType;
  module: VerificationModule;
  claim?: string;
  impact: number;
  message: string;
}

export interface VerificationBonus {
  type: VerificationBonusType;
  module: VerificationModule;
  claim?: string;
  impact: number;
  message: string;
}

export interface VerificationBreakdown {
  certificationScore: number;
  vaguenessScore: number;
  impossibilityScore: number;
  brandScore: number;
  consistencyScore: number;
}

export interface TrustScoreResult {
  score: number;
  rating: VerificationRating;
  color: string;
  emoji: string;
  confidenceLevel: VerificationConfidenceLevel;
  confidencePercentage: number;
  penalties: VerificationPenalty[];
  bonuses: VerificationBonus[];
  breakdown: VerificationBreakdown;
}

export interface ExplanationIndicator {
  icon: string;
  text: string;
  impact?: number;
}

export interface VerificationExplanation {
  summary: string;
  positiveIndicators: ExplanationIndicator[];
  negativeIndicators: ExplanationIndicator[];
  recommendations: string[];
}

export interface VerificationAlternative {
  product: VerificationProduct;
  brand: VerificationBrand;
  trustScore: number;
  scoreDifference: number;
  whyBetter: string;
}

export interface VerificationRecord {
  product: VerificationProduct;
  brand: VerificationBrand;
  dataSource: ProductDataSource;
  sourceUrl?: string | null;
  sourceDetails?: ProductSourceDetails | null;
  rawText?: string;
  productCertifications: VerificationProductCertification[];
  brandCertifications: VerificationBrandCertification[];
  cachedTrustScore?: number;
}

export interface VerificationReferenceData {
  certifications: VerificationCertification[];
  vagueTerms: VerificationVagueTerm[];
  impossibleClaims: VerificationImpossibleClaim[];
  catalog?: VerificationRecord[];
}

export interface VerificationOutcome {
  product: VerificationProduct;
  brand: VerificationBrand;
  claims: ExtractedClaim[];
  result: TrustScoreResult;
  explanation: VerificationExplanation;
  alternatives: VerificationAlternative[];
}
