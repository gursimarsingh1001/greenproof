import type { CertificationSourceEntry, CertificationSourceRegistryPayload } from "../types/index.js";

export const certificationSources: CertificationSourceEntry[] = [
  {
    id: "cosmetics-leaping-bunny",
    sector: "cosmetics",
    certificationName: "Leaping Bunny",
    databaseUrl: "https://www.leapingbunny.org/companies",
    liveFetchUrl: "https://www.leapingbunny.org/sites/default/files/Recomm-list_v5_060418.pdf",
    access: "Public searchable company list",
    notes: "Strong cruelty-free brand-level signal for cosmetics and personal care.",
    coverageHint: "2,000+ certified companies",
    isOfficial: true,
    isSupported: true,
    wave: 1,
    priority: 10
  },
  {
    id: "cosmetics-usda-organic",
    sector: "cosmetics",
    certificationName: "USDA Organic",
    databaseUrl: "https://organic.ams.usda.gov/integrity/",
    access: "Public organic integrity lookup",
    notes: "Can validate certified operations; product-specific matching may still need extra normalization.",
    isOfficial: true,
    isSupported: true,
    wave: 1,
    priority: 20
  },
  {
    id: "cosmetics-cosmos-ecocert",
    sector: "cosmetics",
    certificationName: "COSMOS / Ecocert",
    databaseUrl: "https://cosmos.ecocert.com/certified-companies",
    access: "Public certified-company directory",
    notes: "Strong natural/organic cosmetics signal at company and product-family level.",
    isOfficial: true,
    isSupported: true,
    wave: 1,
    priority: 30
  },
  {
    id: "cosmetics-ewg-verified",
    sector: "cosmetics",
    certificationName: "EWG Verified",
    databaseUrl: "https://www.ewg.org/ewgverified/",
    liveFetchUrl: "https://www.ewg.org/ewgverified/",
    access: "Public product directory",
    notes: "Strong clean-personal-care signal for specific SKUs and lines.",
    isOfficial: true,
    isSupported: true,
    wave: 1,
    priority: 40
  },
  {
    id: "cosmetics-made-safe",
    sector: "cosmetics",
    certificationName: "MADE SAFE",
    databaseUrl: "https://www.madesafe.org/search-certified-products/",
    liveFetchUrl: "https://madesafe.org/find-products/products",
    access: "Public certified product search",
    notes: "Useful for the current cosmetics-first rollout because several demo products rely on MADE SAFE verification.",
    isOfficial: true,
    isSupported: true,
    wave: 1,
    priority: 50
  },
  {
    id: "household-epa-safer-choice",
    sector: "household",
    certificationName: "EPA Safer Choice",
    databaseUrl: "https://www.epa.gov/saferchoice/products",
    access: "Public searchable product database",
    notes: "One of the best cleaning-product sources for GreenProof household verification.",
    coverageHint: "Nearly 2,000 qualifying products historically; 1,656 FY2025 certified products",
    isOfficial: true,
    isSupported: true,
    wave: 2,
    priority: 10
  },
  {
    id: "household-green-seal",
    sector: "household",
    certificationName: "Green Seal",
    databaseUrl: "https://www.greenseal.org/find-certified-products",
    access: "Public certified-product finder",
    notes: "Strong product-level environmental standard for cleaning and facility products.",
    isOfficial: true,
    isSupported: true,
    wave: 2,
    priority: 20
  },
  {
    id: "household-usda-biobased",
    sector: "household",
    certificationName: "USDA Certified Biobased / BioPreferred",
    databaseUrl: "https://www.biopreferred.gov/BioPreferred/faces/catalog/Catalog.xhtml",
    access: "Public product catalog",
    notes: "Useful for products that make explicit USDA biobased or BioPreferred claims.",
    isOfficial: true,
    isSupported: true,
    wave: 2,
    priority: 25
  },
  {
    id: "household-ecologo",
    sector: "household",
    certificationName: "ECOLOGO",
    databaseUrl: "https://www.ul.com/markets-and-safety/ecologo-certification",
    liveFetchUrl: "https://www.ul.com/services/ecologo-certification",
    access: "Public program and certification info",
    notes: "Useful for environmental standards and product families in household categories.",
    isOfficial: true,
    isSupported: true,
    wave: 2,
    priority: 30
  },
  {
    id: "household-dfe",
    sector: "household",
    certificationName: "Design for the Environment",
    databaseUrl: "https://www.epa.gov/saferchoice",
    access: "EPA program pages and legacy references",
    notes: "Program is legacy/discontinued in current form, but historical references still matter for older products.",
    isOfficial: true,
    isSupported: false,
    wave: 4,
    priority: 40
  },
  {
    id: "household-carbon-trust",
    sector: "household",
    certificationName: "Carbon Trust Standard",
    databaseUrl: "https://www.carbontrust.com/what-we-do/assurance-and-certification/the-carbon-trust-standard",
    liveFetchUrl: "https://www.carbontrust.com/the-carbon-trust-standard/standard-bearers",
    access: "Public program pages and case-study references",
    notes: "Useful as climate-assurance context for products or product families that publish Carbon Trust backed claims.",
    isOfficial: true,
    isSupported: false,
    wave: 4,
    priority: 45
  },
  {
    id: "fashion-gots",
    sector: "fashion",
    certificationName: "GOTS (Global Organic Textile Standard)",
    databaseUrl: "https://global-standard.org/certification-database",
    liveFetchUrl: "https://global-standard.org/en/find-suppliers-shops-and-inputs/certifiedsuppliers",
    access: "Public supplier database",
    notes: "Certified suppliers and product categories across the textile supply chain.",
    coverageHint: "Millions of workers represented across GOTS-certified facilities",
    isOfficial: true,
    isSupported: true,
    wave: 3,
    priority: 10
  },
  {
    id: "fashion-oeko-tex",
    sector: "fashion",
    certificationName: "OEKO-TEX",
    databaseUrl: "https://www.oeko-tex.com/en/verified-companies",
    liveFetchUrl: "https://services.oeko-tex.com/buying-guide/",
    access: "Public company/product verification",
    notes: "Useful for STANDARD 100, MADE IN GREEN, and broader textile safety verification.",
    coverageHint: "Tens of thousands of valid certificates and labels",
    isOfficial: true,
    isSupported: true,
    wave: 3,
    priority: 20
  },
  {
    id: "fashion-fairtrade-textile",
    sector: "fashion",
    certificationName: "Fair Trade Textile",
    databaseUrl: "https://www.fairtradecertified.org/find-products",
    liveFetchUrl: "https://www.fairtradecertified.org/knowledge-base/fair-trade-in-practice/how-can-i-find-fair-trade-products/",
    access: "Public product finder",
    notes: "Good for certified apparel and textile product lookups.",
    isOfficial: true,
    isSupported: true,
    wave: 3,
    priority: 30
  },
  {
    id: "fashion-fsc",
    sector: "fashion",
    certificationName: "FSC",
    databaseUrl: "https://search.fsc.org/en/search",
    access: "Public certificate and promotional-license search",
    notes: "Useful for fiber and paper-based packaging claims attached to apparel, footwear, and lifestyle products.",
    isOfficial: true,
    isSupported: false,
    wave: 4,
    priority: 32
  },
  {
    id: "fashion-grs",
    sector: "fashion",
    certificationName: "Global Recycled Standard",
    databaseUrl: "https://textileexchange.org/find-certified-company/",
    liveFetchUrl: "https://textileexchange.org/standards/find-certified-company/",
    access: "Public certified-company lookup",
    notes: "Useful for recycled-content claims at company and selected product-family level.",
    isOfficial: true,
    isSupported: false,
    wave: 4,
    priority: 35
  },
  {
    id: "cosmetics-nsf",
    sector: "cosmetics",
    certificationName: "NSF Certified Products",
    databaseUrl: "https://www.nsf.org/certified-products-systems",
    access: "Public certification lookup",
    notes: "Broad certified-product lookup; helpful for supplements and some personal-care categories.",
    isOfficial: true,
    isSupported: false,
    wave: 4,
    priority: 60
  },
  {
    id: "cosmetics-peta-cruelty-free",
    sector: "cosmetics",
    certificationName: "PETA Cruelty-Free",
    databaseUrl: "https://www.peta.org/about-peta/companies-that-do-test-on-animals/",
    access: "Public brand list",
    notes: "Useful as supporting reputation context, but methodology differs from Leaping Bunny.",
    isOfficial: true,
    isSupported: false,
    wave: 4,
    priority: 70
  },
  {
    id: "cosmetics-vegan-society",
    sector: "cosmetics",
    certificationName: "Vegan Society Trademark",
    databaseUrl: "https://www.vegansociety.com/search/products",
    liveFetchUrl: "https://www.vegansociety.com/resources/lifestyle/shopping/trademark-search",
    access: "Public trademark search",
    notes: "Useful for beauty and personal-care brands that publicly carry the Vegan Society mark.",
    isOfficial: true,
    isSupported: false,
    wave: 4,
    priority: 75
  },
  {
    id: "fashion-bluesign",
    sector: "fashion",
    certificationName: "bluesign",
    databaseUrl: "https://www.bluesign.com/partners/brands",
    access: "Public partner directory",
    notes: "Mostly system-partner and brand-level verification rather than SKU-level verification.",
    isOfficial: true,
    isSupported: false,
    wave: 4,
    priority: 40
  },
  {
    id: "fashion-better-cotton",
    sector: "fashion",
    certificationName: "Better Cotton Initiative",
    databaseUrl: "https://bettercotton.org/members/",
    access: "Public member list",
    notes: "Useful as sourcing context, but not direct product-level certification proof.",
    isOfficial: true,
    isSupported: false,
    wave: 4,
    priority: 50
  },
  {
    id: "fashion-bcorp",
    sector: "fashion",
    certificationName: "B Corp (Fashion)",
    databaseUrl: "https://www.bcorporation.net/discover-b-corp/filter",
    access: "Public filtered directory",
    notes: "Best used as brand-level trust context rather than product-level proof.",
    isOfficial: true,
    isSupported: false,
    wave: 4,
    priority: 60
  },
  {
    id: "household-vegan-society",
    sector: "household",
    certificationName: "Vegan Society Trademark",
    databaseUrl: "https://www.vegansociety.com/search/products",
    liveFetchUrl: "https://www.vegansociety.com/resources/lifestyle/shopping/trademark-search",
    access: "Public trademark search",
    notes: "Useful for household and home-care products marketed with the Vegan Society trademark.",
    isOfficial: true,
    isSupported: false,
    wave: 4,
    priority: 55
  }
];

export function buildCertificationSourceRegistry(): CertificationSourceRegistryPayload {
  const bySector = certificationSources.reduce<Record<string, number>>((totals, source) => {
    totals[source.sector] = (totals[source.sector] ?? 0) + 1;
    return totals;
  }, {});

  return {
    totalSources: certificationSources.length,
    bySector,
    entries: certificationSources
  };
}
