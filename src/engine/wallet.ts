import {
  AsOfSource,
  AttributionStatus,
  DEFAULTS,
  DataSourceStatus,
  MetricStatus,
  ReasonCode,
  RepricingWindow,
  Trade,
  TimeWindowRef,
  WalletMetricEnvelopes,
  WalletMetrics,
  WalletTradeAlignment,
} from "@/src/contracts";
import {
  UNITS,
  buildEnvelope,
  evaluateWindowCompleteness,
  flipRateEnvelope,
  medianExposureMinutesEnvelope,
  ninetyDayEnvelope,
  provenanceFromSourceStatus,
} from "@/src/analysis/metric-envelope";

export interface WalletMetricsOptions {
  /** Read-only source records used to populate envelope provenance. */
  sourceStatus?: DataSourceStatus[];
  /**
   * Server-derived freshness from `deriveAsOf`. Never pass a locally generated
   * timestamp: the client's completion time is not a freshness claim.
   */
  asOf?: string | null;
  asOfSource?: AsOfSource;
  /**
   * False when the trade pager stopped before exhausting history, e.g. at the
   * measured `offset` cap of 10000.
   */
  paginationComplete?: boolean;
}

export function calculateWalletMetrics(
  trades: Trade[],
  windows: RepricingWindow[],
  analysisEnd = new Date(),
  walletWindowDays = DEFAULTS.walletWindowDays,
  options: WalletMetricsOptions = {},
): WalletMetrics {
  const end = analysisEnd.getTime();
  const start = end - walletWindowDays * 24 * 60 * 60 * 1000;
  const observed = trades.filter((trade) => {
    const time = Date.parse(trade.timestamp);
    return Number.isFinite(time) && time >= start && time <= end;
  });
  const alignments = observed.map((trade) => alignTrade(trade, windows));
  const aligned = alignments.filter((alignment) => alignment.included_in_coverage);
  /**
   * C6: this was `observed.length === 0 ? 0 : ...`, the origin of the zero-sample
   * collapse. With no observed trades there is no denominator, so the rate is
   * undefined - not 0%. Reporting 0 asserted "none of this wallet's trades align
   * with any repricing window", the strongest negative claim available, from zero
   * evidence. It is now null with an explicit status and reason code.
   */
  const coverageRate = observed.length === 0 ? null : aligned.length / observed.length;
  /**
   * D8: `complete` replaces the old `available`. `MetricStatus` now answers only
   * "is this computable", with `complete`/`partial`/`unavailable`/
   * `insufficient_evidence`. A measured rate over the observed samples is
   * `complete`; no samples is `unavailable`, never a 0 rate.
   */
  const coverageStatus: MetricStatus = coverageRate === null ? "unavailable" : "complete";
  /**
   * `incomplete_window`, not `coverage_below_gate`: nothing was measured below
   * the gate. The observation window simply contained no trades, so there is no
   * rate to compare against the threshold.
   */
  const coverageReasonCode: ReasonCode | null = coverageRate === null ? "incomplete_window" : null;
  /** A null rate can never satisfy the gate; absence of evidence is not a pass. */
  const coverageBelowGate = coverageRate === null || coverageRate < DEFAULTS.coverageThreshold;
  const attributableProfitable = alignments.filter((alignment) => {
    const window = windows.find((candidate) => candidate.id === alignment.window_id);
    return Boolean(window && isAttributable(window.attribution_status) && (alignment.estimated_directional_return ?? 0) > 0);
  });
  const earlyProfitable = attributableProfitable.filter((alignment) => alignment.time_relation === "before");
  const leadRate = coverageBelowGate || attributableProfitable.length === 0
    ? null
    : earlyProfitable.length / attributableProfitable.length;
  const status = coverageBelowGate
    ? "insufficient_evidence"
    : leadRate !== null && leadRate >= 0.5
      ? "information_pattern"
      : "judgment_pattern";

  const dataStatus = trades[0]?.data_status ?? "synthetic";
  const observedTimes = observed
    .map((trade) => Date.parse(trade.timestamp))
    .filter((time) => Number.isFinite(time));
  const requestedWindow: TimeWindowRef = {
    start: new Date(start).toISOString(),
    end: new Date(end).toISOString(),
  };
  /**
   * Window completeness is judged, not assumed. `pagination_complete` defaults
   * to false: unless a caller has positively established that it exhausted the
   * pager, we must not claim a complete window. Silence is not proof of
   * completeness.
   */
  const completeness = evaluateWindowCompleteness({
    requested_start_ms: start,
    requested_end_ms: end,
    oldest_observed_ms: observedTimes.length ? Math.min(...observedTimes) : null,
    newest_observed_ms: observedTimes.length ? Math.max(...observedTimes) : null,
    pagination_complete: options.paginationComplete ?? false,
  });
  const provenance = provenanceFromSourceStatus(options.sourceStatus ?? []);
  const envelopeBase = {
    data_status: dataStatus,
    requested_window: requestedWindow,
    observed_window: completeness.observed_window,
    as_of: options.asOf ?? null,
    as_of_source: options.asOfSource ?? ("unknown" as const),
    source_provenance: provenance,
  };

  /**
   * A measured rate over a window we only partially covered is `partial`, not
   * `complete`: the number is real but must be read with `observed_window`.
   */
  const coverageEnvelope = coverageRate === null
    ? buildEnvelope<number>({
        ...envelopeBase,
        unit: UNITS.ratio,
        value: null,
        metric_status: "unavailable",
        reason_code: coverageReasonCode ?? "incomplete_window",
        sample_size: observed.length,
        eligible_sample_size: aligned.length,
        coverage: completeness.coverage,
        limitations: ["观察窗口内没有交易样本，覆盖率不可计算（非 0%）。"],
      })
    : buildEnvelope<number>({
        ...envelopeBase,
        unit: UNITS.ratio,
        value: coverageRate,
        metric_status: completeness.metric_status === "complete" ? "complete" : "partial",
        reason_code: completeness.metric_status === "complete" ? null : completeness.reason_code,
        sample_size: observed.length,
        eligible_sample_size: aligned.length,
        coverage: completeness.coverage,
      });

  /**
   * Lead rate has three distinct null causes and they must not share a code:
   * no samples at all (`incomplete_window`), a rate measured below the coverage
   * gate (`coverage_below_gate`), and coverage passing but no attributable
   * profitable trades to form a denominator. The last is
   * `insufficient_evidence` at the status level: samples exist but do not clear
   * the evidentiary bar, which is not the same as never having looked.
   */
  const leadEnvelope = leadRate === null
    ? buildEnvelope<number>({
        ...envelopeBase,
        unit: UNITS.ratio,
        value: null,
        metric_status: coverageRate === null ? "unavailable" : "insufficient_evidence",
        reason_code: coverageRate === null ? "incomplete_window" : "coverage_below_gate",
        sample_size: attributableProfitable.length,
        eligible_sample_size: earlyProfitable.length,
        coverage: completeness.coverage,
        limitations: coverageRate === null
          ? ["没有交易样本，不输出先手率。"]
          : coverageRate < DEFAULTS.coverageThreshold
            ? ["覆盖率低于门槛，不输出先手率。"]
            : ["没有可归因的获利交易作为分母，不输出先手率（非 0）。"],
      })
    : buildEnvelope<number>({
        ...envelopeBase,
        unit: UNITS.ratio,
        value: leadRate,
        metric_status: completeness.metric_status === "complete" ? "complete" : "partial",
        reason_code: completeness.metric_status === "complete" ? null : completeness.reason_code,
        sample_size: attributableProfitable.length,
        eligible_sample_size: earlyProfitable.length,
        coverage: completeness.coverage,
      });

  const metricEnvelopes: WalletMetricEnvelopes = {
    coverage_rate: coverageEnvelope,
    information_lead_rate: leadEnvelope,
    // Requested 90d cannot be satisfied by ~20.72d of measured history.
    ninety_day_trade_count: ninetyDayEnvelope<number>({
      unit: UNITS.count,
      data_status: dataStatus,
      requested_window: requestedWindow,
      observed_window: completeness.observed_window,
      sample_size: observed.length,
      as_of: options.asOf ?? null,
      as_of_source: options.asOfSource ?? "unknown",
      source_provenance: provenance,
    }),
    // No exit leg in the feed; these stay null rather than 0.
    flip_rate: flipRateEnvelope({
      data_status: dataStatus,
      requested_window: requestedWindow,
      observed_window: completeness.observed_window,
      sample_size: observed.length,
      as_of: options.asOf ?? null,
      as_of_source: options.asOfSource ?? "unknown",
      source_provenance: provenance,
    }),
    median_exposure_minutes: medianExposureMinutesEnvelope({
      data_status: dataStatus,
      requested_window: requestedWindow,
      observed_window: completeness.observed_window,
      sample_size: observed.length,
      as_of: options.asOf ?? null,
      as_of_source: options.asOfSource ?? "unknown",
      source_provenance: provenance,
    }),
  };

  return {
    wallet: observed[0]?.wallet ?? trades[0]?.wallet ?? "unknown",
    analysis_start: new Date(start).toISOString(),
    analysis_end: new Date(end).toISOString(),
    observed_trades: observed.length,
    aligned_trades: aligned.length,
    coverage_rate: coverageRate,
    coverage_rate_status: coverageStatus,
    coverage_rate_reason_code: coverageReasonCode,
    attributable_profitable_trades: attributableProfitable.length,
    early_profitable_trades: earlyProfitable.length,
    information_lead_rate: leadRate,
    status,
    estimated_return_note: "收益数据为估算（size × price_change），非精确结算结果；时间先后不等于因果或信息优势。",
    alignments,
    limitations: [
      "未实现仓位结算、赎回和精确 PnL。",
      "长期持仓和未完整映射交易可能造成时间对齐偏差。",
      // C6: distinguish "no samples" from "measured below the gate". Both block
      // the lead rate, but they are different evidentiary situations and must
      // not share one message.
      ...(coverageRate === null
        ? ["观察窗口内没有交易样本，覆盖率不可计算（非 0%），不输出先手率或能力结论。"]
        : coverageRate < DEFAULTS.coverageThreshold
          ? ["覆盖率低于 40%，不输出先手率或能力结论。"]
          : []),
      // D8: the 90-day window and all exit-derived metrics are unavailable by
      // measurement, not by configuration. Stated here so the limitation
      // survives even if a consumer ignores the envelopes.
      `请求的 ${DEFAULTS.walletWindowDays} 日窗口无法由实测约 20.72 天的 /trades 历史满足；90 日指标标记为不可计算。`,
      "未观测到退出事件（实测 /trades 全为 side=BUY），flip_rate 与 median_exposure_minutes 不可计算，且不为 0。",
    ],
    data_status: dataStatus,
    metric_envelopes: metricEnvelopes,
  };
}

function alignTrade(trade: Trade, windows: RepricingWindow[]): WalletTradeAlignment {
  const candidates = windows.filter((window) => window.market_id === trade.market_id && (!trade.token_id || window.token_id === trade.token_id));
  const candidate = candidates
    .sort((a, b) => Math.abs(Date.parse(a.start_at) - Date.parse(trade.timestamp)) - Math.abs(Date.parse(b.start_at) - Date.parse(trade.timestamp)))[0];
  if (!candidate || trade.price === null || trade.size === null) {
    return {
      trade,
      window_id: candidate?.id ?? null,
      time_relation: "unmatched",
      estimated_directional_return: null,
      included_in_coverage: false,
      exclusion_reason: candidate ? "Missing price or size." : "No matching market/token repricing window.",
    };
  }
  const tradeAt = Date.parse(trade.timestamp);
  const startAt = Date.parse(candidate.start_at);
  const endAt = Date.parse(candidate.end_at);
  const timeRelation = tradeAt < startAt ? "before" : tradeAt <= endAt ? "during" : "after";
  const change = candidate.end_price - candidate.start_price;
  const directionMatches = (trade.side === "BUY" && candidate.direction === "UP") || (trade.side === "SELL" && candidate.direction === "DOWN");
  const directionalReturn = directionMatches ? trade.size * Math.abs(change) : -trade.size * Math.abs(change);
  return {
    trade,
    window_id: candidate.id,
    time_relation: timeRelation,
    estimated_directional_return: directionalReturn,
    included_in_coverage: true,
    exclusion_reason: null,
  };
}

function isAttributable(status: AttributionStatus): boolean {
  return status === "information_consistent" || status === "capital_consistent";
}
