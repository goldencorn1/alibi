import { NextRequest, NextResponse } from "next/server";
import { errorResponse, isWalletAddress } from "@/src/contracts";
import {
  ATTRIBUTION_FIELDS,
  FIT_FIELDS,
  OUTCOME_FIELDS,
  buildWalletDetailViewModel,
} from "@/app/components/wallet-discovery/view-model";

/**
 * `GET /api/v1/wallets/[address]/metrics` — Outcome/Attribution/Fit envelopes
 * for one wallet.
 *
 * Free and unauthenticated, read-only over recorded fixtures.
 *
 * A wallet with no captured detail is NOT a 404. The address is a legitimate
 * thing to ask about and the honest answer is "we did not observe this", which
 * is `detail_captured: false` plus a full set of `value: null` envelopes each
 * carrying a `reason_code`. Returning 404 would conflate "no such wallet" with
 * "we have nothing on this wallet", and returning zeros would fabricate
 * observations. A malformed address is still a 400: that is a bad request
 * rather than an unobserved subject.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ address: string }> },
): Promise<Response> {
  const { address } = await context.params;
  if (!isWalletAddress(address)) {
    return errorResponse("invalid_input", "address must be a public EVM address.", "recorded", false, 400);
  }

  const model = buildWalletDetailViewModel(address);

  const outcome: Record<string, unknown> = {};
  for (const field of OUTCOME_FIELDS) outcome[field.key] = model.outcome[field.key];
  const attribution: Record<string, unknown> = {};
  for (const field of ATTRIBUTION_FIELDS) attribution[field.key] = model.attribution.fields[field.key];
  const fit: Record<string, unknown> = {};
  for (const field of FIT_FIELDS) fit[field.key] = model.fit.fields[field.key];

  return NextResponse.json(
    {
      kind: "wallet-discovery-metrics",
      wallet: model.wallet,
      // Null whenever the wallet is absent from the recorded top-50 response.
      rank: model.rank,
      user_name: model.user_name,
      verified_badge: model.verified_badge,
      in_recorded_leaderboard: model.in_recorded_leaderboard,
      /** False for the 19 rows whose wallet-level endpoints were never fetched. */
      detail_captured: model.detail_captured,
      in_capture: model.in_capture,
      data_status: model.data_status,
      // From the capture's stored response headers, not the local clock.
      as_of: model.as_of,
      source_url: model.source_url,
      outcome_metrics: outcome,
      attribution_metrics: {
        metric_status: model.attribution.status,
        reason_code: model.attribution.reason_code,
        /** Empty in this capture: zero sources carried a verifiable publish time. */
        evidence: model.attribution.evidence,
        /** The only legal four-way verdicts. Naming them asserts no verdict. */
        verdict_space: model.attribution.verdict_space,
        fields: attribution,
        limitations: model.attribution.limitations,
      },
      fit_metrics: {
        // Unavailable by construction: no order-book depth was ever captured.
        metric_status: model.fit.status,
        reason_code: model.fit.reason_code,
        fields: fit,
        limitations: model.fit.limitations,
      },
      limitations: [
        ...model.limitations,
        "全部指标为 MetricEnvelope：value=null 必定带 reason_code，不得读作 0。",
        "未捕获的钱包返回 200 + detail_captured=false，而不是 404：未观测不等于不存在。",
        "Fit 组恒为 unavailable：没有订单簿深度，不估造有效成交价、滑点或可部署规模。",
      ],
    },
    { headers: { "cache-control": "no-store" } },
  );
}
