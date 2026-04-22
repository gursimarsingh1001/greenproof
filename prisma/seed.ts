import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  brandCertifications,
  brands,
  certifications,
  impossibleClaims,
  productCertifications,
  products,
  vagueTerms
} from "../src/lib/seed-data.js";
import { certificationSources } from "../src/lib/certification-sources.js";
import { brandAliases, officialEvidenceSeeds, productAliases } from "../src/lib/official-evidence-seeds.js";

const prisma = new PrismaClient();

/**
 * Reads an identifier from a lookup map and throws a helpful seed error if it is missing.
 */
function getId(lookup: Map<string, number>, key: string, label: string): number {
  const value = lookup.get(key);

  if (!value) {
    throw new Error(`Missing ${label}: ${key}`);
  }

  return value;
}

/**
 * Clears tables in dependency order so repeated local seeding stays deterministic.
 */
async function resetDatabase(): Promise<void> {
  await prisma.verificationSnapshot.deleteMany();
  await prisma.certificationEvidence.deleteMany();
  await prisma.certificationIngestionRun.deleteMany();
  await prisma.productCertification.deleteMany();
  await prisma.brandCertification.deleteMany();
  await prisma.productAlias.deleteMany();
  await prisma.brandAlias.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.certificationSource.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.vagueTerm.deleteMany();
  await prisma.impossibleClaim.deleteMany();
}

/**
 * Seeds reference dictionaries and returns a certification lookup keyed by acronym.
 */
async function seedReferenceData(): Promise<Map<string, number>> {
  const certificationLookup = new Map<string, number>();

  for (const certification of certifications) {
    const createdCertification = await prisma.certification.create({
      data: certification
    });

    certificationLookup.set(certification.acronym, createdCertification.id);
  }

  for (const vagueTerm of vagueTerms) {
    await prisma.vagueTerm.create({
      data: vagueTerm
    });
  }

  for (const impossibleClaim of impossibleClaims) {
    await prisma.impossibleClaim.create({
      data: impossibleClaim
    });
  }

  return certificationLookup;
}

/**
 * Seeds brands and returns a brand lookup keyed by name.
 */
async function seedBrands(): Promise<Map<string, number>> {
  const brandLookup = new Map<string, number>();

  for (const brand of brands) {
    const createdBrand = await prisma.brand.create({
      data: {
        flagReason: brand.flagReason ?? null,
        isFlagged: brand.isFlagged,
        name: brand.name,
        reputationScore: brand.reputationScore,
        website: brand.website ?? null
      }
    });

    brandLookup.set(brand.name, createdBrand.id);
  }

  return brandLookup;
}

/**
 * Seeds product records and returns a product lookup keyed by product name.
 */
async function seedProducts(brandLookup: Map<string, number>): Promise<Map<string, number>> {
  const productLookup = new Map<string, number>();

  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: {
        barcode: product.barcode,
        brandId: getId(brandLookup, product.brandName, "brand"),
        category: product.category,
        claims: product.claims as Prisma.InputJsonValue,
        description: product.description,
        imageUrl: product.imageUrl ?? null,
        priceCents: product.priceCents ?? null,
        name: product.name
      }
    });

    productLookup.set(product.name, createdProduct.id);
  }

  return productLookup;
}

/**
 * Seeds official source registry rows.
 */
async function seedCertificationSources(): Promise<void> {
  for (const source of certificationSources) {
    await prisma.certificationSource.create({
      data: source
    });
  }
}

/**
 * Seeds brand and product alias tables for fuzzy matching.
 */
async function seedAliases(
  brandLookup: Map<string, number>,
  productLookup: Map<string, number>
): Promise<void> {
  for (const alias of brandAliases) {
    await prisma.brandAlias.create({
      data: {
        brandId: getId(brandLookup, alias.brandName, "brand"),
        alias: alias.alias,
        isPrimary: alias.isPrimary ?? false
      }
    });
  }

  for (const alias of productAliases) {
    await prisma.productAlias.create({
      data: {
        productId: getId(productLookup, alias.productName, "product"),
        alias: alias.alias,
        isPrimary: alias.isPrimary ?? false
      }
    });
  }
}

/**
 * Seeds certification join tables after base entities exist.
 */
async function seedCertificationLinks(
  brandLookup: Map<string, number>,
  certificationLookup: Map<string, number>,
  productLookup: Map<string, number>
): Promise<void> {
  for (const brandCertification of brandCertifications) {
    await prisma.brandCertification.create({
      data: {
        brandId: getId(brandLookup, brandCertification.brandName, "brand"),
        certificateNumber: brandCertification.certificateNumber,
        certificationId: getId(
          certificationLookup,
          brandCertification.certificationAcronym,
          "certification"
        ),
        expiryDate: brandCertification.expiryDate ? new Date(brandCertification.expiryDate) : null,
        isValid: brandCertification.isValid
      }
    });
  }

  for (const productCertification of productCertifications) {
    await prisma.productCertification.create({
      data: {
        certificateNumber: productCertification.certificateNumber,
        certificationId: getId(
          certificationLookup,
          productCertification.certificationAcronym,
          "certification"
        ),
        isVerified: productCertification.isVerified,
        productId: getId(productLookup, productCertification.productName, "product")
      }
    });
  }
}

/**
 * Seeds canonical official evidence rows that back the richer evidence layer.
 */
async function seedOfficialEvidence(
  brandLookup: Map<string, number>,
  certificationLookup: Map<string, number>,
  productLookup: Map<string, number>
): Promise<void> {
  for (const evidence of officialEvidenceSeeds) {
    await prisma.certificationEvidence.create({
      data: {
        sourceId: evidence.sourceId,
        certificationId: getId(
          certificationLookup,
          evidence.certificationAcronym,
          "certification"
        ),
        scope: evidence.scope,
        status: evidence.status,
        matchedVia: evidence.confidence && evidence.confidence < 0.98 ? "alias" : "exact",
        confidence: evidence.confidence ?? 1,
        externalBrandName: evidence.externalBrandName,
        externalProductName: evidence.externalProductName ?? null,
        certificateNumber: evidence.certificateNumber ?? null,
        sourceUrl: evidence.sourceUrl,
        rawPayload: (evidence.rawPayload ?? {}) as Prisma.InputJsonValue,
        checkedAt: new Date(evidence.checkedAt),
        expiresAt: evidence.expiresAt ? new Date(evidence.expiresAt) : null,
        brandId: evidence.matchedBrandName ? getId(brandLookup, evidence.matchedBrandName, "brand") : null,
        productId: evidence.matchedProductName ? getId(productLookup, evidence.matchedProductName, "product") : null
      }
    });
  }
}

/**
 * Seeds the complete GreenProof Phase 1 dataset.
 */
async function main(): Promise<void> {
  await resetDatabase();

  const certificationLookup = await seedReferenceData();
  const brandLookup = await seedBrands();
  const productLookup = await seedProducts(brandLookup);

  await seedCertificationSources();
  await seedAliases(brandLookup, productLookup);
  await seedCertificationLinks(brandLookup, certificationLookup, productLookup);
  await seedOfficialEvidence(brandLookup, certificationLookup, productLookup);

  console.info("GreenProof seed completed.");
  console.info(`Brands: ${brands.length}`);
  console.info(`Certifications: ${certifications.length}`);
  console.info(`Certification sources: ${certificationSources.length}`);
  console.info(`Products: ${products.length}`);
  console.info(`Brand aliases: ${brandAliases.length}`);
  console.info(`Product aliases: ${productAliases.length}`);
  console.info(`Brand certifications: ${brandCertifications.length}`);
  console.info(`Product certifications: ${productCertifications.length}`);
  console.info(`Official evidence rows: ${officialEvidenceSeeds.length}`);
  console.info(`Vague terms: ${vagueTerms.length}`);
  console.info(`Impossible claims: ${impossibleClaims.length}`);
}

main()
  .catch((error: unknown) => {
    console.error("GreenProof seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
