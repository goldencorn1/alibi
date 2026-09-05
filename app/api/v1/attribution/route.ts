import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/src/contracts";
import { parseAnalysisRequest, parseHeaderInput } from "@/src/api/request";
import { executePlatformAnalysis, detailResponse, freeUnattributedDetailResponse, isFreeUnattributedResult } from "@/src/api/platform";
import { paymentRequiredResponse, protectAttribution, shouldUseConfiguredX402 } from "@/src/payment/server";
import { withPaymentIdempotency } from "@/src/payment/idempotency";

export const runtime = "nodejs";
function toNextResponse(response: Response): NextResponse {
  return new NextResponse(response.body, { status: response.status, headers: response.headers });
}

async function protectedDetailHandler(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  const headerInput = parseHeaderInput(request);
  if (headerInput) body = { input: headerInput, mode: request.headers.get("x-alibi-mode") ?? "recorded" };
  else { try { body = await request.json(); } catch { return toNextResponse(errorResponse("invalid_input", "Request body must be valid JSON.", "recorded", false, 400)); } }
  const parsed = parseAnalysisRequest(body); if (!parsed.ok) return toNextResponse(errorResponse("invalid_input", parsed.message, "recorded", false, 400));
  const run = await executePlatformAnalysis(parsed.input, parsed.mode);
  const response = detailResponse(run.result, run.runId);
  return toNextResponse(response);
}

export async function POST(request: NextRequest): Promise<Response> {
  return withPaymentIdempotency(request, request.nextUrl.pathname, async (idempotentRequest) => {
    const requestedMode = idempotentRequest.headers.get("x-alibi-mode") === "live" ? "live" : "recorded";
    let preflightInput = parseHeaderInput(idempotentRequest);
    if (!preflightInput) {
      try {
        const preflightBody = await idempotentRequest.clone().json() as { input?: unknown };
        preflightInput = typeof preflightBody.input === "string" ? preflightBody.input : null;
      } catch { /* protected handler returns the canonical invalid-input response */ }
    }
    if (preflightInput) {
      const preflight = await executePlatformAnalysis(preflightInput, requestedMode);
      if (isFreeUnattributedResult(preflight.result)) return freeUnattributedDetailResponse(preflight.result, preflight.runId);
    }
    if (!shouldUseConfiguredX402()) return paymentRequiredResponse(idempotentRequest.url, requestedMode);
    return protectAttribution(protectedDetailHandler)(idempotentRequest);
  });
}
