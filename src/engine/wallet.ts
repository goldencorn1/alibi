import { AttributionStatus, DEFAULTS, RepricingWindow, Trade, WalletMetrics, WalletTradeAlignment } from "@/src/contracts";

export function calculateWalletMetrics(
  trades: Trade[],
  windows: RepricingWindow[],
  analysisEnd = new Date(),
  walletWindowDays = DEFAULTS.walletWindowDays,
): WalletMetrics {
  const end = analysisEnd.getTime();
  const start = end - walletWindowDays * 24 * 60 * 60 * 1000;
  const observed = trades.filter((trade) => {
    const time = Date.parse(trade.timestamp);
    return Number.isFinite(time) && time >= start && time <= end;
  });
  const alignments = observed.map((trade) => alignTrade(trade, windows));
  const aligned = alignments.filter((alignment) => alignment.included_in_coverage);
  const coverageRate = observed.length === 0 ? 0 : aligned.length / observed.length;
  const attributableProfitable = alignments.filter((alignment) => {
    const window = windows.find((candidate) => candidate.id === alignment.window_id);
    return Boolean(window && isAttributable(window.attribution_status) && (alignment.estimated_directional_return ?? 0) > 0);
  });
  const earlyProfitable = attributableProfitable.filter((alignment) => alignment.time_relation === "before");
  const leadRate = coverageRate < DEFAULTS.coverageThreshold || attributableProfitable.length === 0
    ? null
    : earlyProfitable.length / attributableProfitable.length;
  const status = coverageRate < DEFAULTS.coverageThreshold
    ? "insufficient_evidence"
    : leadRate !== null && leadRate >= 0.5
      ? "information_pattern"
      : "judgment_pattern";

  return {
    wallet: observed[0]?.wallet ?? trades[0]?.wallet ?? "unknown",
    analysis_start: new Date(start).toISOString(),
    analysis_end: new Date(end).toISOString(),
    observed_trades: observed.length,
    aligned_trades: aligned.length,
    coverage_rate: coverageRate,
    attributable_profitable_trades: attributableProfitable.length,
    early_profitable_trades: earlyProfitable.length,
    information_lead_rate: leadRate,
    status,
    estimated_return_note: "收益数据为估算（size × price_change），非精确结算结果；时间先后不等于因果或信息优势。",
    alignments,
    limitations: [
      "未实现仓位结算、赎回和精确 PnL。",
      "长期持仓和未完整映射交易可能造成时间对齐偏差。",
      ...(coverageRate < DEFAULTS.coverageThreshold ? ["覆盖率低于 40%，不输出先手率或能力结论。"] : []),
    ],
    data_status: trades[0]?.data_status ?? "synthetic",
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
