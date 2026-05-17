const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "with",
  "to",
  "จาก",
  "และ",
  "ที่",
  "ของ",
  "ใน",
  "สำหรับ"
]);

export interface KeywordExtractorOptions {
  minLength?: number;
  maxKeywords?: number;
}

export function extractKeywords(
  text: string | null | undefined,
  options: KeywordExtractorOptions = {}
): string[] {
  if (!text) return [];

  const minLength = options.minLength ?? 2;
  const maxKeywords = options.maxKeywords ?? 20;

  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= minLength)
    .filter((part) => !STOP_WORDS.has(part));

  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([token]) => token);
}

export function keywordOverlapScore(sourceKeywords: string[], targetKeywords: string[]): number {
  if (sourceKeywords.length === 0 || targetKeywords.length === 0) return 0;

  const sourceSet = new Set(sourceKeywords);
  const targetSet = new Set(targetKeywords);

  let overlap = 0;
  for (const key of sourceSet) {
    if (targetSet.has(key)) overlap += 1;
  }

  return overlap / Math.max(sourceSet.size, targetSet.size);
}
