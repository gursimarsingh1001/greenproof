import type { VerificationRating } from "./types";

export const ratingTheme: Record<
  VerificationRating,
  {
    label: string;
    ring: string;
    bg: string;
    text: string;
    glow: string;
  }
> = {
  TRUSTED: {
    label: "Trusted",
    ring: "#22c55e",
    bg: "from-[#ddfbe8] to-[#f7fff9]",
    text: "text-[#1d7f42]",
    glow: "rgba(34, 197, 94, 0.3)"
  },
  MODERATE: {
    label: "Moderate",
    ring: "#eab308",
    bg: "from-[#fff4c7] to-[#fffdf2]",
    text: "text-[#9a6b00]",
    glow: "rgba(234, 179, 8, 0.28)"
  },
  SUSPICIOUS: {
    label: "Suspicious",
    ring: "#f97316",
    bg: "from-[#ffe0ca] to-[#fff7f1]",
    text: "text-[#ba4b08]",
    glow: "rgba(249, 115, 22, 0.25)"
  },
  UNVERIFIED: {
    label: "Unverified",
    ring: "#ef4444",
    bg: "from-[#ffd8d8] to-[#fff5f5]",
    text: "text-[#b42323]",
    glow: "rgba(239, 68, 68, 0.28)"
  }
};

/**
 * Converts confidence into a compact display label.
 */
export function formatConfidence(confidence: string, percentage: number) {
  const sourceCount = Math.max(1, Math.round(percentage / 20));
  return `${confidence} (${sourceCount}/5 sources)`;
}

/**
 * Formats an integer cents value into a compact USD currency string.
 */
export function formatPrice(priceCents?: number | null) {
  if (priceCents === undefined || priceCents === null) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(priceCents / 100);
}
