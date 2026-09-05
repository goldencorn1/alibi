import { describe, expect, it } from "vitest";
import { evaluateCluster, ClusterEvaluationInput, ClusterTradeInput } from "@/src/analysis/cluster-language";

const evaluation = "2026-09-04T12:00:00.000Z";
const windowStart = Date.parse(evaluation) - 180 * 60 * 1000;
const coverage = {
  required_connectors: ["gia-en", "gia-zh"],
  healthy_connectors: ["gia-en", "gia-zh"],
  unavailable_connectors: [],
  coverage_ratio: 0.95,
  coverage_complete: true,
  timestamp_precision: "second" as const,
  source_state: "not_found" as const,
  unknown_reasons: [],
};

function trade(index: number, timestamp: string, overrides: Partial<ClusterTradeInput> = {}): ClusterTradeInput {
  return {
    condition_id: "condition-1",
    proxy_wallet: "0x" + String(index + 1).padStart(40, "0"),
    asset: "asset-1",
    side: "BUY",
    outcome: "YES",
    size: "500",
    price: String(0.5 + index / 100),
    timestamp,
    transaction_hash: "tx-" + index,
    taker_only: true,
    profile_created_at: new Date(Date.parse(timestamp) - 10 * 86_400_000).toISOString(),
    profile_complete: true,
    prior_trade_count: 0,
    prior_market_trade_count: 0,
    history_complete: true,
    ...overrides,
  };
}

function baseline(): ClusterTradeInput[] {
  return Array.from({ length: 200 }, (_, index) => trade(1000 + index, new Date(windowStart - 86_400_000 + index * 1000).toISOString(), { size: "1000", price: "0.2" }));
}

function input(overrides: Partial<ClusterEvaluationInput> = {}): ClusterEvaluationInput {
  return {
    condition_id: "condition-1",
    evaluation_time: evaluation,
    trades: Array.from({ length: 5 }, (_, index) => trade(index, new Date(windowStart + (index + 1) * 60_000).toISOString())),
    baseline_trades: baseline(),
    source_state: "not_found",
    source_coverage: coverage,
    data_status: "recorded",
    ...overrides,
  };
}

describe("cluster_without_verified_source", () => {
  it("passes the deterministic formal gate with five addresses", () => {
    const alert = evaluateCluster(input());
    expect(alert.state).toBe("formal_alert");
    expect(alert.cluster_size).toBe(5);
    expect(alert.baseline_sample_count).toBe(200);
    expect(alert.baseline_p99_usdc).toBe("200");
    expect(alert.dimensions_evaluable).toBe(6);
    expect(alert.dimensions_passed).toBe(6);
    expect(alert.herding_like_pattern).toBe(false);
  });

  it("deduplicates baseline rows before applying the minimum-sample gate", () => {
    const rows = baseline();
    const alert = evaluateCluster(input({ baseline_trades: [...rows, rows[0]] }));
    expect(alert.baseline_sample_count).toBe(200);
    expect(alert.baseline_p99_usdc).toBe("200");
  });

  it("uses a left-open/right-closed window and excludes SELL", () => {
    const alert = evaluateCluster(input({
      trades: [
        trade(0, new Date(windowStart).toISOString()),
        trade(1, evaluation),
        trade(2, new Date(windowStart + 60_000).toISOString()),
        trade(3, new Date(windowStart + 120_000).toISOString()),
        trade(4, new Date(windowStart + 180_000).toISOString(), { side: "SELL" }),
      ],
    }));
    expect(alert.cluster_size).toBe(3);
    expect(alert.state).toBe("cluster_observation");
  });

  it("blocks formal alerts when the source state is unknown", () => {
    const alert = evaluateCluster(input({ source_state: "unknown" }));
    expect(alert.state).toBe("cluster_observation");
    expect(alert.source_state).toBe("unknown");
  });

  it("blocks a contradictory not_found result when coverage is incomplete", () => {
    const alert = evaluateCluster(input({ source_coverage: { ...coverage, coverage_complete: false, source_state: "not_found" } }));
    expect(alert.state).toBe("cluster_observation");
    expect(alert.state).not.toBe("formal_alert");
  });

  it("returns insufficient_baseline instead of filling missing history", () => {
    const alert = evaluateCluster(input({ baseline_trades: [] }));
    expect(alert.state).toBe("insufficient_baseline");
    expect(alert.cluster_size).toBe(0);
    expect(alert.baseline_p99_usdc).toBeNull();
  });
});
