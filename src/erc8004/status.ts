import { registrationDocument } from "@/src/erc8004/registration-schema";
import { ERC8004_AGENT_NAME, ERC8004_CHAIN_ID, ERC8004_VALIDATION, IDENTITY_REGISTRY, REPUTATION_REGISTRY } from "@/src/erc8004/registry-config";
import { validateErc8004WalletRelation } from "@/src/erc8004/wallet";

export function erc8004Status() {
  const owner = process.env.ALIBI_PAYMENT_ADDRESS ?? null; const client = process.env.ERC8004_CLIENT_ADDRESS ?? null;
  const relation = validateErc8004WalletRelation(owner, owner, client);
  return { kind: "erc8004-status", status: relation.ok ? "ready_for_gated_testnet" : "unavailable", data_status: "recorded" as const, agent_name: ERC8004_AGENT_NAME, chain_id: ERC8004_CHAIN_ID, identity_registry: IDENTITY_REGISTRY, reputation_registry: REPUTATION_REGISTRY, validation: ERC8004_VALIDATION, owner_configured: Boolean(owner), client_configured: Boolean(client), owner_equals_payment: relation.ok, agent_wallet: "owner_initially", set_agent_wallet_transactions: 0, custom_registry: false, registration_is_capability_validation: false, registration_document: registrationDocument(), limitation: relation.ok ? "No transaction is sent by status endpoint." : relation.reason };
}
