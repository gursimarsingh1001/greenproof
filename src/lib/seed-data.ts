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
  },
  {
    acronym: "EWG",
    name: "EWG Verified",
    issuingBody: "Environmental Working Group",
    scope: "ingredient-screening"
  },
  {
    acronym: "GS",
    name: "Green Seal Certified",
    issuingBody: "Green Seal",
    scope: "cleaning"
  },
  {
    acronym: "COSMOS",
    name: "COSMOS Organic",
    issuingBody: "COSMOS-standard AISBL",
    scope: "organic-cosmetics"
  },
  {
    acronym: "ECO",
    name: "UL ECOLOGO Certified",
    issuingBody: "UL Solutions",
    scope: "household-cleaning"
  },
  {
    acronym: "PETA",
    name: "PETA Cruelty-Free",
    issuingBody: "People for the Ethical Treatment of Animals",
    scope: "animal-welfare"
  },
  {
    acronym: "BCI",
    name: "Better Cotton",
    issuingBody: "Better Cotton",
    scope: "cotton-sourcing"
  },
  {
    acronym: "NSF",
    name: "NSF Contents Certified",
    issuingBody: "NSF",
    scope: "wellness"
  },
  {
    acronym: "DFE",
    name: "EPA Design for the Environment",
    issuingBody: "United States Environmental Protection Agency",
    scope: "disinfectant-safety"
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
  { name: "EarthGlow Home", website: "https://earthglowhome.example", isFlagged: false, reputationScore: 0.46 },
  { name: "No Nasties", website: "https://www.nonasties.in", isFlagged: false, reputationScore: 0.89 },
  { name: "Mamaearth", website: "https://mamaearth.in", isFlagged: false, reputationScore: 0.62 },
  { name: "Patanjali", website: "https://www.patanjaliayurved.net", isFlagged: false, reputationScore: 0.46 },
  { name: "Biotique", website: "https://www.biotique.com", isFlagged: false, reputationScore: 0.44 },
  { name: "Beco", website: "https://www.letsbeco.com", isFlagged: false, reputationScore: 0.57 },
  { name: "The Better Home", website: "https://thebetterhome.com", isFlagged: false, reputationScore: 0.58 },
  { name: "Safely", website: "https://getsafely.com", isFlagged: false, reputationScore: 0.59 },
  { name: "Ceyon Naturaa", website: "https://www.ceyon.org", isFlagged: false, reputationScore: 0.68 },
  { name: "VIVA DORIA", website: "https://vivadoria.com", isFlagged: false, reputationScore: 0.66 },
  { name: "ATTITUDE", website: "https://attitudeliving.com", isFlagged: false, reputationScore: 0.73 },
  { name: "SmartyPants", website: "https://smartypantsvitamins.com", isFlagged: false, reputationScore: 0.71 },
  { name: "Clorox", website: "https://www.clorox.com", isFlagged: false, reputationScore: 0.56 }
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

const productPhoto = {
  noNastiesBlancTee: "https://www.nonasties.in/cdn/shop/files/BlancClassicTee.jpg?v=1765790141&width=1080",
  hmOrganicCottonTee: "https://image.hm.com/assets/hm/a3/a0/a3a095271ae3365b0a7f4498ded14504ab2de70a.jpg?imwidth=2160",
  mamaearthVitaminCFaceWash: "https://images.mamaearth.in/catalog/product/1/_/1_203.jpg?format=auto&height=600",
  mamaearthOnionShampoo: "https://images.mamaearth.in/catalog/product/o/n/onion-shampoo-fop_white_bg.jpg?format=auto&height=600",
  patanjaliKeshKanti: "https://www.patanjaliayurved.net/assets/product_images/400x500/1684507984KeshkantiNaturalHairCleanser180ml.png",
  biotiqueNeemFaceWash: "https://www.biotique.com/cdn/shop/files/8904352004056_1-min_600x.jpg?v=1670241121",
  becoDishwashRefill: "https://www.letsbeco.com/cdn/shop/files/Artboard_1_2_411ede67-e8d6-40d3-a501-fbd7e0bacf98.webp?v=1751351679",
  betterHomeDishwash: "https://thebetterhome.com/cdn/shop/files/7d0c0b1d-b406-45eb-a944-c8d171cb6dce.jpg?v=1744200783&width=1946"
} as const;

export const products: ProductSeed[] = [
  {
    name: "No Nasties Blanc Classic Tee",
    brandName: "No Nasties",
    barcode: "8901000000001",
    category: "Apparel",
    description: "No Nasties presents this tee as 100% organic cotton, made in a Fair Trade certified factory, and shipped with plastic-free packaging.",
    imageUrl: productPhoto.noNastiesBlancTee,
    claims: ["Organic Cotton", "Fair Trade Factory", "Plastic-Free Packaging"],
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
    name: "The Better Home Dishwash Liquid",
    brandName: "The Better Home",
    barcode: "8901000000003",
    category: "Household",
    description: "The Better Home markets this dishwash liquid as biodegradable, non-toxic, eco-friendly, and plant based for family-safe cleaning.",
    imageUrl: productPhoto.betterHomeDishwash,
    claims: ["Biodegradable", "Eco-Friendly", "Plant-Based Cleaner"],
    scenario: "mixed",
    expectedTrustScore: 30
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
    name: "H&M Organic Cotton T-Shirt",
    brandName: "H&M",
    barcode: "8901000000011",
    category: "Apparel",
    description: "H&M lists this basic tee as 100% organic cotton and still leans on Conscious Choice style messaging without product-level certification detail.",
    imageUrl: productPhoto.hmOrganicCottonTee,
    claims: ["Organic Cotton", "Conscious Choice"],
    scenario: "mixed",
    expectedTrustScore: 54
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
    name: "Mamaearth Vitamin C Face Wash",
    brandName: "Mamaearth",
    barcode: "8901000000132",
    category: "Beauty",
    description: "Mamaearth positions this face wash as MADE SAFE certified, dermatologically tested, and powered by natural ingredients like vitamin C and turmeric.",
    imageUrl: productPhoto.mamaearthVitaminCFaceWash,
    claims: ["Made Safe Certified", "Natural Ingredients", "Dermatologically Tested"],
    scenario: "mixed",
    expectedTrustScore: 80
  },
  {
    name: "Mamaearth Organic Bamboo Baby Wipes",
    brandName: "Mamaearth",
    barcode: "8901000000037",
    category: "Personal Care",
    description: "Mamaearth presents these baby wipes as MADE SAFE certified, organic bamboo based, and gentle enough for daily baby care.",
    imageUrl: productArt("wipe-pack", "Mamaearth Organic Bamboo Baby Wipes"),
    claims: ["Made Safe Certified", "Organic Bamboo Based", "Gentle Daily Care"],
    scenario: "gold",
    expectedTrustScore: 84
  },
  {
    name: "Mamaearth Mineral Based Sunscreen",
    brandName: "Mamaearth",
    barcode: "8901000000038",
    category: "Beauty",
    description: "Mamaearth markets this sunscreen as mineral based and MADE SAFE certified for safer daily sun protection.",
    imageUrl: productArt("sunscreen", "Mamaearth Mineral Based Sunscreen"),
    claims: ["Made Safe Certified", "Mineral Based", "Daily Sun Protection"],
    scenario: "edge",
    expectedTrustScore: 78
  },
  {
    name: "Mamaearth Natural Mosquito Repellent",
    brandName: "Mamaearth",
    barcode: "8901000000039",
    category: "Personal Care",
    description: "Mamaearth positions this repellent as a natural mosquito repellent with MADE SAFE-backed safer-ingredient positioning for casual outdoor use.",
    imageUrl: productArt("spray-bottle", "Mamaearth Natural Mosquito Repellent"),
    claims: ["Made Safe Certified", "Natural Mosquito Repellent", "Safer Ingredient Positioning"],
    scenario: "edge",
    expectedTrustScore: 77
  },
  {
    name: "Mamaearth Mosquito Repellent Gel",
    brandName: "Mamaearth",
    barcode: "8901000000040",
    category: "Personal Care",
    description: "Mamaearth describes this mosquito repellent gel as a safer repellent option supported by MADE SAFE public certification references.",
    imageUrl: productArt("gel-tube", "Mamaearth Mosquito Repellent Gel"),
    claims: ["Made Safe Certified", "Mosquito Repellent Gel", "Safer Daily Use"],
    scenario: "edge",
    expectedTrustScore: 76
  },
  {
    name: "Mamaearth Body Roll-On Repellent",
    brandName: "Mamaearth",
    barcode: "8901000000041",
    category: "Personal Care",
    description: "Mamaearth positions this body roll-on as a natural mosquito repellent option referenced in MADE SAFE public materials.",
    imageUrl: productArt("roll-on", "Mamaearth Body Roll-On Repellent"),
    claims: ["Made Safe Certified", "Body Roll-On Repellent", "Natural Repellent"],
    scenario: "edge",
    expectedTrustScore: 76
  },
  {
    name: "Mamaearth Fabric Roll-On Repellent",
    brandName: "Mamaearth",
    barcode: "8901000000042",
    category: "Household",
    description: "Mamaearth markets this fabric roll-on as a safer mosquito repellent option for textiles, echoed in MADE SAFE public guidance.",
    imageUrl: productArt("roll-on", "Mamaearth Fabric Roll-On Repellent"),
    claims: ["Made Safe Certified", "Fabric Roll-On Repellent", "Safer Textile Use"],
    scenario: "edge",
    expectedTrustScore: 75
  },
  {
    name: "Dr. Bronner's All-One Peppermint Pure-Castile Soap",
    brandName: "Dr. Bronner's",
    barcode: "8901000000043",
    category: "Personal Care",
    description: "This peppermint castile soap is listed by EWG Verified and positioned as a multi-use soap with screened ingredients.",
    imageUrl: productArt("cleaner-bottle", "Dr. Bronner's Peppermint Castile Soap"),
    claims: ["EWG Verified", "Ingredient Screened", "Multi-Use Castile Soap"],
    scenario: "mixed",
    expectedTrustScore: 74
  },
  {
    name: "Safely Dish Soap - Fresh",
    brandName: "Safely",
    barcode: "8901000000044",
    category: "Household",
    description: "Safely presents this fresh dish soap with Green Seal product-level certification for lower-impact cleaning performance.",
    imageUrl: productArt("dish-soap", "Safely Dish Soap - Fresh"),
    claims: ["Green Seal Certified", "Dish Soap", "Lower-Impact Cleaning"],
    scenario: "edge",
    expectedTrustScore: 72
  },
  {
    name: "Ceyon Naturaa Cleansing Cream Face Wash",
    brandName: "Ceyon Naturaa",
    barcode: "8901000000045",
    category: "Beauty",
    description: "Ceyon Naturaa positions this cleansing cream as a COSMOS ORGANIC certified face wash certified by Ecocert Greenlife.",
    imageUrl: productArt("cream-jar", "Ceyon Naturaa Cleansing Cream"),
    claims: ["COSMOS Organic", "Ecocert Greenlife Certified", "Certified Organic Face Wash"],
    scenario: "edge",
    expectedTrustScore: 86
  },
  {
    name: "VIVA DORIA Organic Jojoba Oil",
    brandName: "VIVA DORIA",
    barcode: "8901000000046",
    category: "Beauty",
    description: "VIVA DORIA lists this jojoba oil under a USDA organic operation profile handled by Ecocert SAS, giving it strong certified-organic evidence.",
    imageUrl: productArt("serum", "VIVA DORIA Organic Jojoba Oil"),
    claims: ["USDA Organic", "Certified Organic Jojoba Oil", "Ecocert Certified Operation"],
    scenario: "edge",
    expectedTrustScore: 84
  },
  {
    name: "ATTITUDE Window & Glass Cleaner",
    brandName: "ATTITUDE",
    barcode: "8901000000047",
    category: "Household",
    description: "ATTITUDE markets this window and glass cleaner as ECOLOGO certified, biodegradable, and plant-based on its official product page.",
    imageUrl: productArt("spray-bottle", "ATTITUDE Window & Glass Cleaner"),
    claims: ["UL ECOLOGO Certified", "Biodegradable", "Plant-Based Cleaner"],
    scenario: "edge",
    expectedTrustScore: 80
  },
  {
    name: "SmartyPants Prenatal Organic Multi & Probiotics",
    brandName: "SmartyPants",
    barcode: "8901000000048",
    category: "Wellness",
    description: "SmartyPants lists this prenatal gummy in the official NSF certified products database as an organic multi with probiotics.",
    imageUrl: productArt("capsules", "SmartyPants Prenatal Organic Multi"),
    claims: ["NSF Contents Certified", "Prenatal Organic Multi", "Probiotics"],
    scenario: "edge",
    expectedTrustScore: 78
  },
  {
    name: "Clorox EcoClean Disinfecting Cleaner",
    brandName: "Clorox",
    barcode: "8901000000049",
    category: "Household",
    description: "Clorox EcoClean appears on EPA's DfE-certified disinfectants list as a lower-toxicity disinfecting cleaner under the legacy Design for the Environment program.",
    imageUrl: productArt("spray-bottle", "Clorox EcoClean Cleaner"),
    claims: ["DfE Certified", "Disinfecting Cleaner", "EPA Listed"],
    scenario: "edge",
    expectedTrustScore: 74
  },
  {
    name: "Adidas Boston 12 GRS Running Shoe",
    brandName: "Adidas",
    barcode: "8901000000050",
    category: "Footwear",
    description: "adidas frames the Boston 12 running shoe around Global Recycled Standard certified materials in its official sustainability material innovation post.",
    imageUrl: productArt("runner-shoe", "Adidas Boston 12 GRS Shoe"),
    claims: ["GRS Certified Materials", "Running Shoe", "Recycled Content"],
    scenario: "edge",
    expectedTrustScore: 82
  },
  {
    name: "ATTITUDE Dish Soap - Orange & Sage",
    brandName: "ATTITUDE",
    barcode: "8901000000051",
    category: "Household",
    description: "ATTITUDE presents this dish soap as EWG VERIFIED and made for high-performance dish cleaning with plant- and mineral-based ingredients.",
    imageUrl: productArt("dish-soap", "ATTITUDE Dish Soap"),
    claims: ["EWG Verified", "Plant- and Mineral-Based", "Dish Soap"],
    scenario: "edge",
    expectedTrustScore: 81
  },
  {
    name: "ATTITUDE Extra-Gentle Shampoo Unscented",
    brandName: "ATTITUDE",
    barcode: "8901000000052",
    category: "Beauty",
    description: "ATTITUDE presents this extra-gentle shampoo as EWG VERIFIED, dermatologically tested, and built from naturally sourced ingredients for sensitive scalps.",
    imageUrl: productArt("conditioner", "ATTITUDE Extra-Gentle Shampoo"),
    claims: ["EWG Verified", "Dermatologically Tested", "Naturally Sourced Ingredients"],
    scenario: "edge",
    expectedTrustScore: 80
  },
  {
    name: "Safely Hand Soap - Calm",
    brandName: "Safely",
    barcode: "8901000000053",
    category: "Household",
    description: "Safely lists this Calm hand soap in Green Seal's certified product directory, highlighting mineral-based surfactants and skin-conditioning agents.",
    imageUrl: productArt("pump-bottle", "Safely Hand Soap Calm"),
    claims: ["Green Seal Certified", "Mineral-Based Surfactants", "Hand Soap"],
    scenario: "edge",
    expectedTrustScore: 78
  },
  {
    name: "Safely Hand Soap - Fresh",
    brandName: "Safely",
    barcode: "8901000000054",
    category: "Household",
    description: "Safely lists this Fresh hand soap in Green Seal's directory with mineral-based surfactants and coconut-based conditioning agents.",
    imageUrl: productArt("pump-bottle", "Safely Hand Soap Fresh"),
    claims: ["Green Seal Certified", "Mineral-Based Surfactants", "Hand Soap"],
    scenario: "edge",
    expectedTrustScore: 78
  },
  {
    name: "Safely Dish Soap - Rise",
    brandName: "Safely",
    barcode: "8901000000055",
    category: "Household",
    description: "Safely's Rise dish soap appears in the Green Seal certified product directory as a specialty household cleaner built for grease and baked-on messes.",
    imageUrl: productArt("dish-soap", "Safely Dish Soap Rise"),
    claims: ["Green Seal Certified", "Specialty Household Cleaner", "Dish Soap"],
    scenario: "edge",
    expectedTrustScore: 79
  },
  {
    name: "Safely Universal Cleaner - Fresh",
    brandName: "Safely",
    barcode: "8901000000056",
    category: "Household",
    description: "Safely's Fresh universal cleaner is listed by Green Seal for household cleaning use with coconut-derived ingredients and citric acid.",
    imageUrl: productArt("spray-bottle", "Safely Universal Cleaner Fresh"),
    claims: ["Green Seal Certified", "Universal Cleaner", "Coconut-Derived Ingredients"],
    scenario: "edge",
    expectedTrustScore: 80
  },
  {
    name: "Safely Hand Soap - Rise",
    brandName: "Safely",
    barcode: "8901000000057",
    category: "Household",
    description: "Safely's Rise hand soap is listed in the Green Seal directory as a certified hand cleanser using mineral-based surfactants and coconut-based conditioning agents.",
    imageUrl: productArt("pump-bottle", "Safely Hand Soap Rise"),
    claims: ["Green Seal Certified", "Mineral-Based Surfactants", "Hand Soap"],
    scenario: "edge",
    expectedTrustScore: 78
  },
  {
    name: "Safely Universal Cleaner - Calm",
    brandName: "Safely",
    barcode: "8901000000058",
    category: "Household",
    description: "Safely's Calm universal cleaner appears in Green Seal's household cleaning directory for its safer, multi-surface formulation.",
    imageUrl: productArt("spray-bottle", "Safely Universal Cleaner Calm"),
    claims: ["Green Seal Certified", "Universal Cleaner", "Multi-Surface Formula"],
    scenario: "edge",
    expectedTrustScore: 80
  },
  {
    name: "Safely Universal Cleaner - Rise",
    brandName: "Safely",
    barcode: "8901000000059",
    category: "Household",
    description: "Safely's Rise universal cleaner is certified by Green Seal for household use and positioned as a safer general-purpose cleaner.",
    imageUrl: productArt("spray-bottle", "Safely Universal Cleaner Rise"),
    claims: ["Green Seal Certified", "Universal Cleaner", "General-Purpose Cleaner"],
    scenario: "edge",
    expectedTrustScore: 80
  },
  {
    name: "ATTITUDE Baby Bottle & Dishwashing Liquid Unscented",
    brandName: "ATTITUDE",
    barcode: "8901000000060",
    category: "Household",
    description: "ATTITUDE lists this baby bottle and dishwashing liquid as EWG VERIFIED and formulated for dishes, bottles, and baby accessories with naturally sourced ingredients.",
    imageUrl: productArt("dish-soap", "ATTITUDE Baby Bottle Dishwashing Liquid"),
    claims: ["EWG Verified", "Naturally Sourced Ingredients", "Baby Bottle & Dishwashing Liquid"],
    scenario: "edge",
    expectedTrustScore: 82
  },
  {
    name: "ATTITUDE 2-in-1 Baby Foaming Shampoo & Body Wash",
    brandName: "ATTITUDE",
    barcode: "8901000000061",
    category: "Beauty",
    description: "ATTITUDE presents this baby foaming shampoo and body wash as EWG VERIFIED and dermatologically tested for sensitive skin routines.",
    imageUrl: productArt("pump-bottle", "ATTITUDE Baby Shampoo Body Wash"),
    claims: ["EWG Verified", "Dermatologically Tested", "Baby Shampoo & Body Wash"],
    scenario: "edge",
    expectedTrustScore: 82
  },
  {
    name: "ATTITUDE Hand Soap - Sensitive Skin",
    brandName: "ATTITUDE",
    barcode: "8901000000062",
    category: "Household",
    description: "ATTITUDE lists this sensitive skin hand soap as EWG VERIFIED and dermatologically tested, formulated with oat for delicate skin.",
    imageUrl: productArt("pump-bottle", "ATTITUDE Hand Soap Sensitive Skin"),
    claims: ["EWG Verified", "Dermatologically Tested", "Sensitive Skin Hand Soap"],
    scenario: "edge",
    expectedTrustScore: 81
  },
  {
    name: "ATTITUDE Hand Soap - Orange Blossom & Eucalyptus",
    brandName: "ATTITUDE",
    barcode: "8901000000063",
    category: "Household",
    description: "ATTITUDE presents this energizing hand soap as EWG VERIFIED and dermatologically tested, with naturally sourced ingredients and orange blossom notes.",
    imageUrl: productArt("pump-bottle", "ATTITUDE Hand Soap Orange Blossom"),
    claims: ["EWG Verified", "Dermatologically Tested", "Naturally Sourced Ingredients"],
    scenario: "edge",
    expectedTrustScore: 81
  },
  {
    name: "ATTITUDE Body Wash - Sensitive Skin",
    brandName: "ATTITUDE",
    barcode: "8901000000064",
    category: "Beauty",
    description: "ATTITUDE's sensitive skin body wash is shown as EWG VERIFIED and dermatologically tested with oat for delicate skin routines.",
    imageUrl: productArt("conditioner", "ATTITUDE Body Wash Sensitive Skin"),
    claims: ["EWG Verified", "Dermatologically Tested", "Sensitive Skin Body Wash"],
    scenario: "edge",
    expectedTrustScore: 81
  },
  {
    name: "ATTITUDE Laundry Detergent - Little Ones",
    brandName: "ATTITUDE",
    barcode: "8901000000065",
    category: "Household",
    description: "ATTITUDE lists this Little Ones laundry detergent as EWG VERIFIED and made for baby clothing with naturally sourced ingredients and hypoallergenic positioning.",
    imageUrl: productArt("laundry-pods", "ATTITUDE Laundry Detergent Little Ones"),
    claims: ["EWG Verified", "Hypoallergenic Formula", "Baby Laundry Detergent"],
    scenario: "edge",
    expectedTrustScore: 82
  },
  {
    name: "ATTITUDE Dishwashing Liquid - Unscented",
    brandName: "ATTITUDE",
    barcode: "8901000000066",
    category: "Household",
    description: "ATTITUDE presents this unscented dishwashing liquid as EWG VERIFIED and designed for effective dish cleaning with naturally sourced ingredients.",
    imageUrl: productArt("dish-soap", "ATTITUDE Dishwashing Liquid Unscented"),
    claims: ["EWG Verified", "Naturally Sourced Ingredients", "Unscented Dishwashing Liquid"],
    scenario: "edge",
    expectedTrustScore: 82
  },
  {
    name: "Safely Laundry Detergent - Calm",
    brandName: "Safely",
    barcode: "8901000000067",
    category: "Household",
    description: "Safely lists this Calm laundry detergent in Green Seal's certified directory for lower-impact laundering with plant- and mineral-based cleaning agents.",
    imageUrl: productArt("laundry-pods", "Safely Laundry Detergent Calm"),
    claims: ["Green Seal Certified", "Laundry Detergent", "Lower-Impact Cleaning"],
    scenario: "edge",
    expectedTrustScore: 80
  },
  {
    name: "Safely Laundry Detergent - Rise",
    brandName: "Safely",
    barcode: "8901000000068",
    category: "Household",
    description: "Safely's Rise laundry detergent appears in the Green Seal directory as a certified household cleaning product built for everyday laundry use.",
    imageUrl: productArt("laundry-pods", "Safely Laundry Detergent Rise"),
    claims: ["Green Seal Certified", "Laundry Detergent", "Household Cleaning"],
    scenario: "edge",
    expectedTrustScore: 80
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
    name: "Biotique Fresh Neem Pimple Control Face Wash",
    brandName: "Biotique",
    barcode: "8901000000023",
    category: "Beauty",
    description: "Biotique labels this neem face wash as 100% natural botanical, chemical free, cruelty free, and recyclable packaged despite limited certification evidence.",
    imageUrl: productPhoto.biotiqueNeemFaceWash,
    claims: ["100% Natural Botanical", "Chemical Free", "Cruelty Free"],
    scenario: "greenwashing",
    expectedTrustScore: 0
  },
  {
    name: "Patanjali Kesh Kanti Natural Hair Cleanser",
    brandName: "Patanjali",
    barcode: "8901000000024",
    category: "Beauty",
    description: "Patanjali describes this hair cleanser as a natural herbal composition for dryness, dandruff, and hair glow without third-party sustainability verification.",
    imageUrl: productPhoto.patanjaliKeshKanti,
    claims: ["Natural Ingredients", "Herbal Composition", "Hair Glow"],
    scenario: "mixed",
    expectedTrustScore: 57
  },
  {
    name: "Beco Natural Dishwash Liquid Refill",
    brandName: "Beco",
    barcode: "8901000000025",
    category: "Household",
    description: "Beco presents this refill pack as a natural dishwash liquid with plant-based coconut cleaners and a lower-waste refill format.",
    imageUrl: productPhoto.becoDishwashRefill,
    claims: ["Natural Dishwash", "Plant-Based Cleaner", "Refill Pack"],
    scenario: "greenwashing",
    expectedTrustScore: 39
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
    name: "Mamaearth Onion Shampoo",
    brandName: "Mamaearth",
    barcode: "8901000000033",
    category: "Beauty",
    description: "Mamaearth promotes this onion shampoo with a MADE SAFE certification badge, plant keratin, and a sulfate-free formula for hair fall control.",
    imageUrl: productPhoto.mamaearthOnionShampoo,
    claims: ["Made Safe Certified", "Natural Ingredients", "Sulfate-Free Formula"],
    scenario: "edge",
    expectedTrustScore: 79
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
    productName: "No Nasties Blanc Classic Tee",
    certificationAcronym: "GOTS",
    certificateNumber: "GOTS-NN-TEE-001",
    isVerified: true
  },
  {
    productName: "No Nasties Blanc Classic Tee",
    certificationAcronym: "FTC",
    certificateNumber: "FTC-NN-TEE-001",
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
    productName: "Mamaearth Vitamin C Face Wash",
    certificationAcronym: "MSAFE",
    certificateNumber: "MSAFE-ME-VITC-001",
    isVerified: true
  },
  {
    productName: "Mamaearth Onion Shampoo",
    certificationAcronym: "MSAFE",
    certificateNumber: "MSAFE-ME-ONION-001",
    isVerified: true
  },
  {
    productName: "Mamaearth Organic Bamboo Baby Wipes",
    certificationAcronym: "MSAFE",
    certificateNumber: "MSAFE-ME-WIPES-001",
    isVerified: true
  },
  {
    productName: "Mamaearth Mineral Based Sunscreen",
    certificationAcronym: "MSAFE",
    certificateNumber: "MSAFE-ME-SUN-001",
    isVerified: true
  },
  {
    productName: "Mamaearth Natural Mosquito Repellent",
    certificationAcronym: "MSAFE",
    certificateNumber: "MSAFE-ME-BUG-001",
    isVerified: true
  },
  {
    productName: "Mamaearth Mosquito Repellent Gel",
    certificationAcronym: "MSAFE",
    certificateNumber: "MSAFE-ME-GEL-001",
    isVerified: true
  },
  {
    productName: "Mamaearth Body Roll-On Repellent",
    certificationAcronym: "MSAFE",
    certificateNumber: "MSAFE-ME-BODY-001",
    isVerified: true
  },
  {
    productName: "Mamaearth Fabric Roll-On Repellent",
    certificationAcronym: "MSAFE",
    certificateNumber: "MSAFE-ME-FABRIC-001",
    isVerified: true
  },
  {
    productName: "Dr. Bronner's All-One Peppermint Pure-Castile Soap",
    certificationAcronym: "EWG",
    certificateNumber: "EWG-DB-PEPP-001",
    isVerified: true
  },
  {
    productName: "Safely Dish Soap - Fresh",
    certificationAcronym: "GS",
    certificateNumber: "GS-SAF-DISH-001",
    isVerified: true
  },
  {
    productName: "Ceyon Naturaa Cleansing Cream Face Wash",
    certificationAcronym: "COSMOS",
    certificateNumber: "COSMOS-CEYON-FACE-001",
    isVerified: true
  },
  {
    productName: "VIVA DORIA Organic Jojoba Oil",
    certificationAcronym: "USDA",
    certificateNumber: "USDA-VIVA-JOJOBA-001",
    isVerified: true
  },
  {
    productName: "ATTITUDE Window & Glass Cleaner",
    certificationAcronym: "ECO",
    certificateNumber: "ECO-ATT-WINDOW-001",
    isVerified: true
  },
  {
    productName: "SmartyPants Prenatal Organic Multi & Probiotics",
    certificationAcronym: "NSF",
    certificateNumber: "NSF-SP-PRENATAL-001",
    isVerified: true
  },
  {
    productName: "Clorox EcoClean Disinfecting Cleaner",
    certificationAcronym: "DFE",
    certificateNumber: "DFE-CLX-ECO-001",
    isVerified: true
  },
  {
    productName: "Adidas Boston 12 GRS Running Shoe",
    certificationAcronym: "GRS",
    certificateNumber: "GRS-ADI-B12-001",
    isVerified: true
  },
  {
    productName: "ATTITUDE Dish Soap - Orange & Sage",
    certificationAcronym: "EWG",
    certificateNumber: "EWG-ATT-DISH-001",
    isVerified: true
  },
  {
    productName: "ATTITUDE Extra-Gentle Shampoo Unscented",
    certificationAcronym: "EWG",
    certificateNumber: "EWG-ATT-SHAMPOO-001",
    isVerified: true
  },
  {
    productName: "Safely Hand Soap - Calm",
    certificationAcronym: "GS",
    certificateNumber: "GS-SAF-HAND-001",
    isVerified: true
  },
  {
    productName: "Safely Hand Soap - Fresh",
    certificationAcronym: "GS",
    certificateNumber: "GS-SAF-HANDFRESH-001",
    isVerified: true
  },
  {
    productName: "Safely Dish Soap - Rise",
    certificationAcronym: "GS",
    certificateNumber: "GS-SAF-DISHRISE-001",
    isVerified: true
  },
  {
    productName: "Safely Universal Cleaner - Fresh",
    certificationAcronym: "GS",
    certificateNumber: "GS-SAF-UNIFRESH-001",
    isVerified: true
  },
  {
    productName: "Safely Hand Soap - Rise",
    certificationAcronym: "GS",
    certificateNumber: "GS-SAF-HANDRISE-001",
    isVerified: true
  },
  {
    productName: "Safely Universal Cleaner - Calm",
    certificationAcronym: "GS",
    certificateNumber: "GS-SAF-UNICALM-001",
    isVerified: true
  },
  {
    productName: "Safely Universal Cleaner - Rise",
    certificationAcronym: "GS",
    certificateNumber: "GS-SAF-UNIRISE-001",
    isVerified: true
  },
  {
    productName: "ATTITUDE Baby Bottle & Dishwashing Liquid Unscented",
    certificationAcronym: "EWG",
    certificateNumber: "EWG-ATT-BABYDISH-001",
    isVerified: true
  },
  {
    productName: "ATTITUDE 2-in-1 Baby Foaming Shampoo & Body Wash",
    certificationAcronym: "EWG",
    certificateNumber: "EWG-ATT-BABYBATH-001",
    isVerified: true
  },
  {
    productName: "ATTITUDE Hand Soap - Sensitive Skin",
    certificationAcronym: "EWG",
    certificateNumber: "EWG-ATT-HANDSENS-001",
    isVerified: true
  },
  {
    productName: "ATTITUDE Hand Soap - Orange Blossom & Eucalyptus",
    certificationAcronym: "EWG",
    certificateNumber: "EWG-ATT-HANDENERGY-001",
    isVerified: true
  },
  {
    productName: "ATTITUDE Body Wash - Sensitive Skin",
    certificationAcronym: "EWG",
    certificateNumber: "EWG-ATT-BODYSENS-001",
    isVerified: true
  },
  {
    productName: "ATTITUDE Laundry Detergent - Little Ones",
    certificationAcronym: "EWG",
    certificateNumber: "EWG-ATT-LAUNDRYBABY-001",
    isVerified: true
  },
  {
    productName: "ATTITUDE Dishwashing Liquid - Unscented",
    certificationAcronym: "EWG",
    certificateNumber: "EWG-ATT-DISHUNSC-001",
    isVerified: true
  },
  {
    productName: "Safely Laundry Detergent - Calm",
    certificationAcronym: "GS",
    certificateNumber: "GS-SAF-LAUNDRYCALM-001",
    isVerified: true
  },
  {
    productName: "Safely Laundry Detergent - Rise",
    certificationAcronym: "GS",
    certificateNumber: "GS-SAF-LAUNDRYRISE-001",
    isVerified: true
  },
  {
    productName: "Nespresso Recycled Aluminum Capsules",
    certificationAcronym: "CTS",
    certificateNumber: "CTS-NESP-CAPS-001",
    isVerified: true
  }
];
