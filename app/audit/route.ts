import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/src/contracts";
import { getAuditReport, isValidRunId, renderAuditMarkdown } from "@/src/observability/audit-agent";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<Response> {
  const runId = request.nextUrl.searchParams.get("run_id");
  if (!runId || !isValidRunId(runId)) return errorResponse("invalid_input", "A valid run_id is required.", "recorded", false, 400);
  const report = await getAuditReport(runId);
  if (!report) return errorResponse("not_found", "The requested audit run was not found.", "recorded", false, 404);
  const format = request.nextUrl.searchParams.get("format") ?? "json";
  if (format === "md" || format === "markdown") {
    return new Response(renderAuditMarkdown(report), {
      status: 200,
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": `attachment; filename="alibi-audit-${runId}.md"`,
        "cache-control": "no-store",
      },
    });
  }
  if (format !== "json") return errorResponse("invalid_input", "format must be json or markdown.", report.meta.data_status, false, 400);
  return NextResponse.json(report, { status: 200, headers: { "cache-control": "no-store" } });
}
