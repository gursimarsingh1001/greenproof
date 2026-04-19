import {
  DEFAULT_IMPOSSIBLE_CLAIM_PENALTY,
  DEFAULT_VAGUE_TERM_PENALTY
} from "./constants.js";
import type {
  BrandCertificationSeed,
  BrandSeed,
  CertificationSeed,
  ImpossibleClaimSeed,
  ProductCertificationSeed,
  ProductSeed,
  VagueTermSeed
} from "../types/index.js";

export const certifications: CertificationSeed[] = [
  {
    acronym: "GOTS",
    name: "Global Organic Textile Standard",
    issuingBody: "Global Standard gGmbH",
    scope: "organic"
  },
  {
    acronym: "USDA",
    name: "USDA Organic",
    issuingBody: "United States Department of Agriculture",
    scope: "organic"
  },
  {
    acronym: "FTC",
    name: "Fair Trade Certified",
    issuingBody: "Fair Trade USA",
    scope: "fair-trade"
  },
  {
    acronym: "LB",
    name: "Leaping Bunny",
    issuingBody: "Coalition for Consumer Information on Cosmetics",
    scope: "animal-welfare"
  },
  {
    acronym: "BCORP",
    name: "B Corporation",
    issuingBody: "B Lab",
    scope: "overall"
  },
  {
    acronym: "FSC",
    name: "Forest Stewardship Council",
    issuingBody: "Forest Stewardship Council",
    scope: "forestry"
  },
  {
    acronym: "OEKO",
    name: "OEKO-TEX Standard 100",
    issuingBody: "OEKO-TEX Association",
    scope: "textile-safety"
  },
  {
    acronym: "RA",
    name: "Rainforest Alliance Certified",
    issuingBody: "Rainforest Alliance",
    scope: "agriculture"
  },
  {
    acronym: "C2C",
    name: "Cradle to Cradle Certified",
    issuingBody: "Cradle to Cradle Products Innovation Institute",
    scope: "circularity"
  },
  {
    acronym: "EPA",
    name: "EPA Safer Choice",
    issuingBody: "United States Environmental Protection Agency",
    scope: "chemical-safety"
  },
  {
    acronym: "BIO",
    name: "USDA BioPreferred",
    issuingBody: "United States Department of Agriculture",
    scope: "biobased"
  },
  {
    acronym: "BLS",
    name: "Bluesign Approved",
    issuingBody: "Bluesign Technologies AG",
    scope: "textile-chemistry"
  },
  {
    acronym: "VEG",
    name: "Vegan Society Trademark",
    issuingBody: "The Vegan Society",
    scope: "vegan"
  },
  {
    acronym: "MSAFE",
    name: "MADE SAFE Certified",
    issuingBody: "MADE SAFE",
    scope: "safety"
  },
  {
    acronym: "GRS",
    name: "Global Recycled Standard",
    issuingBody: "Textile Exchange",
    scope: "recycled-content"
  },
  {
    acronym: "ROC",
    name: "Regenerative Organic Certified",
    issuingBody: "Regenerative Organic Alliance",
    scope: "regenerative"
  },
  {
    acronym: "CTS",
    name: "Carbon Trust Standard",
    issuingBody: "Carbon Trust",
    scope: "climate"
  }
];

export const vagueTerms: VagueTermSeed[] = [
  {
    term: "eco-friendly",
    category: "marketing",
    penalty: DEFAULT_VAGUE_TERM_PENALTY,
    explanation: "No legal definition and often used without measurable backing."
  },
  {
    term: "ecofriendly",
    category: "marketing",
    penalty: DEFAULT_VAGUE_TERM_PENALTY,
    explanation: "No legal definition and often used without measurable backing."
  },
  {
    term: "natural",
    category: "ingredients",
    penalty: DEFAULT_VAGUE_TERM_PENALTY,
    explanation: "Vague and unregulated unless supported by specific certification."
  },
  {
    term: "all natural",
    category: "ingredients",
    penalty: DEFAULT_VAGUE_TERM_PENALTY,
    explanation: "Often used as marketing language without a consistent standard."
  },
  {
    term: "green",
    category: "marketing",
    penalty: -15,
    explanation: "Marketing language only and not a verification standard."
  },
  {
    term: "earth-friendly",
    category: "marketing",
    penalty: DEFAULT_VAGUE_TERM_PENALTY,
    explanation: "Not scientifically defined and rarely linked to product evidence."
  },
  {
    term: "planet-friendly",
    category: "marketing",
    penalty: DEFAULT_VAGUE_TERM_PENALTY,
    explanation: "Not scientifically defined and rarely linked to product evidence."
  },
  {
    term: "sustainable",
    category: "marketing",
    penalty: -18,
    explanation: "Requires context, metrics, or certification to be meaningful."
  },
  {
    term: "sustainability",
    category: "marketing",
    penalty: -18,
    explanation: "Requires context, metrics, or certification to be meaningful."
  },
  {
    term: "clean",
    category: "beauty",
    penalty: DEFAULT_VAGUE_TERM_PENALTY,
    explanation: "Beauty-marketing term with no universal regulatory definition."
  },
  {
    term: "conscious",
    category: "marketing",
    penalty: DEFAULT_VAGUE_TERM_PENALTY,
    explanation: "Branding term that does not verify any specific sustainability outcome."
  },
  {
    term: "ethical",
    category: "marketing",
    penalty: DEFAULT_VAGUE_TERM_PENALTY,
    explanation: "Too broad to verify without scope, metrics, or standards."
  },
  {
    term: "responsible",
    category: "marketing",
    penalty: DEFAULT_VAGUE_TERM_PENALTY,
    explanation: "Meaningless without specific sourcing or manufacturing details."
  },
  {
    term: "environmentally friendly",
    category: "marketing",
    penalty: DEFAULT_VAGUE_TERM_PENALTY,
    explanation: "Broad claim with no single technical definition."
  },
  {
    term: "enviro-friendly",
    category: "marketing",
    penalty: DEFAULT_VAGUE_TERM_PENALTY,
    explanation: "Broad claim with no single technical definition."
  }
];

export const impossibleClaims: ImpossibleClaimSeed[] = [
  {
    claimPattern: "chemical-free",
    reason: "All matter is made of chemicals, so the claim is scientifically inaccurate.",
    penalty: DEFAULT_IMPOSSIBLE_CLAIM_PENALTY
  },
  {
    claimPattern: "toxin-free",
    reason: "The phrase is vague and misleading because toxicity depends on dose and exposure.",
    penalty: DEFAULT_IMPOSSIBLE_CLAIM_PENALTY
  },
  {
    claimPattern: "100% natural",
    reason: "The phrase is misleading because processing and formulation alter material origin.",
    penalty: DEFAULT_IMPOSSIBLE_CLAIM_PENALTY
  },
  {
    claimPattern: "harmless",
    reason: "Absolute safety language is not scientifically defensible across all contexts.",
    penalty: DEFAULT_IMPOSSIBLE_CLAIM_PENALTY
  }
];

export const brands: BrandSeed[] = [
  { name: "Patagonia", website: "https://www.patagonia.com", isFlagged: false, reputationScore: 0.95 },
  { name: "Seventh Generation", website: "https://www.seventhgeneration.com", isFlagged: false, reputationScore: 0.9 },
  { name: "Ecover", website: "https://www.ecover.com", isFlagged: false, reputationScore: 0.88 },
  { name: "Dr. Bronner's", website: "https://www.drbronner.com", isFlagged: false, reputationScore: 0.92 },
  { name: "Pact", website: "https://wearpact.com", isFlagged: false, reputationScore: 0.83 },
  { name: "Allbirds", website: "https://www.allbirds.com", isFlagged: false, reputationScore: 0.84 },
  { name: "Who Gives A Crap", website: "https://us.whogivesacrap.org", isFlagged: false, reputationScore: 0.81 },
  { name: "Avocado", website: "https://www.avocadogreenmattress.com", isFlagged: false, reputationScore: 0.86 },
  { name: "Naturepedic", website: "https://www.naturepedic.com", isFlagged: false, reputationScore: 0.87 },
  { name: "Veja", website: "https://www.veja-store.com", isFlagged: false, reputationScore: 0.82 },
  { name: "H&M", website: "https://www.hm.com", isFlagged: false, reputationScore: 0.55 },
  { name: "Adidas", website: "https://www.adidas.com", isFlagged: false, reputationScore: 0.65 },
  { name: "The Body Shop", website: "https://www.thebodyshop.com", isFlagged: false, reputationScore: 0.72 },
  { name: "IKEA", website: "https://www.ikea.com", isFlagged: false, reputationScore: 0.62 },
  { name: "Method", website: "https://www.methodproducts.com", isFlagged: false, reputationScore: 0.74 },
  { name: "Garnier", website: "https://www.garnierusa.com", isFlagged: false, reputationScore: 0.58 },
  { name: "Burt's Bees", website: "https://www.burtsbees.com", isFlagged: false, reputationScore: 0.67 },
  { name: "Lush", website: "https://www.lush.com", isFlagged: false, reputationScore: 0.77 },
  { name: "TOMS", website: "https://www.toms.com", isFlagged: false, reputationScore: 0.69 },
  { name: "Everlane", website: "https://www.everlane.com", isFlagged: false, reputationScore: 0.64 },
  { name: "Nespresso", website: "https://www.nespresso.com", isFlagged: false, reputationScore: 0.6 },
  { name: "Aveda", website: "https://www.aveda.com", isFlagged: false, reputationScore: 0.75 },
  { name: "Honest Company", website: "https://www.honest.com", isFlagged: false, flagReason: "Past product marketing lawsuits were settled.", reputationScore: 0.5 },
  { name: "Tesla", website: "https://www.tesla.com", isFlagged: false, reputationScore: 0.78 },
  { name: "Sephora Collection", website: "https://www.sephora.com", isFlagged: false, reputationScore: 0.57 },
  { name: "KindKlean", website: "https://kindklean.example", isFlagged: false, reputationScore: 0.71 },
  { name: "FastFashionX", website: "https://fastfashionx.example", isFlagged: true, flagReason: "2023 FTC greenwashing fine", reputationScore: 0.25 },
  { name: "CheapoCorp", website: "https://cheapocorp.example", isFlagged: false, reputationScore: 0.35 },
  { name: "WastefulCo", website: "https://wastefulco.example", isFlagged: true, flagReason: "Lawsuit pending over plastic recycling fraud claims", reputationScore: 0.4 },
  { name: "GlowPure Labs", website: "https://glowpure.example", isFlagged: false, reputationScore: 0.38 },
  { name: "UrbanFuel", website: "https://urbanfuel.example", isFlagged: false, reputationScore: 0.42 },
  { name: "QuickSip", website: "https://quicksip.example", isFlagged: false, reputationScore: 0.33 },
  { name: "PureNest", website: "https://purenest.example", isFlagged: false, reputationScore: 0.37 },
  { name: "OceanHalo", website: "https://oceanhalo.example", isFlagged: false, reputationScore: 0.41 },
  { name: "FlexWear", website: "https://flexwear.example", isFlagged: false, reputationScore: 0.44 },
  { name: "EarthGlow Home", website: "https://earthglowhome.example", isFlagged: false, reputationScore: 0.46 }
];

export const brandCertifications: BrandCertificationSeed[] = [
  {
    brandName: "Patagonia",
    certificationAcronym: "BCORP",
    certificateNumber: "BCORP-PAT-2026",
    isValid: true,
    expiryDate: "2028-12-31T00:00:00.000Z"
  },
  {
    brandName: "Ecover",
    certificationAcronym: "BCORP",
    certificateNumber: "BCORP-ECO-2026",
    isValid: true,
    expiryDate: "2028-09-30T00:00:00.000Z"
  },
  {
    brandName: "Ecover",
    certificationAcronym: "VEG",
    certificateNumber: "VEG-ECO-2026",
    isValid: true,
    expiryDate: "2028-11-30T00:00:00.000Z"
  },
  {
    brandName: "Dr. Bronner's",
    certificationAcronym: "BCORP",
    certificateNumber: "BCORP-DB-2026",
    isValid: true,
    expiryDate: "2028-07-31T00:00:00.000Z"
  },
  {
    brandName: "Allbirds",
    certificationAcronym: "BCORP",
    certificateNumber: "BCORP-ALL-2026",
    isValid: true,
    expiryDate: "2028-08-31T00:00:00.000Z"
  },
  {
    brandName: "Who Gives A Crap",
    certificationAcronym: "BCORP",
    certificateNumber: "BCORP-WGAC-2026",
    isValid: true,
    expiryDate: "2028-04-30T00:00:00.000Z"
  },
  {
    brandName: "The Body Shop",
    certificationAcronym: "LB",
    certificateNumber: "LB-TBS-2026",
    isValid: true,
    expiryDate: "2027-12-31T00:00:00.000Z"
  },
  {
    brandName: "The Body Shop",
    certificationAcronym: "VEG",
    certificateNumber: "VEG-TBS-2026",
    isValid: true,
    expiryDate: "2028-03-31T00:00:00.000Z"
  },
  {
    brandName: "Method",
    certificationAcronym: "LB",
    certificateNumber: "LB-MET-2026",
    isValid: true,
    expiryDate: "2028-05-31T00:00:00.000Z"
  },
  {
    brandName: "Lush",
    certificationAcronym: "VEG",
    certificateNumber: "VEG-LUSH-2026",
    isValid: true,
    expiryDate: "2028-10-31T00:00:00.000Z"
  },
  {
    brandName: "Aveda",
    certificationAcronym: "VEG",
    certificateNumber: "VEG-AVD-2026",
    isValid: true,
    expiryDate: "2028-06-30T00:00:00.000Z"
  },
  {
    brandName: "H&M",
    certificationAcronym: "GRS",
    certificateNumber: "GRS-HM-2026",
    isValid: true,
    expiryDate: "2028-02-28T00:00:00.000Z"
  }
];

const productArt = (kind: string, label: string): string =>
  `/api/product-art?kind=${encodeURIComponent(kind)}&label=${encodeURIComponent(label)}`;

export const products: ProductSeed[] = [
  {
    name: "Patagonia Organic Cotton Hoodie",
    brandName: "Patagonia",
    barcode: "8901000000001",
    category: "Apparel",
    description: "Patagonia markets this hoodie as Fair Trade Certified, made with organic cotton, finished with Bluesign approved fabric, and detailed with a recycled lining.",
    imageUrl: productArt("hoodie", "Patagonia Organic Cotton Hoodie"),
    priceCents: 12900,
    claims: ["Fair Trade Certified", "Organic Cotton", "Bluesign Approved"],
    scenario: "gold",
    expectedTrustScore: 94
  },
  {
    name: "Seventh Generation Dish Soap",
    brandName: "Seventh Generation",
    barcode: "8901000000002",
    category: "Household",
    description: "This dish soap highlights USDA Biobased Content, EPA Safer Choice recognition, no artificial fragrances, and a recycled bottle on pack.",
    imageUrl: productArt("dish-soap", "Seventh Generation Dish Soap"),
    priceCents: 499,
    claims: ["USDA Biobased Content", "EPA Safer Choice", "No Artificial Fragrances"],
    scenario: "gold",
    expectedTrustScore: 91
  },
  {
    name: "Ecover Toilet Cleaner",
    brandName: "Ecover",
    barcode: "8901000000003",
    category: "Household",
    description: "Ecover positions this toilet cleaner as Cradle to Cradle Certified with plant-based ingredients.",
    imageUrl: productArt("cleaner-bottle", "Ecover Toilet Cleaner"),
    priceCents: 679,
    claims: ["Cradle to Cradle Certified", "Plant-Based Ingredients"],
    scenario: "gold",
    expectedTrustScore: 88
  },
  {
    name: "Dr. Bronner's Organic Soap Bar",
    brandName: "Dr. Bronner's",
    barcode: "8901000000004",
    category: "Personal Care",
    description: "The soap bar claims USDA Organic ingredients, Fair Trade Certified sourcing, and regenerative organic farming support.",
    imageUrl: productArt("soap-bar", "Dr. Bronner's Organic Soap Bar"),
    claims: ["USDA Organic", "Fair Trade Certified", "Regenerative Organic"],
    scenario: "gold",
    expectedTrustScore: 90
  },
  {
    name: "Pact Organic Crew Tee",
    brandName: "Pact",
    barcode: "8901000000005",
    category: "Apparel",
    description: "Pact describes this tee as GOTS certified organic cotton made in a Fair Trade Certified factory.",
    imageUrl: productArt("tee", "Pact Organic Crew Tee"),
    priceCents: 3400,
    claims: ["GOTS Certified", "Organic Cotton", "Fair Trade Certified"],
    scenario: "gold",
    expectedTrustScore: 86
  },
  {
    name: "Avocado Organic Mattress Protector",
    brandName: "Avocado",
    barcode: "8901000000006",
    category: "Home",
    description: "This mattress protector advertises GOTS certification, OEKO-TEX Standard 100, and MADE SAFE materials.",
    imageUrl: productArt("mattress", "Avocado Organic Mattress Protector"),
    claims: ["GOTS", "OEKO-TEX Standard 100", "MADE SAFE"],
    scenario: "gold",
    expectedTrustScore: 89
  },
  {
    name: "Naturepedic Organic Cotton Sheet Set",
    brandName: "Naturepedic",
    barcode: "8901000000007",
    category: "Home",
    description: "Naturepedic promotes this sheet set as GOTS certified, MADE SAFE certified, and made from organic cotton.",
    imageUrl: productArt("sheets", "Naturepedic Organic Cotton Sheet Set"),
    claims: ["GOTS", "MADE SAFE", "Organic Cotton"],
    scenario: "gold",
    expectedTrustScore: 90
  },
  {
    name: "Allbirds Tree Runners",
    brandName: "Allbirds",
    barcode: "8901000000008",
    category: "Footwear",
    description: "Allbirds highlights FSC certified packaging and carbon neutral operations for these Tree Runners.",
    imageUrl: productArt("runner-shoe", "Allbirds Tree Runners"),
    claims: ["FSC Certified Packaging", "Carbon Neutral"],
    scenario: "gold",
    expectedTrustScore: 84
  },
  {
    name: "Who Gives A Crap Bamboo Toilet Paper",
    brandName: "Who Gives A Crap",
    barcode: "8901000000009",
    category: "Household",
    description: "The pack focuses on FSC certified bamboo fiber and recycled packaging for reduced waste.",
    imageUrl: productArt("toilet-paper", "Who Gives A Crap Bamboo Toilet Paper"),
    claims: ["FSC Certified", "Recycled Packaging"],
    scenario: "gold",
    expectedTrustScore: 85
  },
  {
    name: "Veja Campo Sneakers",
    brandName: "Veja",
    barcode: "8901000000010",
    category: "Footwear",
    description: "Veja describes these sneakers as Fair Trade Certified with organic cotton details and responsibly sourced leather.",
    imageUrl: productArt("sneaker", "Veja Campo Sneakers"),
    claims: ["Fair Trade Certified", "Organic Cotton", "Responsible Leather"],
    scenario: "gold",
    expectedTrustScore: 83
  },
  {
    name: "H&M Conscious Collection T-Shirt",
    brandName: "H&M",
    barcode: "8901000000011",
    category: "Apparel",
    description: "This tee uses sustainable cotton messaging, a Conscious Choice hangtag, and recycled materials messaging without listing a product certification.",
    imageUrl: productArt("tee", "H&M Conscious Collection T-Shirt"),
    priceCents: 1999,
    claims: ["Sustainable Cotton", "Conscious Choice"],
    scenario: "mixed",
    expectedTrustScore: 52
  },
  {
    name: "Adidas Parley Shoes",
    brandName: "Adidas",
    barcode: "8901000000012",
    category: "Footwear",
    description: "Adidas markets the shoes as made with ocean plastic and recycled materials, but the recycled percentage is not obvious on front pack.",
    imageUrl: productArt("runner-shoe", "Adidas Parley Shoes"),
    priceCents: 12000,
    claims: ["Made with Ocean Plastic", "Recycled Materials"],
    scenario: "mixed",
    expectedTrustScore: 68
  },
  {
    name: "The Body Shop Vitamin C Serum",
    brandName: "The Body Shop",
    barcode: "8901000000013",
    category: "Beauty",
    description: "The Body Shop positions this serum as vegan, cruelty-free, and backed by Community Trade sourcing.",
    imageUrl: productArt("serum", "The Body Shop Vitamin C Serum"),
    priceCents: 1899,
    claims: ["Vegan", "Cruelty-Free", "Community Trade"],
    scenario: "mixed",
    expectedTrustScore: 74
  },
  {
    name: "IKEA KUNGSBACKA Kitchen Front",
    brandName: "IKEA",
    barcode: "8901000000014",
    category: "Home",
    description: "IKEA describes this kitchen front as made with recycled materials and designed as a sustainable choice.",
    imageUrl: productArt("cabinet", "IKEA KUNGSBACKA Kitchen Front"),
    claims: ["Recycled Materials", "Sustainable Design"],
    scenario: "mixed",
    expectedTrustScore: 63
  },
  {
    name: "Method Foaming Hand Soap",
    brandName: "Method",
    barcode: "8901000000015",
    category: "Household",
    description: "Method says the soap is cruelty-free and made with plant-based ingredients.",
    imageUrl: productArt("pump-bottle", "Method Foaming Hand Soap"),
    claims: ["Cruelty-Free", "Plant-Based Ingredients"],
    scenario: "mixed",
    expectedTrustScore: 70
  },
  {
    name: "Garnier Whole Blends Shampoo Bar",
    brandName: "Garnier",
    barcode: "8901000000016",
    category: "Beauty",
    description: "The shampoo bar is marketed as a vegan formula with recycled packaging, but without product-level verification.",
    imageUrl: productArt("shampoo-bar", "Garnier Whole Blends Shampoo Bar"),
    claims: ["Vegan Formula", "Recycled Packaging"],
    scenario: "mixed",
    expectedTrustScore: 61
  },
  {
    name: "Burt's Bees Lip Balm",
    brandName: "Burt's Bees",
    barcode: "8901000000017",
    category: "Beauty",
    description: "The balm emphasizes natural origin ingredients and responsible beeswax sourcing.",
    imageUrl: productArt("lip-balm", "Burt's Bees Lip Balm"),
    claims: ["Natural Origin", "Responsible Beeswax"],
    scenario: "mixed",
    expectedTrustScore: 56
  },
  {
    name: "Lush Shampoo Bar",
    brandName: "Lush",
    barcode: "8901000000018",
    category: "Beauty",
    description: "Lush promotes this shampoo bar with naked packaging and vegan ingredients.",
    imageUrl: productArt("shampoo-bar", "Lush Shampoo Bar"),
    claims: ["Naked Packaging", "Vegan"],
    scenario: "mixed",
    expectedTrustScore: 72
  },
  {
    name: "TOMS Earthwise Sneakers",
    brandName: "TOMS",
    barcode: "8901000000019",
    category: "Footwear",
    description: "TOMS markets the sneaker as Earthwise with recycled cotton uppers, but the certification detail is limited.",
    imageUrl: productArt("sneaker", "TOMS Earthwise Sneakers"),
    claims: ["Earthwise", "Recycled Cotton"],
    scenario: "mixed",
    expectedTrustScore: 58
  },
  {
    name: "Everlane ReNew Puffer",
    brandName: "Everlane",
    barcode: "8901000000020",
    category: "Apparel",
    description: "The jacket copy says it is made from recycled plastic bottles in a clean factory network.",
    imageUrl: productArt("puffer", "Everlane ReNew Puffer"),
    claims: ["Made from Recycled Plastic Bottles", "Clean Factory"],
    scenario: "mixed",
    expectedTrustScore: 57
  },
  {
    name: "Nespresso Recycled Aluminum Capsules",
    brandName: "Nespresso",
    barcode: "8901000000021",
    category: "Food & Beverage",
    description: "Nespresso highlights recycled aluminum and carbon neutral delivery for this capsule line.",
    imageUrl: productArt("capsules", "Nespresso Recycled Aluminum Capsules"),
    claims: ["Recycled Aluminum", "Carbon Neutral Delivery"],
    scenario: "mixed",
    expectedTrustScore: 66
  },
  {
    name: "Aveda Botanical Repair Conditioner",
    brandName: "Aveda",
    barcode: "8901000000022",
    category: "Beauty",
    description: "Aveda promotes the conditioner as vegan, cruelty-free, and 93% naturally derived.",
    imageUrl: productArt("conditioner", "Aveda Botanical Repair Conditioner"),
    claims: ["Vegan", "Cruelty-Free", "Naturally Derived"],
    scenario: "mixed",
    expectedTrustScore: 69
  },
  {
    name: "FastFashionX Eco Collection Basic Tee",
    brandName: "FastFashionX",
    barcode: "8901000000023",
    category: "Apparel",
    description: "FastFashionX sells this tee with eco-friendly, green fabric, and nature inspired messaging without any certification details.",
    imageUrl: productArt("tee", "FastFashionX Eco Collection Basic Tee"),
    priceCents: 2999,
    claims: ["Eco-Friendly", "Green Fabric", "Nature Inspired"],
    scenario: "greenwashing",
    expectedTrustScore: 23
  },
  {
    name: "Cheapo Natural Shampoo",
    brandName: "CheapoCorp",
    barcode: "8901000000024",
    category: "Beauty",
    description: "The bottle claims all natural care, chemical-free cleansing, and 100% organic ingredients despite showing no certification.",
    imageUrl: productArt("cleaner-bottle", "Cheapo Natural Shampoo"),
    claims: ["All Natural", "Chemical-Free", "100% Organic Ingredients"],
    scenario: "greenwashing",
    expectedTrustScore: 18
  },
  {
    name: "WastefulCo Earth Friendly Water Bottle",
    brandName: "WastefulCo",
    barcode: "8901000000025",
    category: "Accessories",
    description: "WastefulCo labels the bottle as earth-friendly, sustainable packaging, and eco-conscious with no product evidence.",
    imageUrl: productArt("water-bottle", "WastefulCo Earth Friendly Water Bottle"),
    claims: ["Earth Friendly", "Sustainable Packaging", "Eco-Conscious"],
    scenario: "greenwashing",
    expectedTrustScore: 31
  },
  {
    name: "GlowPure Clean Beauty Cream",
    brandName: "GlowPure Labs",
    barcode: "8901000000026",
    category: "Beauty",
    description: "GlowPure describes the cream as clean beauty, toxin-free, and conscious skincare.",
    imageUrl: productArt("cream-jar", "GlowPure Clean Beauty Cream"),
    claims: ["Clean Beauty", "Toxin-Free", "Conscious Skincare"],
    scenario: "greenwashing",
    expectedTrustScore: 22
  },
  {
    name: "UrbanFuel Planet Friendly Laundry Pods",
    brandName: "UrbanFuel",
    barcode: "8901000000027",
    category: "Household",
    description: "The pouch promises planet-friendly cleaning, zero toxins, and an eco smart formula without specifics.",
    imageUrl: productArt("laundry-pods", "UrbanFuel Planet Friendly Laundry Pods"),
    claims: ["Planet Friendly", "Zero Toxins", "Eco Smart Formula"],
    scenario: "greenwashing",
    expectedTrustScore: 28
  },
  {
    name: "QuickSip Green Cup Set",
    brandName: "QuickSip",
    barcode: "8901000000028",
    category: "Home",
    description: "QuickSip calls the set a green choice made with natural materials that are harmless for daily use.",
    imageUrl: productArt("cup-set", "QuickSip Green Cup Set"),
    claims: ["Green Choice", "Natural Materials", "Harmless"],
    scenario: "greenwashing",
    expectedTrustScore: 20
  },
  {
    name: "PureNest 100% Natural Room Spray",
    brandName: "PureNest",
    barcode: "8901000000029",
    category: "Home",
    description: "PureNest markets the spray as 100% natural, chemical-free, and eco-friendly while providing no verification.",
    imageUrl: productArt("spray-bottle", "PureNest 100% Natural Room Spray"),
    claims: ["100% Natural", "Chemical-Free", "Eco-Friendly"],
    scenario: "greenwashing",
    expectedTrustScore: 12
  },
  {
    name: "OceanHalo Sustainable Straw Pack",
    brandName: "OceanHalo",
    barcode: "8901000000030",
    category: "Home",
    description: "This straw pack uses sustainable, earth-friendly, and ocean positive language with no standards cited.",
    imageUrl: productArt("straw-pack", "OceanHalo Sustainable Straw Pack"),
    claims: ["Sustainable", "Earth-Friendly", "Ocean Positive"],
    scenario: "greenwashing",
    expectedTrustScore: 27
  },
  {
    name: "FlexWear Conscious Active Tee",
    brandName: "FlexWear",
    barcode: "8901000000031",
    category: "Apparel",
    description: "FlexWear promotes the tee as conscious fashion with responsible fabric and a natural feel.",
    imageUrl: productArt("tee", "FlexWear Conscious Active Tee"),
    claims: ["Conscious Fashion", "Responsible Fabric", "Natural Feel"],
    scenario: "greenwashing",
    expectedTrustScore: 29
  },
  {
    name: "EarthGlow Home Compostable Trash Bags",
    brandName: "EarthGlow Home",
    barcode: "8901000000032",
    category: "Household",
    description: "EarthGlow says the bags are compostable, eco-friendly, and naturally strong without showing a compostability certificate.",
    imageUrl: productArt("trash-bags", "EarthGlow Home Compostable Trash Bags"),
    claims: ["Compostable", "Eco-Friendly", "Naturally Strong"],
    scenario: "greenwashing",
    expectedTrustScore: 34
  },
  {
    name: "Honest Company Diapers",
    brandName: "Honest Company",
    barcode: "8901000000033",
    category: "Baby",
    description: "The diapers are described as plant-based, hypoallergenic, and sustainably sourced, but the sustainability proof is limited.",
    imageUrl: productArt("diapers", "Honest Company Diapers"),
    priceCents: 2799,
    claims: ["Plant-Based", "Hypoallergenic", "Sustainably Sourced"],
    scenario: "edge",
    expectedTrustScore: 48
  },
  {
    name: "Tesla Model Y",
    brandName: "Tesla",
    barcode: "8901000000034",
    category: "Automotive",
    description: "Tesla frames the vehicle around zero emissions, sustainable energy, and carbon neutral manufacturing claims.",
    imageUrl: productArt("car", "Tesla Model Y"),
    claims: ["Zero Emissions", "Sustainable Energy", "Carbon Neutral Manufacturing"],
    scenario: "edge",
    expectedTrustScore: 62
  },
  {
    name: "Sephora Collection Clean Lip Balm",
    brandName: "Sephora Collection",
    barcode: "8901000000035",
    category: "Beauty",
    description: "This balm leans on clean beauty, vegan ingredients, and responsible packaging language.",
    imageUrl: productArt("lip-balm", "Sephora Collection Clean Lip Balm"),
    claims: ["Clean Beauty", "Vegan", "Responsible Packaging"],
    scenario: "edge",
    expectedTrustScore: 46
  },
  {
    name: "KindKlean Refill Hand Wash",
    brandName: "KindKlean",
    barcode: "8901000000036",
    category: "Household",
    description: "KindKlean promotes a refill pouch, plant-based ingredients, and recyclable packaging with moderate supporting detail.",
    imageUrl: productArt("refill-pouch", "KindKlean Refill Hand Wash"),
    claims: ["Refill System", "Plant-Based Ingredients", "Recyclable Packaging"],
    scenario: "edge",
    expectedTrustScore: 67
  }
];

export const productCertifications: ProductCertificationSeed[] = [
  {
    productName: "Patagonia Organic Cotton Hoodie",
    certificationAcronym: "FTC",
    certificateNumber: "FTC-PAT-HOOD-001",
    isVerified: true
  },
  {
    productName: "Patagonia Organic Cotton Hoodie",
    certificationAcronym: "GOTS",
    certificateNumber: "GOTS-PAT-HOOD-001",
    isVerified: true
  },
  {
    productName: "Patagonia Organic Cotton Hoodie",
    certificationAcronym: "BLS",
    certificateNumber: "BLS-PAT-HOOD-001",
    isVerified: true
  },
  {
    productName: "Patagonia Organic Cotton Hoodie",
    certificationAcronym: "GRS",
    certificateNumber: "GRS-PAT-HOOD-001",
    isVerified: true
  },
  {
    productName: "Seventh Generation Dish Soap",
    certificationAcronym: "BIO",
    certificateNumber: "BIO-SG-DISH-001",
    isVerified: true
  },
  {
    productName: "Seventh Generation Dish Soap",
    certificationAcronym: "EPA",
    certificateNumber: "EPA-SG-DISH-001",
    isVerified: true
  },
  {
    productName: "Seventh Generation Dish Soap",
    certificationAcronym: "GRS",
    certificateNumber: "GRS-SG-DISH-001",
    isVerified: true
  },
  {
    productName: "Ecover Toilet Cleaner",
    certificationAcronym: "C2C",
    certificateNumber: "C2C-EC-CLEAN-001",
    isVerified: true
  },
  {
    productName: "Dr. Bronner's Organic Soap Bar",
    certificationAcronym: "USDA",
    certificateNumber: "USDA-DB-SOAP-001",
    isVerified: true
  },
  {
    productName: "Dr. Bronner's Organic Soap Bar",
    certificationAcronym: "FTC",
    certificateNumber: "FTC-DB-SOAP-001",
    isVerified: true
  },
  {
    productName: "Dr. Bronner's Organic Soap Bar",
    certificationAcronym: "ROC",
    certificateNumber: "ROC-DB-SOAP-001",
    isVerified: true
  },
  {
    productName: "Pact Organic Crew Tee",
    certificationAcronym: "GOTS",
    certificateNumber: "GOTS-PACT-TEE-001",
    isVerified: true
  },
  {
    productName: "Pact Organic Crew Tee",
    certificationAcronym: "FTC",
    certificateNumber: "FTC-PACT-TEE-001",
    isVerified: true
  },
  {
    productName: "Avocado Organic Mattress Protector",
    certificationAcronym: "GOTS",
    certificateNumber: "GOTS-AVO-MAT-001",
    isVerified: true
  },
  {
    productName: "Avocado Organic Mattress Protector",
    certificationAcronym: "OEKO",
    certificateNumber: "OEKO-AVO-MAT-001",
    isVerified: true
  },
  {
    productName: "Avocado Organic Mattress Protector",
    certificationAcronym: "MSAFE",
    certificateNumber: "MSAFE-AVO-MAT-001",
    isVerified: true
  },
  {
    productName: "Naturepedic Organic Cotton Sheet Set",
    certificationAcronym: "GOTS",
    certificateNumber: "GOTS-NAT-SHEET-001",
    isVerified: true
  },
  {
    productName: "Naturepedic Organic Cotton Sheet Set",
    certificationAcronym: "MSAFE",
    certificateNumber: "MSAFE-NAT-SHEET-001",
    isVerified: true
  },
  {
    productName: "Allbirds Tree Runners",
    certificationAcronym: "FSC",
    certificateNumber: "FSC-ALL-RUN-001",
    isVerified: true
  },
  {
    productName: "Allbirds Tree Runners",
    certificationAcronym: "CTS",
    certificateNumber: "CTS-ALL-RUN-001",
    isVerified: true
  },
  {
    productName: "Who Gives A Crap Bamboo Toilet Paper",
    certificationAcronym: "FSC",
    certificateNumber: "FSC-WGAC-TP-001",
    isVerified: true
  },
  {
    productName: "Veja Campo Sneakers",
    certificationAcronym: "FTC",
    certificateNumber: "FTC-VEJA-CAMPO-001",
    isVerified: true
  },
  {
    productName: "Adidas Parley Shoes",
    certificationAcronym: "GRS",
    certificateNumber: "GRS-ADI-PARLEY-001",
    isVerified: true
  },
  {
    productName: "Nespresso Recycled Aluminum Capsules",
    certificationAcronym: "CTS",
    certificateNumber: "CTS-NESP-CAPS-001",
    isVerified: true
  }
];
