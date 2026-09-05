import { PaymentRequirements } from "@x402/core/types";
import { PAYMENT_NETWORK, TESTNET_USDC_ADDRESS, TESTNET_USDC_ATOMIC_AMOUNT } from "@/src/config";

export function assertAllowedPayment(requirement: PaymentRequirements, expectedPayTo: string, expectedResource: string): void {
  if (requirement.scheme !== "exact") throw new Error("payment scheme is not exact");
  if (requirement.network !== PAYMENT_NETWORK) throw new Error("payment network is not Base Sepolia");
  if (requirement.asset.toLowerCase() !== TESTNET_USDC_ADDRESS.toLowerCase()) throw new Error("payment asset is not testnet USDC");
  if (requirement.amount !== TESTNET_USDC_ATOMIC_AMOUNT) throw new Error("payment amount is not 0.01 USDC");
  if (requirement.payTo.toLowerCase() !== expectedPayTo.toLowerCase()) throw new Error("payment recipient does not match configured payTo");
  if (expectedResource !== "/attribution") throw new Error("payment resource policy is not restricted to /attribution");
}
