import { NextRequest } from "next/server";
import { errorResponse } from "@/src/contracts";
import { executePlatformAnalysis } from "@/src/api/platform";
import { replayRanking } from "@/src/rankings/replay";

export const runtime = "nodejs";
export async function GET(request: NextRequest): Promise<Response> {
  const address = request.nextUrl.searchParams.get("address"); if (!address) return errorResponse("invalid_input", "address is required for a deterministic 90-day recorded ranking replay.", "recorded", false, 400);
  const run = await executePlatformAnalysis(address, "recorded"); if (!run.result.ok || !run.result.bundle.wallet_metrics) return errorResponse(run.result.ok ? "insufficient_evidence" : run.result.code, run.result.ok ? "No wallet metrics are available." : run.result.message, "recorded", false, 503, { run_id: run.runId });
  return Response.json({ kind: "ranking-replay", ...replayRanking([run.result.bundle.wallet_metrics]), run_id: run.runId }, { headers: { "cache-control": "no-store" } });
}
