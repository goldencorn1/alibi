import { DEESMetrics, WalletMetrics } from "@/src/contracts";

/** Deterministic Decision–Evidence–Execution Score; never a claim of identity or skill. */
export function calculateDEES(wallet: WalletMetrics | null): DEESMetrics {
  if (!wallet) return { wallet: null, decision_count: 0, evidence_supported_decisions: 0, execution_count: 0, execution_alignment: null, strategy_score: null, coverage_rate: null, status: "not_applicable", data_status: "recorded" };
  const supported = wallet.attributable_profitable_trades;
  const execution = wallet.observed_trades;
  const alignment = execution === 0 ? null : wallet.aligned_trades / execution;
  const strategy = wallet.information_lead_rate === null ? null : (supported / Math.max(1, execution)) * wallet.information_lead_rate;
  return { wallet: wallet.wallet, decision_count: execution, evidence_supported_decisions: supported, execution_count: wallet.aligned_trades, execution_alignment: alignment, strategy_score: strategy, coverage_rate: wallet.coverage_rate, status: wallet.coverage_rate >= 0.4 ? "eligible" : "insufficient_evidence", data_status: wallet.data_status };
}
