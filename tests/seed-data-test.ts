import assert from "node:assert/strict";
import {
  brands,
  certifications,
  impossibleClaims,
  products,
  vagueTerms
} from "../src/lib/seed-data.js";
import { assertUniqueValues } from "../src/lib/utils.js";

const scenarioCounts = products.reduce<Record<string, number>>((counts, product) => {
  counts[product.scenario] = (counts[product.scenario] ?? 0) + 1;
  return counts;
}, {});

assert(products.length >= 30 && products.length <= 50, "Seed products should stay between 30 and 50.");
assert(
  (scenarioCounts.gold ?? 0) >= 5 && (scenarioCounts.gold ?? 0) <= 10,
  "Gold-standard seed products should stay between 5 and 10."
);
assert(
  (scenarioCounts.mixed ?? 0) >= 10 && (scenarioCounts.mixed ?? 0) <= 15,
  "Mixed-signal seed products should stay between 10 and 15."
);
assert(
  (scenarioCounts.greenwashing ?? 0) >= 5 && (scenarioCounts.greenwashing ?? 0) <= 10,
  "Greenwashing seed products should stay between 5 and 10."
);

assertUniqueValues(
  products.map((product) => product.barcode),
  "Product barcodes"
);
assertUniqueValues(
  products.map((product) => product.name),
  "Product names"
);
assertUniqueValues(
  brands.map((brand) => brand.name),
  "Brand names"
);
assertUniqueValues(
  certifications.map((certification) => certification.acronym),
  "Certification acronyms"
);

for (const product of products) {
  assert(product.description.trim().length > 0, `${product.name} should include a description.`);
  assert(product.claims.length > 0, `${product.name} should include at least one seeded claim.`);
  assert(product.imageUrl && product.imageUrl.length > 0, `${product.name} should include an image URL.`);
  assert(
    product.expectedTrustScore >= 0 && product.expectedTrustScore <= 100,
    `${product.name} expected score must be 0-100.`
  );
  if (product.priceCents !== undefined) {
    assert(product.priceCents > 0, `${product.name} priceCents must be positive when present.`);
  }
}

const patagoniaHoodie = products.find((product) => product.name === "Patagonia Organic Cotton Hoodie");
assert(
  patagoniaHoodie?.imageUrl?.includes("kind=hoodie"),
  "Patagonia Organic Cotton Hoodie should use hoodie artwork."
);

const pactTee = products.find((product) => product.name === "Pact Organic Crew Tee");
assert(pactTee?.imageUrl?.includes("kind=tee"), "Pact Organic Crew Tee should use tee artwork.");

for (const requiredProduct of [
  "Patagonia Organic Cotton Hoodie",
  "Seventh Generation Dish Soap",
  "Ecover Toilet Cleaner",
  "H&M Conscious Collection T-Shirt",
  "Adidas Parley Shoes",
  "The Body Shop Vitamin C Serum",
  "FastFashionX Eco Collection Basic Tee",
  "Cheapo Natural Shampoo",
  "WastefulCo Earth Friendly Water Bottle",
  "Honest Company Diapers",
  "Tesla Model Y"
]) {
  assert(
    products.some((product) => product.name === requiredProduct),
    `Missing required demo product: ${requiredProduct}`
  );
}

for (const requiredTerm of ["eco-friendly", "natural", "green", "sustainable", "clean"]) {
  assert(vagueTerms.some((term) => term.term === requiredTerm), `Missing vague term seed: ${requiredTerm}`);
}

for (const requiredImpossibleClaim of ["chemical-free", "toxin-free", "100% natural", "harmless"]) {
  assert(
    impossibleClaims.some((claim) => claim.claimPattern === requiredImpossibleClaim),
    `Missing impossible claim seed: ${requiredImpossibleClaim}`
  );
}

console.info("GreenProof seed data checks passed.");
console.info(
  JSON.stringify(
    {
      brandCount: brands.length,
      certificationCount: certifications.length,
      productCount: products.length,
      scenarioCounts,
      vagueTermCount: vagueTerms.length,
      impossibleClaimCount: impossibleClaims.length
    },
    null,
    2
  )
);
