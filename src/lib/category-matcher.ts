export function normalizeCategory(category: string | null | undefined): string {
  return (category ?? "").trim().toLowerCase();
}

export function categoryMatchScore(sourceCategory: string | null | undefined, targetCategory: string | null | undefined): number {
  const source = normalizeCategory(sourceCategory);
  const target = normalizeCategory(targetCategory);

  if (!source || !target) return 0;
  if (source === target) return 1;
  if (source.includes(target) || target.includes(source)) return 0.7;

  return 0;
}
