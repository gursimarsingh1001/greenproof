import assert from "node:assert/strict";
import {
  brands,
  certifications,
  impossibleClaims,
  products,
  vagueTerms
} from "../src/lib/seed-data.js";
import { certificationSources } from "../src/lib/certification-sources.js";
import { brandAliases, officialEvidenceSeeds, productAliases } from "../src/lib/official-evidence-seeds.js";
import { assertUniqueValues } from "../src/lib/utils.js";

const scenarioCounts = products.reduce<Record<string, number>>((counts, product) => {
  counts[product.scenario] = (counts[product.scenario] ?? 0) + 1;
  return counts;
}, {});

assert(products.length >= 30 && products.length <= 70, "Seed products should stay between 30 and 70.");
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
assertUniqueValues(
  certificationSources.map((source) => source.id),
  "Certification source ids"
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

const noNastiesTee = products.find((product) => product.name === "No Nasties Blanc Classic Tee");
assert(
  noNastiesTee?.imageUrl?.includes("nonasties.in"),
  "No Nasties Blanc Classic Tee should use an official No Nasties image."
);

const hmTee = products.find((product) => product.name === "H&M Organic Cotton T-Shirt");
assert(hmTee?.imageUrl?.includes("image.hm.com"), "H&M Organic Cotton T-Shirt should use an official H&M image.");

for (const requiredProduct of [
  "No Nasties Blanc Classic Tee",
  "Seventh Generation Dish Soap",
  "The Better Home Dishwash Liquid",
  "H&M Organic Cotton T-Shirt",
  "Adidas Parley Shoes",
  "Mamaearth Vitamin C Face Wash",
  "Mamaearth Organic Bamboo Baby Wipes",
  "Mamaearth Mineral Based Sunscreen",
  "Mamaearth Natural Mosquito Repellent",
  "Mamaearth Mosquito Repellent Gel",
  "Mamaearth Body Roll-On Repellent",
  "Mamaearth Fabric Roll-On Repellent",
  "Dr. Bronner's All-One Peppermint Pure-Castile Soap",
  "Safely Dish Soap - Fresh",
  "Ceyon Naturaa Cleansing Cream Face Wash",
  "VIVA DORIA Organic Jojoba Oil",
  "ATTITUDE Window & Glass Cleaner",
  "SmartyPants Prenatal Organic Multi & Probiotics",
  "Clorox EcoClean Disinfecting Cleaner",
  "Adidas Boston 12 GRS Running Shoe",
  "ATTITUDE Dish Soap - Orange & Sage",
  "ATTITUDE Extra-Gentle Shampoo Unscented",
  "Safely Hand Soap - Calm",
  "Safely Hand Soap - Fresh",
  "Safely Dish Soap - Rise",
  "Safely Universal Cleaner - Fresh",
  "Safely Hand Soap - Rise",
  "Safely Universal Cleaner - Calm",
  "Safely Universal Cleaner - Rise",
  "ATTITUDE Baby Bottle & Dishwashing Liquid Unscented",
  "ATTITUDE 2-in-1 Baby Foaming Shampoo & Body Wash",
  "ATTITUDE Hand Soap - Sensitive Skin",
  "ATTITUDE Hand Soap - Orange Blossom & Eucalyptus",
  "ATTITUDE Body Wash - Sensitive Skin",
  "ATTITUDE Laundry Detergent - Little Ones",
  "ATTITUDE Dishwashing Liquid - Unscented",
  "Safely Laundry Detergent - Calm",
  "Safely Laundry Detergent - Rise",
  "Biotique Fresh Neem Pimple Control Face Wash",
  "Patanjali Kesh Kanti Natural Hair Cleanser",
  "Beco Natural Dishwash Liquid Refill",
  "Mamaearth Onion Shampoo",
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

assert(
  certificationSources.some((source) => source.id === "cosmetics-made-safe" && source.isSupported),
  "Expected MADE SAFE to be present as a supported cosmetics source."
);
assert(
  officialEvidenceSeeds.some(
    (evidence) =>
      evidence.sourceId === "cosmetics-made-safe" &&
      evidence.matchedProductName === "Mamaearth Vitamin C Face Wash"
  ),
  "Expected a bootstrap official evidence row for Mamaearth Vitamin C Face Wash."
);
assert(
  officialEvidenceSeeds.some((evidence) => evidence.sourceId === "cosmetics-cosmos-ecocert"),
  "Expected a bootstrap official evidence row for COSMOS / Ecocert."
);
assert(
  officialEvidenceSeeds.some((evidence) => evidence.sourceId === "cosmetics-usda-organic"),
  "Expected a bootstrap official evidence row for USDA Organic."
);
assert(
  officialEvidenceSeeds.some((evidence) => evidence.sourceId === "household-ecologo"),
  "Expected a bootstrap official evidence row for ECOLOGO."
);
assert(
  officialEvidenceSeeds.some((evidence) => evidence.sourceId === "cosmetics-nsf"),
  "Expected a bootstrap official evidence row for NSF."
);
assert(
  officialEvidenceSeeds.some((evidence) => evidence.sourceId === "fashion-grs"),
  "Expected a bootstrap official evidence row for GRS."
);
assert(
  officialEvidenceSeeds.some((evidence) => evidence.sourceId === "household-dfe"),
  "Expected a bootstrap official evidence row for DfE."
);
assert(
  officialEvidenceSeeds.some((evidence) => evidence.sourceId === "fashion-fsc"),
  "Expected a bootstrap official evidence row for FSC."
);
assert(
  officialEvidenceSeeds.some((evidence) => evidence.sourceId === "household-carbon-trust"),
  "Expected a bootstrap official evidence row for Carbon Trust."
);
assert(
  officialEvidenceSeeds.some(
    (evidence) =>
      evidence.matchedProductName === "Dr. Bronner's Organic Soap Bar" &&
      evidence.sourceId === "cosmetics-usda-organic"
  ),
  "Expected Dr. Bronner's Organic Soap Bar to have official evidence."
);
assert(
  officialEvidenceSeeds.some(
    (evidence) => evidence.matchedProductName === "Adidas Parley Shoes" && evidence.sourceId === "fashion-grs"
  ),
  "Expected Adidas Parley Shoes to have official evidence."
);
assert(
  brandAliases.some((alias) => alias.brandName === "Mamaearth" && alias.alias === "Mama Earth"),
  "Expected Mamaearth brand alias seed."
);
assert(
  productAliases.some((alias) => alias.productName === "No Nasties Blanc Classic Tee"),
  "Expected No Nasties product alias seed."
);

console.info("GreenProof seed data checks passed.");
console.info(
  JSON.stringify(
    {
      brandCount: brands.length,
      certificationCount: certifications.length,
      certificationSourceCount: certificationSources.length,
      productCount: products.length,
      officialEvidenceCount: officialEvidenceSeeds.length,
      scenarioCounts,
      vagueTermCount: vagueTerms.length,
      impossibleClaimCount: impossibleClaims.length
    },
    null,
    2
  )
);
