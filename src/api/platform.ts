import { NextResponse } from "next/server";
import { AppMode } from "@/src/config";
import { AnalysisResult } from "@/src/engine/analyze";
import { runInvestigation } from "@/src/agents/orchestrator";
import { errorResponse, jsonResponse } from "@/src/contracts";
import { assembleDetail, assembleSummary } from "@/src/reports/assembler";

export async function executePlatformAnalysis(input: string, mode: AppMode): Promise<{ runId: string; result: AnalysisResult }> {
  const run = await runInvestigation(input, mode);
  return { runId: run.run_id, result: run.result };
}

export function analysisError(result: Extract<AnalysisResult, { ok: false }>, runId: string): Response {
  return errorResponse(result.code, result.message, result.data_status, result.code === "upstream_unavailable", result.code === "invalid_input" ? 400 : 503, { run_id: runId });
}

export function summaryResponse(result: AnalysisResult, runId: string): Response {
  if (!result.ok) return analysisError(result, runId);
  const summary = assembleSummary({ ...result.bundle, run_id: runId });
  return NextResponse.json(summary, { status: 200, headers: { "cache-control": "no-store" } });
}

export function detailResponse(result: AnalysisResult, runId: string): Response {
  if (!result.ok) return analysisError(result, runId);
  return NextResponse.json(assembleDetail({ ...result.bundle, run_id: runId }), { status: 200, headers: { "cache-control": "no-store" } });
}

export function isFreeUnattributedResult(result: AnalysisResult): result is Extract<AnalysisResult, { ok: true }> {
  return result.ok && result.bundle.windows.length > 0 && result.bundle.evidence.length === 0 && result.bundle.windows.every((window) => window.attribution_status === "unattributed") && !result.bundle.source_coverage?.unavailable_connectors.length;
}

/**
 * §4 billing gate. Counts the results a caller could legitimately be charged for.
 * Returns 0 — meaning "must stay free, never emit 402" — when:
 *   - the analysis failed (invalid_input / upstream_unavailable),
 *   - any required connector was unavailable (provider unavailable),
 *   - there is no verified evidence at all,
 *   - every window is `unattributed` or `insufficient_evidence`.
 * Only `information_consistent` / `capital_consistent` windows are billable.
 */
export function billableResultCount(result: AnalysisResult): number {
  if (!result.ok) return 0;
  const bundle = result.bundle;
  if (bundle.source_coverage?.unavailable_connectors.length) return 0;
  if (bundle.evidence.length === 0) return 0;
  return bundle.windows.filter(
    (window) => window.attribution_status === "information_consistent" || window.attribution_status === "capital_consistent",
  ).length;
}

export function isBillableResult(result: AnalysisResult): boolean {
  return billableResultCount(result) > 0;
}

/**
 * The free response for any non-billable outcome: 200 for a usable report,
 * or the plain error envelope for a failed analysis. Never emits 402.
 * `free_unattributed` is the only non-paid value in the `paid_access.access`
 * contract, so it also labels insufficient-evidence and unavailable outcomes.
 */
export function freeDetailResponse(result: AnalysisResult, runId: string): Response {
  if (!result.ok) return analysisError(result, runId);
  const detail = JSON.parse(JSON.stringify(assembleDetail({ ...result.bundle, run_id: runId }))) as import("@/src/contracts").DetailReport;
  detail.paid_access.access = "free_unattributed";
  return NextResponse.json(detail, { status: 200, headers: { "cache-control": "no-store" } });
}

export function freeUnattributedDetailResponse(result: Extract<AnalysisResult, { ok: true }>, runId: string): Response {
  return freeDetailResponse(result, runId);
}

export function safePlatformStatus() {
  return jsonResponse({ service: "alibi", platform: "v0.7", status: "ok", data_status: "recorded", local_only: true, synthetic_results_in_user_demo: false });
}
