import type { CertificationSourceEntry, CertificationSourceRegistryPayload } from "../types/index.js";

export const certificationSources: CertificationSourceEntry[] = [
  {
    id: "fashion-gots",
    sector: "fashion",
    certificationName: "GOTS (Global Organic Textile Standard)",
    databaseUrl: "https://global-standard.org/certification-database",
    access: "Public supplier database",
    notes: "Certified suppliers and product categories across the textile supply chain.",
    coverageHint: "Millions of workers represented across GOTS-certified facilities",
    isOfficial: true
  },
  {
    id: "fashion-oeko-tex",
    sector: "fashion",
    certificationName: "OEKO-TEX",
    databaseUrl: "https://www.oeko-tex.com/en/verified-companies",
    access: "Public company/product verification",
    notes: "Useful for STANDARD 100, MADE IN GREEN, and broader textile safety verification.",
    coverageHint: "Tens of thousands of valid certificates and labels",
    isOfficial: true
  },
  {
    id: "fashion-fairtrade-textile",
    sector: "fashion",
    certificationName: "Fair Trade Textile",
    databaseUrl: "https://www.fairtradecertified.org/find-products",
    access: "Public product finder",
    notes: "Good for certified apparel and textile product lookups.",
    isOfficial: true
  },
  {
    id: "fashion-bcorp",
    sector: "fashion",
    certificationName: "B Corp (Fashion)",
    databaseUrl: "https://www.bcorporation.net/discover-b-corp/filter",
    access: "Public filtered directory",
    notes: "Best used as brand-level trust context rather than product-level proof.",
    isOfficial: true
  },
  {
    id: "fashion-bluesign",
    sector: "fashion",
    certificationName: "bluesign",
    databaseUrl: "https://www.bluesign.com/partners/brands",
    access: "Public partner directory",
    notes: "Mostly system-partner and brand-level verification rather than SKU-level verification.",
    isOfficial: true
  },
  {
    id: "fashion-better-cotton",
    sector: "fashion",
    certificationName: "Better Cotton Initiative",
    databaseUrl: "https://bettercotton.org/members/",
    access: "Public member list",
    notes: "Useful as sourcing context, but not direct product-level certification proof.",
    isOfficial: true
  },
  {
    id: "cosmetics-leaping-bunny",
    sector: "cosmetics",
    certificationName: "Leaping Bunny",
    databaseUrl: "https://www.leapingbunny.org/companies",
    access: "Public searchable company list",
    notes: "Strong cruelty-free brand-level signal for cosmetics and personal care.",
    coverageHint: "2,000+ certified companies",
    isOfficial: true
  },
  {
    id: "cosmetics-usda-organic",
    sector: "cosmetics",
    certificationName: "USDA Organic",
    databaseUrl: "https://organic.ams.usda.gov/integrity/",
    access: "Public organic integrity lookup",
    notes: "Can validate certified operations; product-specific matching may still need extra normalization.",
    isOfficial: true
  },
  {
    id: "cosmetics-cosmos-ecocert",
    sector: "cosmetics",
    certificationName: "COSMOS / Ecocert",
    databaseUrl: "https://cosmos.ecocert.com/certified-companies",
    access: "Public certified-company directory",
    notes: "Strong natural/organic cosmetics signal at company and product-family level.",
    isOfficial: true
  },
  {
    id: "cosmetics-peta-cruelty-free",
    sector: "cosmetics",
    certificationName: "PETA Cruelty-Free",
    databaseUrl: "https://www.peta.org/about-peta/companies-that-do-test-on-animals/",
    access: "Public brand list",
    notes: "Useful as supporting reputation context, but methodology differs from Leaping Bunny.",
    isOfficial: true
  },
  {
    id: "cosmetics-ewg-verified",
    sector: "cosmetics",
    certificationName: "EWG Verified",
    databaseUrl: "https://www.ewg.org/ewgverified/",
    access: "Public product directory",
    notes: "Strong clean-personal-care signal for specific SKUs and lines.",
    isOfficial: true
  },
  {
    id: "cosmetics-nsf",
    sector: "cosmetics",
    certificationName: "NSF Certified Products",
    databaseUrl: "https://www.nsf.org/certified-products-systems",
    access: "Public certification lookup",
    notes: "Broad certified-product lookup; helpful for supplements and some personal-care categories.",
    isOfficial: true
  },
  {
    id: "household-epa-safer-choice",
    sector: "household",
    certificationName: "EPA Safer Choice",
    databaseUrl: "https://www.epa.gov/saferchoice/products",
    access: "Public searchable product database",
    notes: "One of the best cleaning-product sources for GreenProof household verification.",
    coverageHint: "Nearly 2,000 qualifying products historically; 1,656 FY2025 certified products",
    isOfficial: true
  },
  {
    id: "household-green-seal",
    sector: "household",
    certificationName: "Green Seal",
    databaseUrl: "https://www.greenseal.org/find-certified-products",
    access: "Public certified-product finder",
    notes: "Strong product-level environmental standard for cleaning and facility products.",
    isOfficial: true
  },
  {
    id: "household-ecologo",
    sector: "household",
    certificationName: "ECOLOGO",
    databaseUrl: "https://www.ul.com/markets-and-safety/ecologo-certification",
    access: "Public program and certification info",
    notes: "Useful for environmental standards and product families in household categories.",
    isOfficial: true
  },
  {
    id: "household-dfe",
    sector: "household",
    certificationName: "Design for the Environment",
    databaseUrl: "https://www.epa.gov/saferchoice",
    access: "EPA program pages and legacy references",
    notes: "Program is legacy/discontinued in current form, but historical references still matter for older products.",
    isOfficial: true
  }
];

/**
 * Returns a compact registry summary for the current official source list.
 */
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
