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
  const row = RECORDED_LEADERBOARD.find((item) => item.wallet === normalized);
  const isKnown = Boolean(row) || RECORDED_DETAIL_WALLETS.includes(normalized as (typeof RECORDED_DETAIL_WALLETS)[number]);
  if (!isKnown) return errorResponse("not_found", "No recorded wallet snapshot is available for this address.", "recorded", false, 404);
  return Response.json({
    kind: "wallet-metrics",
    wallet: address,
    data_status: "recorded",
    metric_status: "unavailable",
    as_of: RECORDED_LEADERBOARD_CAPTURED_AT,
    coverage: null,
    sample_size: null,
    source_provenance: [{ source: "polymarket-data-api", source_url: RECORDED_LEADERBOARD_SOURCE, retrieved_at: RECORDED_LEADERBOARD_CAPTURED_AT, http_status: 200, data_status: "recorded" }],
    metrics: {
      realized_pnl_7d: null,
      win_rate: null,
      avg_buy_price: null,
      flip_rate: null,
      median_exposure_minutes: null,
      last_trade_at: null,
      profile_age_days: null,
      first_deposit_at: null,
      total_trades: null,
      active_markets: null,
      category_mix: null,
      portfolio_value: null,
      rebate_income: null,
    },
    limitations: [
      "The recorded leaderboard snapshot does not contain wallet detail metrics.",
      "No browser-side calculation, default value, or synthetic metric is used.",
    ],
  }, { headers: { "cache-control": "no-store" } });
}
