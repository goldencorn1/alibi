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

type PaymentDataStatus = "live" | "recorded";

function dataStatusForMode(mode: string | null | undefined): PaymentDataStatus {
  return mode === "live" ? "live" : "recorded";
}

function dataStatusForRequest(context: HTTPRequestContext): PaymentDataStatus {
  return dataStatusForMode(context.adapter.getHeader("x-alibi-mode"));
}

function paymentAddress(): string {
  return process.env.ALIBI_PAYMENT_ADDRESS || "0x0000000000000000000000000000000000000000";
}

export const ATTRIBUTION_ROUTE_CONFIG: RouteConfig = {
  accepts: {
    scheme: "exact",
    payTo: paymentAddress(),
    price: PAYMENT_PRICE,
    network: PAYMENT_NETWORK,
    maxTimeoutSeconds: 120,
    extra: { asset: TESTNET_USDC_ADDRESS, amount: TESTNET_USDC_ATOMIC_AMOUNT },
  },
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
    accepts: [{
      scheme: "exact",
      network: PAYMENT_NETWORK,
      asset: TESTNET_USDC_ADDRESS,
      amount: TESTNET_USDC_ATOMIC_AMOUNT,
      payTo: paymentAddress(),
      maxTimeoutSeconds: 120,
      extra: { asset: TESTNET_USDC_ADDRESS },
    }],
  }));
  response.headers.set("cache-control", "no-store");
  return response;
}

export function protectAttribution(
  handler: (request: NextRequest) => Promise<NextResponse>,
): (request: NextRequest) => Promise<NextResponse> {
  return withX402(handler, ATTRIBUTION_ROUTE_CONFIG, createX402Server(), undefined, undefined, true);
}

export function shouldUseConfiguredX402(): boolean {
  return hasPaymentConfiguration() && getFacilitatorUrl() === "https://x402.org/facilitator" && process.env.X402_NETWORK === PAYMENT_NETWORK;
}
