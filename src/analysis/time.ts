import { PricePoint } from "@/src/contracts";

export function sortByObservedTime<T extends { timestamp: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}

export function timeRelation(timestamp: string, start: string, end: string): "before" | "during" | "after" | "unknown" {
  const t = Date.parse(timestamp); const s = Date.parse(start); const e = Date.parse(end);
  if (![t, s, e].every(Number.isFinite)) return "unknown";
  return t < s ? "before" : t <= e ? "during" : "after";
}

export function observedRange(points: PricePoint[]): { start_at: string | null; end_at: string | null } {
  const sorted = sortByObservedTime(points);
  return { start_at: sorted[0]?.timestamp ?? null, end_at: sorted.at(-1)?.timestamp ?? null };
}
