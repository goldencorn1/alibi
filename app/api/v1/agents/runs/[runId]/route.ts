import { NextRequest } from "next/server";
import { errorResponse } from "@/src/contracts";
import { getAuditReport, isValidRunId, renderAuditMarkdown } from "@/src/observability/audit-agent";

export const runtime = "nodejs";
export async function GET(request: NextRequest, context: { params: Promise<{ runId: string }> }): Promise<Response> {
  const { runId } = await context.params; if (!isValidRunId(runId)) return errorResponse("invalid_input", "A valid runId is required.", "recorded", false, 400);
  const report = await getAuditReport(runId); if (!report) return errorResponse("not_found", "The requested agent run was not found.", "recorded", false, 404);
  if (request.nextUrl.searchParams.get("format") === "markdown") return new Response(renderAuditMarkdown(report), { headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "no-store" } });
  return Response.json(report, { headers: { "cache-control": "no-store" } });
}
