import { MetricStatus, ReasonCode, WalletMetrics } from "@/src/contracts";
import { rankingEligibility } from "@/src/rankings/eligibility";

/** C6: `coverage_rate` is nullable and carries its status; null never means 0%. */
export interface WalletRankingRow { rank: number | null; wallet: string; score: number | null; coverage_rate: number | null; coverage_rate_status: MetricStatus; coverage_rate_reason_code: ReasonCode | null; eligible: boolean; status: WalletMetrics["status"] | "not_eligible"; data_status: WalletMetrics["data_status"]; }
export function rankWallets(metrics: WalletMetrics[]): WalletRankingRow[] {
  const eligible = metrics.filter((metric) => rankingEligibility(metric).eligible).sort((a, b) => (b.information_lead_rate ?? -1) - (a.information_lead_rate ?? -1));
  const positions = new Map(eligible.map((metric, index) => [metric.wallet, index + 1]));
  return metrics.map((metric) => ({ rank: positions.get(metric.wallet) ?? null, wallet: metric.wallet, score: metric.information_lead_rate, coverage_rate: metric.coverage_rate, coverage_rate_status: metric.coverage_rate_status, coverage_rate_reason_code: metric.coverage_rate_reason_code, eligible: positions.has(metric.wallet), status: positions.has(metric.wallet) ? metric.status : "not_eligible", data_status: metric.data_status }));
}
