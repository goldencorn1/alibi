import { DEFAULTS } from "@/src/contracts";

export const PAYMENT_NETWORK = "eip155:84532" as const;
export const PAYMENT_PRICE = "$0.01" as const;
export const TESTNET_USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
export const TESTNET_USDC_ATOMIC_AMOUNT = "10000" as const;

export type AppMode = "live" | "recorded";

export function getAppMode(value = process.env.ALIBI_DATA_MODE): AppMode {
  return value === "live" ? "live" : "recorded";
}

export function getFacilitatorUrl(): string {
  return process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";
}

export function getAnthropicModel(): string {
  return process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
}

export function hasAnthropicCredentials(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function hasPaymentConfiguration(): boolean {
  return Boolean(process.env.ALIBI_PAYMENT_ADDRESS);
}

export function getSafeConfig() {
  return {
    mode: getAppMode(),
    hasAnthropicKey: hasAnthropicCredentials(),
    hasPaymentAddress: hasPaymentConfiguration(),
    facilitatorUrl: getFacilitatorUrl(),
    paymentNetwork: PAYMENT_NETWORK,
    paymentPrice: PAYMENT_PRICE,
    thresholds: DEFAULTS,
  };
}
