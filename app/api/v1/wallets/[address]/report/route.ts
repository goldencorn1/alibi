import { NextRequest } from "next/server";
import { errorResponse, isWalletAddress } from "@/src/contracts";
import { executePlatformAnalysis } from "@/src/api/platform";
import { buildSummary } from "@/src/report/build";

export const runtime = "nodejs";
export async function GET(_request: NextRequest, context: { params: Promise<{ address: string }> }): Promise<Response> {
  const { address } = await context.params; if (!isWalletAddress(address)) return errorResponse("invalid_input", "address must be a public EVM address.", "recorded", false, 400);
  const run = await executePlatformAnalysis(address, "recorded"); if (!run.result.ok) return errorResponse(run.result.code, run.result.message, run.result.data_status, false, 503, { run_id: run.runId });
  return Response.json({ kind: "wallet-report", data_status: run.result.bundle.data_status, run_id: run.runId, summary: buildSummary({ ...run.result.bundle, run_id: run.runId }), wallet_metrics: run.result.bundle.wallet_metrics, limitations: run.result.bundle.limitations }, { headers: { "cache-control": "no-store" } });
}
