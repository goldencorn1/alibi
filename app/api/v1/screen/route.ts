import { NextResponse } from "next/server";
import { errorResponse, isWalletAddress } from "@/src/contracts";
import { RECORDED_LEADERBOARD, RECORDED_LEADERBOARD_CAPTURED_AT, RECORDED_LEADERBOARD_SOURCE } from "@/src/rankings/recorded-leaderboard";

export const runtime = "nodejs";

type ScreenBody = {
  wallets?: unknown;
  window?: unknown;
  max_lead_rate?: unknown;
  min_coverage?: unknown;
  my_delay?: unknown;
  my_size_usd?: unknown;
  min_retained_return?: unknown;
  mode?: unknown;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export async function POST(request: Request): Promise<Response> {
  let body: ScreenBody;
  try {
    body = await request.json() as ScreenBody;
  } catch {
    return errorResponse("invalid_input", "Request body must be valid JSON.", "recorded", false, 400);
  }

  const mode = body.mode === "live" ? "live" : "recorded";
  if (mode === "live") {
    return errorResponse("provider_unavailable", "Wallet screening is currently available only for the recorded local snapshot.", "live", true, 503);
  }

  const requestedWallets = body.wallets === undefined
    ? RECORDED_LEADERBOARD.map((row) => row.wallet)
    : Array.isArray(body.wallets) && body.wallets.every((wallet) => typeof wallet === "string")
      ? body.wallets
      : null;
  if (!requestedWallets || requestedWallets.length === 0 || requestedWallets.length > 50 || requestedWallets.some((wallet) => !isWalletAddress(wallet))) {
    return errorResponse("invalid_input", "wallets must contain 1–50 valid public EVM addresses.", "recorded", false, 400);
  }

  const rows = new Map(RECORDED_LEADERBOARD.map((row) => [row.wallet.toLowerCase(), row]));
  const results = requestedWallets.map((wallet) => {
    const row = rows.get(wallet.toLowerCase());
    return {
      wallet,
      rank: row?.rank ?? null,
      username: row?.username ?? null,
      data_status: "recorded" as const,
      metric_status: "unavailable" as const,
      lead_rate: null,
      coverage: null,
      eligible: null,
      reason: row ? "The recorded leaderboard row has no trusted wallet-level lead-rate or coverage payload." : "The wallet is not present in the recorded leaderboard snapshot.",
    };
  });

  const response = {
    kind: "screen" as const,
    data_status: "recorded" as const,
    metric_status: "unavailable" as const,
    as_of: RECORDED_LEADERBOARD_CAPTURED_AT,
    request: {
      wallet_count: requestedWallets.length,
      window: typeof body.window === "string" ? body.window : "30d",
      max_lead_rate: isFiniteNumber(body.max_lead_rate) ? body.max_lead_rate : null,
      min_coverage: isFiniteNumber(body.min_coverage) ? body.min_coverage : null,
      my_delay: isFiniteNumber(body.my_delay) ? body.my_delay : null,
      my_size_usd: isFiniteNumber(body.my_size_usd) ? body.my_size_usd : null,
      min_retained_return: isFiniteNumber(body.min_retained_return) ? body.min_retained_return : null,
    },
    results,
    source_provenance: [{
      source: "polymarket-data-api",
      source_url: RECORDED_LEADERBOARD_SOURCE,
      retrieved_at: RECORDED_LEADERBOARD_CAPTURED_AT,
      http_status: 200,
      data_status: "recorded" as const,
    }],
    limitations: [
      "This local A2A screen is a recorded leaderboard pass-through; no browser-side lead-rate, coverage, or return calculation is performed.",
      "eligible=null is deliberate because the trusted snapshot does not provide the metrics required to apply caller policy thresholds.",
      "No automatic trade, signing, wallet custody, payment, or investment recommendation is performed.",
    ],
    payment: { class: "free_recorded_only", payment_required: false, settlement: "not_performed" },
  };
  return NextResponse.json(response, { status: 200, headers: { "cache-control": "no-store" } });
}
