const OCR_STOP_PATTERNS = [
  /\bingredients?\b/i,
  /\bdirections?\b/i,
  /\bwarning\b/i,
  /\bcaution\b/i,
  /\bhow to use\b/i,
  /\bmade in\b/i,
  /\bmanufactured\b/i,
  /\bbatch\b/i,
  /\bexpiry\b/i,
  /\bexp\b/i,
  /\bmrp\b/i,
  /\bnet\b/i,
  /\bweight\b/i,
  /\bvolume\b/i,
  /\bfl\.?\s?oz\b/i,
  /\bml\b/i,
  /\bg\b/i,
  /\bbarcode\b/i,
  /\bcustomer care\b/i,
  /\bhelpline\b/i
] as const;

function normalizeLine(rawLine: string) {
  return rawLine
    .replace(/[^\p{L}\p{N}&'()+/\-.\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isUsefulLine(line: string) {
  if (line.length < 2 || line.length > 56) {
    return false;
  }

  if (!/[A-Za-z]/.test(line)) {
    return false;
  }

  if (OCR_STOP_PATTERNS.some((pattern) => pattern.test(line))) {
    return false;
  }

  const words = line.split(" ").filter(Boolean);

  if (words.length > 7) {
    return false;
  }

  const digitHeavy = line.replace(/\D/g, "").length >= Math.max(6, Math.ceil(line.length * 0.45));

  return !digitHeavy;
}

function scoreLine(line: string) {
  const words = line.split(" ").filter(Boolean);
  let score = 0;

  if (words.length >= 1 && words.length <= 4) {
    score += 3;
  }

  if (words.length <= 6) {
    score += 2;
  }

  if (/^[A-Z0-9&'()+/\-.\s]+$/.test(line)) {
    score += 1;
  }

  if (/[A-Za-z]/.test(line) && /\s/.test(line)) {
    score += 2;
  }

  if (/^(organic|natural|vegan|eco|clean|safe)\b/i.test(line)) {
    score -= 2;
  }

  return score;
}

function dedupeTokens(value: string) {
  const seen = new Set<string>();
  const tokens = value.split(" ").filter(Boolean);

  return tokens
    .filter((token) => {
      const normalizedToken = token.toLowerCase();

      if (seen.has(normalizedToken)) {
        return false;
      }

      seen.add(normalizedToken);
      return true;
    })
    .join(" ");
}

function fallbackQueryFromText(text: string) {
  return dedupeTokens(
    text
      .replace(/[^\p{L}\p{N}\s&'()+/\-.]/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((token) => /[A-Za-z]/.test(token))
      .slice(0, 6)
      .join(" ")
  );
}

export function extractProductQueryFromOcrText(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => normalizeLine(line))
    .filter(Boolean);

  const candidates = lines
    .map((line, index) => ({
      line,
      index,
      score: scoreLine(line)
    }))
    .filter(({ line }) => isUsefulLine(line))
    .sort((leftLine, rightLine) => rightLine.score - leftLine.score || leftLine.index - rightLine.index)
    .slice(0, 3)
    .sort((leftLine, rightLine) => leftLine.index - rightLine.index);

  const query = dedupeTokens(candidates.map(({ line }) => line).join(" ").slice(0, 96)).trim();

  if (query) {
    return query;
  }

  return fallbackQueryFromText(text);
}

export async function extractProductQueryFromImage(file: Blob) {
  const { recognize } = await import("tesseract.js");
  const result = await recognize(file, "eng");
  const rawText = result.data.text.trim();
  const query = extractProductQueryFromOcrText(rawText);

  return {
    rawText,
    query
  };
}
