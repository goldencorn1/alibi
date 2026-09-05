import { AnalysisBundle, FinalStateReport } from "@/src/contracts";
import { riskFlags } from "@/src/analysis/risk";

export function finalState(bundle: AnalysisBundle): FinalStateReport {
  const policy_flags = riskFlags(bundle) as FinalStateReport["policy_flags"];
  const state = bundle.windows.length === 0 || (bundle.wallet_metrics !== null && bundle.wallet_metrics.coverage_rate < 0.4) ? "insufficient_evidence" : policy_flags.includes("unattributed") ? "unattributed" : "success";
  return { state, data_status: bundle.data_status, policy_flags, limitations: [...new Set(bundle.limitations)] };
}
