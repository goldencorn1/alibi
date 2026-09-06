import { NextRequest } from "next/server";
import { isWalletAddress, errorResponse } from "@/src/contracts";
import {
  RECORDED_DETAIL_WALLETS,
  RECORDED_LEADERBOARD,
  RECORDED_LEADERBOARD_CAPTURED_AT,
  RECORDED_LEADERBOARD_SOURCE,
} from "@/src/rankings/recorded-leaderboard";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ address: string }> }): Promise<Response> {
  const { address } = await context.params;
  if (!isWalletAddress(address)) return errorResponse("invalid_input", "address must be a public EVM address.", "recorded", false, 400);
  const normalized = address.toLowerCase();
  const isKnown = RECORDED_LEADERBOARD.some((item) => item.wallet === normalized) || RECORDED_DETAIL_WALLETS.includes(normalized as (typeof RECORDED_DETAIL_WALLETS)[number]);
  if (!isKnown) return errorResponse("not_found", "No recorded wallet snapshot is available for this address.", "recorded", false, 404);
  return Response.json({
    kind: "wallet-lead-rate",
    wallet: address,
    data_status: "recorded",
    metric_status: "unavailable",
    lead_rate: null,
    as_of: RECORDED_LEADERBOARD_CAPTURED_AT,
    coverage: null,
    sample_size: null,
    source_provenance: [{ source: "polymarket-data-api", source_url: RECORDED_LEADERBOARD_SOURCE, retrieved_at: RECORDED_LEADERBOARD_CAPTURED_AT, http_status: 200, data_status: "recorded" }],
    limitations: [
      "A recorded public leaderboard row does not establish an information lead rate.",
      "No verified evidence chain is available for this snapshot.",
    ],
  }, { headers: { "cache-control": "no-store" } });
}
