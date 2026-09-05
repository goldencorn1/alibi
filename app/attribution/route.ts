import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/src/contracts";
import { parseAnalysisRequest, parseHeaderInput } from "@/src/api/request";
import { analyze } from "@/src/engine/analyze";
import { buildDetail } from "@/src/report/build";
import { paymentRequiredResponse, protectAttribution, shouldUseConfiguredX402 } from "@/src/payment/server";
import { withPaymentIdempotency } from "@/src/payment/idempotency";
import { freeUnattributedDetailResponse, isFreeUnattributedResult } from "@/src/api/platform";
import { createAuditRun, getActiveAuditRun, AuditReportAgent } from "@/src/observability/audit-agent";

export const runtime = "nodejs";

async function detailHandler(request: NextRequest, auditRun: AuditReportAgent): Promise<NextResponse> {
  let body: unknown;
  const headerInput = parseHeaderInput(request);
  if (headerInput) {
    // The x402 Next adapter consumes request.json() while extracting payment.
    // The duplicated, non-secret input header preserves the public API contract.
    body = { input: headerInput, mode: request.headers.get("x-alibi-mode") ?? "recorded" };
  } else {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: { code: "invalid_input", message: "Request body must be valid JSON.", retryable: false, data_status: "recorded", retrieved_at: new Date().toISOString() } }, { status: 400 });
    }
  }
  const parsed = parseAnalysisRequest(body);
  if (!parsed.ok) return NextResponse.json({ error: { code: "invalid_input", message: parsed.message, retryable: false, data_status: "recorded", retrieved_at: new Date().toISOString() } }, { status: 400 });
  const result = await analyze(parsed.input, parsed.mode, { auditRun });
  const resultDataStatus = result.ok ? result.bundle.data_status : result.data_status;
  const reportWorker = await auditRun.startWorker("report", { data_status: resultDataStatus, output_artifact: `artifacts/agent-runs/${auditRun.run_id}/report.json` });
  if (!result.ok) {
    await auditRun.failWorker(reportWorker, result.code, { data_status: result.data_status, output_artifact: `artifacts/agent-runs/${auditRun.run_id}/report.json` });
    return NextResponse.json({ error: { code: result.code, message: result.message, retryable: result.code === "upstream_unavailable", data_status: result.data_status, retrieved_at: new Date().toISOString(), details: { run_id: auditRun.run_id } } }, { status: result.code === "invalid_input" ? 400 : 503 });
  }
  const detail = buildDetail(result.bundle);
  await auditRun.completeWorker(reportWorker, { data_status: result.bundle.data_status, output_artifact: `artifacts/agent-runs/${auditRun.run_id}/report.json`, source_count: result.bundle.markets.length });
  return NextResponse.json(detail, { status: 200, headers: { "cache-control": "no-store" } });
}

export async function POST(request: NextRequest): Promise<Response> {
  return withPaymentIdempotency(request, request.nextUrl.pathname, async (idempotentRequest) => {
    const requestedMode = idempotentRequest.headers.get("x-alibi-mode") === "live" ? "live" : "recorded";
    let preflightInput = parseHeaderInput(idempotentRequest);
    if (!preflightInput) {
      try {
        const candidate = await idempotentRequest.clone().json() as { input?: unknown };
        preflightInput = typeof candidate.input === "string" ? candidate.input : null;
      } catch { /* protected handler returns the canonical invalid-input response */ }
    }
    const requestedRunId = idempotentRequest.headers.get("x-alibi-run-id");
    const activeRun = requestedRunId ? getActiveAuditRun(requestedRunId) : undefined;
    const auditRun = activeRun ?? await createAuditRun(preflightInput ?? "attribution-request");
    if (preflightInput) {
      const preflight = await analyze(preflightInput, requestedMode, { auditRun });
      if (isFreeUnattributedResult(preflight)) {
        const paymentWorker = await auditRun.startWorker("payment", { data_status: requestedMode, policy_flags: ["unattributed"] });
        await auditRun.completeWorker(paymentWorker, { data_status: requestedMode, policy_flags: ["unattributed"] });
        const reportWorker = await auditRun.startWorker("report", { data_status: requestedMode, output_artifact: `artifacts/agent-runs/${auditRun.run_id}/report.json` });
        await auditRun.completeWorker(reportWorker, { data_status: requestedMode, output_artifact: `artifacts/agent-runs/${auditRun.run_id}/report.json` });
        return freeUnattributedDetailResponse(preflight, auditRun.run_id);
      }
    }
    const paymentWorker = await auditRun.startWorker("payment", { data_status: requestedMode, policy_flags: requestedMode === "recorded" ? ["recorded_replay"] : [] });

    if (!shouldUseConfiguredX402()) {
      const response = paymentRequiredResponse(idempotentRequest.url, requestedMode);
      await auditRun.completeWorker(paymentWorker, { data_status: requestedMode, policy_flags: ["payment_required"] }, "blocked");
      return response;
    }

    const response = await protectAttribution((innerRequest) => detailHandler(innerRequest, auditRun))(idempotentRequest);
    if (response.status === 200) {
      await auditRun.completeWorker(paymentWorker, { data_status: requestedMode, policy_flags: requestedMode === "recorded" ? ["recorded_replay"] : [] });
    } else if (response.status === 402) {
      await auditRun.completeWorker(paymentWorker, { data_status: requestedMode, policy_flags: ["payment_required"] }, "blocked");
    } else {
      await auditRun.completeWorker(paymentWorker, { data_status: requestedMode }, "failed");
    }
    return response;
  });
}
