import { describe, expect, it } from "vitest";
import { Evidence, PricePoint, REASON_CODES, isReasonCode } from "@/src/contracts";
import {
  REPRICING_DELTA_LOGODDS_THRESHOLD,
  detectRepricingWindows,
  repricingDeltaLogOdds,
} from "@/src/engine/repricing";
import { PUBLICATION_SKEW_TOLERANCE_MS, attributeWindows } from "@/src/engine/attribution";

const point = (minutes: number, price: number): PricePoint => ({
  market_id: "condition-1",
  token_id: "token-1",
  timestamp: new Date(Date.UTC(2026, 0, 1, 0, minutes)).toISOString(),
  price,
  source: "synthetic",
  fidelity_minutes: 1,
  data_status: "synthetic",
});

describe("C15 clipped-logit repricing scale", () => {
  it("anchors the log-odds threshold to the approved 0.08 linear gate at p=0.50", () => {
    // Recalibration basis: 0.08 x 1/(0.5*0.5) = 0.32. The anchor must hold, and
    // the raw 0.08 must NOT be reused on a log-odds scale.
    const atMidMarket = repricingDeltaLogOdds(0.46, 0.54);
    expect(atMidMarket).not.toBeNull();
    expect(Math.abs(atMidMarket as number)).toBeCloseTo(REPRICING_DELTA_LOGODDS_THRESHOLD, 2);
    expect(REPRICING_DELTA_LOGODDS_THRESHOLD).not.toBe(0.08);
  });

  it("stops compressing tail moves, which the linear scale under-weighted ~5x", () => {
    // Same 0.02 linear step, very different information content.
    const tail = Math.abs(repricingDeltaLogOdds(0.03, 0.05) as number);
    const middle = Math.abs(repricingDeltaLogOdds(0.49, 0.51) as number);
    expect(tail).toBeGreaterThan(middle * 4);
  });

  it("reuses the D5 clipped logit so 0 and 1 do not produce infinities", () => {
    for (const [a, b] of [[0, 1], [1, 0], [0, 0.5], [0.5, 1]] as const) {
      const delta = repricingDeltaLogOdds(a, b);
      expect(delta).not.toBeNull();
      expect(Number.isFinite(delta as number)).toBe(true);
    }
  });

  it("gates detection on log-odds magnitude and publishes the field", () => {
    const windows = detectRepricingWindows([point(0, 0.2), point(30, 0.4)]);
    expect(windows).toHaveLength(1);
    const delta = windows[0].repricing_delta_logodds;
    expect(delta).not.toBeNull();
    expect(Math.abs(delta as number)).toBeGreaterThanOrEqual(REPRICING_DELTA_LOGODDS_THRESHOLD);
    // Linear value is retained for display but is no longer the gate.
    expect(windows[0].absolute_change).toBeCloseTo(0.2);
  });

  it("rejects moves below the recalibrated gate without falling back to 0", () => {
    // 0.50 -> 0.51 is ~0.04 log-odds, far under 0.32.
    expect(detectRepricingWindows([point(0, 0.5), point(30, 0.51)])).toHaveLength(0);
  });
});

describe("C22 publication skew tolerance", () => {
  const evidence = (publishedAt: string): Evidence => ({
    id: "ev-1",
    url: "https://example.invalid/source",
    title: "Synthetic source",
    published_at: publishedAt,
    retrieved_at: "2026-01-02T00:00:00.000Z",
    source_level: "synthetic-test-only",
    license_or_restriction: "Synthetic only",
    data_status: "synthetic",
    time_relation: "unknown",
  });

  const windows = () => detectRepricingWindows([point(0, 0.2), point(30, 0.4)]);

  it("tightens the tolerance well below the previous 24h allowance", () => {
    expect(PUBLICATION_SKEW_TOLERANCE_MS).toBeLessThan(24 * 60 * 60 * 1000);
    expect(PUBLICATION_SKEW_TOLERANCE_MS).toBe(5 * 60 * 1000);
  });

  it("flags timestamps beyond the tolerance as timestamp_uncertain, not valid", async () => {
    const detected = windows();
    expect(detected).toHaveLength(1);
    const windowEnd = Date.parse(detected[0].end_at);
    // Published a full hour after the window ends: previously accepted under
    // the 24h allowance, now must be refused as uncertain.
    const late = new Date(windowEnd + 60 * 60 * 1000).toISOString();
    const run = await attributeWindows(detected, [evidence(late)]);
    expect(run.windows[0].attribution_status).toBe("unattributed");
    expect(run.reason_codes[detected[0].id]).toBe("timestamp_uncertain");
    expect(run.windows[0].confidence).toBeNull();
  });

  it("does not treat a future timestamp as a valid publication time", async () => {
    const detected = windows();
    const farFuture = "2099-01-01T00:00:00.000Z";
    const run = await attributeWindows(detected, [evidence(farFuture)]);
    expect(run.windows[0].attribution_status).toBe("unattributed");
    expect(run.reason_codes[detected[0].id]).toBe("timestamp_uncertain");
  });
});

describe("reason code vocabulary", () => {
  it("permits exactly the eight approved codes", () => {
    expect([...REASON_CODES]).toEqual([
      "incomplete_window",
      "pagination_cap",
      "exit_events_unavailable",
      "profile_endpoint_unverified",
      "provider_unavailable",
      "coverage_below_gate",
      "sentinel_unknown",
      "timestamp_uncertain",
    ]);
    expect(REASON_CODES).toHaveLength(8);
  });

  it("rejects codes outside the approved set", () => {
    expect(isReasonCode("timestamp_uncertain")).toBe(true);
    expect(isReasonCode("median_account_age_days")).toBe(false);
    expect(isReasonCode("zero")).toBe(false);
    expect(isReasonCode(0)).toBe(false);
  });
});
