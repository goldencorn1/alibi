import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { decodePaymentRequiredHeader } from "@x402/core/http";
import type { HTTPRequestContext } from "@x402/core/server";

vi.mock("@x402/next", () => ({ withX402: (handler: unknown) => handler }));

import { POST as attributionPost } from "@/app/attribution/route";
import { POST as platformAttributionPost } from "@/app/api/v1/attribution/route";
import { POST as summaryPost } from "@/app/summary/route";
import { GET as healthGet } from "@/app/api/v1/health/route";
import { ATTRIBUTION_ROUTE_CONFIG } from "@/src/payment/server";
import type { SummaryReport } from "@/src/contracts";

const RECORDED_INPUT = "https://polymarket.com/event/will-there-be-no-change-in-fed-interest-rates-after-the-september-2026-meeting-615";

function unpaidRequest(url: string, mode: "live" | "recorded") {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-alibi-mode": mode },
    body: JSON.stringify({ input: "0x1111111111111111111111111111111111111111", mode }),
  });
}

function expectPaymentChallenge(response: Response, path: string, expectedStatus: "live" | "recorded") {
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
    payTo: "0x0000000000000000000000000000000000000000",
    maxTimeoutSeconds: 120,
  });
  return response.json().then((body) => {
    expect(body).toMatchObject({ error: { code: "payment_required", data_status: expectedStatus } });
  });
}

describe("API payment boundary", () => {
  it("keeps recorded mode on the root 402 envelope and preserves x402 terms", async () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", "");
    vi.stubEnv("X402_NETWORK", "");
    await expectPaymentChallenge(await attributionPost(unpaidRequest("http://localhost/attribution", "recorded")), "/attribution", "recorded");
  });

  it("preserves live mode on the root 402 envelope", async () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", "");
    vi.stubEnv("X402_NETWORK", "");
    await expectPaymentChallenge(await attributionPost(unpaidRequest("http://localhost/attribution", "live")), "/attribution", "live");
  });

  it("keeps the v1 platform detail boundary mode-aware and unpaid", async () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", "");
    vi.stubEnv("X402_NETWORK", "");
    await expectPaymentChallenge(await platformAttributionPost(unpaidRequest("http://localhost/api/v1/attribution", "recorded")), "/api/v1/attribution", "recorded");
    await expectPaymentChallenge(await platformAttributionPost(unpaidRequest("http://localhost/api/v1/attribution", "live")), "/api/v1/attribution", "live");
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
