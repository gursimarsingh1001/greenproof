export type ProductScenario = "gold" | "mixed" | "greenwashing" | "edge";

export interface BrandSeed {
  name: string;
  website?: string;
  isFlagged: boolean;
  flagReason?: string;
  reputationScore: number;
}

export interface CertificationSeed {
  acronym: string;
  name: string;
  issuingBody: string;
  scope: string;
}

export interface BrandCertificationSeed {
  brandName: string;
  certificationAcronym: string;
  certificateNumber: string;
  isValid: boolean;
  expiryDate?: string;
}

export interface ProductCertificationSeed {
  productName: string;
  certificationAcronym: string;
  certificateNumber: string;
  isVerified: boolean;
}

export interface ProductSeed {
  name: string;
  brandName: string;
  barcode: string;
  category: string;
  description: string;
  imageUrl?: string;
  priceCents?: number;
  claims: string[];
  scenario: ProductScenario;
  expectedTrustScore: number;
}

export interface VagueTermSeed {
  term: string;
  category: string;
  penalty: number;
  explanation: string;
}

export interface ImpossibleClaimSeed {
  claimPattern: string;
  reason: string;
  penalty: number;
}

export type CertificationSourceSector = "fashion" | "cosmetics" | "household";
export type CertificationEvidenceScope = "product" | "brand";
export type CertificationEvidenceStatus =
  | "verified"
  | "expired"
  | "manual_review"
  | "unmatched"
  | "unsupported";

export interface CertificationSourceSeed {
  id: string;
  sector: CertificationSourceSector;
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

export interface BrandAliasSeed {
  brandName: string;
  alias: string;
  isPrimary?: boolean;
}

export interface ProductAliasSeed {
  productName: string;
  alias: string;
  isPrimary?: boolean;
}

export interface OfficialEvidenceSeed {
  sourceId: string;
  certificationAcronym: string;
  scope: CertificationEvidenceScope;
  externalBrandName: string;
  externalProductName?: string;
  matchedBrandName?: string;
  matchedProductName?: string;
  certificateNumber?: string;
  sourceUrl: string;
  checkedAt: string;
  expiresAt?: string;
  status: CertificationEvidenceStatus;
  confidence?: number;
  rawPayload?: Record<string, unknown>;
}
