export interface PriceSimilarityResult {
  normalizedScore: number;
  deltaPercent: number;
}

export function calculatePriceSimilarity(sourcePrice: number, targetPrice: number): PriceSimilarityResult {
  if (sourcePrice <= 0 || targetPrice <= 0) {
    return { normalizedScore: 0, deltaPercent: 100 };
  }

  const delta = Math.abs(sourcePrice - targetPrice);
  const baseline = Math.max(sourcePrice, targetPrice);
  const deltaPercent = (delta / baseline) * 100;
  const normalizedScore = Math.max(0, 1 - deltaPercent / 100);

  return {
    normalizedScore,
    deltaPercent: Number(deltaPercent.toFixed(2))
  };
}
