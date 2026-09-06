import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { decodePaymentRequiredHeader } from "@x402/core/http";
import type { HTTPRequestContext } from "@x402/core/server";

vi.mock("@x402/next", () => ({ withX402: (handler: unknown) => handler }));

import { POST as attributionPost } from "@/app/attribution/route";
import { POST as platformAttributionPost } from "@/app/api/v1/attribution/route";
import { POST as summaryPost } from "@/app/summary/route";
import { GET as healthGet } from "@/app/api/v1/health/route";
import { ATTRIBUTION_ROUTE_CONFIG, paymentRequiredResponse } from "@/src/payment/server";
import type { SummaryReport } from "@/src/contracts";

const RECORDED_INPUT = "https://polymarket.com/event/will-there-be-no-change-in-fed-interest-rates-after-the-september-2026-meeting-615";

/**
 * A syntactically valid, obviously fake recipient. It must be non-zero: `isPayableAddress`
 * rejects the zero address, which makes billing fail closed to a free 503 instead of
 * emitting the 402 these envelope assertions exist to check.
 */
const TEST_PAYMENT_ADDRESS = "0x1234567890123456789012345678901234567890";

// vitest.config.ts does not set `unstubEnvs`, and these cases want opposite values
// for ALIBI_PAYMENT_ADDRESS, so clean up explicitly.
afterEach(() => {
  vi.unstubAllEnvs();
});

function unpaidRequest(url: string, mode: "live" | "recorded") {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-alibi-mode": mode },
    body: JSON.stringify({ input: "0x1111111111111111111111111111111111111111", mode }),
  });
}

async function expectPaymentChallenge(response: Response, path: string, expectedStatus: "live" | "recorded") {
  expect(response.status).toBe(402);
  const challenge = response.headers.get("PAYMENT-REQUIRED");
  expect(challenge).toBeTruthy();
  const decoded = decodePaymentRequiredHeader(challenge as string);
  expect(decoded.x402Version).toBe(2);
  expect(decoded.resource.url).toContain(path);
  expect(decoded.accepts).toHaveLength(1);
  expect(decoded.accepts[0]).toMatchObject({
    scheme: "exact",
    network: "eip155:84532",
    asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    amount: "10000",
    payTo: TEST_PAYMENT_ADDRESS,
    maxTimeoutSeconds: 120,
  });
  // A challenge naming 0x000…000 would ask a user to send funds to an unspendable address.
  expect(decoded.accepts[0].payTo).not.toBe("0x0000000000000000000000000000000000000000");
  const body = await response.json();
  expect(body).toMatchObject({ error: { code: "payment_required", data_status: expectedStatus } });
}

/**
 * These exercise `paymentRequiredResponse` directly rather than through the route.
 * The §4 billing gate (analyse first, bill only when billable_result_count > 0) makes a
 * route-level 402 unreachable with the fixtures in the repo: every recorded fixture has
 * `evidence: []`, so billable_result_count is always 0 and the boundary correctly stays
 * free. Reaching a 402 end-to-end needs a fixture with attributed evidence, which does
 * not exist yet. `paymentRequiredResponse` is the function that builds and validates the
 * envelope, so asserting on it keeps the original intent verifiable today.
 */
describe("x402 challenge envelope", () => {
  it("keeps recorded mode on the root 402 envelope and preserves x402 terms", async () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", TEST_PAYMENT_ADDRESS);
    await expectPaymentChallenge(paymentRequiredResponse("http://localhost/attribution", "recorded"), "/attribution", "recorded");
  });

  it("preserves live mode on the root 402 envelope", async () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", TEST_PAYMENT_ADDRESS);
    await expectPaymentChallenge(paymentRequiredResponse("http://localhost/attribution", "live"), "/attribution", "live");
  });

  it("keeps the v1 platform detail boundary mode-aware", async () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", TEST_PAYMENT_ADDRESS);
    await expectPaymentChallenge(paymentRequiredResponse("http://localhost/api/v1/attribution", "recorded"), "/api/v1/attribution", "recorded");
    await expectPaymentChallenge(paymentRequiredResponse("http://localhost/api/v1/attribution", "live"), "/api/v1/attribution", "live");
  });

  // Locks the P3 fix: an unconfigured recipient is never papered over with the zero
  // address. Billing fails closed to a free, retryable 503 and broadcasts no challenge.
  it("fails closed to a free 503 without a challenge when no payment address is configured", async () => {
    for (const mode of ["recorded", "live"] as const) {
      vi.stubEnv("ALIBI_PAYMENT_ADDRESS", "");
      const response = paymentRequiredResponse("http://localhost/attribution", mode);
      expect(response.status).toBe(503);
      expect(response.headers.get("PAYMENT-REQUIRED")).toBeNull();
      expect(await response.json()).toMatchObject({
        error: { code: "provider_unavailable", retryable: true, data_status: mode },
      });
    }
  });
});

describe("API payment boundary", () => {
  /**
   * Route-level guarantee that survives the billing gate: a non-billable input is never
   * charged, even with billing fully configured. Recorded mode only — `live` reaches the
   * real read-only upstreams, which are unavailable offline, so a live end-to-end
   * assertion here would only ever measure network reachability.
   */
  it("never emits a payment challenge for a non-billable input", async () => {
    for (const [post, url] of [
      [attributionPost, "http://localhost/attribution"],
      [platformAttributionPost, "http://localhost/api/v1/attribution"],
    ] as const) {
      vi.stubEnv("ALIBI_PAYMENT_ADDRESS", TEST_PAYMENT_ADDRESS);
      const response = await post(unpaidRequest(url, "recorded"));
      expect(response.status).not.toBe(402);
      expect(response.headers.get("PAYMENT-REQUIRED")).toBeNull();
    }
  });

  it("uses the request mode in the configured x402 unpaid callback", async () => {
    const unpaidResponseBody = ATTRIBUTION_ROUTE_CONFIG.unpaidResponseBody;
    expect(unpaidResponseBody).toBeDefined();
    if (!unpaidResponseBody) return;
    const context = (mode: string | undefined) => ({
      adapter: { getHeader: (name: string) => name === "x-alibi-mode" ? mode : undefined },
    }) as HTTPRequestContext;
    expect(unpaidResponseBody(context("recorded"))).toMatchObject({
      contentType: "application/json",
      body: { error: { code: "payment_required", message: "A Base Sepolia x402 payment is required for the detail report.", retryable: true, data_status: "recorded" } },
    });
    expect(unpaidResponseBody(context("live"))).toMatchObject({ body: { error: { data_status: "live" } } });
    expect(unpaidResponseBody(context(undefined))).toMatchObject({ body: { error: { data_status: "recorded" } } });
    expect(unpaidResponseBody(context("invalid"))).toMatchObject({ body: { error: { data_status: "recorded" } } });
  });

  it("keeps normal recorded Summary status and reports database availability separately", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const summaryResponse = await summaryPost(new NextRequest("http://localhost/summary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: RECORDED_INPUT, mode: "recorded" }),
    }));
    expect(summaryResponse.status).toBe(200);
    const summary = await summaryResponse.json() as SummaryReport;
    expect(summary).toMatchObject({ meta: { data_status: "recorded", schema_version: "1.1.0" } });
    expect(summary.cluster_alerts).toEqual(expect.any(Array));
    expect(summary.language_windows).toEqual(expect.any(Array));
    expect(summary.source_coverage?.source_state).toBe("unknown");

    const healthResponse = await healthGet();
    await expect(healthResponse.json()).resolves.toMatchObject({ data_status: "recorded", capabilities: { database_status: "unavailable" } });
  });

  it("returns recorded unattributed detail without a payment challenge", async () => {
    vi.stubEnv("X402_NETWORK", "");
    const response = await attributionPost(new NextRequest("http://localhost/attribution", {
      method: "POST",
      headers: { "content-type": "application/json", "x-alibi-mode": "recorded" },
      body: JSON.stringify({ input: RECORDED_INPUT, mode: "recorded" }),
    }));
    expect(response.status).toBe(200);
    const detail = await response.json();
    expect(detail.kind).toBe("detail");
    expect(detail.meta.data_status).toBe("recorded");
    expect(detail.paid_access.access).toBe("free_unattributed");
    expect(response.headers.get("PAYMENT-REQUIRED")).toBeNull();
  });
});
