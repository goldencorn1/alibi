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
  /**
   * C15: the gate is |delta clipped-logit| >= 0.32, not the abolished linear
   * 0.08 threshold on |p_j - p_i|.
   *
   * The linear gate compressed tail moves by ~5.26x: the logit derivative
   * 1/(p(1-p)) is 4.0 at p=0.50 but 21.05 at p=0.05, so a fixed 0.08 step was
   * far more informative near the tails than at mid-market. The 0.08 value is
   * therefore abolished and is not carried over to the log-odds scale.
   *
   * 0.2 -> 0.279 is delta log-odds 0.4369 >= 0.32 and is now correctly a
   * window. The previous version of this test asserted 0 windows for that move,
   * which encoded the abolished linear semantics; its failure was evidence that
   * C15 took effect, not a regression.
   */
  it("uses the inclusive 0.32 log-odds threshold and 60-minute boundary", () => {
    expect(detectRepricingWindows([point(0, 0.2), point(60, 0.28)])).toHaveLength(1);
    expect(detectRepricingWindows([point(0, 0.2), point(60, 0.279)])).toHaveLength(1);
    // Gate boundary on the log-odds scale, verified numerically:
    // 0.2 -> 0.256 is 0.3194 (below), 0.2 -> 0.257 is 0.3247 (clears).
    expect(detectRepricingWindows([point(0, 0.2), point(60, 0.256)])).toHaveLength(0);
    expect(detectRepricingWindows([point(0, 0.2), point(60, 0.257)])).toHaveLength(1);
    // The 60-minute observation boundary is unchanged by C15.
    expect(detectRepricingWindows([point(0, 0.2), point(61, 0.3)])).toHaveLength(0);
  });

  it("sorts input and deduplicates overlapping windows", () => {
    const windows = detectRepricingWindows([point(40, 0.4), point(0, 0.2), point(20, 0.3), point(60, 0.5)]);
    expect(windows).toHaveLength(1);
    expect(windows[0].absolute_change).toBeCloseTo(0.3);
    expect(windows[0].merged_window_ids.length).toBeGreaterThan(0);
  });
});
