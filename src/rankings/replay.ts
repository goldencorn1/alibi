import { WalletMetrics } from "@/src/contracts";
import { makeRankingCheckpoint } from "@/src/rankings/checkpoint";
import { rankWallets, WalletRankingRow } from "@/src/rankings/ranker";

export interface RankingReplay { checkpoint: ReturnType<typeof makeRankingCheckpoint>; rows: WalletRankingRow[]; data_status: "recorded"; limitations: string[]; }
export function replayRanking(metrics: WalletMetrics[]): RankingReplay {
  const rows = metrics.map((metric) => ({ wallet: metric.wallet, observed_trades: metric.observed_trades, markets: new Set(metric.alignments.map((item) => item.trade.market_id)).size, first_seen: metric.analysis_start, last_seen: metric.analysis_end, data_status: metric.data_status }));
  return { checkpoint: makeRankingCheckpoint(rows, "recorded"), rows: rankWallets(metrics), data_status: "recorded", limitations: ["Recorded ranking replay is not a live leaderboard and does not establish skill, identity, or causality."] };
}
