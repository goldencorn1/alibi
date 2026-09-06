import { describe, expect, it } from "vitest";
import {
  AnalysisBundle,
  DataStatus,
  METRIC_STATUSES,
  MetricEnvelope,
  MetricStatus,
  RepricingWindow,
  Trade,
  isDataStatus,
  isMetricStatus,
  isReasonCode,
  requiresNullValue,
} from "@/src/contracts";
import { buildSummary } from "@/src/report/build";
import {
  CALCULATION_VERSION,
  OBSERVED_TRADES_HISTORY_DAYS,
  UNITS,
  buildEnvelope,
  deriveAsOf,
  evaluateWindowCompleteness,
  flipRateEnvelope,
  medianExposureMinutesEnvelope,
  ninetyDayEnvelope,
} from "@/src/analysis/metric-envelope";
import { calculateWalletMetrics } from "@/src/engine/wallet";
import { MCP_TOOL_NAMES, resolveToolDataStatus, toolCatalog } from "@/mcp/tools/catalog";

/**
 * P2 / D8. Two guarantees are under test:
 *   1. `data_status` and `metric_status` are independent axes. Neither may be
 *      derived from the other.
 *   2. An uncomputable metric reports null with a reason code and NEVER 0.
 */

const REQUIRED_ENVELOPE_FIELDS = [
  "value",
  "unit",
  "requested_window",
  "observed_window",
  "as_of",
  "sample_size",
  "eligible_sample_size",
  "coverage",
  "data_status",
  "metric_status",
  "reason_code",
  "source_provenance",
  "calculation_version",
  "limitations",
  "retrieved_at",
  "source_url",
  "http_status",
  "response_hash",
] as const;

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

/** Every envelope, whatever its status, must satisfy the shared invariants. */
function assertEnvelopeShape(envelope: MetricEnvelope<unknown>, label: string) {
  for (const field of REQUIRED_ENVELOPE_FIELDS) {
    expect(Object.prototype.hasOwnProperty.call(envelope, field), `${label}.${field}`).toBe(true);
  }
  expect(Object.keys(envelope).length, `${label} field count`).toBeGreaterThanOrEqual(17);
  expect(isMetricStatus(envelope.metric_status), label).toBe(true);
  expect(isDataStatus(envelope.data_status), label).toBe(true);
  expect(typeof envelope.unit, label).toBe("string");
  expect(envelope.unit.length, label).toBeGreaterThan(0);
  expect(envelope.calculation_version, label).toBe(CALCULATION_VERSION);
  expect(Array.isArray(envelope.limitations), label).toBe(true);
  expect(Array.isArray(envelope.source_provenance), label).toBe(true);
  // "No 429 seen" is not "no rate limit exists".
  expect(envelope.rate_limit_state, label).toBe("UNKNOWN");
  if (requiresNullValue(envelope.metric_status)) {
    expect(envelope.value, `${label} value`).toBeNull();
    expect(envelope.value, `${label} value`).not.toBe(0);
    expect(isReasonCode(envelope.reason_code), `${label} reason_code`).toBe(true);
  }
}

describe("D8 metric_status is a computability axis only", () => {
  it("carries the four D8 values, with not_enabled kept as a distinct case", () => {
    expect(METRIC_STATUSES).toContain("complete");
    expect(METRIC_STATUSES).toContain("partial");
    expect(METRIC_STATUSES).toContain("unavailable");
    expect(METRIC_STATUSES).toContain("insufficient_evidence");
    // The retired value must be gone: it read as a data-origin claim.
    expect(METRIC_STATUSES as readonly string[]).not.toContain("available");
    // `not_enabled` is "switched off", not "we tried and could not compute it".
    expect(METRIC_STATUSES).toContain("not_enabled");
  });

  it("rejects data_status values as metric statuses and vice versa", () => {
    // The load-bearing separation: the vocabularies must not overlap at all.
    for (const dataStatus of ["live", "recorded", "cached", "synthetic"]) {
      expect(isMetricStatus(dataStatus), dataStatus).toBe(false);
    }
    for (const metricStatus of METRIC_STATUSES) {
      expect(isDataStatus(metricStatus), metricStatus).toBe(false);
    }
  });

  it("allows every combination of the two axes independently", () => {
    const dataStatuses: DataStatus[] = ["live", "recorded", "cached", "synthetic"];
    for (const dataStatus of dataStatuses) {
      // `recorded` is not "uncomputable": it can be complete.
      const complete = buildEnvelope<number>({
        unit: UNITS.ratio,
        value: 0.5,
        metric_status: "complete",
        data_status: dataStatus,
      });
      expect(complete.metric_status).toBe("complete");
      expect(complete.data_status).toBe(dataStatus);
      assertEnvelopeShape(complete, `complete/${dataStatus}`);

      // `unavailable` is not "the source was fake": live data can be unavailable.
      const unavailable = buildEnvelope<number>({
        unit: UNITS.ratio,
        metric_status: "unavailable",
        reason_code: "incomplete_window",
        data_status: dataStatus,
      });
      expect(unavailable.data_status).toBe(dataStatus);
      assertEnvelopeShape(unavailable, `unavailable/${dataStatus}`);
    }
  });

  it("refuses to build an uncomputable envelope that carries a value", () => {
    for (const status of ["unavailable", "insufficient_evidence", "not_enabled"] as MetricStatus[]) {
      // 0 is the specific wrong answer this guard exists to stop.
      expect(() =>
        buildEnvelope<number>({
          unit: UNITS.ratio,
          value: 0,
          metric_status: status,
          reason_code: "incomplete_window",
          data_status: "live",
        }),
      ).toThrow(/requires value=null/);
    }
  });

  it("refuses an uncomputable envelope with no reason_code", () => {
    expect(() =>
      buildEnvelope<number>({ unit: UNITS.ratio, metric_status: "unavailable", data_status: "live" }),
    ).toThrow(/requires a reason_code/);
  });
});

describe("D8 90-day metrics are unavailable by measurement", () => {
  it("reports incomplete_window with a null value, never 0 and never extrapolated", () => {
    const envelope = ninetyDayEnvelope<number>({ unit: UNITS.count, data_status: "live" });
    expect(envelope.metric_status).toBe("unavailable");
    expect(envelope.reason_code).toBe("incomplete_window");
    expect(envelope.value).toBeNull();
    expect(envelope.value).not.toBe(0);
    expect(envelope.coverage).toBeNull();
    // Live data with an unavailable metric: the axes really are independent.
    expect(envelope.data_status).toBe("live");
    expect(envelope.limitations.join(" ")).toContain(String(OBSERVED_TRADES_HISTORY_DAYS));
    assertEnvelopeShape(envelope, "ninetyDay");
  });
});

describe("D8 exit-derived metrics are unavailable, not zero", () => {
  it("reports flip_rate as exit_events_unavailable", () => {
    const envelope = flipRateEnvelope({ data_status: "live" });
    expect(envelope.metric_status).toBe("unavailable");
    expect(envelope.reason_code).toBe("exit_events_unavailable");
    expect(envelope.value).toBeNull();
    // A 0 flip rate would assert "this wallet never flips" from no evidence.
    expect(envelope.value).not.toBe(0);
    expect(envelope.unit).toBe(UNITS.ratio);
    assertEnvelopeShape(envelope, "flipRate");
  });

  it("reports median_exposure_minutes as exit_events_unavailable in minutes", () => {
    const envelope = medianExposureMinutesEnvelope({ data_status: "recorded" });
    expect(envelope.metric_status).toBe("unavailable");
    expect(envelope.reason_code).toBe("exit_events_unavailable");
    expect(envelope.value).toBeNull();
    expect(envelope.value).not.toBe(0);
    expect(envelope.unit).toBe(UNITS.minutes);
    assertEnvelopeShape(envelope, "medianExposure");
  });

  it("records that side=BUY-only data is the reason, so /trades.side is not reused", () => {
    const envelope = flipRateEnvelope({ data_status: "live" });
    expect(envelope.limitations.join(" ")).toContain("side=BUY");
    expect(envelope.limitations.join(" ")).toContain("禁止");
  });
});

describe("D8 window completeness is judged, not assumed", () => {
  const start = Date.parse("2026-01-01T00:00:00.000Z");
  const end = Date.parse("2026-04-01T00:00:00.000Z");

  it("marks complete only when history reaches the requested start and paging finished", () => {
    const result = evaluateWindowCompleteness({
      requested_start_ms: start,
      requested_end_ms: end,
      oldest_observed_ms: start - 1000,
      newest_observed_ms: end,
      pagination_complete: true,
    });
    expect(result.metric_status).toBe("complete");
    expect(result.reason_code).toBeNull();
  });

  it("downgrades to partial with pagination_cap when the pager stopped early", () => {
    const result = evaluateWindowCompleteness({
      requested_start_ms: start,
      requested_end_ms: end,
      oldest_observed_ms: start - 1000,
      newest_observed_ms: end,
      pagination_complete: false,
    });
    // Reaching the requested start is not sufficient on its own.
    expect(result.metric_status).toBe("partial");
    expect(result.reason_code).toBe("pagination_cap");
  });

  it("downgrades to partial when history does not reach the requested start", () => {
    const observedStart = end - OBSERVED_TRADES_HISTORY_DAYS * 24 * 60 * 60 * 1000;
    const result = evaluateWindowCompleteness({
      requested_start_ms: start,
      requested_end_ms: end,
      oldest_observed_ms: observedStart,
      newest_observed_ms: end,
      pagination_complete: true,
    });
    expect(result.metric_status).toBe("partial");
    expect(result.reason_code).toBe("incomplete_window");
    // Coverage reflects what was observed and is never rounded up to 1.
    expect(result.coverage).toBeLessThan(1);
    expect(result.coverage).toBeGreaterThan(0);
  });

  it("reports unavailable, not zero coverage, when nothing was observed", () => {
    const result = evaluateWindowCompleteness({
      requested_start_ms: start,
      requested_end_ms: end,
      oldest_observed_ms: null,
      newest_observed_ms: null,
      pagination_complete: true,
    });
    expect(result.metric_status).toBe("unavailable");
    expect(result.reason_code).toBe("incomplete_window");
    expect(result.coverage).toBeNull();
    expect(result.coverage).not.toBe(0);
  });

  it("downgrades to partial when integrity checks fail even if the range looks right", () => {
    const result = evaluateWindowCompleteness({
      requested_start_ms: start,
      requested_end_ms: end,
      oldest_observed_ms: start - 1000,
      newest_observed_ms: end,
      pagination_complete: true,
      integrity_checks_passed: false,
    });
    expect(result.metric_status).toBe("partial");
    expect(result.reason_code).toBe("timestamp_uncertain");
  });
});

describe("as_of is derived from the response, never the client clock", () => {
  it("subtracts age from date so cache staleness is not hidden", () => {
    // Measured: the same URL returned age values up to 1150s seconds apart.
    const result = deriveAsOf({ date: "Fri, 04 Sep 2026 12:00:00 GMT", age: "1150" });
    expect(result.as_of_source).toBe("age_adjusted");
    expect(result.as_of).toBe("2026-09-04T11:40:50.000Z");
    // The conservative (older) reading, not the optimistic response time.
    expect(Date.parse(result.as_of as string)).toBeLessThan(Date.parse("2026-09-04T12:00:00.000Z"));
  });

  it("uses the date header when no age is present", () => {
    const result = deriveAsOf({ date: "Fri, 04 Sep 2026 12:00:00 GMT" });
    expect(result.as_of_source).toBe("response_date");
    expect(result.as_of).toBe("2026-09-04T12:00:00.000Z");
  });

  it("falls back to last-modified before giving up", () => {
    const result = deriveAsOf({ date: null, "last-modified": "Fri, 04 Sep 2026 09:30:00 GMT" });
    expect(result.as_of_source).toBe("last_modified");
    expect(result.as_of).toBe("2026-09-04T09:30:00.000Z");
  });

  it("prefers a payload-supplied timestamp when the response carries one", () => {
    const result = deriveAsOf({ date: "Fri, 04 Sep 2026 12:00:00 GMT" }, "2026-09-04T11:00:00.000Z");
    expect(result.as_of_source).toBe("payload_field");
    expect(result.as_of).toBe("2026-09-04T11:00:00.000Z");
  });

  it("returns unknown rather than inventing a client timestamp", () => {
    for (const headers of [null, undefined, {}, { date: "not-a-date" }, { date: null, age: "5" }]) {
      const result = deriveAsOf(headers);
      expect(result.as_of).toBeNull();
      expect(result.as_of_source).toBe("unknown");
    }
    // Null means unknown freshness. It must not be read as "fresh now".
    const before = Date.now();
    const result = deriveAsOf({});
    expect(result.as_of).toBeNull();
    expect(Number.isNaN(Date.parse(String(result.as_of)))).toBe(true);
    expect(before).toBeGreaterThan(0);
  });

  it("ignores a zero or malformed age instead of shifting the timestamp", () => {
    for (const age of ["0", "-5", "abc", ""]) {
      const result = deriveAsOf({ date: "Fri, 04 Sep 2026 12:00:00 GMT", age });
      expect(result.as_of, age).toBe("2026-09-04T12:00:00.000Z");
      expect(result.as_of_source, age).toBe("response_date");
    }
  });
});

describe("wallet metrics expose D8 envelopes", () => {
  const metrics = calculateWalletMetrics(
    [trade("2026-01-01T00:00:00.000Z")],
    [window],
    new Date("2026-01-02T00:00:00.000Z"),
  );

  it("returns a well-formed envelope for every wallet metric", () => {
    const entries = Object.entries(metrics.metric_envelopes);
    expect(entries.length).toBeGreaterThanOrEqual(5);
    for (const [name, envelope] of entries) {
      assertEnvelopeShape(envelope, name);
    }
  });

  it("keeps the 90-day and exit-derived metrics unavailable with codes and no zeros", () => {
    const { ninety_day_trade_count: ninetyDay, flip_rate: flip, median_exposure_minutes: exposure } =
      metrics.metric_envelopes;
    for (const [label, envelope] of [
      ["ninety_day_trade_count", ninetyDay],
      ["flip_rate", flip],
      ["median_exposure_minutes", exposure],
    ] as const) {
      // The core P2 assertion: status AND code together, and never 0.
      expect(envelope.metric_status, label).toBe("unavailable");
      expect(isReasonCode(envelope.reason_code), label).toBe(true);
      expect(envelope.value, label).toBeNull();
      expect(envelope.value, label).not.toBe(0);
    }
    expect(ninetyDay.reason_code).toBe("incomplete_window");
    expect(flip.reason_code).toBe("exit_events_unavailable");
    expect(exposure.reason_code).toBe("exit_events_unavailable");
  });

  it("marks a measured rate partial when pagination completeness is unproven", () => {
    // The default is deliberately not `complete`: absent proof of a full pager
    // sweep, the window cannot be claimed complete.
    const coverage = metrics.metric_envelopes.coverage_rate;
    expect(coverage.value).toBe(1);
    expect(coverage.metric_status).toBe("partial");
    expect(coverage.reason_code).toBe("pagination_cap");
    expect(coverage.sample_size).toBe(1);
  });

  it("reports an unavailable coverage envelope, not 0, when no trades are observed", () => {
    const empty = calculateWalletMetrics(
      [trade("2026-01-01T00:00:00.000Z")],
      [window],
      new Date("2026-09-01T00:00:00.000Z"),
    );
    const coverage = empty.metric_envelopes.coverage_rate;
    expect(coverage.value).toBeNull();
    expect(coverage.value).not.toBe(0);
    expect(coverage.metric_status).toBe("unavailable");
    expect(coverage.reason_code).toBe("incomplete_window");
    // Lead rate must not silently become 0 either.
    const lead = empty.metric_envelopes.information_lead_rate;
    expect(lead.value).toBeNull();
    expect(lead.value).not.toBe(0);
    expect(isReasonCode(lead.reason_code)).toBe(true);
  });

  it("does not use the client clock for as_of by default", () => {
    for (const envelope of Object.values(metrics.metric_envelopes)) {
      expect(envelope.as_of).toBeNull();
      expect(envelope.as_of_source).toBe("unknown");
    }
  });

  it("threads a server-derived as_of through every envelope when supplied", () => {
    const derived = deriveAsOf({ date: "Fri, 04 Sep 2026 12:00:00 GMT", age: "1150" });
    const withAsOf = calculateWalletMetrics(
      [trade("2026-01-01T00:00:00.000Z")],
      [window],
      new Date("2026-01-02T00:00:00.000Z"),
      90,
      { asOf: derived.as_of, asOfSource: derived.as_of_source },
    );
    for (const envelope of Object.values(withAsOf.metric_envelopes)) {
      expect(envelope.as_of).toBe(derived.as_of);
      expect(envelope.as_of_source).toBe("age_adjusted");
    }
  });
});

describe("C20/D8 report meta declares the 90-day window unavailable", () => {
  const bundle: AnalysisBundle = {
    input: { kind: "wallet", raw: "wallet-a", normalized_id: "wallet-a", source_url: null },
    markets: [],
    prices: [],
    windows: [],
    evidence: [],
    trades: [trade("2026-01-01T00:00:00.000Z")],
    wallet_metrics: null,
    source_status: [],
    data_status: "synthetic",
    limitations: [],
  };

  it("publishes the requested window with an explicit unavailable status", () => {
    const meta = buildSummary(bundle).meta;
    expect(meta.analysis_window.wallet_days_requested).toBe(90);
    // Publishing 90 bare would imply it was covered; it cannot be.
    expect(meta.analysis_window.wallet_days_status).toBe("unavailable");
    expect(meta.analysis_window.wallet_days_reason_code).toBe("incomplete_window");
    expect(isReasonCode(meta.analysis_window.wallet_days_reason_code)).toBe(true);
    // The window is not silently shortened to the ~20.72 observed days either.
    expect(meta.analysis_window.wallet_days).toBe(90);
  });
});

describe("C24 MCP catalog data_status reflects real behaviour", () => {
  it("no longer hardcodes recorded for all eight tools", () => {
    const statuses = new Set(toolCatalog("recorded").map((tool) => tool.data_status));
    expect(MCP_TOOL_NAMES).toHaveLength(8);
    // The whole defect was one constant for eight different behaviours.
    expect(statuses.size).toBeGreaterThan(1);
  });

  it("follows the app mode for tools that actually serve analysis data", () => {
    for (const name of ["alibi_summary", "alibi_detail", "alibi_wallet_report", "alibi_rankings"] as const) {
      expect(resolveToolDataStatus(name, "recorded"), name).toBe("recorded");
      // Live mode must not keep reporting recorded.
      expect(resolveToolDataStatus(name, "live"), name).toBe("live");
    }
  });

  it("labels hardcoded stub handlers synthetic rather than recorded", () => {
    for (const name of ["alibi_evidence", "alibi_agent_run", "alibi_subscription_status"] as const) {
      // Claiming `recorded` would assert a real capture that does not exist.
      expect(resolveToolDataStatus(name, "recorded"), name).toBe("synthetic");
      expect(resolveToolDataStatus(name, "live"), name).toBe("synthetic");
    }
  });

  it("reports process state as live in both modes", () => {
    expect(resolveToolDataStatus("alibi_health", "recorded")).toBe("live");
    expect(resolveToolDataStatus("alibi_health", "live")).toBe("live");
  });

  it("documents the basis for every tool and stays read-only", () => {
    for (const tool of toolCatalog("recorded")) {
      expect(tool.data_status_evidence.length, tool.name).toBeGreaterThan(20);
      expect(tool.mutates_business_result, tool.name).toBe(false);
      expect(isDataStatus(tool.data_status), tool.name).toBe(true);
    }
  });
});
