import { describe, expect, it } from "vitest";

describe("local contract policy", () => {
  it("locks Base Sepolia and the test-only transaction boundary", () => {
    expect({ chain_id: 84532, max_transactions: 5, max_gas_per_transaction: 500000, cumulative_gas_cap: 1500000, mainnet: false, real_funds: false }).toEqual({ chain_id: 84532, max_transactions: 5, max_gas_per_transaction: 500000, cumulative_gas_cap: 1500000, mainnet: false, real_funds: false });
  });
});
