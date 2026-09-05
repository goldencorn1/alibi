import { NextRequest } from "next/server";
import { parseAnalysisRequest } from "@/src/api/request";
import { errorResponse } from "@/src/contracts";
import { executePlatformAnalysis, summaryResponse } from "@/src/api/platform";

export const runtime = "nodejs";
export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown; try { body = await request.json(); } catch { return errorResponse("invalid_input", "Request body must be valid JSON.", "recorded", false, 400); }
  const parsed = parseAnalysisRequest(body); if (!parsed.ok) return errorResponse("invalid_input", parsed.message, "recorded", false, 400);
  const run = await executePlatformAnalysis(parsed.input, parsed.mode); return summaryResponse(run.result, run.runId);
}
export async function GET(request: NextRequest): Promise<Response> {
  const input = request.nextUrl.searchParams.get("input"); if (!input) return errorResponse("invalid_input", "input is required.", "recorded", false, 400);
  const mode = request.nextUrl.searchParams.get("mode") === "live" ? "live" : "recorded"; const run = await executePlatformAnalysis(input, mode); return summaryResponse(run.result, run.runId);
}
