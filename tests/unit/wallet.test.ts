import { describe, expect, it } from "vitest";
import { RepricingWindow, Trade } from "@/src/contracts";
import { calculateWalletMetrics } from "@/src/engine/wallet";

const window: RepricingWindow = {
  id: "rw-1",
  market_id: "condition-1",
  token_id: "token-1",
  start_at: "2026-01-01T00:30:00.000Z",
  end_at: "2026-01-01T01:00:00.000Z",
  start_price: 0.2,
  end_price: 0.4,
  absolute_change: 0.2,
  direction: "UP",
  threshold: 0.08,
  observation_window_minutes: 60,
  sample_fidelity_minutes: 1,
  merged_window_ids: [],
  attribution_status: "information_consistent",
  evidence_ids: ["e1"],
  confidence: 0.8,
  data_status: "synthetic",
  limitation: "synthetic test",
};

const trade = (timestamp: string, price = 0.2, size = 10): Trade => ({
  wallet: "wallet-a",
  market_id: "condition-1",
  token_id: "token-1",
  timestamp,
  side: "BUY",
  outcome: "YES",
  price,
  size,
  transaction_hash: null,
  maker_taker: "UNKNOWN",
  source_type: "DIRECT",
  data_status: "synthetic",
});

describe("calculateWalletMetrics", () => {
  it("gates lead rate below 40% coverage", () => {
    const result = calculateWalletMetrics([trade("2026-01-01T00:00:00.000Z")], [window], new Date("2026-01-02T00:00:00.000Z"));
    expect(result.coverage_rate).toBe(1);
    expect(result.information_lead_rate).toBe(1);
  });

  it("does not calculate a capability conclusion for missing alignment", () => {
    const result = calculateWalletMetrics([trade("2026-01-01T00:00:00.000Z"), { ...trade("2026-01-01T02:00:00.000Z"), market_id: "other" }, { ...trade("2026-01-01T03:00:00.000Z"), market_id: "other-2" }, { ...trade("2026-01-01T04:00:00.000Z"), market_id: "other-3" }], [window], new Date("2026-01-02T00:00:00.000Z"));
    expect(result.coverage_rate).toBe(0.25);
    expect(result.information_lead_rate).toBeNull();
    expect(result.status).toBe("insufficient_evidence");
  });
});
