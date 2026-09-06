import { MetricEnvelope, SourceProvenance, TimeWindowRef } from "@/src/contracts";
import {
  UNITS,
  buildEnvelope,
  deriveAsOf,
  evaluateWindowCompleteness,
  flipRateEnvelope,
  medianExposureMinutesEnvelope,
  ninetyDayEnvelope,
  unavailableEnvelope,
} from "@/src/analysis/metric-envelope";
import { WALLET_FIXTURE } from "@/src/wallet-discovery/fixture-loader";
import {
  ActivityObservation,
  ClosedPositionsObservation,
  TradesObservation,
} from "@/src/wallet-discovery/fixture-types";

/**
 * Outcome metrics for the one wallet with captured detail.
 *
 * Every value here is computed from recorded bytes; every null carries the
 * measured constraint that made it uncomputable. Two metrics the brief expected
 * to be computable are deliberately null — see `realizedPnl7d` and `winRate`.
 */

const trades: TradesObservation = WALLET_FIXTURE.observations.trades;
const closed: ClosedPositionsObservation = WALLET_FIXTURE.observations.closed_positions;
const activity: ActivityObservation = WALLET_FIXTURE.observations.activity;

/**
 * `as_of` is re-derived through the shared helper from the stored response
 * headers rather than read back from the fixture, so the freshness claim is
 * produced by the same code path the rest of the system uses. The client clock
 * is never consulted.
 */
const tradesAsOf = deriveAsOf(trades.response_headers);
const closedAsOf = deriveAsOf(closed.response_headers);
const activityAsOf = deriveAsOf(activity.response_headers);

function provenance(
  source: string,
  source_url: string | null,
  http_status: number | null,
  retrieved_at: string | null,
  response_hash: string | null,
): SourceProvenance[] {
  return [
    {
      source,
      source_url,
      endpoint: source,
      data_status: "recorded",
      retrieved_at,
      http_status,
      response_hash,
    },
  ];
}

const TRADES_PROVENANCE = provenance(
  trades.source,
  trades.source_url,
  trades.http_status,
  tradesAsOf.as_of,
  trades.response_hash,
);

const CLOSED_PROVENANCE: SourceProvenance[] = closed.pages_captured.map((page) => ({
  source: closed.source,
  source_url: page.source_url,
  endpoint: `${closed.source}?offset=${page.offset}`,
  data_status: "recorded",
  retrieved_at: closedAsOf.as_of,
  http_status: closed.http_status,
  response_hash: page.response_hash,
}));

const ACTIVITY_PROVENANCE = provenance(
  activity.source,
  activity.source_url,
  activity.http_status,
  activityAsOf.as_of,
  activity.response_hash,
);

const REQUESTED_7D: TimeWindowRef = { start: trades.window_7d.start, end: trades.window_7d.end };
const CLOSED_REQUESTED_7D: TimeWindowRef = { start: closed.window_7d.start, end: closed.window_7d.end };

/**
 * Window verdict for `/trades`-derived metrics.
 *
 * `pagination_complete` is true because the 7-day window is fully enclosed by
 * the returned page: the response is timestamp-DESC, so the newest rows are
 * present, and the oldest returned trade predates the window start. The 10000
 * row limit truncates history OLDER than the window, which cannot affect a
 * 7-day figure. (A 90-day figure is a different story — see `ninetyDay`.)
 */
const tradesWindow = evaluateWindowCompleteness({
  requested_start_ms: Date.parse(trades.window_7d.start),
  requested_end_ms: Date.parse(trades.window_7d.end),
  oldest_observed_ms: Date.parse(trades.oldest_observed_trade_at),
  newest_observed_ms: Date.parse(trades.newest_observed_trade_at),
  pagination_complete: trades.window_7d.window_start_covered,
  integrity_checks_passed: trades.duplicate_rows_after_dedup === 0,
});

const TRADES_LIMITATIONS = [
  `观测窗口来自响应头 date（as_of_source=${tradesAsOf.as_of_source}），非本地时钟。`,
  `/trades 返回 ${trades.rows_returned} 行、跨度约 ${trades.observed_span_days.toFixed(2)} 天；` +
    `7 日窗口起点被覆盖（oldest=${trades.oldest_observed_trade_at}），故 7 日口径可计算。`,
  `offset 硬封顶 ${trades.offset_cap_observed}（越界报错：${trades.offset_cap_error ?? "n/a"}），仅截断更早历史。`,
];

/** `Σ(price×size)/Σ(size)` over the 7-day window. Share-weighted, not per-trade mean. */
export const avgBuyPrice7d: MetricEnvelope<number> = buildEnvelope<number>({
  value: trades.window_7d.size_weighted_avg_buy_price,
  unit: UNITS.ratio,
  metric_status: tradesWindow.metric_status,
  reason_code: tradesWindow.reason_code,
  data_status: "recorded",
  requested_window: REQUESTED_7D,
  observed_window: tradesWindow.observed_window,
  as_of: tradesAsOf.as_of,
  as_of_source: tradesAsOf.as_of_source,
  sample_size: trades.window_7d.trades_in_window,
  eligible_sample_size: trades.window_7d.trades_in_window,
  coverage: tradesWindow.coverage,
  source_provenance: TRADES_PROVENANCE,
  limitations: [
    ...TRADES_LIMITATIONS,
    `按份额加权：Σ(price×size)/Σ(size)，Σsize=${trades.window_7d.size_sum_in_window}。非逐笔算术平均。`,
    "仅含买入腿（实测无卖出腿），因此这是建仓均价，不是往返成交均价。",
  ],
});

export const totalTrades7d: MetricEnvelope<number> = buildEnvelope<number>({
  value: trades.window_7d.trades_in_window,
  unit: UNITS.count,
  metric_status: tradesWindow.metric_status,
  reason_code: tradesWindow.reason_code,
  data_status: "recorded",
  requested_window: REQUESTED_7D,
  observed_window: tradesWindow.observed_window,
  as_of: tradesAsOf.as_of,
  as_of_source: tradesAsOf.as_of_source,
  sample_size: trades.window_7d.trades_in_window,
  eligible_sample_size: trades.window_7d.trades_in_window,
  coverage: tradesWindow.coverage,
  source_provenance: TRADES_PROVENANCE,
  limitations: [
    ...TRADES_LIMITATIONS,
    `去重校验：${trades.unique_transaction_hashes} 个唯一 transactionHash / ${trades.rows_returned} 行，重复 ${trades.duplicate_rows_after_dedup} 行。`,
  ],
});

/** Distinct `conditionId` traded in the window. Markets, not tokens/outcomes. */
export const activeMarkets7d: MetricEnvelope<number> = buildEnvelope<number>({
  value: trades.window_7d.unique_condition_ids_in_window,
  unit: UNITS.count,
  metric_status: tradesWindow.metric_status,
  reason_code: tradesWindow.reason_code,
  data_status: "recorded",
  requested_window: REQUESTED_7D,
  observed_window: tradesWindow.observed_window,
  as_of: tradesAsOf.as_of,
  as_of_source: tradesAsOf.as_of_source,
  sample_size: trades.window_7d.trades_in_window,
  eligible_sample_size: trades.window_7d.unique_condition_ids_in_window,
  coverage: tradesWindow.coverage,
  source_provenance: TRADES_PROVENANCE,
  limitations: [...TRADES_LIMITATIONS, "按 conditionId 去重（市场层级），不按 asset/outcome 去重。"],
});

export const lastTradeAt: MetricEnvelope<string> = buildEnvelope<string>({
  value: trades.newest_observed_trade_at,
  unit: UNITS.none,
  metric_status: "complete",
  data_status: "recorded",
  requested_window: REQUESTED_7D,
  observed_window: tradesWindow.observed_window,
  as_of: tradesAsOf.as_of,
  as_of_source: tradesAsOf.as_of_source,
  sample_size: trades.rows_returned,
  eligible_sample_size: trades.rows_returned,
  coverage: null,
  source_provenance: TRADES_PROVENANCE,
  limitations: [
    "上游 timestamp 为 10 位 epoch 秒，已按秒解释后转 ISO。",
    `这是快照内最新一笔，不等于「此后无交易」；第二次快照（相隔约 31 分钟）新增 ${trades.snapshot_consistency.rows_only_in_second_snapshot} 行可证。`,
  ],
});

/**
 * MEASURED SELECTION BIAS — why this is null instead of 222710.5082.
 *
 * `/closed-positions` sorts `realizedPnl DESC`. The captured offsets are
 * 0-139 and 500-549, so offsets 140-499 were never fetched, and offset 500
 * still returned a FULL page of 50 rows whose smallest value is positive.
 * Total positions is therefore >= 550 and the entire losing tail is outside
 * the sample: all 190 observed positions have realizedPnl > 0.
 *
 * Summing the in-window subset yields +222,710 USDC while the same wallet's
 * upstream 30-day net PnL is +118,282 — the 7-day "sum" is ~1.9x the 30-day
 * net. Publishing it would state a net result computed from winners only.
 * `pagination_cap` is the honest verdict.
 */
export const realizedPnl7d: MetricEnvelope<number> = unavailableEnvelope<number>({
  unit: UNITS.usdc,
  reason_code: "pagination_cap",
  data_status: "recorded",
  requested_window: CLOSED_REQUESTED_7D,
  observed_window: {
    start: closed.oldest_observed_position_at,
    end: closed.newest_observed_position_at,
  },
  as_of: closedAsOf.as_of,
  as_of_source: closedAsOf.as_of_source,
  sample_size: closed.window_7d.positions_in_window,
  eligible_sample_size: 0,
  source_provenance: CLOSED_PROVENANCE,
  limitations: [
    `端点排序为 ${closed.sort_order_observed}（逐页校验通过=${closed.sort_order_verified_per_page}），非按时间排序。`,
    `已采集 offset 区间 ${JSON.stringify(closed.offset_ranges_captured)}，缺口 ${JSON.stringify(closed.offset_ranges_missing)}。`,
    `offset 500 仍返回满页 ${closed.pages_captured[3]?.rows ?? 50} 行且最小值 ${closed.pages_captured[3]?.realized_pnl_min ?? 0} > 0，故总仓位数 >= ${closed.total_positions_lower_bound}。`,
    `已观测 ${closed.unique_positions_observed} 个仓位中正收益 ${closed.positions_with_positive_pnl}、负收益 ${closed.positions_with_negative_pnl}：亏损尾部完全缺失。`,
    `窗口内已观测正收益之和 ${closed.window_7d.observed_positive_pnl_sum_lower_bound.toFixed(4)} USDC 仅是下界；` +
      `对照上游 30 日净 PnL ${closed.leaderboard_cross_check.leaderboard_pnl_30d.toFixed(2)} USDC，该下界已近其 1.9 倍，证明净额不可从此样本得出。`,
    `尺度已判定为 ${closed.realized_pnl_scale.interpretation}（比值中位数 ${closed.realized_pnl_scale.ratio_median.toFixed(4)}）：不得再除 1e6。`,
    "不输出观测子集之和作为 7 日已实现盈亏：那会把「赢家子集」当作「净结果」发布。",
  ],
});

/**
 * Null for the same measured reason as `realizedPnl7d`.
 *
 * The observed sample is 190/190 winners by construction of the sort order, so
 * the arithmetic answer is exactly 1.0 (and 3/3 within the window). A published
 * 100% win rate would be a statement about the endpoint's ORDER BY clause, not
 * about the wallet. Denominator would be positions, not trades — but no
 * denominator rescues a winners-only numerator.
 */
export const winRate7d: MetricEnvelope<number> = unavailableEnvelope<number>({
  unit: UNITS.ratio,
  reason_code: "pagination_cap",
  data_status: "recorded",
  requested_window: CLOSED_REQUESTED_7D,
  observed_window: {
    start: closed.oldest_observed_position_at,
    end: closed.newest_observed_position_at,
  },
  as_of: closedAsOf.as_of,
  as_of_source: closedAsOf.as_of_source,
  sample_size: closed.window_7d.positions_in_window,
  eligible_sample_size: 0,
  source_provenance: CLOSED_PROVENANCE,
  limitations: [
    `分母口径应为仓位数（非交易数）；窗口内已观测仓位仅 ${closed.window_7d.positions_in_window} 个。`,
    `已观测样本 100% 为正收益（${closed.positions_with_positive_pnl}/${closed.unique_positions_observed}），` +
      "系 realizedPnl DESC 排序 + 分页缺口所致，直接计算恒得 1.0。",
    "发布 1.0 会把排序副作用陈述为「胜率 100%」；因此标记为不可计算。",
    "需要完整分页（含亏损尾部）后才能计算，届时应同时给出分母与覆盖率。",
  ],
});

/** `/trades` exposes no exit leg: all 10000 sampled rows are `side=BUY`. */
export const flipRate7d: MetricEnvelope<number> = flipRateEnvelope({
  data_status: "recorded",
  requested_window: REQUESTED_7D,
  observed_window: tradesWindow.observed_window,
  as_of: tradesAsOf.as_of,
  as_of_source: tradesAsOf.as_of_source,
  sample_size: trades.window_7d.trades_in_window,
  source_provenance: TRADES_PROVENANCE,
});

export const medianExposureMinutes7d: MetricEnvelope<number> = medianExposureMinutesEnvelope({
  data_status: "recorded",
  requested_window: REQUESTED_7D,
  observed_window: tradesWindow.observed_window,
  as_of: tradesAsOf.as_of,
  as_of_source: tradesAsOf.as_of_source,
  sample_size: trades.window_7d.trades_in_window,
  source_provenance: TRADES_PROVENANCE,
});

/**
 * `/public-profile` was never successfully probed in this capture, and none of
 * the five probed endpoints exposes `createdAt`.
 */
export const profileAgeDays: MetricEnvelope<number> = unavailableEnvelope<number>({
  unit: UNITS.days,
  reason_code: "profile_endpoint_unverified",
  data_status: "recorded",
  requested_window: REQUESTED_7D,
  observed_window: null,
  as_of: null,
  as_of_source: "unknown",
  sample_size: 0,
  eligible_sample_size: 0,
  source_provenance: [],
  limitations: [
    "/public-profile 在本次采集中不存在任何 artifact，从未成功探测。",
    "已探测的 leaderboard / trades / activity / closed-positions / prices-history 均不暴露 createdAt。",
    "首次观测到的交易时间只是采样下界，不能当作账户创建时间。",
    "as_of 为 null 表示新鲜度未知，不代表「当前」。",
  ],
});

/**
 * `/activity` reaches only ~7.48 hours (page size ceiling 500, offset cap
 * 5000), so the absence of DEPOSIT rows is a window artifact.
 */
const ACTIVITY_LIMITATIONS = [
  `/activity 全量触达约 ${activity.reach_hours.toFixed(2)} 小时（${activity.reach_oldest_at} → ${activity.reach_newest_at}），远小于 7 日窗口。`,
  `page size 上限 ${activity.page_size_ceiling_observed}（limit=1000 仍只返回 ${activity.rows_returned_at_limit_1000} 行）；offset 上限 ${activity.offset_cap_observed}（越界：${activity.offset_cap_error ?? "n/a"}）。`,
  `窗口内事件类型分布 ${JSON.stringify(activity.type_histogram)}：DEPOSIT=${activity.deposit_events_observed}、REWARD=${activity.reward_events_observed}。`,
  "触达内为零不等于不存在；因此不填 0，也不断言无入金/无返佣。",
];

export const firstDepositAt: MetricEnvelope<string> = unavailableEnvelope<string>({
  unit: UNITS.none,
  reason_code: "incomplete_window",
  data_status: "recorded",
  requested_window: REQUESTED_7D,
  observed_window: { start: activity.reach_oldest_at, end: activity.reach_newest_at },
  as_of: activityAsOf.as_of,
  as_of_source: activityAsOf.as_of_source,
  sample_size: activity.rows_returned,
  eligible_sample_size: activity.deposit_events_observed,
  source_provenance: ACTIVITY_PROVENANCE,
  limitations: ACTIVITY_LIMITATIONS,
});

/** Reported as its own line. Never folded into realized PnL. */
export const rebateIncome7d: MetricEnvelope<number> = unavailableEnvelope<number>({
  unit: UNITS.usdc,
  reason_code: "incomplete_window",
  data_status: "recorded",
  requested_window: REQUESTED_7D,
  observed_window: { start: activity.reach_oldest_at, end: activity.reach_newest_at },
  as_of: activityAsOf.as_of,
  as_of_source: activityAsOf.as_of_source,
  sample_size: activity.rows_returned,
  eligible_sample_size: activity.reward_events_observed,
  source_provenance: ACTIVITY_PROVENANCE,
  limitations: [...ACTIVITY_LIMITATIONS, "返佣单列，不并入已实现盈亏，避免把补贴计为交易收益。"],
});

/** The `/value` endpoint has no implementation in this codebase. */
export const portfolioValue: MetricEnvelope<number> = unavailableEnvelope<number>({
  unit: UNITS.usdc,
  reason_code: "provider_unavailable",
  data_status: "recorded",
  requested_window: null,
  observed_window: null,
  as_of: null,
  as_of_source: "unknown",
  sample_size: 0,
  eligible_sample_size: 0,
  source_provenance: [],
  limitations: ["/value 端点零实现、未采集，无法给出组合估值。", "不用持仓成本或榜单 vol 近似估值。"],
});

/** Requires Gamma category taxonomy, which was never captured. */
export const categoryMix: MetricEnvelope<Record<string, number>> = unavailableEnvelope<Record<string, number>>({
  unit: UNITS.ratio,
  reason_code: "provider_unavailable",
  data_status: "recorded",
  requested_window: REQUESTED_7D,
  observed_window: tradesWindow.observed_window,
  as_of: null,
  as_of_source: "unknown",
  sample_size: trades.window_7d.trades_in_window,
  eligible_sample_size: 0,
  source_provenance: [],
  limitations: [
    "未采集 Gamma 类目映射，无法把 conditionId 归入类目。",
    "不用 title/slug 关键词猜测类目：那是推断而非观测。",
  ],
});

/**
 * No repricing series was captured for this wallet, so the source-vs-market
 * sequence that a lead rate requires cannot be established.
 */
export const informationLeadRate7d: MetricEnvelope<number> = unavailableEnvelope<number>({
  unit: UNITS.ratio,
  reason_code: "provider_unavailable",
  data_status: "recorded",
  requested_window: REQUESTED_7D,
  observed_window: tradesWindow.observed_window,
  as_of: null,
  as_of_source: "unknown",
  sample_size: trades.window_7d.trades_in_window,
  eligible_sample_size: 0,
  source_provenance: [],
  limitations: [
    "本钱包未采集任何 clob prices-history 重定价序列，无法建立 observed_sequence。",
    "缺少 source_lead_minutes / repricing_lead_minutes 观测，不输出单一 lead 值，也不做因果表述。",
  ],
});

/** Any 90-day metric. Always unavailable: measured history is ~20.72 days. */
export const ninetyDayRealizedPnl: MetricEnvelope<number> = ninetyDayEnvelope<number>({
  unit: UNITS.usdc,
  data_status: "recorded",
  requested_window: null,
  observed_window: tradesWindow.observed_window,
  sample_size: trades.rows_returned,
  eligible_sample_size: 0,
  as_of: tradesAsOf.as_of,
  as_of_source: tradesAsOf.as_of_source,
  source_provenance: TRADES_PROVENANCE,
  extra_limitations: [`实测 /trades 跨度 ${trades.observed_span_days.toFixed(2)} 天。`],
});

export const ninetyDayWinRate: MetricEnvelope<number> = ninetyDayEnvelope<number>({
  unit: UNITS.ratio,
  data_status: "recorded",
  requested_window: null,
  observed_window: tradesWindow.observed_window,
  sample_size: closed.unique_positions_observed,
  eligible_sample_size: 0,
  as_of: closedAsOf.as_of,
  as_of_source: closedAsOf.as_of_source,
  source_provenance: CLOSED_PROVENANCE,
  extra_limitations: [closed.selection_bias],
});

export interface WalletOutcomeMetrics {
  wallet: string;
  data_status: "recorded";
  as_of: string | null;
  realized_pnl_7d: MetricEnvelope<number>;
  win_rate_7d: MetricEnvelope<number>;
  avg_buy_price_7d: MetricEnvelope<number>;
  total_trades_7d: MetricEnvelope<number>;
  active_markets_7d: MetricEnvelope<number>;
  last_trade_at: MetricEnvelope<string>;
  flip_rate_7d: MetricEnvelope<number>;
  median_exposure_minutes_7d: MetricEnvelope<number>;
  profile_age_days: MetricEnvelope<number>;
  first_deposit_at: MetricEnvelope<string>;
  rebate_income_7d: MetricEnvelope<number>;
  portfolio_value: MetricEnvelope<number>;
  category_mix: MetricEnvelope<Record<string, number>>;
  information_lead_rate_7d: MetricEnvelope<number>;
  realized_pnl_90d: MetricEnvelope<number>;
  win_rate_90d: MetricEnvelope<number>;
}

/**
 * Assembled Outcome metrics. `median_exposure_minutes` stands in for MDD,
 * which is deliberately not produced.
 */
export const DETAIL_WALLET_METRICS: WalletOutcomeMetrics = {
  wallet: WALLET_FIXTURE.wallet,
  data_status: "recorded",
  as_of: tradesAsOf.as_of,
  realized_pnl_7d: realizedPnl7d,
  win_rate_7d: winRate7d,
  avg_buy_price_7d: avgBuyPrice7d,
  total_trades_7d: totalTrades7d,
  active_markets_7d: activeMarkets7d,
  last_trade_at: lastTradeAt,
  flip_rate_7d: flipRate7d,
  median_exposure_minutes_7d: medianExposureMinutes7d,
  profile_age_days: profileAgeDays,
  first_deposit_at: firstDepositAt,
  rebate_income_7d: rebateIncome7d,
  portfolio_value: portfolioValue,
  category_mix: categoryMix,
  information_lead_rate_7d: informationLeadRate7d,
  realized_pnl_90d: ninetyDayRealizedPnl,
  win_rate_90d: ninetyDayWinRate,
};
