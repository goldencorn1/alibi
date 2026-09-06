import { NextResponse } from "next/server";
import { LEADERBOARD_COLUMNS, buildLeaderboardViewModel, leaderboardEnvelope } from "@/app/components/wallet-discovery/view-model";
import { getRecordedLeaderboard } from "@/src/wallet-discovery";

/**
 * `GET /api/v1/leaderboard` — the recorded 30-day snapshot.
 *
 * Free and unauthenticated: this is a local recorded replay, so there is
 * nothing to meter and no account to attach. It is also strictly read-only —
 * no clock is read, no network call is made, and every `as_of` comes from the
 * stored response headers of the capture.
 *
 * The 20 rows carry real upstream `rank`/`wallet`/`user_name`/`verified_badge`/
 * `vol`/`pnl`. Every derived metric travels as a `MetricEnvelope`, so a metric
 * that could not be computed arrives as `value: null` with a `reason_code`
 * rather than as a `0`.
 */

export const runtime = "nodejs";
/** Recorded fixture read; nothing to revalidate, and nothing may be cached as live. */
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const view = getRecordedLeaderboard();
  const model = buildLeaderboardViewModel();

  const rows = view.rows.map((row) => {
    const metrics: Record<string, unknown> = {};
    for (const column of LEADERBOARD_COLUMNS) {
      metrics[column.key] = leaderboardEnvelope(row, column.key);
    }
    return {
      rank: row.rank,
      rank_raw: row.rank_raw,
      wallet: row.wallet,
      user_name: row.user_name,
      verified_badge: row.verified_badge,
      // Upstream self-reported 30d figures. Deliberately NOT named
      // `realized_pnl` or `volume_7d`: the window is the source's, not ours.
      source_vol_30d: row.vol,
      source_pnl_30d: row.pnl,
      detail_captured: row.detail_captured,
      detail_path: row.detail_captured ? `/wallet-discovery/${row.wallet.toLowerCase()}` : null,
      metrics,
    };
  });

  return NextResponse.json(
    {
      kind: "wallet-discovery-leaderboard",
      window: view.window,
      // Recorded replay. This field is never "live" on this route.
      data_status: view.data_status,
      fixture_status: view.fixture_status,
      // Derived from the capture's response headers, never from the local clock.
      as_of: view.as_of,
      as_of_source: view.as_of_source,
      source_url: view.source_url,
      metric_keys: LEADERBOARD_COLUMNS.map((column) => column.key),
      rows_available_in_response: view.rows_available_in_response,
      rows_returned: rows.length,
      detail_captured_count: view.detail_captured_count,
      uncaptured_count: rows.length - view.detail_captured_count,
      rows,
      /**
       * Wallets with a detail page that are NOT in the ranked sample. Returned
       * under a separate key with `rank: null` so a consumer cannot mistake
       * them for leaderboard entries.
       */
      unranked_detail_wallets: model.attribution_fixture_wallets,
      limitations: [
        ...view.limitations,
        "每个指标为 MetricEnvelope：value=null 必定带 reason_code，不得读作 0。",
        "source_vol_30d / source_pnl_30d 是上游 30 日自报字段，窗口由来源决定，不是 Alibi 推导的 7 日指标。",
        "unranked_detail_wallets 不在本榜样本内，rank 恒为 null。",
      ],
    },
    { headers: { "cache-control": "no-store" } },
  );
}
