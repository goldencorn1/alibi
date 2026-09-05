export const MCP_TOOL_NAMES = [
  "alibi_summary",
  "alibi_detail",
  "alibi_wallet_report",
  "alibi_rankings",
  "alibi_agent_run",
  "alibi_evidence",
  "alibi_health",
  "alibi_subscription_status",
] as const;

export type McpToolName = (typeof MCP_TOOL_NAMES)[number];
export function toolResult(payload: unknown) { return { content: [{ type: "text" as const, text: JSON.stringify(payload) }] }; }
export function toolCatalog() { return MCP_TOOL_NAMES.map((name) => ({ name, data_status: "recorded" as const, mutates_business_result: false })); }
