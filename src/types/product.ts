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
