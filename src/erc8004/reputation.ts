import { ERC8004_CHAIN_ID, REPUTATION_REGISTRY } from "@/src/erc8004/registry-config";

export interface ReputationPlan { chain_id: 84532; registry: string; client: string | null; subject_agent_id: string | null; tx_allowed: boolean; max_transactions: 1; validation: "not_enabled"; }
export function reputationPlan(client = process.env.ERC8004_CLIENT_ADDRESS ?? null, subjectAgentId = process.env.ERC8004_AGENT_ID ?? null): ReputationPlan { return { chain_id: ERC8004_CHAIN_ID, registry: REPUTATION_REGISTRY, client, subject_agent_id: subjectAgentId, tx_allowed: Boolean(client && subjectAgentId), max_transactions: 1, validation: "not_enabled" }; }
