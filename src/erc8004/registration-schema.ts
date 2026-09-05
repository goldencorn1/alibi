import { ERC8004_AGENT_NAME, ERC8004_CHAIN_ID, ERC8004_VALIDATION, IDENTITY_REGISTRY, REPUTATION_REGISTRY } from "@/src/erc8004/registry-config";

export interface AgentRegistrationDocument {
  type: "https://eips.ethereum.org/EIPS/eip-8004";
  name: typeof ERC8004_AGENT_NAME;
  description: string;
  capabilities: string[];
  service: Array<{ type: "web" | "mcp"; url: string; data_status: "recorded" | "live" }>;
  registrations: { chain_id: 84532; identity_registry: string; reputation_registry: string; validation: "not_enabled" };
  disclaimer: string;
}

export function registrationDocument(baseUrl = process.env.APP_BASE_URL ?? "http://127.0.0.1:3000"): AgentRegistrationDocument {
  return { type: "https://eips.ethereum.org/EIPS/eip-8004", name: ERC8004_AGENT_NAME, description: "Read-only evidence and timestamp analysis for public prediction-market data.", capabilities: ["time-evidence", "repricing-detection", "wallet-coverage", "audit-report"], service: [{ type: "web", url: `${baseUrl}/api/v1/summary`, data_status: baseUrl.includes("127.0.0.1") ? "recorded" : "live" }, { type: "mcp", url: `${baseUrl}/mcp`, data_status: baseUrl.includes("127.0.0.1") ? "recorded" : "live" }], registrations: { chain_id: ERC8004_CHAIN_ID, identity_registry: IDENTITY_REGISTRY, reputation_registry: REPUTATION_REGISTRY, validation: ERC8004_VALIDATION }, disclaimer: "Registration is an identity pointer, not a capability validation or endorsement." };
}
