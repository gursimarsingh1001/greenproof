import assert from "node:assert/strict";
import { ClaimExtractor, TrustScorer, VerificationEngine } from "../src/engine/index.js";
import { TEXT_SEGMENT_SEPARATOR } from "../src/lib/constants.js";
import {
  brandCertifications,
  brands,
  certifications,
  impossibleClaims,
  productCertifications,
  products,
  vagueTerms
} from "../src/lib/seed-data.js";
import type {
  ClaimType,
  ExtractedClaim,
  VerificationBrand,
  VerificationCertification,
  VerificationRecord,
  VerificationReferenceData
} from "../src/types/index.js";

/**
 * Creates a compact extracted claim for scorer unit tests.
 */
function createClaim(text: string, type: ClaimType): ExtractedClaim {
  return {
    text,
    type,
    confidence: 0.95,
    position: {
      start: 0,
      end: text.length
    }
  };
}

/**
 * Builds a minimal verification record for scorer-focused unit tests.
 */
function createRecord(overrides: Partial<VerificationRecord> = {}): VerificationRecord {
  return {
    product: {
      id: 1,
      name: "Demo Product",
      brandId: 1,
      barcode: "0000000000000",
      category: "Demo",
      description: "Demo description",
      claims: []
    },
    brand: {
      id: 1,
      name: "Demo Brand",
      isFlagged: false,
      reputationScore: 0.6
    },
    dataSource: "local_seed",
    sourceDetails: {
      label: "GreenProof Seed Catalog"
    },
    productCertifications: [],
    brandCertifications: [],
    ...overrides
  };
}

/**
 * Builds a seeded integration dataset with stable numeric ids for engine tests.
 */
function buildSeedReferenceData(): { recordsByName: Map<string, VerificationRecord>; referenceData: VerificationReferenceData } {
  const certificationRecords: VerificationCertification[] = certifications.map((certification, index) => ({
    ...certification,
    id: index + 1
  }));
  const certificationIdByAcronym = new Map(certificationRecords.map((certification) => [certification.acronym, certification.id]));
  const brandRecords = brands.map((brand, index) => ({
    ...brand,
    id: index + 1
  }));
  const brandIdByName = new Map(brandRecords.map((brand) => [brand.name, brand.id]));
  const brandByName = new Map(brandRecords.map((brand) => [brand.name, brand]));
  const productRecords = products.map((product, index) => ({
    ...product,
    id: index + 1,
    brandId: brandIdByName.get(product.brandName) ?? 0
  }));
  const productIdByName = new Map(productRecords.map((product) => [product.name, product.id]));

  const records = productRecords.map<VerificationRecord>((product) => ({
    product: {
      id: product.id,
      name: product.name,
      brandId: product.brandId,
      barcode: product.barcode,
      category: product.category,
      description: product.description,
      imageUrl: product.imageUrl ?? null,
      claims: product.claims
    },
    brand: brandByName.get(product.brandName) as VerificationBrand,
    dataSource: "local_seed",
    sourceDetails: {
      label: "GreenProof Seed Catalog"
    },
    rawText: `${product.description}${TEXT_SEGMENT_SEPARATOR}${product.claims.join(TEXT_SEGMENT_SEPARATOR)}`,
    productCertifications: productCertifications
      .filter((certification) => certification.productName === product.name)
      .map((certification) => ({
        productId: productIdByName.get(certification.productName) ?? 0,
        certificationId: certificationIdByAcronym.get(certification.certificationAcronym) ?? 0,
        certificateNumber: certification.certificateNumber,
        isVerified: certification.isVerified
      })),
    brandCertifications: brandCertifications
      .filter((certification) => certification.brandName === product.brandName)
      .map((certification) => ({
        brandId: brandIdByName.get(certification.brandName) ?? 0,
        certificationId: certificationIdByAcronym.get(certification.certificationAcronym) ?? 0,
        certificateNumber: certification.certificateNumber,
        isValid: certification.isValid,
        expiryDate: certification.expiryDate ?? null
      }))
  }));

  const recordsByName = new Map(records.map((record) => [record.product.name, record]));

  return {
    recordsByName,
    referenceData: {
      certifications: certificationRecords,
      vagueTerms,
      impossibleClaims,
      catalog: records
    }
  };
}

const extractor = new ClaimExtractor();
const scorer = new TrustScorer();
const referenceData: VerificationReferenceData = {
  certifications: [
    {
      id: 1,
      name: "Global Organic Textile Standard",
      acronym: "GOTS",
      issuingBody: "Global Standard gGmbH",
      scope: "organic"
    },
    {
      id: 2,
      name: "Global Recycled Standard",
      acronym: "GRS",
      issuingBody: "Textile Exchange",
      scope: "recycled-content"
    },
    {
      id: 3,
      name: "Carbon Trust Standard",
      acronym: "CTS",
      issuingBody: "Carbon Trust",
      scope: "climate"
    }
  ],
  vagueTerms,
  impossibleClaims
};

const extractedClaims = extractor.extractClaims(
  "Certified organic cotton with fair-trade sourcing, cruelty-free testing, recycled fibers, carbon-neutral shipping, vegan dyes, B.Corp values, FSC packaging, OEKO-TEX lining, Rainforest Alliance cotton, eco-friendly natural sustainable clean responsible design, environmentally friendly finish, chemical-free and harmless."
);

assert(extractedClaims.some((claim) => claim.text.includes("organic") && claim.type === "certifiable"));
assert(extractedClaims.some((claim) => claim.text.includes("fair trade") && claim.type === "certifiable"));
assert(extractedClaims.some((claim) => claim.text.includes("cruelty free") && claim.type === "certifiable"));
assert(extractedClaims.some((claim) => claim.text.includes("recycled") && claim.type === "measurable"));
assert(extractedClaims.some((claim) => claim.text.includes("carbon neutral") && claim.type === "verifiable"));
assert(extractedClaims.some((claim) => claim.text.includes("vegan") && claim.type === "certifiable"));
assert(extractedClaims.some((claim) => claim.text.includes("b corp") && claim.type === "certifiable"));
assert(extractedClaims.some((claim) => claim.text.includes("fsc") && claim.type === "certifiable"));
assert(extractedClaims.some((claim) => claim.text.includes("oeko tex") && claim.type === "certifiable"));
assert(extractedClaims.some((claim) => claim.text.includes("rainforest alliance") && claim.type === "certifiable"));
assert(extractedClaims.some((claim) => claim.text.includes("eco friendly") && claim.type === "vague"));
assert(extractedClaims.some((claim) => claim.text === "natural" && claim.type === "vague"));
assert(extractedClaims.some((claim) => claim.text.includes("sustainable") && claim.type === "vague"));
assert(extractedClaims.some((claim) => claim.text.includes("clean") && claim.type === "vague"));
assert(extractedClaims.some((claim) => claim.text.includes("environmentally friendly") && claim.type === "vague"));
assert(extractedClaims.some((claim) => claim.text.includes("chemical free") && claim.type === "impossible"));
assert(extractedClaims.some((claim) => claim.text.includes("harmless") && claim.type === "impossible"));

const repeatedOccurrenceClaims = extractor.extractClaims("Eco-friendly packaging with eco-friendly messaging.");

assert.equal(
  repeatedOccurrenceClaims.filter((claim) => claim.type === "vague" && claim.text === "eco friendly").length,
  2
);
assert.notEqual(
  repeatedOccurrenceClaims.filter((claim) => claim.type === "vague" && claim.text === "eco friendly")[0]?.position.start,
  repeatedOccurrenceClaims.filter((claim) => claim.type === "vague" && claim.text === "eco friendly")[1]?.position.start
);

const brandCertOnlyRecord = createRecord({
  brandCertifications: [
    {
      brandId: 1,
      certificationId: 1,
      certificateNumber: "GOTS-DEMO-001",
      isValid: true
    }
  ]
});
const brandCertOnlyResult = scorer.calculateTrustScore(
  brandCertOnlyRecord,
  [createClaim("organic", "certifiable")],
  referenceData
);

assert.equal(brandCertOnlyResult.score, 85);
assert.equal(brandCertOnlyResult.confidenceLevel, "LOW");
assert(brandCertOnlyResult.penalties.some((penalty) => penalty.type === "BRAND_CERT_ONLY"));

const vagueOnlyResult = scorer.calculateTrustScore(
  createRecord({
    brand: {
      id: 1,
      name: "LowRep Brand",
      isFlagged: false,
      reputationScore: 0.4
    }
  }),
  [createClaim("eco friendly", "vague")],
  referenceData
);

assert.equal(vagueOnlyResult.score, 60);
assert(vagueOnlyResult.penalties.some((penalty) => penalty.type === "VAGUE_TERM_USED"));
assert(vagueOnlyResult.penalties.some((penalty) => penalty.type === "VAGUE_WITHOUT_SPECIFICS"));
assert(vagueOnlyResult.penalties.some((penalty) => penalty.type === "LOW_REPUTATION"));

const multipleVagueClaimsResult = scorer.calculateTrustScore(
  createRecord(),
  [
    createClaim("natural", "vague"),
    {
      ...createClaim("sustainability", "vague"),
      position: {
        start: 12,
        end: 26
      }
    }
  ],
  referenceData
);

assert.equal(
  multipleVagueClaimsResult.penalties.filter((penalty) => penalty.type === "VAGUE_WITHOUT_SPECIFICS").length,
  1
);
assert.equal(multipleVagueClaimsResult.score, 52);
assert(
  multipleVagueClaimsResult.penalties.some(
    (penalty) =>
      penalty.type === "VAGUE_WITHOUT_SPECIFICS" &&
      penalty.message.includes("natural") &&
      penalty.message.includes("sustainability")
  )
);

const measurableEvidenceResult = scorer.calculateTrustScore(
  createRecord({
    rawText: "This item uses recycled cotton with no percentage disclosed.",
    productCertifications: [
      {
        productId: 1,
        certificationId: 2,
        certificateNumber: "GRS-DEMO-001",
        isVerified: true
      }
    ]
  }),
  [createClaim("recycled cotton", "measurable")],
  referenceData
);

assert.equal(measurableEvidenceResult.score, 88);
assert(measurableEvidenceResult.bonuses.some((bonus) => bonus.type === "PRODUCT_CERTIFICATION_FOUND"));
assert(measurableEvidenceResult.penalties.some((penalty) => penalty.type === "MEASURABLE_WITHOUT_DETAILS"));

const evidenceGapResult = scorer.calculateTrustScore(
  createRecord({
    rawText: "Carbon neutral shipping and ocean plastic claims appear with no evidence."
  }),
  [createClaim("carbon neutral", "verifiable"), createClaim("ocean plastic", "measurable")],
  referenceData
);

assert.equal(evidenceGapResult.score, 60);
assert.equal(evidenceGapResult.rating, "MODERATE");
assert.equal(
  evidenceGapResult.penalties.filter((penalty) => penalty.type === "NO_SUPPORTING_EVIDENCE").length,
  2
);

const importedNoEvidenceResult = scorer.calculateTrustScore(
  createRecord({
    dataSource: "open_food_facts",
    sourceDetails: {
      label: "Open Food Facts"
    }
  }),
  [],
  referenceData
);

assert.equal(importedNoEvidenceResult.score, 65);
assert(importedNoEvidenceResult.penalties.some((penalty) => penalty.type === "NO_SUSTAINABILITY_EVIDENCE"));
assert.equal(
  importedNoEvidenceResult.penalties.filter((penalty) => penalty.type === "NO_SUSTAINABILITY_EVIDENCE").length,
  1
);
assert.equal(
  importedNoEvidenceResult.penalties.filter((penalty) => penalty.type === "NO_VERIFIABLE_ECO_SIGNALS").length,
  0
);

const importedWeakEcoSignalResult = scorer.calculateTrustScore(
  createRecord({
    dataSource: "open_food_facts",
    sourceDetails: {
      label: "Open Food Facts",
      packaging: ["recyclable bottle"]
    },
    rawText: "recyclable packaging"
  }),
  [createClaim("recyclable", "measurable")],
  referenceData
);

assert.equal(importedWeakEcoSignalResult.score, 45);
assert(importedWeakEcoSignalResult.penalties.some((penalty) => penalty.type === "NO_SUSTAINABILITY_EVIDENCE"));
assert(importedWeakEcoSignalResult.penalties.some((penalty) => penalty.type === "NO_SUPPORTING_EVIDENCE"));

const absolutesResult = scorer.calculateTrustScore(
  createRecord(),
  [
    createClaim("100% natural", "impossible"),
    createClaim("100% carbon neutral", "verifiable"),
    createClaim("100% recycled", "measurable")
  ],
  referenceData
);

assert.equal(absolutesResult.score, 5);
assert(absolutesResult.penalties.some((penalty) => penalty.type === "IMPOSSIBLE_CLAIM"));
assert.equal(
  absolutesResult.penalties.filter((penalty) => penalty.type === "NO_SUPPORTING_EVIDENCE").length,
  2
);
assert(absolutesResult.penalties.some((penalty) => penalty.type === "TOO_MANY_ABSOLUTES"));

const { recordsByName, referenceData: seededReferenceData } = buildSeedReferenceData();
const engine = new VerificationEngine();
const noNastiesOutcome = engine.verify(
  recordsByName.get("No Nasties Blanc Classic Tee") as VerificationRecord,
  seededReferenceData
);
const adidasOutcome = engine.verify(recordsByName.get("Adidas Parley Shoes") as VerificationRecord, seededReferenceData);
const biotiqueOutcome = engine.verify(
  recordsByName.get("Biotique Fresh Neem Pimple Control Face Wash") as VerificationRecord,
  seededReferenceData
);
const urbanFuelOutcome = engine.verify(
  recordsByName.get("UrbanFuel Planet Friendly Laundry Pods") as VerificationRecord,
  seededReferenceData
);
const earthGlowOutcome = engine.verify(
  recordsByName.get("EarthGlow Home Compostable Trash Bags") as VerificationRecord,
  seededReferenceData
);
const teslaOutcome = engine.verify(recordsByName.get("Tesla Model Y") as VerificationRecord, seededReferenceData);
const importedNoEvidenceOutcome = engine.verify(
  createRecord({
    dataSource: "open_food_facts",
    sourceDetails: {
      label: "Open Food Facts",
      nutriscoreGrade: "E"
    }
  }),
  seededReferenceData
);
const calibratedDemoProducts = [
  "No Nasties Blanc Classic Tee",
  "Seventh Generation Dish Soap",
  "The Better Home Dishwash Liquid",
  "H&M Organic Cotton T-Shirt",
  "Adidas Parley Shoes",
  "Mamaearth Vitamin C Face Wash",
  "Biotique Fresh Neem Pimple Control Face Wash",
  "Mamaearth Onion Shampoo",
  "Tesla Model Y"
] as const;

assert.equal(noNastiesOutcome.result.rating, "TRUSTED");
assert(noNastiesOutcome.result.score >= 85);
assert.equal(adidasOutcome.result.rating, "MODERATE");
assert(adidasOutcome.result.score >= 60 && adidasOutcome.result.score <= 79);
assert(adidasOutcome.result.penalties.some((penalty) => penalty.type === "NO_SUPPORTING_EVIDENCE"));
assert.equal(biotiqueOutcome.result.rating, "UNVERIFIED");
assert(biotiqueOutcome.result.score <= 40);
assert(urbanFuelOutcome.result.score <= 40);
assert(urbanFuelOutcome.claims.some((claim) => claim.type === "impossible" && claim.text.includes("zero toxins")));
assert(earthGlowOutcome.result.score <= 40);
assert(earthGlowOutcome.claims.some((claim) => claim.text.includes("compostable")));
assert.equal(teslaOutcome.result.rating, "MODERATE");
assert(teslaOutcome.result.score >= 60 && teslaOutcome.result.score <= 79);
assert(importedNoEvidenceOutcome.explanation.summary.includes("external catalog data"));
assert(noNastiesOutcome.result.score > biotiqueOutcome.result.score);
assert(biotiqueOutcome.alternatives.length > 0);
assert(
  biotiqueOutcome.alternatives.every(
    (alternative) => alternative.product.category === biotiqueOutcome.product.category && alternative.scoreDifference > 5
  )
);

for (const productName of calibratedDemoProducts) {
  const seededProduct = products.find((product) => product.name === productName);
  const seededRecord = recordsByName.get(productName);
  const seededOutcome = engine.verify(seededRecord as VerificationRecord, seededReferenceData);

  assert(seededProduct, `Missing calibrated demo product seed: ${productName}`);
  assert(
    Math.abs(seededOutcome.result.score - seededProduct.expectedTrustScore) <= 4,
    `${productName} drifted too far from its demo target. Expected near ${seededProduct.expectedTrustScore}, received ${seededOutcome.result.score}.`
  );
}

console.info("GreenProof engine tests passed.");
