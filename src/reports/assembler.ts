import { AnalysisBundle, DetailReport, SummaryReport } from "@/src/contracts";
import { buildDetail, buildSummary } from "@/src/report/build";

/** Pure report facade shared by the API and the observation-only report agent. */
export function assembleSummary(bundle: AnalysisBundle): SummaryReport {
  return buildSummary(bundle);
}

export function assembleDetail(bundle: AnalysisBundle): DetailReport {
  return buildDetail(bundle);
}

export function assembleReports(bundle: AnalysisBundle): { summary: SummaryReport; detail: DetailReport } {
  return { summary: assembleSummary(bundle), detail: assembleDetail(bundle) };
}
