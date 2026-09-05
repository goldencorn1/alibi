import { DEFAULTS, WalletMetrics } from "@/src/contracts";

export interface CoverageGate { passed: boolean; rate: number | null; threshold: number; reason: string; }
export function evaluateCoverage(wallet: WalletMetrics | null): CoverageGate {
  if (!wallet) return { passed: true, rate: null, threshold: DEFAULTS.coverageThreshold, reason: "wallet_not_requested" };
  const passed = wallet.coverage_rate >= DEFAULTS.coverageThreshold;
  return { passed, rate: wallet.coverage_rate, threshold: DEFAULTS.coverageThreshold, reason: passed ? "coverage_gate_passed" : "coverage_below_gate" };
}
