import { AnalysisBundle, FinalStateReport } from "@/src/contracts";
import { riskFlags } from "@/src/analysis/risk";

export function finalState(bundle: AnalysisBundle): FinalStateReport {
  const policy_flags = riskFlags(bundle) as FinalStateReport["policy_flags"];
  // C6: an uncomputable coverage rate yields insufficient_evidence, stated
  // explicitly rather than relying on `null < 0.4` coercing to true.
  const coverageBlocks = bundle.wallet_metrics !== null
    && (bundle.wallet_metrics.coverage_rate === null || bundle.wallet_metrics.coverage_rate < 0.4);
  const state = bundle.windows.length === 0 || coverageBlocks ? "insufficient_evidence" : policy_flags.includes("unattributed") ? "unattributed" : "success";
  return { state, data_status: bundle.data_status, policy_flags, limitations: [...new Set(bundle.limitations)] };
}
