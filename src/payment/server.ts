import { HTTPFacilitatorClient, RouteConfig, x402ResourceServer } from "@x402/core/server";
import type { HTTPRequestContext } from "@x402/core/server";
import { encodePaymentRequiredHeader } from "@x402/core/http";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { withX402 } from "@x402/next";
import { NextRequest, NextResponse } from "next/server";
import {
  PAYMENT_NETWORK,
  PAYMENT_PRICE,
  TESTNET_USDC_ADDRESS,
  TESTNET_USDC_ATOMIC_AMOUNT,
  getFacilitatorUrl,
  hasPaymentConfiguration,
} from "@/src/config";
import { errorResponse } from "@/src/contracts";
import { assertAllowedPayment, isPayableAddress, normalizePaymentResource } from "@/src/payment/policy";

type PaymentDataStatus = "live" | "recorded";

function dataStatusForMode(mode: string | null | undefined): PaymentDataStatus {
  return mode === "live" ? "live" : "recorded";
}

function dataStatusForRequest(context: HTTPRequestContext): PaymentDataStatus {
  return dataStatusForMode(context.adapter.getHeader("x-alibi-mode"));
}

/**
 * Returns the configured recipient, or null when it is unset or unusable.
 * There is deliberately no zero-address fallback: a challenge that names
 * 0x000…000 as payTo would ask a user to send real funds to an unspendable
 * address. Callers must treat null as "cannot bill" and stay free.
 */
function paymentAddress(): string | null {
  const configured = process.env.ALIBI_PAYMENT_ADDRESS?.trim();
  return isPayableAddress(configured) ? (configured as string) : null;
}

export function hasPayableAddress(): boolean {
  return paymentAddress() !== null;
}

/** Free, retryable response used whenever billing cannot be performed safely. */
export function paymentUnavailableResponse(dataStatus: PaymentDataStatus = "recorded"): Response {
  const response = errorResponse(
    "provider_unavailable",
    "Payment is not configured on this deployment, so the detail report cannot be billed. No charge was made.",
    dataStatus,
    true,
    503,
  );
  response.headers.set("cache-control", "no-store");
  return response;
}

/**
 * `payTo` is resolved per call rather than captured at module load, so a deployment
 * that configures the address after import is not stuck with a stale value.
 */
function attributionAccepts(payTo: string) {
  return {
    scheme: "exact" as const,
    payTo,
    price: PAYMENT_PRICE,
    network: PAYMENT_NETWORK,
    maxTimeoutSeconds: 120,
    extra: { asset: TESTNET_USDC_ADDRESS, amount: TESTNET_USDC_ATOMIC_AMOUNT },
  };
}

export const ATTRIBUTION_ROUTE_CONFIG: RouteConfig = {
  accepts: attributionAccepts(paymentAddress() ?? ""),
  resource: "/attribution",
  description: "Alibi evidence-linked detail report",
  mimeType: "application/json",
  serviceName: "alibi-trust-agent",
  unpaidResponseBody: (context) => ({
    contentType: "application/json",
    body: {
      error: {
        code: "payment_required",
        message: "A Base Sepolia x402 payment is required for the detail report.",
        retryable: true,
        data_status: dataStatusForRequest(context),
      },
    },
  }),
};

export function createX402Server(): x402ResourceServer {
  const facilitator = new HTTPFacilitatorClient({ url: getFacilitatorUrl(), timeoutMs: 12_000 });
  return new x402ResourceServer(facilitator).register(PAYMENT_NETWORK, new ExactEvmScheme());
}

export function paymentRequiredResponse(
  resourceUrl = "http://127.0.0.1:3000/attribution",
  dataStatus: PaymentDataStatus = "recorded",
): Response {
  const payTo = paymentAddress();
  // No recipient configured -> never fabricate a collectable-looking challenge.
  if (!payTo) return paymentUnavailableResponse(dataStatus);
  const requirement = {
    scheme: "exact" as const,
    network: PAYMENT_NETWORK,
    asset: TESTNET_USDC_ADDRESS,
    amount: TESTNET_USDC_ATOMIC_AMOUNT,
    payTo,
    maxTimeoutSeconds: 120,
    extra: { asset: TESTNET_USDC_ADDRESS },
  };
  // Validate our own outgoing terms before broadcasting them. Any policy violation
  // (off-table resource, wrong network/asset/amount, unspendable payTo) fails closed
  // to a free response rather than charging on terms we could not verify.
  try {
    assertAllowedPayment(requirement, payTo, normalizePaymentResource(resourceUrl));
  } catch {
    return paymentUnavailableResponse(dataStatus);
  }
  const response = errorResponse(
    "payment_required",
    "Detail requires a 0.01 USDC Base Sepolia payment.",
    dataStatus,
    true,
    402,
    { scheme: "exact", network: PAYMENT_NETWORK, asset: TESTNET_USDC_ADDRESS },
  );
  response.headers.set("PAYMENT-REQUIRED", encodePaymentRequiredHeader({
    x402Version: 2,
    resource: { url: resourceUrl, description: "Alibi evidence-linked detail report", mimeType: "application/json" },
    // Broadcast exactly the object that assertAllowedPayment just validated.
    accepts: [requirement],
  }));
  response.headers.set("cache-control", "no-store");
  return response;
}

/**
 * Verified against @x402/next@2.24.0 (dist/esm/index.d.ts:247, dist/esm/index.js:444):
 *   withX402(routeHandler, routeConfig, server, paywallConfig?, paywall?, syncFacilitatorOnStart?)
 * The 6th positional argument is `syncFacilitatorOnStart` — "Whether to sync with the
 * facilitator on startup (defaults to true)". Passing `true` is therefore identical to
 * omitting it; the two `undefined` placeholders exist only to reach that slot.
 */
export function protectAttribution(
  handler: (request: NextRequest) => Promise<NextResponse>,
): (request: NextRequest) => Promise<NextResponse> {
  const payTo = paymentAddress();
  if (!payTo) {
    // Unconfigured recipient: never let the adapter mint a 402 challenge.
    return async (request: NextRequest) =>
      new NextResponse(await paymentUnavailableResponse(dataStatusForMode(request.headers.get("x-alibi-mode"))).text(), {
        status: 503,
        headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
      });
  }
  return withX402(
    handler,
    { ...ATTRIBUTION_ROUTE_CONFIG, accepts: attributionAccepts(payTo) },
    createX402Server(),
    undefined,
    undefined,
    true,
  );
}

export function shouldUseConfiguredX402(): boolean {
  return hasPaymentConfiguration() && hasPayableAddress() && getFacilitatorUrl() === "https://x402.org/facilitator" && process.env.X402_NETWORK === PAYMENT_NETWORK;
}
