import { describe, expect, it } from "vitest";
import { assertAllowedPayment } from "@/src/payment/policy";
import { PAYMENT_NETWORK, TESTNET_USDC_ADDRESS, TESTNET_USDC_ATOMIC_AMOUNT } from "@/src/config";

const valid = { scheme: "exact", network: PAYMENT_NETWORK, asset: TESTNET_USDC_ADDRESS, amount: TESTNET_USDC_ATOMIC_AMOUNT, payTo: "0x1234567890123456789012345678901234567890", maxTimeoutSeconds: 120, extra: {} };

describe("x402 payment policy", () => {
  it("accepts only the approved Base Sepolia exact terms", () => {
    expect(() => assertAllowedPayment(valid, valid.payTo, "/attribution")).not.toThrow();
  });

  it("rejects wrong network, asset, amount, recipient, and resource policy", () => {
    expect(() => assertAllowedPayment({ ...valid, network: "eip155:1" }, valid.payTo, "/attribution")).toThrow();
    expect(() => assertAllowedPayment({ ...valid, asset: "0x0000000000000000000000000000000000000001" }, valid.payTo, "/attribution")).toThrow();
    expect(() => assertAllowedPayment({ ...valid, amount: "10001" }, valid.payTo, "/attribution")).toThrow();
    expect(() => assertAllowedPayment({ ...valid, payTo: "0x0000000000000000000000000000000000000001" }, valid.payTo, "/attribution")).toThrow();
    expect(() => assertAllowedPayment(valid, valid.payTo, "/summary")).toThrow();
  });
});
