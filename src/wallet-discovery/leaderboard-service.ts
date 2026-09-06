import { MetricEnvelope, ReasonCode, SourceProvenance, requiresNullValue } from "@/src/contracts";
import { UNITS, buildEnvelope, deriveAsOf, unavailableEnvelope } from "@/src/analysis/metric-envelope";
import {
  ATTRIBUTION_FIXTURE_WALLETS,
  DETAIL_WALLET,
  LEADERBOARD_FIXTURE,
} from "@/src/wallet-discovery/fixture-loader";
import { DETAIL_WALLET_METRICS, WalletOutcomeMetrics } from "@/src/wallet-discovery/outcome-metrics";

/**
 * Read-only leaderboard service over the recorded 30-day snapshot.
 *
 * The row set is 20 rows because the fixture retained 20 of the 50 returned.
 * `rank` / `wallet` / `user_name` / `verified_badge` / `vol` / `pnl` are real
 * upstream fields for ALL 20 rows and are shown as such.
 *
 * Exactly one wallet was captured in detail. For the other 19 every metric is
 * `value: null` with a reason code. No metric is interpolated from `vol`/`pnl`,
 * inferred from neighbouring rows, or filled with 0 — an uncaptured wallet is
 * reported as uncaptured.
 */

const snapshotAsOf = deriveAsOf(LEADERBOARD_FIXTURE.source.response_headers);

const LEADERBOARD_PROVENANCE: SourceProvenance[] = [
  {
    source: LEADERBOARD_FIXTURE.source.source,
    source_url: LEADERBOARD_FIXTURE.source.source_url,
    endpoint: LEADERBOARD_FIXTURE.source.source,
    data_status: "recorded",
    retrieved_at: snapshotAsOf.as_of,
    http_status: LEADERBOARD_FIXTURE.source.http_status,
    response_hash: LEADERBOARD_FIXTURE.source.response_hash,
  },
];

/**
 * Reason code for "this wallet was never captured in detail".
 *
 * NOTE: `incomplete_window` is the closest of the eight legal codes, but it is
 * a semantic stretch — the window is not partially covered, it is entirely
 * unobserved. A dedicated code (e.g. `wallet_not_captured`) is requested in the
 * report rather than added here, since REASON_CODES is out of scope.
 */
const NOT_CAPTURED_REASON: ReasonCode = "incomplete_window";

const NOT_CAPTURED_LIMITATIONS = [
  "本钱包未被本次采集覆盖：仅抓取了排行榜行本身，未抓取其 /trades、/closed-positions、/activity。",
  "value=null 表示未观测，不是 0，也不是「无交易」。",
  "不从 vol/pnl 反推任何指标，不用同榜其他钱包插值。",
  `reason_code=${NOT_CAPTURED_REASON} 为八个合法码中最接近者；语义上应为「钱包未捕获」，已在报告中申请专用码。`,
];

function notCaptured<T>(unit: string): MetricEnvelope<T> {
  return unavailableEnvelope<T>({
    unit,
    reason_code: NOT_CAPTURED_REASON,
    data_status: "recorded",
    requested_window: null,
    observed_window: null,
    // Freshness of the leaderboard row, not of any wallet detail.
    as_of: snapshotAsOf.as_of,
    as_of_source: snapshotAsOf.as_of_source,
    sample_size: 0,
    eligible_sample_size: 0,
    coverage: null,
    source_provenance: LEADERBOARD_PROVENANCE,
    limitations: NOT_CAPTURED_LIMITATIONS,
  });
}

/**
 * Re-publish the 7-day trade-window coverage as its own envelope.
 *
 * Coverage rides along on `total_trades_7d`; exposing it as a metric keeps a
 * null coverage from ever being rendered as "0% covered". When the underlying
 * metric is itself uncomputable there is no coverage to report either, so the
 * uncaptured envelope is returned rather than a fabricated ratio.
 */
function coverageEnvelope(metrics: WalletOutcomeMetrics): MetricEnvelope<number> {
  const source = metrics.total_trades_7d;
  if (source.coverage === null || requiresNullValue(source.metric_status)) {
    return notCaptured<number>(UNITS.ratio);
  }
  return buildEnvelope<number>({
    value: source.coverage,
    unit: UNITS.ratio,
    metric_status: source.metric_status,
    reason_code: source.reason_code,
    data_status: "recorded",
    requested_window: source.requested_window,
    observed_window: source.observed_window,
    as_of: source.as_of,
    as_of_source: source.as_of_source,
    sample_size: source.sample_size,
    eligible_sample_size: source.eligible_sample_size,
    coverage: source.coverage,
    source_provenance: source.source_provenance,
    limitations: [
      "coverage 为「请求窗口被观测数据覆盖的比例」，由 evaluateWindowCompleteness 计算。",
      "该值仅描述 /trades 的 7 日窗口覆盖，不代表其他端点（尤其 /closed-positions 分页有缺口）的覆盖。",
    ],
  });
}

/** Display-only upstream fields plus per-metric envelopes. */
export interface LeaderboardServiceRow {
  rank: number;
  rank_raw: string;
  wallet: string;
  user_name: string | null;
  verified_badge: boolean;
  /** Upstream 30d self-reported volume, USDC. Real for every row. */
  vol: number;
  /** Upstream 30d self-reported PnL, USDC. Real for every row. */
  pnl: number;
  /** False when no wallet-level endpoint was captured for this wallet. */
  detail_captured: boolean;
  realized_pnl_7d: MetricEnvelope<number>;
  win_rate_7d: MetricEnvelope<number>;
  avg_buy_price_7d: MetricEnvelope<number>;
  flip_rate_7d: MetricEnvelope<number>;
  median_exposure_minutes_7d: MetricEnvelope<number>;
  last_trade_at: MetricEnvelope<string>;
  information_lead_rate_7d: MetricEnvelope<number>;
  coverage_7d: MetricEnvelope<number>;
  data_status: "recorded";
}

function detailRow(row: (typeof LEADERBOARD_FIXTURE.rows)[number]): LeaderboardServiceRow {
  const metrics: WalletOutcomeMetrics = DETAIL_WALLET_METRICS;
  return {
    rank: row.rank,
    rank_raw: row.rank_raw,
    wallet: row.wallet,
    user_name: row.user_name,
    verified_badge: row.verified_badge,
    vol: row.vol,
    pnl: row.pnl,
    detail_captured: true,
    realized_pnl_7d: metrics.realized_pnl_7d,
    win_rate_7d: metrics.win_rate_7d,
    avg_buy_price_7d: metrics.avg_buy_price_7d,
    flip_rate_7d: metrics.flip_rate_7d,
    median_exposure_minutes_7d: metrics.median_exposure_minutes_7d,
    last_trade_at: metrics.last_trade_at,
    information_lead_rate_7d: metrics.information_lead_rate_7d,
    // Coverage of the 7-day trade window, carried as a metric so a null
    // coverage can never be read as 0% coverage. Built through buildEnvelope
    // so the null-value invariant is enforced rather than spread around.
    coverage_7d: coverageEnvelope(metrics),
    data_status: "recorded",
  };
}

function uncapturedRow(row: (typeof LEADERBOARD_FIXTURE.rows)[number]): LeaderboardServiceRow {
  return {
    rank: row.rank,
    rank_raw: row.rank_raw,
    wallet: row.wallet,
    user_name: row.user_name,
    verified_badge: row.verified_badge,
    vol: row.vol,
    pnl: row.pnl,
    detail_captured: false,
    realized_pnl_7d: notCaptured<number>(UNITS.usdc),
    win_rate_7d: notCaptured<number>(UNITS.ratio),
    avg_buy_price_7d: notCaptured<number>(UNITS.ratio),
    flip_rate_7d: notCaptured<number>(UNITS.ratio),
    median_exposure_minutes_7d: notCaptured<number>(UNITS.minutes),
    last_trade_at: notCaptured<string>(UNITS.none),
    information_lead_rate_7d: notCaptured<number>(UNITS.ratio),
    coverage_7d: notCaptured<number>(UNITS.ratio),
    data_status: "recorded",
  };
}

export interface LeaderboardView {
  window: "30d";
  data_status: "recorded";
  fixture_status: "recorded";
  as_of: string | null;
  as_of_source: string;
  source_url: string;
  rows_available_in_response: number;
  rows: LeaderboardServiceRow[];
  detail_captured_count: number;
  limitations: string[];
}

/** Pure read over the recorded fixture. No network, no clock. */
export function getRecordedLeaderboard(): LeaderboardView {
  const rows = LEADERBOARD_FIXTURE.rows.map((row) =>
    row.wallet.toLowerCase() === DETAIL_WALLET ? detailRow(row) : uncapturedRow(row),
  );
  return {
    window: "30d",
    data_status: "recorded",
    fixture_status: "recorded",
    as_of: snapshotAsOf.as_of,
    as_of_source: snapshotAsOf.as_of_source,
    source_url: LEADERBOARD_FIXTURE.source.source_url,
    rows_available_in_response: LEADERBOARD_FIXTURE.rows_available_in_response,
    rows,
    detail_captured_count: rows.filter((row) => row.detail_captured).length,
    limitations: [
      ...LEADERBOARD_FIXTURE.limitations,
      `20 行中仅 ${rows.filter((r) => r.detail_captured).length} 个钱包有钱包级观测；其余 ${rows.filter((r) => !r.detail_captured).length} 个的指标一律 null。`,
      "rank/wallet/user_name/verified_badge/vol/pnl 对全部 20 行均为上游真实字段。",
      "本视图为 recorded 回放，不得标注 live，也不构成能力、身份或因果判断。",
    ],
  };
}

export type DetailCapability = "outcome" | "attribution";

export interface DetailWalletEntry {
  wallet: string;
  /** Null when the wallet is absent from the recorded top-50 response. */
  rank: number | null;
  capabilities: DetailCapability[];
  fixture: string;
  note: string;
}

/**
 * Wallets that can be opened into a detail view.
 *
 * MEASURED: the two Attribution fixture wallets do NOT appear anywhere in the
 * recorded top-50 leaderboard response, so both carry `rank: null`. They are
 * not injected into the ranked rows and no rank is invented for them; how (or
 * whether) to surface them is a UI decision left to the caller.
 */
export function getDetailWallets(): DetailWalletEntry[] {
  const ranked = new Map(LEADERBOARD_FIXTURE.rows.map((row) => [row.wallet.toLowerCase(), row.rank]));
  const entries: DetailWalletEntry[] = [
    {
      wallet: DETAIL_WALLET,
      rank: ranked.get(DETAIL_WALLET) ?? null,
      capabilities: ["outcome"],
      fixture: `fixtures/recorded/wallet-${DETAIL_WALLET}.json`,
      note: "有 /trades、/closed-positions、/activity 观测，支撑 Outcome 指标（部分指标仍不可计算，见各信封 reason_code）。",
    },
  ];
  for (const wallet of ATTRIBUTION_FIXTURE_WALLETS) {
    entries.push({
      wallet,
      rank: ranked.get(wallet) ?? null,
      capabilities: ["attribution"],
      fixture: `fixtures/recorded/${wallet}.json`,
      note: "有 markets/prices/trades/evidence，支撑 Attribution；实测不在 recorded top-50 榜内，rank 为 null，未伪造名次。",
    });
  }
  return entries;
}
