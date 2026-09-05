import { describe, expect, it } from "vitest";
import { PricePoint } from "@/src/contracts";
import { detectRepricingWindows } from "@/src/engine/repricing";

const point = (minutes: number, price: number): PricePoint => ({
  market_id: "condition-1",
  token_id: "token-1",
  timestamp: new Date(Date.UTC(2026, 0, 1, 0, minutes)).toISOString(),
  price,
  source: "synthetic",
  fidelity_minutes: 1,
  data_status: "synthetic",
});

describe("detectRepricingWindows", () => {
  it("uses the inclusive 0.08 threshold and 60-minute boundary", () => {
    expect(detectRepricingWindows([point(0, 0.2), point(60, 0.28)])).toHaveLength(1);
    expect(detectRepricingWindows([point(0, 0.2), point(60, 0.279)])).toHaveLength(0);
    expect(detectRepricingWindows([point(0, 0.2), point(61, 0.3)])).toHaveLength(0);
  });

  it("sorts input and deduplicates overlapping windows", () => {
    const windows = detectRepricingWindows([point(40, 0.4), point(0, 0.2), point(20, 0.3), point(60, 0.5)]);
    expect(windows).toHaveLength(1);
    expect(windows[0].absolute_change).toBeCloseTo(0.3);
    expect(windows[0].merged_window_ids.length).toBeGreaterThan(0);
  });
});
