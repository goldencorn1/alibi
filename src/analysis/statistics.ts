import { fixedToNumber } from "@/src/analysis/decimal";

export function nearestRankP99(values: bigint[]): bigint | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const index = Math.max(0, Math.ceil(sorted.length * 0.99) - 1);
  return sorted[index] ?? null;
}

export function quantileR7(values: number[], q: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 1) return sorted[0];
  const h = (sorted.length - 1) * q;
  const lower = Math.floor(h);
  const upper = Math.ceil(h);
  if (lower === upper) return sorted[lower] ?? null;
  return (sorted[lower] ?? 0) + (sorted[upper] - (sorted[lower] ?? 0)) * (h - lower);
}

export function populationStdDev(values: number[]): number | null {
  if (!values.length) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
}

export function clippedLogit(price: bigint): { value: number; clipped: boolean } {
  const numeric = fixedToNumber(price);
  const clippedPrice = Math.min(1 - 1e-6, Math.max(1e-6, numeric));
  return { value: Math.log(clippedPrice / (1 - clippedPrice)), clipped: clippedPrice !== numeric };
}

function averageRanks(values: number[]): number[] {
  const indexed = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const ranks = Array.from({ length: values.length }, () => 0);
  let index = 0;
  while (index < indexed.length) {
    let end = index + 1;
    while (end < indexed.length && indexed[end]?.value === indexed[index]?.value) end += 1;
    const rank = (index + 1 + end) / 2;
    for (let cursor = index; cursor < end; cursor += 1) ranks[indexed[cursor]?.index ?? 0] = rank;
    index = end;
  }
  return ranks;
}

export function spearmanRankCorrelation(left: number[], right: number[]): number | null {
  if (left.length !== right.length || left.length < 2) return null;
  const leftRanks = averageRanks(left);
  const rightRanks = averageRanks(right);
  const leftMean = leftRanks.reduce((sum, value) => sum + value, 0) / leftRanks.length;
  const rightMean = rightRanks.reduce((sum, value) => sum + value, 0) / rightRanks.length;
  let numerator = 0;
  let leftDenominator = 0;
  let rightDenominator = 0;
  for (let index = 0; index < leftRanks.length; index += 1) {
    const leftDelta = leftRanks[index] - leftMean;
    const rightDelta = rightRanks[index] - rightMean;
    numerator += leftDelta * rightDelta;
    leftDenominator += leftDelta ** 2;
    rightDenominator += rightDelta ** 2;
  }
  if (leftDenominator === 0 || rightDenominator === 0) return 0;
  return numerator / Math.sqrt(leftDenominator * rightDenominator);
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

