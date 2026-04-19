import type { NextRequest } from "next/server";

const PALETTES = {
  apparel: { start: "#f4ecdc", end: "#ddebdc", accent: "#315f44", secondary: "#dfa36f", line: "#173225" },
  beauty: { start: "#f8e9f1", end: "#f6dddf", accent: "#7a4c6d", secondary: "#d28db3", line: "#4c2942" },
  household: { start: "#e6f4ee", end: "#d6ece5", accent: "#2f6a51", secondary: "#8cc4aa", line: "#1d4b3a" },
  home: { start: "#f4eee2", end: "#e1eadc", accent: "#6f5d46", secondary: "#ba9f7c", line: "#45392b" },
  footwear: { start: "#e8eef8", end: "#dce8f4", accent: "#34507f", secondary: "#86a5d7", line: "#20324f" },
  accessories: { start: "#eaf5ef", end: "#d9ecdf", accent: "#2f5f49", secondary: "#86b497", line: "#1e3b2e" },
  baby: { start: "#fff0e5", end: "#f4e7ff", accent: "#8b689f", secondary: "#e1acbb", line: "#5d476d" },
  automotive: { start: "#edf2f7", end: "#dbe7ef", accent: "#394b59", secondary: "#8ca5b7", line: "#24313b" }
} as const;

type PaletteKey = keyof typeof PALETTES;

interface ArtConfig {
  palette: PaletteKey;
  title: string;
  body: string;
}

const esc = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");

const wrapLabel = (label: string): string[] => {
  const words = label.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= 23 || current.length === 0) {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = word;

    if (lines.length === 2) {
      break;
    }
  }

  if (lines.length < 2 && current) {
    lines.push(current);
  }

  if (words.join(" ").length > lines.join(" ").length) {
    const lastLineIndex = lines.length - 1;
    lines[lastLineIndex] = `${lines[lastLineIndex].slice(0, 20).trimEnd()}...`;
  }

  return lines.slice(0, 2);
};

const artByKind: Record<string, ArtConfig> = {
  hoodie: {
    palette: "apparel",
    title: "Hoodie",
    body: `
      <path d="M355 282c17-40 62-75 120-75 57 0 102 35 119 75l58 38-38 74-48-25v236H284V369l-48 25-38-74 58-38Z" fill="var(--accent)"/>
      <path d="M404 246c14-18 42-32 71-32s57 14 71 32l-32 57H436l-32-57Z" fill="#fff" opacity=".16"/>
      <path d="M382 308h196v66H382z" fill="#fff" opacity=".08"/>
      <path d="M448 308v297M512 308v297" stroke="#fff" opacity=".18" stroke-width="8"/>
      <path d="M432 615h96" stroke="var(--line)" opacity=".5" stroke-width="14" stroke-linecap="round"/>
    `
  },
  tee: {
    palette: "apparel",
    title: "T-Shirt",
    body: `
      <path d="M358 286l72-42 50 33h40l50-33 72 42-34 94-56-25v250H388V355l-56 25-34-94Z" fill="var(--accent)"/>
      <path d="M452 277c14 18 42 18 56 0" stroke="#fff" opacity=".28" stroke-width="10" stroke-linecap="round"/>
      <path d="M430 348h100" stroke="#fff" opacity=".16" stroke-width="10" stroke-linecap="round"/>
    `
  },
  puffer: {
    palette: "apparel",
    title: "Puffer",
    body: `
      <path d="M360 284l68-36 48 28h48l48-28 68 36-28 96-52-18v243H388V362l-52 18-28-96Z" fill="var(--accent)"/>
      <path d="M402 342h156M402 392h156M402 442h156M402 492h156M402 542h156" stroke="#fff" opacity=".22" stroke-width="10" stroke-linecap="round"/>
      <path d="M480 284v321" stroke="#fff" opacity=".14" stroke-width="8"/>
    `
  },
  "runner-shoe": {
    palette: "footwear",
    title: "Running Shoe",
    body: `
      <path d="M265 478c58 0 76-62 138-62 42 0 69 28 114 28 38 0 72-14 92-28 20-14 48-18 64 9l43 71c15 25 7 51-19 61-32 12-98 23-181 23H299c-60 0-108-26-108-63 0-21 20-39 48-39h26Z" fill="var(--accent)"/>
      <path d="M243 548h426" stroke="#fff" opacity=".3" stroke-width="14" stroke-linecap="round"/>
      <path d="M430 456l34 20M470 448l32 23M510 444l28 20" stroke="#fff" opacity=".28" stroke-width="8" stroke-linecap="round"/>
    `
  },
  sneaker: {
    palette: "footwear",
    title: "Sneakers",
    body: `
      <path d="M258 498c46 0 74-49 129-49 38 0 73 18 118 18 33 0 71-13 100-29 22-12 50-6 61 18l26 57c13 29-3 54-34 60-32 6-87 12-151 12H304c-75 0-121-28-121-59 0-15 13-28 32-28h43Z" fill="var(--accent)"/>
      <path d="M250 545h425" stroke="#fff" opacity=".28" stroke-width="14" stroke-linecap="round"/>
      <path d="M418 469h126" stroke="#fff" opacity=".2" stroke-width="10" stroke-linecap="round"/>
    `
  },
  "dish-soap": {
    palette: "household",
    title: "Dish Soap",
    body: `
      <path d="M450 228h60v68h40v52h-40v245c0 36-29 65-65 65s-65-29-65-65V348h-36v-52h36v-68h70Z" fill="var(--accent)"/>
      <path d="M448 388h124" stroke="#fff" opacity=".2" stroke-width="14" stroke-linecap="round"/>
      <circle cx="604" cy="352" r="48" fill="var(--secondary)" opacity=".6"/>
      <circle cx="654" cy="302" r="28" fill="var(--secondary)" opacity=".38"/>
    `
  },
  "cleaner-bottle": {
    palette: "household",
    title: "Bottle",
    body: `
      <path d="M516 208h52v62l48 70v233c0 36-29 65-65 65H433c-36 0-65-29-65-65V340l58-70v-62h52v60h38v-60Z" fill="var(--accent)"/>
      <rect x="448" y="386" width="104" height="114" rx="20" fill="#fff" opacity=".18"/>
      <path d="M522 208h82v24c0 13-11 24-24 24h-58z" fill="var(--secondary)"/>
    `
  },
  "pump-bottle": {
    palette: "household",
    title: "Pump Bottle",
    body: `
      <path d="M500 220h48v50h76v32h-76v42h-48v-42h-34v-32h34z" fill="var(--secondary)"/>
      <path d="M426 332c0-24 20-44 44-44h108c24 0 44 20 44 44v247c0 32-26 58-58 58H484c-32 0-58-26-58-58V332Z" fill="var(--accent)"/>
      <rect x="456" y="392" width="136" height="104" rx="24" fill="#fff" opacity=".16"/>
    `
  },
  "refill-pouch": {
    palette: "household",
    title: "Refill Pouch",
    body: `
      <path d="M436 244h128l34 70-26 39 34 57-44 240H438l-44-240 34-57-26-39 34-70Z" fill="var(--accent)"/>
      <path d="M446 312h108" stroke="#fff" opacity=".22" stroke-width="12" stroke-linecap="round"/>
      <rect x="450" y="396" width="100" height="92" rx="20" fill="#fff" opacity=".16"/>
    `
  },
  serum: {
    palette: "beauty",
    title: "Serum",
    body: `
      <rect x="452" y="258" width="96" height="44" rx="18" fill="var(--secondary)"/>
      <path d="M470 202h60v64h-60z" fill="#2d2431"/>
      <path d="M492 170h16l16 34h-48z" fill="#2d2431"/>
      <path d="M420 302h160v278c0 34-28 62-62 62h-36c-34 0-62-28-62-62V302Z" fill="var(--accent)"/>
      <circle cx="500" cy="450" r="42" fill="#fff" opacity=".18"/>
    `
  },
  conditioner: {
    palette: "beauty",
    title: "Conditioner",
    body: `
      <path d="M470 214h60v46h26c18 0 32 14 32 32v282c0 38-31 68-68 68h-40c-38 0-68-30-68-68V292c0-18 14-32 32-32h26z" fill="var(--accent)"/>
      <rect x="446" y="356" width="108" height="142" rx="26" fill="#fff" opacity=".16"/>
      <rect x="476" y="186" width="48" height="30" rx="10" fill="var(--secondary)"/>
    `
  },
  "cream-jar": {
    palette: "beauty",
    title: "Cream",
    body: `
      <rect x="400" y="300" width="200" height="58" rx="20" fill="var(--secondary)"/>
      <path d="M362 364c0-24 20-44 44-44h188c24 0 44 20 44 44v144c0 73-59 132-132 132h-12c-73 0-132-59-132-132V364Z" fill="var(--accent)"/>
      <rect x="414" y="402" width="172" height="92" rx="24" fill="#fff" opacity=".16"/>
    `
  },
  "lip-balm": {
    palette: "beauty",
    title: "Lip Balm",
    body: `
      <rect x="424" y="280" width="152" height="74" rx="28" fill="var(--secondary)"/>
      <path d="M452 354h96v202c0 34-28 62-62 62h-34c-15 0-28-12-28-28V382c0-15 13-28 28-28Z" fill="var(--accent)"/>
      <path d="M444 418h112" stroke="#fff" opacity=".22" stroke-width="10" stroke-linecap="round"/>
    `
  },
  "soap-bar": {
    palette: "beauty",
    title: "Soap Bar",
    body: `
      <rect x="338" y="338" width="324" height="206" rx="72" fill="var(--accent)"/>
      <circle cx="446" cy="306" r="44" fill="#fff" opacity=".18"/>
      <circle cx="498" cy="270" r="24" fill="#fff" opacity=".18"/>
      <circle cx="548" cy="304" r="18" fill="#fff" opacity=".14"/>
    `
  },
  "shampoo-bar": {
    palette: "beauty",
    title: "Shampoo Bar",
    body: `
      <rect x="340" y="340" width="320" height="196" rx="64" fill="var(--accent)"/>
      <path d="M424 396h152M424 446h112" stroke="#fff" opacity=".24" stroke-width="12" stroke-linecap="round"/>
      <circle cx="462" cy="304" r="36" fill="#fff" opacity=".16"/>
    `
  },
  mattress: {
    palette: "home",
    title: "Mattress Protector",
    body: `
      <rect x="266" y="392" width="468" height="162" rx="38" fill="var(--accent)"/>
      <rect x="248" y="346" width="468" height="162" rx="38" fill="var(--secondary)" opacity=".9"/>
      <rect x="298" y="298" width="150" height="58" rx="24" fill="#fff" opacity=".38"/>
      <path d="M308 433h372" stroke="#fff" opacity=".18" stroke-width="12" stroke-linecap="round"/>
    `
  },
  sheets: {
    palette: "home",
    title: "Sheet Set",
    body: `
      <rect x="276" y="360" width="448" height="190" rx="42" fill="var(--accent)"/>
      <path d="M276 414h448" stroke="#fff" opacity=".2" stroke-width="12"/>
      <rect x="316" y="304" width="118" height="68" rx="22" fill="#fff" opacity=".34"/>
      <rect x="458" y="304" width="118" height="68" rx="22" fill="#fff" opacity=".26"/>
    `
  },
  cabinet: {
    palette: "home",
    title: "Kitchen Front",
    body: `
      <rect x="322" y="252" width="356" height="394" rx="26" fill="var(--accent)"/>
      <rect x="352" y="284" width="296" height="332" rx="20" fill="#fff" opacity=".16"/>
      <rect x="610" y="410" width="18" height="72" rx="9" fill="#fff" opacity=".48"/>
      <path d="M352 356h296M352 470h296" stroke="#fff" opacity=".12" stroke-width="6"/>
    `
  },
  "toilet-paper": {
    palette: "household",
    title: "Toilet Paper",
    body: `
      <ellipse cx="408" cy="466" rx="110" ry="138" fill="var(--secondary)"/>
      <ellipse cx="408" cy="466" rx="52" ry="64" fill="#fff" opacity=".7"/>
      <path d="M438 344h142c48 0 88 40 88 88v68c0 48-40 88-88 88H448" fill="var(--accent)"/>
      <ellipse cx="580" cy="466" rx="88" ry="112" fill="var(--accent)"/>
      <ellipse cx="580" cy="466" rx="38" ry="48" fill="#fff" opacity=".34"/>
    `
  },
  capsules: {
    palette: "home",
    title: "Capsules",
    body: `
      <path d="M360 510c0-80 65-145 145-145s145 65 145 145H360Z" fill="var(--accent)"/>
      <path d="M388 510c0-65 52-117 117-117s117 52 117 117H388Z" fill="#fff" opacity=".16"/>
      <path d="M322 428c0-54 44-98 98-98s98 44 98 98H322Z" fill="var(--secondary)"/>
      <path d="M492 428c0-54 44-98 98-98s98 44 98 98H492Z" fill="var(--secondary)" opacity=".85"/>
    `
  },
  "water-bottle": {
    palette: "accessories",
    title: "Water Bottle",
    body: `
      <path d="M462 206h76v74l34 38v262c0 38-30 68-68 68h-8c-38 0-68-30-68-68V318l34-38z" fill="var(--accent)"/>
      <rect x="448" y="356" width="104" height="148" rx="24" fill="#fff" opacity=".16"/>
      <rect x="476" y="170" width="48" height="36" rx="12" fill="var(--secondary)"/>
    `
  },
  "laundry-pods": {
    palette: "household",
    title: "Laundry Pods",
    body: `
      <circle cx="432" cy="444" r="82" fill="var(--secondary)"/>
      <circle cx="566" cy="444" r="82" fill="var(--secondary)"/>
      <circle cx="500" cy="540" r="82" fill="var(--secondary)"/>
      <path d="M430 444c0-38 30-68 68-68 19 0 37 8 50 22-26 26-68 26-94 0-16 13-24 29-24 46Z" fill="var(--accent)"/>
      <path d="M500 532c0-36 28-64 64-64 14 0 28 4 39 13-20 22-55 25-78 8-14 6-25 22-25 43Z" fill="var(--accent)"/>
    `
  },
  "cup-set": {
    palette: "home",
    title: "Cup Set",
    body: `
      <path d="M310 344h122v214c0 27-22 49-49 49h-24c-27 0-49-22-49-49V344Z" fill="var(--secondary)"/>
      <path d="M452 304h128v254c0 27-22 49-49 49h-30c-27 0-49-22-49-49V304Z" fill="var(--accent)"/>
      <path d="M608 368h92v190c0 27-22 49-49 49h-18c-27 0-49-22-49-49V368Z" fill="var(--secondary)"/>
    `
  },
  "spray-bottle": {
    palette: "home",
    title: "Room Spray",
    body: `
      <path d="M484 224h48v44h76v34h-76v38h-48v-38h-32v-34h32z" fill="var(--secondary)"/>
      <path d="M430 344c0-26 21-46 46-46h64c25 0 46 20 46 46v236c0 36-29 66-66 66h-24c-37 0-66-30-66-66V344Z" fill="var(--accent)"/>
      <rect x="454" y="394" width="108" height="96" rx="24" fill="#fff" opacity=".16"/>
    `
  },
  "straw-pack": {
    palette: "home",
    title: "Straw Pack",
    body: `
      <rect x="366" y="274" width="268" height="352" rx="28" fill="var(--accent)"/>
      <path d="M418 318v248M470 318v248M522 318v248M574 318v248" stroke="#fff" opacity=".22" stroke-width="12" stroke-linecap="round"/>
      <rect x="402" y="250" width="196" height="44" rx="18" fill="var(--secondary)"/>
    `
  },
  "trash-bags": {
    palette: "household",
    title: "Trash Bags",
    body: `
      <path d="M404 252h44l20 40h64l20-40h44l48 92-42 276H358l-42-276 88-92Z" fill="var(--accent)"/>
      <path d="M418 330h164" stroke="#fff" opacity=".18" stroke-width="12" stroke-linecap="round"/>
      <path d="M456 292h88" stroke="var(--line)" opacity=".28" stroke-width="10" stroke-linecap="round"/>
    `
  },
  diapers: {
    palette: "baby",
    title: "Diapers",
    body: `
      <path d="M314 400c0-74 60-134 134-134h104c74 0 134 60 134 134v116c0 30-24 54-54 54h-88l-32-64-32 64h-112c-30 0-54-24-54-54V400Z" fill="var(--accent)"/>
      <path d="M410 360l60 118M590 360l-60 118" stroke="#fff" opacity=".2" stroke-width="12" stroke-linecap="round"/>
      <path d="M392 570c24-16 55-24 88-24s64 8 88 24" stroke="#fff" opacity=".24" stroke-width="12" stroke-linecap="round"/>
    `
  },
  car: {
    palette: "automotive",
    title: "Vehicle",
    body: `
      <path d="M278 480c0-32 26-58 58-58h24l74-108c22-32 59-52 99-52h68c28 0 55 11 75 31l68 68h28c39 0 70 31 70 70v74H278z" fill="var(--accent)"/>
      <circle cx="388" cy="562" r="54" fill="var(--line)"/>
      <circle cx="622" cy="562" r="54" fill="var(--line)"/>
      <circle cx="388" cy="562" r="24" fill="#fff" opacity=".58"/>
      <circle cx="622" cy="562" r="24" fill="#fff" opacity=".58"/>
      <path d="M434 324h142c16 0 31 6 42 17l52 52H388z" fill="#fff" opacity=".18"/>
    `
  }
};

const renderSvg = (kind: string, label: string): string => {
  const config = artByKind[kind] ?? artByKind["cleaner-bottle"];
  const palette = PALETTES[config.palette];
  const labelLines = wrapLabel(label);
  const lineMarkup = labelLines
    .map(
      (line, index) =>
        `<text x="100" y="${690 + index * 46}" font-size="40" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#13261d">${esc(line)}</text>`
    )
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" role="img" aria-label="${esc(label)}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.start}" />
          <stop offset="100%" stop-color="${palette.end}" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#0d1f17" flood-opacity=".16" />
        </filter>
      </defs>
      <style>
        :root {
          --accent: ${palette.accent};
          --secondary: ${palette.secondary};
          --line: ${palette.line};
        }
      </style>
      <rect width="900" height="900" rx="72" fill="url(#bg)" />
      <circle cx="736" cy="174" r="124" fill="#ffffff" opacity=".22" />
      <circle cx="168" cy="152" r="96" fill="#ffffff" opacity=".16" />
      <rect x="74" y="74" width="236" height="58" rx="29" fill="#ffffff" opacity=".7" />
      <text x="112" y="112" font-size="26" font-family="Arial, Helvetica, sans-serif" letter-spacing="5" fill="var(--line)" opacity=".72">${esc(config.title.toUpperCase())}</text>
      <g filter="url(#shadow)">
        <rect x="118" y="156" width="664" height="468" rx="58" fill="#ffffff" opacity=".28" />
        <g transform="translate(0 0)">
          ${config.body}
        </g>
      </g>
      <rect x="74" y="642" width="752" height="170" rx="38" fill="#ffffff" opacity=".72" />
      ${lineMarkup}
    </svg>
  `;
};

export function GET(request: NextRequest): Response {
  const kind = request.nextUrl.searchParams.get("kind") ?? "cleaner-bottle";
  const label = request.nextUrl.searchParams.get("label") ?? "GreenProof Product";
  const svg = renderSvg(kind, label);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
