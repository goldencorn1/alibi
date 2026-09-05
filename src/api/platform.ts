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

export function freeUnattributedDetailResponse(result: Extract<AnalysisResult, { ok: true }>, runId: string): Response {
  const detail = JSON.parse(JSON.stringify(assembleDetail({ ...result.bundle, run_id: runId }))) as import("@/src/contracts").DetailReport;
  detail.paid_access.access = "free_unattributed";
  return NextResponse.json(detail, { status: 200, headers: { "cache-control": "no-store" } });
}

export function safePlatformStatus() {
  return jsonResponse({ service: "alibi", platform: "v0.7", status: "ok", data_status: "recorded", local_only: true, synthetic_results_in_user_demo: false });
}
