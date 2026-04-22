import { Prisma } from "@prisma/client";
import { db } from "../../lib/db.js";
import { parseClaims, parseSourceDetails } from "../../lib/utils.js";
import type {
  ApiBrandDetails,
  ApiProductDetails,
  CertificationCatalogItem
} from "../../types/api.js";
import type {
  ProductSourceDetails,
  VerificationBrand,
  VerificationRecord,
  VerificationReferenceData
} from "../../types/index.js";
import { TEXT_SEGMENT_SEPARATOR } from "../../lib/constants.js";

const productInclude = Prisma.validator<Prisma.ProductInclude>()({
  brand: {
    include: {
      brandCertifications: {
        include: {
          certification: true
        }
      }
    }
  },
  productCertifications: {
    include: {
      certification: true
    }
  }
});

const brandInclude = Prisma.validator<Prisma.BrandInclude>()({
  brandCertifications: {
    include: {
      certification: true
    }
  }
});

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;
export type BrandWithRelations = Prisma.BrandGetPayload<{ include: typeof brandInclude }>;

export interface LoadedVerificationData {
  products: ProductWithRelations[];
  recordsByProductId: Map<number, VerificationRecord>;
  referenceData: VerificationReferenceData;
}

/**
 * Loads the full verification dataset from Prisma and maps it into engine-ready records.
 */
export async function loadVerificationData(): Promise<LoadedVerificationData> {
  const [products, certifications, vagueTerms, impossibleClaims] = await Promise.all([
    db.product.findMany({
      include: productInclude,
      orderBy: {
        id: "asc"
      }
    }),
    db.certification.findMany({
      orderBy: {
        name: "asc"
      }
    }),
    db.vagueTerm.findMany({
      orderBy: {
        term: "asc"
      }
    }),
    db.impossibleClaim.findMany({
      orderBy: {
        claimPattern: "asc"
      }
    })
  ]);

  const records = products.map(mapProductToVerificationRecord);

  return {
    products,
    recordsByProductId: new Map(records.map((record) => [record.product.id, record])),
    referenceData: {
      certifications: certifications.map((certification) => ({
        id: certification.id,
        name: certification.name,
        acronym: certification.acronym,
        issuingBody: certification.issuingBody,
        scope: certification.scope
      })),
      vagueTerms: vagueTerms.map((term) => ({
        term: term.term,
        category: term.category,
        penalty: term.penalty,
        explanation: term.explanation
      })),
      impossibleClaims: impossibleClaims.map((claim) => ({
        claimPattern: claim.claimPattern,
        reason: claim.reason,
        penalty: claim.penalty
      })),
      catalog: records
    }
  };
}

/**
 * Finds one brand with its certification metadata.
 */
export async function findBrandWithRelations(brandId: number): Promise<BrandWithRelations | null> {
  return db.brand.findUnique({
    where: {
      id: brandId
    },
    include: brandInclude
  });
}

/**
 * Serializes a product row into the API payload shape.
 */
export function serializeProductDetails(product: ProductWithRelations): ApiProductDetails {
  return {
    id: product.id,
    name: product.name,
    brandId: product.brandId,
    barcode: product.barcode,
    category: product.category,
    description: product.description,
    imageUrl: product.imageUrl,
    priceCents: product.priceCents,
    claims: parseClaims(product.claims),
    certifications: product.productCertifications.map((certification) => ({
      ...serializeCertificationCatalogItem(certification.certification),
      certificateNumber: certification.certificateNumber,
      status: "product" as const,
      isVerified: certification.isVerified
    }))
  };
}

/**
 * Serializes a brand row into the API payload shape.
 */
export function serializeBrandDetails(brand: BrandWithRelations | ProductWithRelations["brand"]): ApiBrandDetails {
  return {
    id: brand.id,
    name: brand.name,
    website: brand.website,
    isFlagged: brand.isFlagged,
    flagReason: brand.flagReason,
    reputationScore: brand.reputationScore,
    certifications: brand.brandCertifications.map((certification) => ({
      ...serializeCertificationCatalogItem(certification.certification),
      certificateNumber: certification.certificateNumber,
      status: "brand" as const,
      isVerified: certification.isValid,
      expiryDate: certification.expiryDate?.toISOString() ?? null
    }))
  };
}

/**
 * Serializes one certification row from Prisma.
 */
export function serializeCertificationCatalogItem(certification: {
  id: number;
  name: string;
  acronym: string;
  issuingBody: string;
  scope: string;
}): CertificationCatalogItem {
  return {
    id: certification.id,
    name: certification.name,
    acronym: certification.acronym,
    issuingBody: certification.issuingBody,
    scope: certification.scope
  };
}

/**
 * Builds a normalized source-details payload for API responses and engine records.
 */
export function buildSourceDetails(product: {
  dataSource: string;
  sourceUrl?: string | null;
  sourceMetadata?: Prisma.JsonValue | null;
}): ProductSourceDetails | undefined {
  const parsedSourceDetails = parseSourceDetails(product.sourceMetadata);

  if (product.dataSource === "open_food_facts") {
    return {
      label: parsedSourceDetails?.label ?? "Open Food Facts",
      ...(product.sourceUrl ? { productUrl: product.sourceUrl } : {}),
      ...(parsedSourceDetails?.labels ? { labels: parsedSourceDetails.labels } : {}),
      ...(parsedSourceDetails?.packaging ? { packaging: parsedSourceDetails.packaging } : {}),
      ...(parsedSourceDetails?.ecoscoreGrade ? { ecoscoreGrade: parsedSourceDetails.ecoscoreGrade } : {}),
      ...(parsedSourceDetails?.ecoscoreScore !== undefined ? { ecoscoreScore: parsedSourceDetails.ecoscoreScore } : {}),
      ...(parsedSourceDetails?.nutriscoreGrade ? { nutriscoreGrade: parsedSourceDetails.nutriscoreGrade } : {}),
      ...(parsedSourceDetails?.novaGroup !== undefined ? { novaGroup: parsedSourceDetails.novaGroup } : {})
    };
  }

  if (product.dataSource === "official_evidence_import") {
    return {
      label: parsedSourceDetails?.label ?? "Official Evidence Import",
      ...(product.sourceUrl ? { productUrl: product.sourceUrl } : {}),
      ...(parsedSourceDetails?.labels ? { labels: parsedSourceDetails.labels } : {})
    };
  }

  return {
    label: "GreenProof Seed Catalog"
  };
}

/**
 * Maps a product row to the verification-engine record format.
 */
function mapProductToVerificationRecord(product: ProductWithRelations): VerificationRecord {
  const brand: VerificationBrand = {
    id: product.brand.id,
    name: product.brand.name,
    website: product.brand.website,
    isFlagged: product.brand.isFlagged,
    flagReason: product.brand.flagReason,
    reputationScore: product.brand.reputationScore
  };
  const sourceDetails = buildSourceDetails(product);
  const productClaims = parseClaims(product.claims);
  const rawText =
    product.dataSource === "open_food_facts"
      ? productClaims.join(TEXT_SEGMENT_SEPARATOR)
      : [product.description, ...productClaims].filter((value): value is string => Boolean(value)).join(TEXT_SEGMENT_SEPARATOR);

  return {
    product: {
      id: product.id,
      name: product.name,
      brandId: product.brandId,
      barcode: product.barcode,
      category: product.category,
      description: product.description,
      imageUrl: product.imageUrl,
      priceCents: product.priceCents,
      claims: productClaims
    },
    brand,
    dataSource:
      product.dataSource === "open_food_facts"
        ? "open_food_facts"
        : product.dataSource === "official_evidence_import"
          ? "official_evidence_import"
          : "local_seed",
    sourceUrl: product.sourceUrl,
    ...(sourceDetails ? { sourceDetails } : { sourceDetails: null }),
    rawText,
    productCertifications: product.productCertifications.map((certification) => ({
      productId: certification.productId,
      certificationId: certification.certificationId,
      certificateNumber: certification.certificateNumber,
      isVerified: certification.isVerified
    })),
    brandCertifications: product.brand.brandCertifications.map((certification) => ({
      brandId: certification.brandId,
      certificationId: certification.certificationId,
      certificateNumber: certification.certificateNumber,
      isValid: certification.isValid,
        expiryDate: certification.expiryDate
      }))
  };
}
