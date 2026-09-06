/**
 * Shapes of the recorded wallet-discovery fixtures.
 *
 * These mirror `fixtures/recorded/leaderboard-30d.json` and
 * `fixtures/recorded/wallet-0xfe787d2d….json`, which were generated from the
 * captured artifacts under `artifacts/verification/wallet-discovery-001/`.
 *
 * The fixtures deliberately store OBSERVATIONS (row counts, spans, sort order,
 * offset gaps), not published metrics. Turning an observation into a metric is
 * the job of `outcome-metrics.ts`, which is where the computability verdict is
 * decided. Keeping the two apart is what stops a biased sample from silently
 * becoming a headline number.
 */

export interface FixtureResponseHeaders {
  date: string | null;
  "last-modified": string | null;
  age: string | null;
}

export type AsOfSourceLiteral = "response_date" | "last_modified" | "age_adjusted" | "payload_field" | "unknown";

export interface LeaderboardFixtureRow {
  /** Numeric form of `rank_raw`. Upstream ships rank as a string. */
  rank: number;
  /** Verbatim upstream value, e.g. `"1"`. Retained so the cast is auditable. */
  rank_raw: string;
  wallet: string;
  /** `null` when upstream sent `""`. */
  user_name: string | null;
  user_name_raw: string;
  x_username: string | null;
  x_username_raw: string;
  verified_badge: boolean;
  /** Upstream self-reported 30d volume, in USDC. Not recomputed. */
  vol: number;
  /** Upstream self-reported 30d PnL, in USDC. Not recomputed. */
  pnl: number;
}

export interface LeaderboardFixtureSource {
  source: string;
  source_url: string;
  http_status: number | null;
  retrieved_at: string | null;
  as_of: string | null;
  as_of_source: AsOfSourceLiteral;
  response_headers: FixtureResponseHeaders;
  response_hash: string;
  artifact: string;
}

export interface LeaderboardFixture {
  schema_version: string;
  fixture_status: "recorded";
  data_status: "recorded";
  window: "30d";
  captured_at: string | null;
  source: LeaderboardFixtureSource;
  rows_available_in_response: number;
  rows_retained: number;
  rows: LeaderboardFixtureRow[];
  limitations: string[];
}

export interface TradesWindowObservation {
  start: string;
  end: string;
  /** True when the oldest observed trade predates the window start. */
  window_start_covered: boolean;
  trades_in_window: number;
  unique_condition_ids_in_window: number;
  size_sum_in_window: number;
  notional_sum_in_window: number;
  /** `Σ(price × size) / Σ(size)` over the window. */
  size_weighted_avg_buy_price: number;
}

export interface TradesObservation {
  artifact: string;
  source: string;
  source_url: string | null;
  http_status: number | null;
  response_headers: FixtureResponseHeaders;
  as_of: string | null;
  as_of_source: AsOfSourceLiteral;
  response_hash: string;
  rows_returned: number;
  row_limit_requested: number;
  offset_cap_observed: number;
  offset_cap_error: string | null;
  unique_transaction_hashes: number;
  duplicate_rows_after_dedup: number;
  /** Measured `side` domain. `["BUY"]` means no exit leg was ever observed. */
  side_values_observed: string[];
  oldest_observed_trade_at: string;
  newest_observed_trade_at: string;
  observed_span_days: number;
  window_7d: TradesWindowObservation;
  snapshot_consistency: {
    second_snapshot_artifact: string;
    rows_only_in_second_snapshot: number;
    rows_shared: number;
    note: string;
  };
}

export interface ClosedPositionsPage {
  artifact: string;
  offset: number;
  rows: number;
  source_url: string | null;
  response_hash: string;
  realized_pnl_max: number;
  realized_pnl_min: number;
}

export interface ClosedPositionsObservation {
  source: string;
  source_url: string | null;
  http_status: number | null;
  response_headers: FixtureResponseHeaders;
  as_of: string | null;
  as_of_source: AsOfSourceLiteral;
  pages_captured: ClosedPositionsPage[];
  sort_order_observed: string;
  sort_order_verified_per_page: boolean;
  offset_ranges_captured: number[][];
  /** Offsets that were never fetched. Non-empty means the sample has holes. */
  offset_ranges_missing: number[][];
  unique_positions_observed: number;
  positions_with_positive_pnl: number;
  positions_with_negative_pnl: number;
  positions_with_zero_pnl: number;
  total_positions_lower_bound: number;
  /** False whenever offsets are missing or the tail was never reached. */
  pagination_complete: boolean;
  oldest_observed_position_at: string;
  newest_observed_position_at: string;
  window_7d: {
    start: string;
    end: string;
    positions_in_window: number;
    observed_positive_pnl_sum_lower_bound: number;
    positions_in_window_detail: {
      closed_at: string;
      realized_pnl: number;
      avg_price: number;
      cur_price: number;
      title: string;
    }[];
  };
  realized_pnl_scale: {
    interpretation: "decimal USDC";
    evidence: string;
    sample: number;
    ratio_min: number;
    ratio_median: number;
    ratio_max: number;
    note: string;
  };
  selection_bias: string;
  leaderboard_cross_check: {
    leaderboard_pnl_30d: number;
    observed_7d_positive_sum: number;
    note: string;
  };
}

export interface ActivityObservation {
  artifact: string;
  source: string;
  source_url: string | null;
  http_status: number | null;
  response_headers: FixtureResponseHeaders;
  as_of: string | null;
  as_of_source: AsOfSourceLiteral;
  response_hash: string;
  rows_returned: number;
  rows_returned_at_limit_1000: number;
  page_size_ceiling_observed: number;
  offset_cap_observed: number;
  offset_cap_error: string | null;
  type_histogram: Record<string, number>;
  deposit_events_observed: number;
  reward_events_observed: number;
  redeem_events_observed: number;
  merge_events_observed: number;
  reach_oldest_at: string;
  reach_newest_at: string;
  /** Total reach of `/activity`, measured. Far short of a 7-day window. */
  reach_hours: number;
  note: string;
}

export interface WalletFixture {
  schema_version: string;
  fixture_status: "recorded";
  data_status: "recorded";
  wallet: string;
  leaderboard_rank_30d: number;
  leaderboard_user_name: string;
  captured_at: string;
  observations: {
    trades: TradesObservation;
    closed_positions: ClosedPositionsObservation;
    activity: ActivityObservation;
  };
  endpoints_never_successfully_probed: { endpoint: string; reason: string }[];
  limitations: string[];
}
