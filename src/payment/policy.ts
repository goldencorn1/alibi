import { PaymentRequirements } from "@x402/core/types";
import { PAYMENT_NETWORK, TESTNET_USDC_ADDRESS, TESTNET_USDC_ATOMIC_AMOUNT } from "@/src/config";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

/**
 * The billing table (§4/§16): the only resources allowed to emit an x402 challenge.
 * `/api/v1/fit` is the reserved C-group read-only matching-simulation path; it has no
 * route implementation yet, so a challenge for it is unreachable until that route lands.
 */
export const BILLABLE_PAYMENT_RESOURCES = [
  "/attribution",
  "/api/v1/attribution",
  "/api/v1/fit",
] as const;

export function normalizePaymentResource(resource: string): string {
  let path = resource;
  try {
    path = new URL(resource).pathname;
  } catch {
    /* already a bare path */
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

export function isBillablePaymentResource(resource: string): boolean {
  return (BILLABLE_PAYMENT_RESOURCES as readonly string[]).includes(normalizePaymentResource(resource));
}

export function isPayableAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  const value = address.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) return false;
  return value.toLowerCase() !== ZERO_ADDRESS;
}

/**
 * Validates x402 terms before they are broadcast to (or accepted from) a counterparty.
 * Base Sepolia exact scheme, 0.01 USDC, a real recipient, and a resource on the billing table.
 */
export function assertAllowedPayment(requirement: PaymentRequirements, expectedPayTo: string, expectedResource: string): void {
  if (requirement.scheme !== "exact") throw new Error("payment scheme is not exact");
  if (requirement.network !== PAYMENT_NETWORK) throw new Error("payment network is not Base Sepolia");
  if (requirement.asset.toLowerCase() !== TESTNET_USDC_ADDRESS.toLowerCase()) throw new Error("payment asset is not testnet USDC");
  if (requirement.amount !== TESTNET_USDC_ATOMIC_AMOUNT) throw new Error("payment amount is not 0.01 USDC");
  if (!isPayableAddress(requirement.payTo)) throw new Error("payment recipient is unset or the zero address");
  if (requirement.payTo.toLowerCase() !== expectedPayTo.toLowerCase()) throw new Error("payment recipient does not match configured payTo");
  if (!isBillablePaymentResource(expectedResource)) throw new Error(`payment resource ${normalizePaymentResource(expectedResource)} is not on the billing table`);
}
