import type { ClaimType } from "../types/index.js";

export interface ClaimPatternDefinition {
  key: string;
  type: ClaimType;
  confidence: number;
  pattern: RegExp;
}

export interface ContradictionRule {
  left: RegExp;
  right: RegExp;
  message: string;
}

export interface CertificationClaimMatcher {
  pattern: RegExp;
  certificationAcronyms: string[];
}

export const CLAIM_PATTERN_LIBRARY: ClaimPatternDefinition[] = [
  {
    key: "gots",
    type: "certifiable",
    confidence: 0.95,
    pattern: /\b(gots|global organic textile standard)\b/gi
  },
  {
    key: "organic",
    type: "certifiable",
    confidence: 0.95,
    pattern: /\b(organic|usda organic|certified organic)\b/gi
  },
  {
    key: "fair-trade",
    type: "certifiable",
    confidence: 0.95,
    pattern: /\b(fair.?trade|fairtrade)\b/gi
  },
  {
    key: "cruelty-free",
    type: "certifiable",
    confidence: 0.96,
    pattern: /\b(cruelty.?free|leaping.?bunny|not.?tested.?on.?animals)\b/gi
  },
  {
    key: "recycled",
    type: "measurable",
    confidence: 0.9,
    pattern: /\b(recycled|post.?consumer|pre.?consumer|ocean.?plastic|recyclable|recycling|biodegradable)\b/gi
  },
  {
    key: "carbon-neutral",
    type: "verifiable",
    confidence: 0.92,
    pattern: /\b(carbon.?neutral|net.?zero|climate.?neutral|compostable)\b/gi
  },
  {
    key: "cradle-to-cradle",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(cradle.?to.?cradle)\b/gi
  },
  {
    key: "safer-choice",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(safer.?choice)\b/gi
  },
  {
    key: "biobased",
    type: "certifiable",
    confidence: 0.93,
    pattern: /\b(usda biobased|bio.?based|biobased)\b/gi
  },
  {
    key: "vegan",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(vegan|plant.?based)\b/gi
  },
  {
    key: "bcorp",
    type: "certifiable",
    confidence: 0.93,
    pattern: /\b(b.corp|b.corporation|certified.b)\b/gi
  },
  {
    key: "fsc",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(fsc|forest.stewardship)\b/gi
  },
  {
    key: "oeko-tex",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(oeko.?tex|standard.100)\b/gi
  },
  {
    key: "bluesign",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(bluesign|bluesign approved)\b/gi
  },
  {
    key: "made-safe",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(made.?safe)\b/gi
  },
  {
    key: "ewg-verified",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(ewg.?verified)\b/gi
  },
  {
    key: "green-seal",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(green.?seal)\b/gi
  },
  {
    key: "ecologo",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(eco.?logo|ecologo)\b/gi
  },
  {
    key: "cosmos",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(cosmos(?:.?organic)?|cosmos.?ecocert)\b/gi
  },
  {
    key: "nsf",
    type: "certifiable",
    confidence: 0.93,
    pattern: /\b(nsf(?:.?certified)?)\b/gi
  },
  {
    key: "design-for-the-environment",
    type: "certifiable",
    confidence: 0.93,
    pattern: /\b(design.?for.?the.?environment|dfe(?:.?certified)?)\b/gi
  },
  {
    key: "better-cotton",
    type: "certifiable",
    confidence: 0.93,
    pattern: /\b(better.?cotton|better.?cotton.?initiative|bci)\b/gi
  },
  {
    key: "peta-cruelty-free",
    type: "certifiable",
    confidence: 0.93,
    pattern: /\b(peta.?approved|peta.?cruelty.?free)\b/gi
  },
  {
    key: "regenerative-organic",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(regenerative.?organic)\b/gi
  },
  {
    key: "rainforest-alliance",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(rainforest.alliance|utz)\b/gi
  },
  {
    key: "ecocert",
    type: "certifiable",
    confidence: 0.94,
    pattern: /\b(ecocert)\b/gi
  },
  {
    key: "eco-friendly",
    type: "vague",
    confidence: 0.98,
    pattern: /\b(eco.?friendly|ecofriendly)\b/gi
  },
  {
    key: "natural",
    type: "vague",
    confidence: 0.97,
    pattern: /\b(natural|all.?natural|naturally.?derived|naturally)\b/gi
  },
  {
    key: "green",
    type: "vague",
    confidence: 0.97,
    pattern: /\b(green|earth.?friendly|planet.?friendly|earthwise)\b/gi
  },
  {
    key: "sustainable",
    type: "vague",
    confidence: 0.97,
    pattern: /\b(sustainable|sustainability)\b/gi
  },
  {
    key: "conscious",
    type: "vague",
    confidence: 0.97,
    pattern: /\b(clean|conscious|ethical|responsible)\b/gi
  },
  {
    key: "environmentally-friendly",
    type: "vague",
    confidence: 0.97,
    pattern: /\b(environmentally.?friendly|enviro.?friendly)\b/gi
  },
  {
    key: "chemical-free",
    type: "impossible",
    confidence: 0.99,
    pattern: /\bchemical.?free\b/gi
  },
  {
    key: "toxin-free",
    type: "impossible",
    confidence: 0.99,
    pattern: /\b(toxin.?free|zero.?toxins?)\b/gi
  },
  {
    key: "100-natural",
    type: "impossible",
    confidence: 0.99,
    pattern: /\b100%.?natural\b/gi
  },
  {
    key: "harmless",
    type: "impossible",
    confidence: 0.99,
    pattern: /\bharmless\b/gi
  }
];

export const CERTIFICATION_CLAIM_MATCHERS: CertificationClaimMatcher[] = [
  { pattern: /\b(gots|global organic textile standard)\b/i, certificationAcronyms: ["GOTS"] },
  { pattern: /\b(organic|usda organic|certified organic)\b/i, certificationAcronyms: ["USDA", "GOTS", "ROC"] },
  { pattern: /\b(regenerative.?organic)\b/i, certificationAcronyms: ["ROC"] },
  { pattern: /\b(fair.?trade|fairtrade)\b/i, certificationAcronyms: ["FTC"] },
  { pattern: /\b(cruelty.?free|leaping.?bunny|not.?tested.?on.?animals)\b/i, certificationAcronyms: ["LB"] },
  { pattern: /\b(cradle.?to.?cradle)\b/i, certificationAcronyms: ["C2C"] },
  { pattern: /\b(safer.?choice)\b/i, certificationAcronyms: ["EPA"] },
  { pattern: /\b(usda biobased|bio.?based|biobased)\b/i, certificationAcronyms: ["BIO"] },
  { pattern: /\b(vegan|plant.?based)\b/i, certificationAcronyms: ["VEG"] },
  { pattern: /\b(b.corp|b.corporation|certified.b)\b/i, certificationAcronyms: ["BCORP"] },
  { pattern: /\b(fsc|forest.stewardship)\b/i, certificationAcronyms: ["FSC"] },
  { pattern: /\b(oeko.?tex|standard.100)\b/i, certificationAcronyms: ["OEKO"] },
  { pattern: /\b(bluesign|bluesign approved)\b/i, certificationAcronyms: ["BLS"] },
  { pattern: /\b(made.?safe)\b/i, certificationAcronyms: ["MSAFE"] },
  { pattern: /\b(ewg.?verified)\b/i, certificationAcronyms: ["EWG"] },
  { pattern: /\b(green.?seal)\b/i, certificationAcronyms: ["GS"] },
  { pattern: /\b(eco.?logo|ecologo)\b/i, certificationAcronyms: ["ECO"] },
  { pattern: /\b(cosmos(?:.?organic)?|cosmos.?ecocert|ecocert)\b/i, certificationAcronyms: ["COSMOS"] },
  { pattern: /\b(nsf(?:.?certified)?)\b/i, certificationAcronyms: ["NSF"] },
  {
    pattern: /\b(design.?for.?the.?environment|dfe(?:.?certified)?)\b/i,
    certificationAcronyms: ["DFE"]
  },
  { pattern: /\b(better.?cotton|better.?cotton.?initiative|bci)\b/i, certificationAcronyms: ["BCI"] },
  { pattern: /\b(peta.?approved|peta.?cruelty.?free)\b/i, certificationAcronyms: ["PETA"] },
  { pattern: /\b(rainforest.alliance|utz)\b/i, certificationAcronyms: ["RA"] }
  ,
  { pattern: /\b(recycled|post.?consumer|pre.?consumer)\b/i, certificationAcronyms: ["GRS"] },
  { pattern: /\b(carbon.?neutral|net.?zero|climate.?neutral)\b/i, certificationAcronyms: ["CTS"] }
];

export const CONTRADICTION_RULES: ContradictionRule[] = [
  {
    left: /\bwaterproof\b/i,
    right: /\bbreathable cotton\b/i,
    message: 'Contradictory claims detected: "waterproof" conflicts with "breathable cotton".'
  },
  {
    left: /\bplastic.free\b/i,
    right: /\bplastic\b/i,
    message: 'Contradictory claims detected: "plastic-free" appears alongside a plastic material claim.'
  }
];
