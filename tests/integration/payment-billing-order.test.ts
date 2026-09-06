import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { decodePaymentRequiredHeader } from "@x402/core/http";

// The @x402/next ESM build imports the bare "next/server" specifier, which vitest
// cannot resolve outside the Next runtime. Same stub as tests/integration/api.test.ts.
vi.mock("@x402/next", () => ({ withX402: (handler: unknown) => handler }));

import type { AnalysisResult } from "@/src/engine/analyze";
import { billableResultCount, isBillableResult } from "@/src/api/platform";
import { assertAllowedPayment, isBillablePaymentResource, isPayableAddress, normalizePaymentResource, ZERO_ADDRESS } from "@/src/payment/policy";
import { hasPayableAddress, paymentRequiredResponse, shouldUseConfiguredX402 } from "@/src/payment/server";
import { PAYMENT_NETWORK, TESTNET_USDC_ADDRESS, TESTNET_USDC_ATOMIC_AMOUNT } from "@/src/config";
import { resetPaymentIdempotencyForTests, withPaymentIdempotency } from "@/src/payment/idempotency";

const REAL_ADDRESS = "0x1234567890123456789012345678901234567890";

/** Minimal AnalysisResult shapes: the billing gate only reads these fields. */
function okResult(options: {
  statuses: string[];
  evidenceCount?: number;
  unavailable?: string[];
}): AnalysisResult {
  return {
    ok: true,
    bundle: {
      windows: options.statuses.map((attribution_status, index) => ({ id: `w${index}`, attribution_status })),
      evidence: Array.from({ length: options.evidenceCount ?? 1 }, (_unused, index) => ({ id: `e${index}` })),
      data_status: "recorded",
      source_coverage: { unavailable_connectors: options.unavailable ?? [] },
    },
  } as unknown as AnalysisResult;
}

function failedResult(code: "invalid_input" | "upstream_unavailable"): AnalysisResult {
  return { ok: false, input: null, code, message: "failed", data_status: "recorded" } as unknown as AnalysisResult;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("§4 billing gate: analyse first, bill only when billable_result_count > 0", () => {
  it("counts zero for unattributed-only windows", () => {
    expect(billableResultCount(okResult({ statuses: ["unattributed", "unattributed"] }))).toBe(0);
    expect(isBillableResult(okResult({ statuses: ["unattributed"] }))).toBe(false);
  });

  it("counts zero for insufficient_evidence windows", () => {
    expect(billableResultCount(okResult({ statuses: ["insufficient_evidence"] }))).toBe(0);
  });

  it("counts zero when any required connector is unavailable", () => {
    const result = okResult({ statuses: ["information_consistent"], unavailable: ["gamma"] });
    expect(billableResultCount(result)).toBe(0);
  });

  it("counts zero when there is no verified evidence", () => {
    expect(billableResultCount(okResult({ statuses: ["information_consistent"], evidenceCount: 0 }))).toBe(0);
  });

  it("counts zero for a failed analysis (invalid input and upstream unavailable are free)", () => {
    expect(billableResultCount(failedResult("invalid_input"))).toBe(0);
    expect(billableResultCount(failedResult("upstream_unavailable"))).toBe(0);
  });

  it("counts only attributed windows as billable", () => {
    expect(billableResultCount(okResult({ statuses: ["information_consistent", "capital_consistent", "unattributed"] }))).toBe(2);
    expect(isBillableResult(okResult({ statuses: ["capital_consistent"] }))).toBe(true);
  });
});

describe("zero-address safety: never broadcast an uncollectable challenge", () => {
  it("rejects unset, blank, malformed, and zero payTo values", () => {
    expect(isPayableAddress(undefined)).toBe(false);
    expect(isPayableAddress("")).toBe(false);
    expect(isPayableAddress("   ")).toBe(false);
    expect(isPayableAddress("not-an-address")).toBe(false);
    expect(isPayableAddress(ZERO_ADDRESS)).toBe(false);
    expect(isPayableAddress(REAL_ADDRESS)).toBe(true);
  });

  it("returns a free provider_unavailable instead of a 402 when no address is configured", async () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", "");
    expect(hasPayableAddress()).toBe(false);
    const response = paymentRequiredResponse("http://localhost/attribution", "recorded");
    expect(response.status).not.toBe(402);
    expect(response.status).toBe(503);
    expect(response.headers.get("PAYMENT-REQUIRED")).toBeNull();
    const body = await response.json();
    expect(body.error.code).toBe("provider_unavailable");
    expect(body.error.data_status).toBe("recorded");
  });

  it("returns a free provider_unavailable when the address is the zero address", async () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", ZERO_ADDRESS);
    const response = paymentRequiredResponse("http://localhost/attribution", "live");
    expect(response.status).toBe(503);
    expect(response.headers.get("PAYMENT-REQUIRED")).toBeNull();
    expect((await response.json()).error.data_status).toBe("live");
  });

  it("never treats a zero-address deployment as x402-configured", () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", ZERO_ADDRESS);
    vi.stubEnv("X402_NETWORK", PAYMENT_NETWORK);
    vi.stubEnv("X402_FACILITATOR_URL", "https://x402.org/facilitator");
    expect(shouldUseConfiguredX402()).toBe(false);
  });

  it("emits a single well-formed 402 once a real recipient is configured", async () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", REAL_ADDRESS);
    const response = paymentRequiredResponse("http://localhost/attribution", "recorded");
    expect(response.status).toBe(402);
    const challenge = response.headers.get("PAYMENT-REQUIRED");
    expect(challenge).toBeTruthy();
    const decoded = decodePaymentRequiredHeader(challenge as string);
    expect(decoded.x402Version).toBe(2);
    expect(decoded.accepts).toHaveLength(1);
    expect(decoded.accepts[0]).toMatchObject({
      scheme: "exact",
      network: PAYMENT_NETWORK,
      asset: TESTNET_USDC_ADDRESS,
      amount: TESTNET_USDC_ATOMIC_AMOUNT,
      payTo: REAL_ADDRESS,
      maxTimeoutSeconds: 120,
    });
    expect(decoded.accepts[0].payTo).not.toBe(ZERO_ADDRESS);
  });
});

describe("C12 multi-endpoint billing allowlist", () => {
  const requirement = {
    scheme: "exact",
    network: PAYMENT_NETWORK,
    asset: TESTNET_USDC_ADDRESS,
    amount: TESTNET_USDC_ATOMIC_AMOUNT,
    payTo: REAL_ADDRESS,
    maxTimeoutSeconds: 120,
    extra: {},
  };

  it("normalizes absolute urls and trailing slashes to a bare path", () => {
    expect(normalizePaymentResource("http://localhost/api/v1/attribution")).toBe("/api/v1/attribution");
    expect(normalizePaymentResource("/attribution/")).toBe("/attribution");
  });

  it("allows every endpoint on the billing table", () => {
    for (const resource of ["/attribution", "/api/v1/attribution", "/api/v1/fit"]) {
      expect(isBillablePaymentResource(resource)).toBe(true);
      expect(() => assertAllowedPayment(requirement, REAL_ADDRESS, resource)).not.toThrow();
    }
    expect(() => assertAllowedPayment(requirement, REAL_ADDRESS, "http://localhost/api/v1/attribution")).not.toThrow();
  });

  it("rejects free endpoints and unknown resources", () => {
    expect(isBillablePaymentResource("/summary")).toBe(false);
    expect(() => assertAllowedPayment(requirement, REAL_ADDRESS, "/summary")).toThrow(/billing table/);
    expect(() => assertAllowedPayment(requirement, REAL_ADDRESS, "/audit")).toThrow(/billing table/);
  });

  it("rejects a zero-address recipient even when the terms are otherwise valid", () => {
    expect(() => assertAllowedPayment({ ...requirement, payTo: ZERO_ADDRESS }, ZERO_ADDRESS, "/attribution")).toThrow(/zero address/);
  });

  it("still rejects wrong network, asset, and amount", () => {
    expect(() => assertAllowedPayment({ ...requirement, network: "eip155:1" }, REAL_ADDRESS, "/attribution")).toThrow();
    expect(() => assertAllowedPayment({ ...requirement, asset: REAL_ADDRESS }, REAL_ADDRESS, "/attribution")).toThrow();
    expect(() => assertAllowedPayment({ ...requirement, amount: "10001" }, REAL_ADDRESS, "/attribution")).toThrow();
  });

  it("refuses to bill an off-table resource even with a valid recipient", async () => {
    vi.stubEnv("ALIBI_PAYMENT_ADDRESS", REAL_ADDRESS);
    const response = paymentRequiredResponse("http://localhost/summary", "recorded");
    expect(response.status).toBe(503);
    expect(response.headers.get("PAYMENT-REQUIRED")).toBeNull();
  });
});

describe("payment retry reads the same frozen result", () => {
  function attributionRequest(identifier: string, extraHeaders: Record<string, string> = {}) {
    return new NextRequest("http://localhost/attribution", {
      method: "POST",
      headers: { "content-type": "application/json", "x-alibi-mode": "recorded", "PAYMENT-IDENTIFIER": identifier, ...extraHeaders },
      body: JSON.stringify({ input: REAL_ADDRESS, mode: "recorded" }),
    });
  }

  it("does not recompute or re-settle when the paid request is retried", async () => {
    resetPaymentIdempotencyForTests();
    let analyses = 0;
    let settlements = 0;
    const handler = async () => {
      analyses += 1;
      settlements += 1;
      return new Response(JSON.stringify({ kind: "detail", analysis: analyses, paid_access: { access: "paid" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    };

    const first = await withPaymentIdempotency(attributionRequest("retry-1", { "PAYMENT-SIGNATURE": "sig-1" }), "/attribution", handler);
    const retry = await withPaymentIdempotency(attributionRequest("retry-1", { "PAYMENT-SIGNATURE": "sig-1" }), "/attribution", handler);

    expect(analyses).toBe(1);
    expect(settlements).toBe(1);
    expect(first.status).toBe(200);
    expect(retry.status).toBe(200);
    expect(await retry.text()).toBe(await first.text());
  });

  it("does not leak the payment signature into the replayed snapshot", async () => {
    resetPaymentIdempotencyForTests();
    const handler = async () =>
      new Response("ok", { status: 200, headers: { "PAYMENT-SIGNATURE": "secret-sig", "x-safe": "kept" } });
    await withPaymentIdempotency(attributionRequest("redact-1"), "/attribution", handler);
    const replayed = await withPaymentIdempotency(attributionRequest("redact-1"), "/attribution", handler);
    expect(replayed.headers.get("PAYMENT-SIGNATURE")).toBeNull();
    expect(replayed.headers.get("x-safe")).toBe("kept");
  });

  it("lets the client retry after a 402 challenge instead of pinning the identifier", async () => {
    resetPaymentIdempotencyForTests();
    let calls = 0;
    const handler = async () => {
      calls += 1;
      if (calls === 1) return new Response(JSON.stringify({ error: { code: "payment_required" } }), { status: 402 });
      return new Response(JSON.stringify({ kind: "detail", call: calls }), { status: 200 });
    };
    const challenge = await withPaymentIdempotency(attributionRequest("pay-then-retry"), "/attribution", handler);
    expect(challenge.status).toBe(402);
    const paid = await withPaymentIdempotency(attributionRequest("pay-then-retry", { "PAYMENT-SIGNATURE": "sig" }), "/attribution", handler);
    expect(paid.status).toBe(200);
    // The settled 200 is now frozen: a further retry must not recompute.
    const replay = await withPaymentIdempotency(attributionRequest("pay-then-retry", { "PAYMENT-SIGNATURE": "sig" }), "/attribution", handler);
    expect(calls).toBe(2);
    expect(await replay.text()).toBe(await paid.text());
  });
});
