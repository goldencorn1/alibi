import { AnalysisBundle, DEFAULTS } from "@/src/contracts";
import { evaluateCoverage } from "@/src/analysis/coverage";

export function riskFlags(bundle: AnalysisBundle): string[] {
  const flags = new Set<string>();
  if (bundle.data_status === "recorded") flags.add("recorded_replay");
  if (bundle.windows.some((window) => window.attribution_status === "unattributed")) flags.add("unattributed");
  const gate = evaluateCoverage(bundle.wallet_metrics);
  if (!gate.passed) flags.add("coverage_below_gate");
  if (bundle.evidence.length === 0 && bundle.windows.length > 0) flags.add("no_verified_evidence");
  if (DEFAULTS.coverageThreshold !== 0.4) flags.add("configuration_changed");
  return [...flags];
}
