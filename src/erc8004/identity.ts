import { ERC8004_CHAIN_ID, IDENTITY_REGISTRY } from "@/src/erc8004/registry-config";

export interface IdentityRegistrationPlan { chain_id: 84532; registry: string; owner: string | null; agent_wallet: string | null; agent_uri: string; tx_allowed: boolean; max_transactions: 1; }
export function identityRegistrationPlan(agentUri: string, owner = process.env.ALIBI_PAYMENT_ADDRESS ?? null): IdentityRegistrationPlan { return { chain_id: ERC8004_CHAIN_ID, registry: IDENTITY_REGISTRY, owner, agent_wallet: owner, agent_uri: agentUri, tx_allowed: Boolean(owner), max_transactions: 1 }; }
