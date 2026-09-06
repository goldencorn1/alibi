import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET as leaderboardGet } from "@/app/api/v1/leaderboard/route";
import { GET as walletMetricsGet } from "@/app/api/v1/wallets/[address]/metrics/route";
import { requiresNullValue, type MetricEnvelope } from "@/src/contracts";
import { DETAIL_WALLET } from "@/src/wallet-discovery";

/**
 * Route-level guarantees for the Wallet Discovery API.
 *
 * The assertions that matter are the negative ones: an unobserved metric must
 * be `null` and must NOT be `0`, because `0` is the one wrong answer that looks
 * like a right one.
 */

const UNCAPTURED_LEADERBOARD_WALLET = "0x3dfb153c197d4c19d3b31c1ecd2c7b6860eeabaf";
const ATTRIBUTION_WALLET = "0xc69bd5567b40ef4d11922eaa57e1f9be1c642076";
/** Valid EVM address that was never part of this capture. */
const NEVER_CAPTURED_WALLET = "0x0000000000000000000000000000000000000001";

type Envelope = MetricEnvelope<unknown>;

interface LeaderboardRowPayload {
  rank: number;
  wallet: string;
  user_name: string | null;
  verified_badge: boolean;
  source_vol_30d: number;
  source_pnl_30d: number;
  detail_captured: boolean;
  detail_path: string | null;
  metrics: Record<string, Envelope>;
}

interface LeaderboardPayload {
  data_status: string;
  fixture_status: string;
  as_of: string | null;
  as_of_source: string;
  metric_keys: string[];
  rows_available_in_response: number;
  rows_returned: number;
  detail_captured_count: number;
  uncaptured_count: number;
  rows: LeaderboardRowPayload[];
  unranked_detail_wallets: { wallet: string; rank: null; detail_href: string }[];
  limitations: string[];
}

async function getLeaderboard(): Promise<{ response: Response; body: LeaderboardPayload }> {
  const response = await leaderboardGet();
  return { response, body: (await response.json()) as LeaderboardPayload };
}

async function getWalletMetrics(address: string) {
  const response = await walletMetricsGet(
    new NextRequest(`http://localhost/api/v1/wallets/${address}/metrics`),
    { params: Promise.resolve({ address }) },
  );
  return { response, body: (await response.json()) as Record<string, unknown> };
}

describe("GET /api/v1/leaderboard", () => {
  it("returns the 20 recorded rows and never claims to be live", async () => {
    const { response, body } = await getLeaderboard();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.rows).toHaveLength(20);
    expect(body.rows_returned).toBe(20);
    expect(body.data_status).toBe("recorded");
    expect(body.fixture_status).toBe("recorded");
    expect(body.data_status).not.toBe("live");
    expect(body.rows_available_in_response).toBe(50);
    expect(JSON.stringify(body)).not.toMatch(/synthetic/i);
  });

  it("carries an as_of from the capture that predates the test run", async () => {
    const { body } = await getLeaderboard();
    expect(body.as_of).toBeTruthy();
    const asOfMs = Date.parse(body.as_of as string);
    expect(Number.isFinite(asOfMs)).toBe(true);
    // Derived from stored response headers, so it must be strictly in the past.
    expect(asOfMs).toBeLessThan(Date.now());
    // `age_adjusted` proves the local clock was not consulted.
    expect(body.as_of_source).toBe("age_adjusted");
  });

  it("marks exactly one wallet as captured in detail", async () => {
    const { body } = await getLeaderboard();
    const captured = body.rows.filter((row) => row.detail_captured);
    expect(captured).toHaveLength(1);
    expect(body.detail_captured_count).toBe(1);
    expect(body.uncaptured_count).toBe(19);
    expect(captured[0]?.wallet.toLowerCase()).toBe(DETAIL_WALLET);
    // Only the captured row offers a detail link; the rest must not be linkable.
    expect(captured[0]?.detail_path).toBe(`/wallet-discovery/${DETAIL_WALLET}`);
    for (const row of body.rows.filter((item) => !item.detail_captured)) {
      expect(row.detail_path).toBeNull();
    }
  });

  it("reports every metric of the 19 uncaptured wallets as null and never as 0", async () => {
    const { body } = await getLeaderboard();
    const uncaptured = body.rows.filter((row) => !row.detail_captured);
    expect(uncaptured).toHaveLength(19);
    expect(body.metric_keys).toHaveLength(8);

    for (const row of uncaptured) {
      for (const key of body.metric_keys) {
        const envelope = row.metrics[key];
        expect(envelope, `${row.wallet}.${key} missing`).toBeDefined();
        // The core honesty assertion: unobserved is null, never zero.
        expect(envelope.value, `${row.wallet}.${key}`).toBeNull();
        expect(envelope.value, `${row.wallet}.${key}`).not.toBe(0);
        expect(envelope.value).not.toBe("0");
        expect(requiresNullValue(envelope.metric_status)).toBe(true);
        expect(envelope.reason_code).toBeTruthy();
        expect(envelope.data_status).toBe("recorded");
        expect(envelope.limitations.length).toBeGreaterThan(0);
        // A null coverage must stay null rather than collapsing to 0.
        expect(envelope.coverage).toBeNull();
      }
    }
  });

  it("keeps upstream row fields real for all 20 rows", async () => {
    const { body } = await getLeaderboard();
    expect(body.rows.map((row) => row.rank)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    for (const row of body.rows) {
      expect(row.wallet).toMatch(/^0x[0-9a-f]{40}$/);
      expect(Number.isFinite(row.source_vol_30d)).toBe(true);
      expect(Number.isFinite(row.source_pnl_30d)).toBe(true);
      expect(typeof row.verified_badge).toBe("boolean");
    }
    // Upstream 30d fields must not be renamed into 7-day Alibi metrics.
    const serialized = JSON.stringify(body.rows[0]);
    expect(serialized).toContain("source_pnl_30d");
    expect(serialized).toContain("source_vol_30d");
  });

  it("lists the unranked attribution wallets separately with rank null", async () => {
    const { body } = await getLeaderboard();
    expect(body.unranked_detail_wallets).toHaveLength(2);
    const ranked = new Set(body.rows.map((row) => row.wallet.toLowerCase()));
    for (const entry of body.unranked_detail_wallets) {
      expect(entry.rank).toBeNull();
      // Never smuggled into the ranked sample.
      expect(ranked.has(entry.wallet.toLowerCase())).toBe(false);
      expect(entry.detail_href).toBe(`/wallet-discovery/${entry.wallet}`);
    }
  });
});

describe("GET /api/v1/wallets/[address]/metrics", () => {
  it("rejects a malformed address as a bad request", async () => {
    const { response, body } = await getWalletMetrics("not-a-wallet");
    expect(response.status).toBe(400);
    expect((body.error as { code: string }).code).toBe("invalid_input");
  });

  it("returns 200 with detail_captured false rather than 404 for an uncaptured wallet", async () => {
    for (const wallet of [UNCAPTURED_LEADERBOARD_WALLET, ATTRIBUTION_WALLET, NEVER_CAPTURED_WALLET]) {
      const { response, body } = await getWalletMetrics(wallet);
      // An unobserved wallet is a real answer, not an error.
      expect(response.status, wallet).toBe(200);
      expect(body.detail_captured, wallet).toBe(false);
      expect(body.data_status).toBe("recorded");

      const outcome = body.outcome_metrics as Record<string, Envelope>;
      for (const [key, envelope] of Object.entries(outcome)) {
        expect(envelope.value, `${wallet}.${key}`).toBeNull();
        expect(envelope.value, `${wallet}.${key}`).not.toBe(0);
        expect(envelope.reason_code, `${wallet}.${key}`).toBeTruthy();
      }
    }
  });

  it("serves the captured wallet with envelopes whose nulls still carry reasons", async () => {
    const { response, body } = await getWalletMetrics(DETAIL_WALLET);
    expect(response.status).toBe(200);
    expect(body.detail_captured).toBe(true);
    expect(body.rank).toBe(1);

    const outcome = body.outcome_metrics as Record<string, Envelope>;
    // Measured selection bias keeps these two null despite being "computable".
    expect(outcome.realized_pnl_7d.value).toBeNull();
    expect(outcome.realized_pnl_7d.reason_code).toBe("pagination_cap");
    expect(outcome.win_rate_7d.value).toBeNull();
    expect(outcome.win_rate_7d.reason_code).toBe("pagination_cap");
    // And these are genuinely observed, so they must NOT be null.
    expect(outcome.avg_buy_price_7d.value).not.toBeNull();
    expect(outcome.total_trades_7d.value).not.toBeNull();

    for (const envelope of Object.values(outcome)) {
      if (requiresNullValue(envelope.metric_status)) {
        expect(envelope.value).toBeNull();
        expect(envelope.reason_code).toBeTruthy();
      }
    }
  });

  it("keeps the Fit group unavailable for every wallet", async () => {
    for (const wallet of [DETAIL_WALLET, UNCAPTURED_LEADERBOARD_WALLET, ATTRIBUTION_WALLET, NEVER_CAPTURED_WALLET]) {
      const { body } = await getWalletMetrics(wallet);
      const fit = body.fit_metrics as {
        metric_status: string;
        reason_code: string;
        fields: Record<string, Envelope>;
      };
      expect(fit.metric_status, wallet).toBe("unavailable");
      expect(fit.reason_code, wallet).toBe("provider_unavailable");
      expect(Object.keys(fit.fields).sort()).toEqual([
        "effective_entry_price",
        "failed_criteria",
        "max_deployable_usd",
        "meets_policy",
        "retained_return_ratio",
        "slippage_bps",
      ]);
      for (const [key, envelope] of Object.entries(fit.fields)) {
        expect(envelope.value, `${wallet}.fit.${key}`).toBeNull();
        expect(envelope.value, `${wallet}.fit.${key}`).not.toBe(0);
        // meets_policy must not degrade into a false verdict.
        expect(envelope.value).not.toBe(false);
        expect(envelope.metric_status).toBe("unavailable");
        expect(envelope.reason_code).toBe("provider_unavailable");
      }
    }
  });

  it("abstains from attribution rather than publishing a lead rate", async () => {
    const { body } = await getWalletMetrics(ATTRIBUTION_WALLET);
    const attribution = body.attribution_metrics as {
      metric_status: string;
      reason_code: string;
      evidence: unknown[];
      verdict_space: string[];
      fields: Record<string, Envelope>;
    };
    // Zero qualified sources means coverage 0, which is under the gate.
    expect(attribution.metric_status).toBe("insufficient_evidence");
    expect(attribution.reason_code).toBe("coverage_below_gate");
    expect(attribution.evidence).toHaveLength(0);
    expect(attribution.verdict_space).toEqual([
      "before_verified_source",
      "between_local_and_english",
      "after_verified_english",
      "unattributed",
    ]);
    expect(attribution.fields.lead_rate.value).toBeNull();
    expect(attribution.fields.lead_rate.value).not.toBe(0);
    expect(attribution.fields.language_lead_rate.value).toBeNull();
  });

  it("distinguishes a probed-but-unqualified wallet from one never probed", async () => {
    const probed = await getWalletMetrics(ATTRIBUTION_WALLET);
    const never = await getWalletMetrics(NEVER_CAPTURED_WALLET);
    const probedAttribution = probed.body.attribution_metrics as { reason_code: string; fields: Record<string, Envelope> };
    const neverAttribution = never.body.attribution_metrics as { reason_code: string; fields: Record<string, Envelope> };
    expect(probedAttribution.reason_code).toBe("coverage_below_gate");
    expect(neverAttribution.reason_code).toBe("provider_unavailable");
    // Measured zero qualified evidence vs. unknown: 0 and null are not merged.
    expect(probedAttribution.fields.lead_rate.coverage).toBe(0);
    expect(neverAttribution.fields.lead_rate.coverage).toBeNull();
  });

  it("never labels a recorded reply as live and sets no-store", async () => {
    const { response, body } = await getWalletMetrics(DETAIL_WALLET);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const serialized = JSON.stringify(body);
    expect(serialized).not.toMatch(/"data_status":\s*"live"/);
    expect(serialized).not.toMatch(/synthetic/i);
  });
});
