import { DEFAULTS, ReasonCode, WalletMetrics } from "@/src/contracts";

export interface CoverageGate { passed: boolean; rate: number | null; threshold: number; reason: string; reason_code: ReasonCode | null; }
export function evaluateCoverage(wallet: WalletMetrics | null): CoverageGate {
  if (!wallet) return { passed: true, rate: null, threshold: DEFAULTS.coverageThreshold, reason: "wallet_not_requested", reason_code: null };
  /**
   * C6: an uncomputable rate must not pass the gate. This is written as an
   * explicit null check rather than relying on `null >= 0.4` coercing to false,
   * so the intent survives refactoring: absence of evidence is not a pass.
   */
  if (wallet.coverage_rate === null) {
    return {
      passed: false,
      rate: null,
      threshold: DEFAULTS.coverageThreshold,
      reason: "coverage_rate_unavailable",
      reason_code: wallet.coverage_rate_reason_code ?? "incomplete_window",
    };
  }
  const passed = wallet.coverage_rate >= DEFAULTS.coverageThreshold;
  return { passed, rate: wallet.coverage_rate, threshold: DEFAULTS.coverageThreshold, reason: passed ? "coverage_gate_passed" : "coverage_below_gate", reason_code: passed ? null : "coverage_below_gate" };
}
