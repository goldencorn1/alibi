import { describe, expect, it } from "vitest";
import { buildEnvelope, UNITS } from "@/src/analysis/metric-envelope";
import { requiresNullValue } from "@/src/contracts";
import {
  ATTRIBUTION_FIELDS,
  ATTRIBUTION_VERDICTS,
  COVERAGE_GATE,
  FIT_FIELDS,
  LEADERBOARD_COLUMNS,
  MISSING_TEXT,
  NOT_APPLICABLE_TEXT,
  OUTCOME_FIELDS,
  buildFitGroup,
  buildLeaderboardViewModel,
  buildWalletDetailViewModel,
  enforceCoverageGate,
  findEnvelopeViolations,
  formatEnvelopeValue,
  formatRatioAsPercent,
  renderMetric,
  walletDetailHref,
} from "@/app/components/wallet-discovery/view-model";
import { DETAIL_WALLET } from "@/src/wallet-discovery";

/**
 * Presentation-level honesty checks.
 *
 * These run against the same view model the pages render, so a regression that
 * would put a `0` on screen fails here rather than in a screenshot review.
 */

const UNCAPTURED_WALLET = "0x3dfb153c197d4c19d3b31c1ecd2c7b6860eeabaf";
const ATTRIBUTION_WALLET = "0xc69bd5567b40ef4d11922eaa57e1f9be1c642076";
const NEVER_CAPTURED_WALLET = "0x0000000000000000000000000000000000000001";

describe("missing-value formatting", () => {
  it("renders a null value as an em dash, never as 0", () => {
    const envelope = buildEnvelope<number>({
      value: null,
      unit: UNITS.usdc,
      metric_status: "unavailable",
      reason_code: "pagination_cap",
      data_status: "recorded",
    });
    for (const display of ["usdc", "percent", "price", "minutes", "days", "count", "timestamp"] as const) {
      const text = formatEnvelopeValue(envelope, display);
      expect(text).toBe(MISSING_TEXT);
      expect(text).not.toBe("0");
      expect(text).not.toMatch(/\b0\b/);
    }
  });

  it("renders a null ratio as n/a so it cannot be read as 0%", () => {
    expect(formatRatioAsPercent(null)).toBe(NOT_APPLICABLE_TEXT);
    expect(formatRatioAsPercent(null)).not.toBe("0.0%");
    // A genuine zero is still shown as zero: the two must stay distinguishable.
    expect(formatRatioAsPercent(0)).toBe("0.0%");
    expect(formatRatioAsPercent(0.5)).toBe("50.0%");
  });

  it("flags a missing metric so the UI can label it", () => {
    const rendered = renderMetric(
      buildEnvelope<number>({
        value: null,
        unit: UNITS.ratio,
        metric_status: "insufficient_evidence",
        reason_code: "coverage_below_gate",
        data_status: "recorded",
        coverage: null,
        sample_size: null,
      }),
      "percent",
    );
    expect(rendered.is_missing).toBe(true);
    expect(rendered.text).toBe(MISSING_TEXT);
    expect(rendered.coverage_text).toBe(NOT_APPLICABLE_TEXT);
    expect(rendered.sample_size_text).toBe(NOT_APPLICABLE_TEXT);
    expect(rendered.reason_code).toBe("coverage_below_gate");
    // Caveats must travel with the value, not only in a tooltip.
    expect(rendered.title).toContain("coverage_below_gate");
  });
});

describe("coverage gate", () => {
  it("drops a lead rate whose coverage sits under 0.40", () => {
    const gated = enforceCoverageGate(
      buildEnvelope<number>({
        value: 0.72,
        unit: UNITS.ratio,
        metric_status: "partial",
        reason_code: "incomplete_window",
        data_status: "recorded",
        coverage: 0.2,
        sample_size: 9,
      }),
    );
    expect(gated.value).toBeNull();
    expect(gated.value).not.toBe(0);
    expect(gated.metric_status).toBe("insufficient_evidence");
    expect(gated.reason_code).toBe("coverage_below_gate");
    // Coverage itself is retained so the reader can see why it was withheld.
    expect(gated.coverage).toBe(0.2);
    expect(gated.limitations.join(" ")).toContain("低于门槛");
  });

  it("keeps a value whose coverage clears the gate", () => {
    const kept = enforceCoverageGate(
      buildEnvelope<number>({
        value: 0.61,
        unit: UNITS.ratio,
        metric_status: "partial",
        reason_code: "incomplete_window",
        data_status: "recorded",
        coverage: 0.85,
      }),
    );
    expect(kept.value).toBe(0.61);
    expect(kept.metric_status).toBe("partial");
  });

  it("uses the same 0.40 threshold as the engine", () => {
    expect(COVERAGE_GATE).toBe(0.4);
  });
});

describe("leaderboard view model", () => {
  const model = buildLeaderboardViewModel();

  it("exposes 20 rows with 8 metric columns", () => {
    expect(model.rows).toHaveLength(20);
    expect(LEADERBOARD_COLUMNS).toHaveLength(8);
    expect(model.data_status).toBe("recorded");
  });

  it("derives as_of from the capture, strictly before now", () => {
    expect(model.as_of).toBeTruthy();
    expect(Date.parse(model.as_of as string)).toBeLessThan(Date.now());
    expect(model.as_of_text).not.toBe("unknown");
  });

  it("links only the one captured row", () => {
    const linkable = model.rows.filter((row) => row.detail_href !== null);
    expect(linkable).toHaveLength(1);
    expect(model.detail_captured_count).toBe(1);
    expect(model.uncaptured_count).toBe(19);
    expect(linkable[0]?.wallet).toBe(DETAIL_WALLET);
    expect(linkable[0]?.detail_href).toBe(walletDetailHref(DETAIL_WALLET));
  });

  it("shows an em dash for every metric of the 19 uncaptured rows", () => {
    const uncaptured = model.rows.filter((row) => !row.detail_captured);
    expect(uncaptured).toHaveLength(19);
    for (const row of uncaptured) {
      for (const column of LEADERBOARD_COLUMNS) {
        const metric = row.metrics[column.key];
        expect(metric.is_missing, `${row.wallet}.${column.key}`).toBe(true);
        expect(metric.text, `${row.wallet}.${column.key}`).toBe(MISSING_TEXT);
        // The failure this project cares about most.
        expect(metric.text).not.toBe("0");
        expect(metric.text).not.toBe("0.0%");
        expect(metric.coverage_text).toBe(NOT_APPLICABLE_TEXT);
        expect(metric.reason_code).toBeTruthy();
        expect(metric.limitations.length).toBeGreaterThan(0);
      }
      // Upstream row fields stay real and are labelled as the source's window.
      expect(row.source_vol_text).toMatch(/USDC$/);
      expect(row.source_pnl_text).toMatch(/USDC$/);
    }
  });

  it("keeps the two attribution wallets out of the ranked rows", () => {
    expect(model.attribution_fixture_wallets).toHaveLength(2);
    const ranked = new Set(model.rows.map((row) => row.wallet));
    for (const entry of model.attribution_fixture_wallets) {
      expect(entry.rank).toBeNull();
      expect(ranked.has(entry.wallet)).toBe(false);
      expect(entry.detail_href).toBe(walletDetailHref(entry.wallet));
    }
  });
});

describe("wallet detail view model", () => {
  it("computes real Outcome values for the captured wallet", () => {
    const model = buildWalletDetailViewModel(DETAIL_WALLET);
    expect(model.detail_captured).toBe(true);
    expect(model.rank).toBe(1);
    expect(model.outcome.avg_buy_price_7d.value).not.toBeNull();
    expect(model.outcome.total_trades_7d.value).not.toBeNull();
    // Null for a measured reason, not for lack of trying.
    expect(model.outcome.realized_pnl_7d.value).toBeNull();
    expect(model.outcome.realized_pnl_7d.reason_code).toBe("pagination_cap");
    expect(findEnvelopeViolations(Object.values(model.outcome))).toEqual([]);
  });

  it("nulls every Outcome field for a row-only wallet without 404ing", () => {
    const model = buildWalletDetailViewModel(UNCAPTURED_WALLET);
    expect(model.detail_captured).toBe(false);
    expect(model.in_recorded_leaderboard).toBe(true);
    expect(model.rank).toBe(2);
    for (const field of OUTCOME_FIELDS) {
      const envelope = model.outcome[field.key];
      expect(envelope.value, field.key).toBeNull();
      expect(envelope.value, field.key).not.toBe(0);
      expect(requiresNullValue(envelope.metric_status)).toBe(true);
      expect(envelope.reason_code).toBeTruthy();
    }
    expect(findEnvelopeViolations(Object.values(model.outcome))).toEqual([]);
  });

  it("gives the unranked attribution wallet a null rank", () => {
    const model = buildWalletDetailViewModel(ATTRIBUTION_WALLET);
    expect(model.rank).toBeNull();
    expect(model.in_recorded_leaderboard).toBe(false);
    expect(model.in_capture).toBe(true);
    expect(model.attribution.absence).toBe("no_qualified_evidence");
  });

  it("says nothing about an address that was never captured", () => {
    const model = buildWalletDetailViewModel(NEVER_CAPTURED_WALLET);
    expect(model.rank).toBeNull();
    expect(model.in_capture).toBe(false);
    expect(model.attribution.absence).toBe("no_attribution_capture");
    for (const field of OUTCOME_FIELDS) {
      expect(model.outcome[field.key].value, field.key).toBeNull();
    }
  });

  it("abstains from every attribution field and lists only legal verdicts", () => {
    for (const wallet of [DETAIL_WALLET, ATTRIBUTION_WALLET, NEVER_CAPTURED_WALLET]) {
      const model = buildWalletDetailViewModel(wallet);
      expect(model.attribution.evidence).toHaveLength(0);
      expect(requiresNullValue(model.attribution.status)).toBe(true);
      for (const field of ATTRIBUTION_FIELDS) {
        const envelope = model.attribution.fields[field.key];
        expect(envelope.value, `${wallet}.${field.key}`).toBeNull();
        expect(envelope.value, `${wallet}.${field.key}`).not.toBe(0);
        expect(envelope.reason_code).toBeTruthy();
      }
      expect(model.attribution.verdict_space).toEqual(ATTRIBUTION_VERDICTS);
      expect(ATTRIBUTION_VERDICTS).toHaveLength(4);
    }
  });

  it("keeps the Fit group unavailable with all six field names present", () => {
    const group = buildFitGroup();
    expect(group.status).toBe("unavailable");
    expect(group.reason_code).toBe("provider_unavailable");
    expect(FIT_FIELDS.map((field) => field.key)).toEqual([
      "effective_entry_price",
      "slippage_bps",
      "retained_return_ratio",
      "max_deployable_usd",
      "meets_policy",
      "failed_criteria",
    ]);
    for (const field of FIT_FIELDS) {
      const envelope = group.fields[field.key];
      expect(envelope.value, field.key).toBeNull();
      expect(envelope.value, field.key).not.toBe(0);
      expect(envelope.value, field.key).not.toBe(false);
      expect(renderMetric(envelope, field.display).text).toBe(MISSING_TEXT);
    }
    for (const wallet of [DETAIL_WALLET, UNCAPTURED_WALLET, NEVER_CAPTURED_WALLET]) {
      expect(buildWalletDetailViewModel(wallet).fit.status).toBe("unavailable");
    }
  });

  it("never emits a non-recorded data_status across any group", () => {
    for (const wallet of [DETAIL_WALLET, UNCAPTURED_WALLET, ATTRIBUTION_WALLET, NEVER_CAPTURED_WALLET]) {
      const model = buildWalletDetailViewModel(wallet);
      const all = [
        ...Object.values(model.outcome),
        ...Object.values(model.attribution.fields),
        ...Object.values(model.fit.fields),
      ];
      expect(findEnvelopeViolations(all), wallet).toEqual([]);
      expect(model.data_status).toBe("recorded");
    }
  });
});

describe("forbidden vocabulary", () => {
  /**
   * The banned terms are causal or advisory claims. Scanning the rendered
   * strings keeps them out of limitation text as well as headings, since
   * limitations are the easiest place for a causal phrasing to slip in.
   */
  const BANNED = [
    "insider",
    "knew first",
    "speaks chinese",
    "better judgment",
    "worth following",
    "decide whether to follow",
    "decide how to follow",
    "他是先知道",
    "决定跟不跟",
    "决定怎么跟",
    "值不值得跟单",
    // Unsafe field names that must never surface.
    "median_account_age_days",
    "timestamp_uncertainty_seconds",
    "max_drawdown",
    "mdd",
  ];

  function collectText(): string {
    const parts: string[] = [];
    const leaderboard = buildLeaderboardViewModel();
    parts.push(JSON.stringify(leaderboard));
    parts.push(LEADERBOARD_COLUMNS.map((column) => column.header).join(" "));
    for (const wallet of [DETAIL_WALLET, UNCAPTURED_WALLET, ATTRIBUTION_WALLET, NEVER_CAPTURED_WALLET]) {
      parts.push(JSON.stringify(buildWalletDetailViewModel(wallet)));
    }
    parts.push(OUTCOME_FIELDS.map((field) => field.label).join(" "));
    parts.push(ATTRIBUTION_FIELDS.map((field) => field.label).join(" "));
    parts.push(FIT_FIELDS.map((field) => field.label).join(" "));
    return parts.join(" \n ").toLowerCase();
  }

  it("uses none of the banned causal or advisory phrases", () => {
    const text = collectText();
    for (const term of BANNED) {
      expect(text, `banned term "${term}"`).not.toContain(term);
    }
  });

  it("reports exposure as median_exposure_minutes rather than a drawdown", () => {
    const text = collectText();
    expect(text).toContain("median_exposure_minutes");
    expect(text).not.toContain("drawdown");
  });

  it("never presents a recorded surface as live", () => {
    const text = collectText();
    expect(text).not.toContain('"data_status":"live"');
    expect(text).not.toContain("synthetic");
  });
});
