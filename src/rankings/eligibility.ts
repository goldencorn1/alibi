import { WalletMetrics } from "@/src/contracts";
import { evaluateCoverage } from "@/src/analysis/coverage";

export interface RankingEligibility { eligible: boolean; reason: "coverage_gate_passed" | "coverage_below_gate" | "no_metrics"; }
export function rankingEligibility(metrics: WalletMetrics | null): RankingEligibility {
  if (!metrics) return { eligible: false, reason: "no_metrics" };
  return evaluateCoverage(metrics).passed ? { eligible: true, reason: "coverage_gate_passed" } : { eligible: false, reason: "coverage_below_gate" };
}
