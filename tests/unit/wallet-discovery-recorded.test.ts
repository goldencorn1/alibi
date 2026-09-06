import { describe, expect, it } from "vitest";
import { MetricEnvelope, isReasonCode, requiresNullValue } from "@/src/contracts";
import { CALCULATION_VERSION, UNITS } from "@/src/analysis/metric-envelope";
import {
  ATTRIBUTION_FIXTURE_WALLETS,
  DETAIL_WALLET,
  DETAIL_WALLET_METRICS,
  LEADERBOARD_FIXTURE,
  WALLET_FIXTURE,
  getDetailWallets,
  getRecordedLeaderboard,
} from "@/src/wallet-discovery";

const view = getRecordedLeaderboard();

/** Every envelope field the contract requires a consumer to be able to read. */
const ENVELOPE_KEYS = [
  "value",
  "unit",
  "requested_window",
  "observed_window",
  "as_of",
  "as_of_source",
  "sample_size",
  "eligible_sample_size",
  "coverage",
  "data_status",
  "metric_status",
  "reason_code",
  "source_provenance",
  "calculation_version",
  "limitations",
] as const;

const ROW_METRIC_KEYS = [
  "realized_pnl_7d",
  "win_rate_7d",
  "avg_buy_price_7d",
  "flip_rate_7d",
  "median_exposure_minutes_7d",
  "last_trade_at",
  "information_lead_rate_7d",
  "coverage_7d",
] as const;

describe("wallet-discovery recorded fixtures", () => {
  it("marks both fixtures recorded and never mentions synthetic", () => {
    for (const [label, fixture] of [
      ["leaderboard", LEADERBOARD_FIXTURE],
      ["wallet", WALLET_FIXTURE],
    ] as const) {
      expect(fixture.fixture_status, label).toBe("recorded");
      expect(fixture.data_status, label).toBe("recorded");
      // recorded must never be relabelled as live, nor carry synthetic data.
      expect(JSON.stringify(fixture), label).not.toMatch(/synthetic/i);
      expect(fixture.data_status, label).not.toBe("live");
    }
  });

  it("derives as_of from response headers, not the run clock", () => {
    const runStart = Date.now();
    // age_adjusted: date 16:14:12Z minus age 1150s.
    expect(LEADERBOARD_FIXTURE.source.as_of_source).toBe("age_adjusted");
    expect(LEADERBOARD_FIXTURE.source.as_of).toBe("2026-09-05T15:55:02Z");
    // The service re-derives through deriveAsOf, which emits toISOString() and
    // therefore carries milliseconds. Same instant, different formatting.
    expect(view.as_of).toBe("2026-09-05T15:55:02.000Z");
    expect(Date.parse(String(view.as_of))).toBe(Date.parse(String(LEADERBOARD_FIXTURE.source.as_of)));
    expect(view.as_of_source).toBe("age_adjusted");

    const asOfMs = Date.parse(String(view.as_of));
    // Not the moment this test ran: must be strictly in the past by minutes.
    expect(asOfMs).toBeLessThan(runStart);
    expect(runStart - asOfMs).toBeGreaterThan(60_000);

    // The age-adjusted value is older than the raw Date header it came from.
    const rawDateMs = Date.parse(String(LEADERBOARD_FIXTURE.source.response_headers.date));
    expect(asOfMs).toBeLessThan(rawDateMs);
    expect(rawDateMs - asOfMs).toBe(1150 * 1000);
  });

  it("keeps upstream rank as a string alongside the numeric cast", () => {
    for (const row of LEADERBOARD_FIXTURE.rows) {
      expect(typeof row.rank_raw).toBe("string");
      expect(typeof row.rank).toBe("number");
      expect(row.rank).toBe(Number(row.rank_raw));
    }
    expect(LEADERBOARD_FIXTURE.rows[0]?.rank_raw).toBe("1");
  });

  it("records that /trades exposed no exit leg", () => {
    expect(WALLET_FIXTURE.observations.trades.side_values_observed).toEqual(["BUY"]);
    expect(WALLET_FIXTURE.observations.trades.rows_returned).toBe(10000);
  });

  it("interprets realizedPnl as decimal USDC, not 6-decimal fixed point", () => {
    const scale = WALLET_FIXTURE.observations.closed_positions.realized_pnl_scale;
    expect(scale.interpretation).toBe("decimal USDC");
    // pnl / (totalBought * (curPrice - avgPrice)) lands on ~1.0, so the value
    // is already decimal. A 1e6 fixed-point reading would sit near 1e6.
    expect(scale.ratio_median).toBeGreaterThan(0.79);
    expect(scale.ratio_max).toBeLessThanOrEqual(1.0);
    expect(scale.ratio_median).toBeLessThan(1.0001);

    const sample = WALLET_FIXTURE.observations.closed_positions.window_7d.positions_in_window_detail[0];
    expect(sample).toBeDefined();
    // Plain-dollar magnitude: a fixed-point misread would be ~1e6 larger.
    expect(sample!.realized_pnl).toBeLessThan(1_000_000);
    expect(sample!.realized_pnl).toBeGreaterThan(1);
  });
});

describe("leaderboard service rows", () => {
  it("returns exactly 20 rows with real upstream display fields", () => {
    expect(view.rows).toHaveLength(20);
    expect(view.window).toBe("30d");
    expect(view.data_status).toBe("recorded");
    expect(view.rows_available_in_response).toBe(50);

    const ranks = view.rows.map((row) => row.rank);
    expect(ranks).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(new Set(view.rows.map((row) => row.wallet)).size).toBe(20);

    for (const row of view.rows) {
      expect(row.wallet).toMatch(/^0x[0-9a-f]{40}$/);
      expect(typeof row.vol).toBe("number");
      expect(typeof row.pnl).toBe("number");
      expect(Number.isFinite(row.vol)).toBe(true);
      expect(Number.isFinite(row.pnl)).toBe(true);
      expect(typeof row.verified_badge).toBe("boolean");
      expect(row.data_status).toBe("recorded");
    }
  });

  it("every row carries full envelopes on every metric", () => {
    for (const row of view.rows) {
      for (const key of ROW_METRIC_KEYS) {
        const envelope = row[key] as MetricEnvelope<unknown>;
        for (const field of ENVELOPE_KEYS) {
          expect(envelope, `${row.wallet}.${key}.${field}`).toHaveProperty(field);
        }
        expect(Object.keys(envelope).length).toBeGreaterThanOrEqual(13);
        expect(envelope.calculation_version).toBe(CALCULATION_VERSION);
        expect(envelope.data_status).toBe("recorded");
        expect(Array.isArray(envelope.limitations)).toBe(true);
        expect(envelope.limitations.length).toBeGreaterThan(0);
        if (requiresNullValue(envelope.metric_status)) {
          expect(envelope.value, `${row.wallet}.${key}`).toBeNull();
          expect(isReasonCode(envelope.reason_code)).toBe(true);
        }
      }
    }
  });

  it("captures detail for exactly one wallet", () => {
    expect(view.detail_captured_count).toBe(1);
    const captured = view.rows.filter((row) => row.detail_captured);
    expect(captured).toHaveLength(1);
    expect(captured[0]?.wallet).toBe(DETAIL_WALLET);
    expect(view.rows.filter((row) => !row.detail_captured)).toHaveLength(19);
  });

  it("never reports 0 for the 19 uncaptured wallets", () => {
    const uncaptured = view.rows.filter((row) => !row.detail_captured);
    expect(uncaptured).toHaveLength(19);

    for (const row of uncaptured) {
      for (const key of ROW_METRIC_KEYS) {
        const envelope = row[key] as MetricEnvelope<unknown>;
        // The point of the exercise: absent must not be dressed up as zero.
        expect(envelope.value, `${row.wallet}.${key}`).not.toBe(0);
        expect(envelope.value, `${row.wallet}.${key}`).not.toBe("0");
        expect(envelope.value, `${row.wallet}.${key}`).not.toBe(false);
        expect(envelope.value, `${row.wallet}.${key}`).toBeNull();
        expect(envelope.metric_status, `${row.wallet}.${key}`).toBe("unavailable");
        expect(envelope.reason_code, `${row.wallet}.${key}`).toBe("incomplete_window");
        // Zero samples, explicitly — distinct from a zero-valued metric.
        expect(envelope.sample_size).toBe(0);
        expect(envelope.coverage).toBeNull();
      }
      // Display fields stay real even when metrics are unavailable.
      expect(typeof row.vol).toBe("number");
      expect(typeof row.pnl).toBe("number");
    }
  });

  it("does not derive uncaptured metrics from vol/pnl", () => {
    for (const row of view.rows.filter((r) => !r.detail_captured)) {
      for (const key of ROW_METRIC_KEYS) {
        const envelope = row[key] as MetricEnvelope<unknown>;
        expect(envelope.value).not.toBe(row.pnl);
        expect(envelope.value).not.toBe(row.vol);
      }
    }
    // Rows whose upstream vol is genuinely 0 keep that real 0 on the display
    // field while their metrics stay null — the two must not be conflated.
    const zeroVol = view.rows.filter((row) => row.vol === 0);
    expect(zeroVol.length).toBeGreaterThan(0);
    for (const row of zeroVol) {
      expect(row.realized_pnl_7d.value).toBeNull();
    }
  });
});

describe("detail wallet outcome metrics", () => {
  const m = DETAIL_WALLET_METRICS;

  it("computes the /trades-derived 7d metrics from recorded rows", () => {
    expect(m.total_trades_7d.value).toBe(3244);
    expect(m.active_markets_7d.value).toBe(1038);
    expect(m.avg_buy_price_7d.value).toBeCloseTo(0.4543806482260841, 12);
    expect(m.last_trade_at.value).toBe("2026-09-05T16:20:06Z");

    // 7-day window start is covered by observed history, so: complete.
    expect(m.total_trades_7d.metric_status).toBe("complete");
    expect(m.total_trades_7d.reason_code).toBeNull();
    // Coverage is just under 1: the newest observed trade (16:20:06Z) sits 43s
    // before the response date (16:20:49Z), and coverage is never extrapolated
    // past newest_observed. `complete` does not require coverage === 1.
    expect(m.total_trades_7d.coverage).toBeLessThan(1);
    expect(m.total_trades_7d.coverage).toBeCloseTo(1 - 43 / 604_800, 9);
    expect(m.avg_buy_price_7d.unit).toBe(UNITS.ratio);
    expect(m.total_trades_7d.unit).toBe(UNITS.count);

    // avg_buy_price is share-weighted, so it must differ from the plain mean.
    expect(m.avg_buy_price_7d.value).toBeGreaterThan(0);
    expect(m.avg_buy_price_7d.value).toBeLessThan(1);
  });

  it("keeps flip_rate and median_exposure_minutes unavailable on exit evidence", () => {
    for (const envelope of [m.flip_rate_7d, m.median_exposure_minutes_7d]) {
      expect(envelope.value).toBeNull();
      expect(envelope.value).not.toBe(0);
      expect(envelope.metric_status).toBe("unavailable");
      expect(envelope.reason_code).toBe("exit_events_unavailable");
      expect(envelope.eligible_sample_size).toBe(0);
    }
    expect(m.flip_rate_7d.unit).toBe(UNITS.ratio);
    expect(m.median_exposure_minutes_7d.unit).toBe(UNITS.minutes);
  });

  it("reports profile_age_days as profile_endpoint_unverified", () => {
    expect(m.profile_age_days.value).toBeNull();
    expect(m.profile_age_days.value).not.toBe(0);
    expect(m.profile_age_days.metric_status).toBe("unavailable");
    expect(m.profile_age_days.reason_code).toBe("profile_endpoint_unverified");
    expect(m.profile_age_days.unit).toBe(UNITS.days);
    // Unknown freshness is null, never "now".
    expect(m.profile_age_days.as_of).toBeNull();
    expect(m.profile_age_days.as_of_source).toBe("unknown");
  });

  it("withholds realized_pnl_7d and win_rate_7d under the pagination cap", () => {
    for (const envelope of [m.realized_pnl_7d, m.win_rate_7d]) {
      expect(envelope.value).toBeNull();
      expect(envelope.value).not.toBe(0);
      expect(envelope.metric_status).toBe("unavailable");
      // The sample is winners-only, so neither is computable.
      expect(envelope.reason_code).toBe("pagination_cap");
      expect(envelope.eligible_sample_size).toBe(0);
    }
    // win_rate must never be published as a perfect score off a biased sample.
    expect(m.win_rate_7d.value).not.toBe(1);
    expect(m.realized_pnl_7d.unit).toBe(UNITS.usdc);
    expect(m.win_rate_7d.unit).toBe(UNITS.ratio);

    const closed = WALLET_FIXTURE.observations.closed_positions;
    expect(closed.positions_with_negative_pnl).toBe(0);
    expect(closed.pagination_complete).toBe(false);
    expect(closed.offset_ranges_missing.length).toBeGreaterThan(0);
    expect(closed.sort_order_observed).toBe("realizedPnl DESC");
    // The observed positive-only 7d sum exceeds the upstream 30d net PnL,
    // which is the independent proof that the losing tail is missing.
    expect(closed.window_7d.observed_positive_pnl_sum_lower_bound).toBeGreaterThan(
      closed.leaderboard_cross_check.leaderboard_pnl_30d,
    );
  });

  it("reports activity-window metrics as incomplete_window, not zero", () => {
    for (const envelope of [m.first_deposit_at, m.rebate_income_7d]) {
      expect(envelope.value).toBeNull();
      expect(envelope.value).not.toBe(0);
      expect(envelope.metric_status).toBe("unavailable");
      expect(envelope.reason_code).toBe("incomplete_window");
    }
    const activity = WALLET_FIXTURE.observations.activity;
    expect(activity.deposit_events_observed).toBe(0);
    expect(activity.reward_events_observed).toBe(0);
    // ~7.48h of reach cannot support a 7-day statement.
    expect(activity.reach_hours).toBeLessThan(8);
    expect(activity.offset_cap_observed).toBe(5000);
  });

  it("reports provider-less metrics as provider_unavailable", () => {
    for (const envelope of [m.portfolio_value, m.category_mix, m.information_lead_rate_7d]) {
      expect(envelope.value).toBeNull();
      expect(envelope.value).not.toBe(0);
      expect(envelope.metric_status).toBe("unavailable");
      expect(envelope.reason_code).toBe("provider_unavailable");
    }
  });

  it("holds every 90-day metric unavailable on incomplete_window", () => {
    for (const envelope of [m.realized_pnl_90d, m.win_rate_90d]) {
      expect(envelope.value).toBeNull();
      expect(envelope.value).not.toBe(0);
      expect(envelope.metric_status).toBe("unavailable");
      expect(envelope.reason_code).toBe("incomplete_window");
      expect(envelope.coverage).toBeNull();
      expect(envelope.limitations.join(" ")).toMatch(/20\.72|90/);
    }
    // Measured history is ~20.72d; a 90-day window cannot be satisfied.
    expect(WALLET_FIXTURE.observations.trades.observed_span_days).toBeLessThan(21);
    expect(WALLET_FIXTURE.observations.trades.offset_cap_observed).toBe(10000);
  });

  it("emits no maximum-drawdown metric", () => {
    const keys = Object.keys(m);
    expect(keys.some((k) => /drawdown|mdd/i.test(k))).toBe(false);
    // median_exposure_minutes is the sanctioned stand-in.
    expect(keys).toContain("median_exposure_minutes_7d");
  });

  it("uses only safe metric names", () => {
    const serialized = JSON.stringify(m);
    expect(serialized).not.toMatch(/median_account_age_days/);
    expect(serialized).not.toMatch(/market_familiarity_ratio/);
    expect(serialized).not.toMatch(/timestamp_uncertainty_seconds/);
    expect(serialized).not.toMatch(/"driver"/);
    expect(Object.keys(m)).not.toContain("lead_minutes");
  });
});

describe("detail wallet registry", () => {
  it("lists the outcome wallet and both attribution wallets", () => {
    const entries = getDetailWallets();
    expect(entries).toHaveLength(3);

    const outcome = entries.find((entry) => entry.wallet === DETAIL_WALLET);
    expect(outcome?.capabilities).toEqual(["outcome"]);
    expect(outcome?.rank).toBe(1);

    for (const wallet of ATTRIBUTION_FIXTURE_WALLETS) {
      const entry = entries.find((item) => item.wallet === wallet);
      expect(entry?.capabilities).toEqual(["attribution"]);
      // Absent from the recorded top-50: no rank may be invented.
      expect(entry?.rank).toBeNull();
    }
  });

  it("does not inject attribution wallets into the ranked rows", () => {
    const ranked = new Set(view.rows.map((row) => row.wallet));
    for (const wallet of ATTRIBUTION_FIXTURE_WALLETS) {
      expect(ranked.has(wallet)).toBe(false);
    }
  });
});
