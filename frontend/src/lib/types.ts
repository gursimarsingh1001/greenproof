export type VerificationRating = "TRUSTED" | "MODERATE" | "SUSPICIOUS" | "UNVERIFIED";
export type VerificationConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";
export type ProductDataSource = "local_seed" | "open_food_facts" | "official_evidence_import";
export type EvidenceLookupMode = "cached" | "live_refresh" | "none_found";
export type EvidenceFreshness = "fresh" | "stale" | "unavailable";

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CertificationEvidence {
  id: number;
  name: string;
  acronym: string;
  issuingBody: string;
  scope: string;
  certificateNumber?: string | null;
  status: "product" | "brand";
  isVerified: boolean;
  expiryDate?: string | null;
}

export interface CertificationSourceEntry {
  id: string;
  sector: "fashion" | "cosmetics" | "household";
  certificationName: string;
  databaseUrl: string;
  access: string;
  notes: string;
  coverageHint?: string;
  isOfficial: boolean;
  isSupported: boolean;
  wave: number;
  priority: number;
}

export interface CertificationSourceRegistryPayload {
  totalSources: number;
  bySector: Record<string, number>;
  entries: CertificationSourceEntry[];
}

export interface ProductSummary {
  id: number;
  name: string;
  brandId: number;
  barcode: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  priceCents?: number | null;
  claims: string[];
  certifications: CertificationEvidence[];
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

export interface OfficialEvidenceItem {
  id: number;
  sourceId: string;
  sourceLabel: string;
  certificationId: number;
  certificationName: string;
  certificationAcronym: string;
  issuingBody: string;
  scope: "product" | "brand";
  status: "verified" | "expired" | "manual_review" | "unmatched" | "unsupported";
  confidence: number;
  matchedVia: string;
  sourceUrl?: string | null;
  certificateNumber?: string | null;
  externalBrandName: string;
  externalProductName?: string | null;
  checkedAt: string;
  expiresAt?: string | null;
  rawPayload?: Record<string, unknown> | null;
  isProjected: boolean;
}

export interface BrandSummary {
  id: number;
  name: string;
  website?: string | null;
  isFlagged: boolean;
  flagReason?: string | null;
  reputationScore: number;
  certifications: CertificationEvidence[];
}

export interface ExtractedClaim {
  text: string;
  type: "certifiable" | "measurable" | "verifiable" | "vague" | "impossible";
  confidence: number;
  position: {
    start: number;
    end: number;
  };
}

export interface VerificationEvent {
  type: string;
  module: "certification" | "vagueness" | "impossibility" | "brand" | "consistency";
  claim?: string;
  impact: number;
  message: string;
}

export interface VerificationResult {
  score: number;
  rating: VerificationRating;
  color: string;
  emoji: string;
  confidenceLevel: VerificationConfidenceLevel;
  confidencePercentage: number;
  penalties: VerificationEvent[];
  bonuses: VerificationEvent[];
  breakdown: {
    certificationScore: number;
    vaguenessScore: number;
    impossibilityScore: number;
    brandScore: number;
    consistencyScore: number;
  };
}

export interface VerificationExplanation {
  summary: string;
  positiveIndicators: Array<{
    icon: string;
    text: string;
  }>;
  negativeIndicators: Array<{
    icon: string;
    text: string;
    impact?: number;
  }>;
  recommendations: string[];
}

export interface VerificationAlternative {
  product: {
    id: number;
    name: string;
    brandId: number;
    barcode: string;
    category: string;
    description?: string | null;
    imageUrl?: string | null;
    priceCents?: number | null;
    claims: string[];
  };
  brand: {
    id: number;
    name: string;
    website?: string | null;
    isFlagged: boolean;
    flagReason?: string | null;
    reputationScore: number;
  };
  trustScore: number;
  scoreDifference: number;
  whyBetter: string;
}

export interface IntegrityMetadata {
  displayId: string;
  resultHash: string;
  algorithm: "SHA-256";
  algorithmVersion: string;
  storedAt: string;
  capabilities: string[];
  limitations: string[];
}

export interface VerificationReportPayload {
  product: ProductSummary;
  brand: BrandSummary;
  dataSource: ProductDataSource;
  sourceDetails?: ProductSourceDetails;
  evidenceLookup: EvidenceLookupMode;
  evidenceSources: string[];
  evidenceFreshness: EvidenceFreshness;
  officialEvidence: {
    lastCheckedAt?: string | null;
    product: OfficialEvidenceItem[];
    brand: OfficialEvidenceItem[];
  };
  claims: ExtractedClaim[];
  result: VerificationResult;
  explanation: VerificationExplanation;
  alternatives: VerificationAlternative[];
}

export interface ScanResultPayload extends VerificationReportPayload {
  integrity: IntegrityMetadata;
}

export interface BrandReputationPayload {
  brand: BrandSummary;
  history: Array<{
    date: string;
    title: string;
    detail: string;
    severity: "positive" | "warning" | "neutral";
  }>;
  pastScores: Array<{
    productId: number;
    productName: string;
    score: number;
    rating: VerificationRating;
    sampledAt: string;
  }>;
  newsMentions: Array<{
    title: string;
    summary: string;
    source: string;
    sentiment: "positive" | "negative" | "neutral";
    publishedAt: string;
  }>;
  averageTrustScore: number;
}

export interface StatsPayload {
  productsAnalyzed: number;
  brandsTracked: number;
  certificationsRecognized: number;
  flaggedBrands: number;
  feedbackCount: number;
  averageTrustScore: number;
  averageBrandReputation: number;
  ratingDistribution: Record<VerificationRating, number>;
  mostTrustedProduct?: {
    productId: number;
    productName: string;
    score: number;
  };
  mostQuestionableProduct?: {
    productId: number;
    productName: string;
    score: number;
  };
}

export interface FeedbackPayload {
  productId: number;
  issueType: "incorrect-score" | "missing-certification" | "incorrect-brand-data" | "other";
  message: string;
  email?: string;
  reportedScore?: number;
  expectedScore?: number;
}

export interface VerifyIntegrityPayload {
  displayId: string;
  verified: boolean;
  message: string;
  checkedAt: string;
  storedAt: string;
  storedHash: string;
  submittedHash: string;
  algorithm: "SHA-256";
  algorithmVersion: string;
  capabilities: string[];
  limitations: string[];
}

export interface RecentScanItem {
  productId: number;
  productName: string;
  brandName: string;
  score: number;
  rating: VerificationRating;
  scannedAt: string;
}
