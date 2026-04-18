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
  await prisma.productCertification.deleteMany();
  await prisma.brandCertification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
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
 * Seeds the complete GreenProof Phase 1 dataset.
 */
async function main(): Promise<void> {
  await resetDatabase();

  const certificationLookup = await seedReferenceData();
  const brandLookup = await seedBrands();
  const productLookup = await seedProducts(brandLookup);

  await seedCertificationLinks(brandLookup, certificationLookup, productLookup);

  console.info("GreenProof seed completed.");
  console.info(`Brands: ${brands.length}`);
  console.info(`Certifications: ${certifications.length}`);
  console.info(`Products: ${products.length}`);
  console.info(`Brand certifications: ${brandCertifications.length}`);
  console.info(`Product certifications: ${productCertifications.length}`);
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
