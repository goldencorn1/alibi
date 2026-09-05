import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/src/contracts";
import { parseAnalysisRequest } from "@/src/api/request";
import { analyze } from "@/src/engine/analyze";
import { buildSummary } from "@/src/report/build";
import { createAuditRun } from "@/src/observability/audit-agent";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("invalid_input", "Request body must be valid JSON.", "recorded", false, 400);
  }
  const parsed = parseAnalysisRequest(body);
  if (!parsed.ok) return errorResponse("invalid_input", parsed.message, "recorded", false, 400);
  const auditRun = await createAuditRun(parsed.input);
  const result = await analyze(parsed.input, parsed.mode, { auditRun });
  const resultDataStatus = result.ok ? result.bundle.data_status : result.data_status;
  const reportWorker = await auditRun.startWorker("report", { data_status: resultDataStatus, output_artifact: `artifacts/agent-runs/${auditRun.run_id}/report.json` });
  if (!result.ok) {
    await auditRun.failWorker(reportWorker, result.code, { data_status: result.data_status, output_artifact: `artifacts/agent-runs/${auditRun.run_id}/report.json` });
    await auditRun.skipWorker("payment", { data_status: result.data_status, policy_flags: ["not_requested"] });
    return errorResponse(result.code, result.message, result.data_status, result.code === "upstream_unavailable", result.code === "invalid_input" ? 400 : 503, { run_id: auditRun.run_id });
  }
  const summary = buildSummary(result.bundle);
  await auditRun.completeWorker(reportWorker, { data_status: result.bundle.data_status, output_artifact: `artifacts/agent-runs/${auditRun.run_id}/report.json`, source_count: result.bundle.markets.length });
  await auditRun.skipWorker("payment", { data_status: result.bundle.data_status, policy_flags: ["not_requested"] });
  return NextResponse.json(summary, { status: 200, headers: { "cache-control": "no-store" } });
}
