import type {
  ExtractedClaim,
  ProductDataSource,
  ProductSourceDetails,
  TrustScoreResult,
  VerificationAlternative,
  VerificationExplanation,
  VerificationRating
} from "./verification.js";

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface ApiCertificationEvidence {
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

export interface CertificationCatalogItem {
  id: number;
  name: string;
  acronym: string;
  issuingBody: string;
  scope: string;
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
}

export interface CertificationSourceRegistryPayload {
  totalSources: number;
  bySector: Record<string, number>;
  entries: CertificationSourceEntry[];
}

export interface ApiBrandDetails {
  id: number;
  name: string;
  website?: string | null;
  isFlagged: boolean;
  flagReason?: string | null;
  reputationScore: number;
  certifications: ApiCertificationEvidence[];
}

export interface ApiProductDetails {
  id: number;
  name: string;
  brandId: number;
  barcode: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  priceCents?: number | null;
  claims: string[];
  certifications: ApiCertificationEvidence[];
}

export interface ScanRequestPayload {
  barcode?: string;
  query?: string;
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
  product: ApiProductDetails;
  brand: ApiBrandDetails;
  dataSource: ProductDataSource;
  sourceDetails?: ProductSourceDetails;
  claims: ExtractedClaim[];
  result: TrustScoreResult;
  explanation: VerificationExplanation;
  alternatives: VerificationAlternative[];
}

export interface ScanResponsePayload extends VerificationReportPayload {
  integrity: IntegrityMetadata;
}

export interface ProductVerificationPayload extends ScanResponsePayload {}

export interface VerifyIntegrityRequestPayload {
  displayId: string;
  report: VerificationReportPayload;
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

export interface BrandHistoryEvent {
  date: string;
  title: string;
  detail: string;
  severity: "positive" | "warning" | "neutral";
}

export interface BrandScoreSnapshot {
  productId: number;
  productName: string;
  score: number;
  rating: VerificationRating;
  sampledAt: string;
}

export interface BrandNewsMention {
  title: string;
  summary: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  publishedAt: string;
}

export interface BrandReputationPayload {
  brand: ApiBrandDetails;
  history: BrandHistoryEvent[];
  pastScores: BrandScoreSnapshot[];
  newsMentions: BrandNewsMention[];
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

export interface FeedbackRequestPayload {
  productId: number;
  issueType: "incorrect-score" | "missing-certification" | "incorrect-brand-data" | "other";
  message: string;
  email?: string;
  reportedScore?: number;
  expectedScore?: number;
}

export interface FeedbackReceiptPayload {
  id: number;
  productId?: number | null;
  issueType: string;
  message: string;
  email?: string | null;
  reportedScore?: number | null;
  expectedScore?: number | null;
  createdAt: string;
}
