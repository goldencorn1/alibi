import { AnalysisBundle, DEFAULTS, FinalStateReport, QualityRiskReport, PolicyFlag } from "@/src/contracts";
import { PlatformAgentContext, QualityRiskAgentResult } from "@/src/agents/contracts";

export function runQualityRiskAgent(bundle: AnalysisBundle, context: PlatformAgentContext): QualityRiskAgentResult {
  const coverage = bundle.wallet_metrics?.coverage_rate ?? null;
  const flags: PolicyFlag[] = [];
  if (coverage !== null && coverage < DEFAULTS.coverageThreshold) flags.push("coverage_below_gate");
  if (bundle.windows.some((window) => window.attribution_status === "unattributed")) flags.push("unattributed");
  if (context.data_status === "recorded") flags.push("recorded_replay");
  if (bundle.cluster_alerts?.some((alert) => alert.state === "insufficient_baseline" || alert.source_state === "unknown")) flags.push("audit_partial");
  const clusterLimitations = bundle.cluster_alerts?.flatMap((alert) => alert.limitations) ?? [];
  const quality: QualityRiskReport = {
    coverage_gate_passed: coverage === null || coverage >= DEFAULTS.coverageThreshold,
    coverage_rate: coverage,
    evidence_count: bundle.evidence.length,
    source_count: bundle.source_status.length,
    risk_flags: flags,
    limitations: [...new Set([...bundle.limitations, ...clusterLimitations])],
    data_status: context.data_status,
  };
  const state: FinalStateReport["state"] = bundle.windows.length === 0 && bundle.markets.length === 0
    ? "insufficient_evidence"
    : coverage !== null && coverage < DEFAULTS.coverageThreshold
        ? "insufficient_evidence"
        : bundle.windows.some((window) => window.attribution_status === "unattributed")
          ? "unattributed"
          : "success";
  const final_state: FinalStateReport = { state, data_status: context.data_status, policy_flags: flags, limitations: [...new Set([...bundle.limitations, ...clusterLimitations])] };
  return { agent_id: "quality-risk", quality, final_state };
}
