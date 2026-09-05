import { toolResult } from "@/mcp/tools/catalog";
import { getSafeConfig } from "@/src/config";
import { registrationDocument } from "@/src/erc8004/registration-schema";

export function handleTool(name: string, args: unknown = {}) {
  const input = args && typeof args === "object" && typeof (args as Record<string, unknown>).input === "string" ? (args as Record<string, unknown>).input : null;
  if (name === "alibi_health") return toolResult({ status: "ok", data_status: "recorded", config: getSafeConfig() });
  if (name === "alibi_subscription_status") return toolResult({ status: "not_enabled", data_status: "recorded", network: "eip155:84532" });
  if (name === "alibi_evidence") return toolResult({ evidence: [], data_status: "recorded", limitation: "Evidence is only admitted from verified input records." });
  if (name === "alibi_agent_run") return toolResult({ run_id: input, status: "read_only_lookup", data_status: "recorded" });
  if (name === "alibi_rankings" || name === "alibi_wallet_report") return toolResult({ status: "recorded_replay", input, data_status: "recorded", coverage_gate: "40%" });
  if (name === "alibi_detail") return toolResult({ status: "payment_required", data_status: "recorded", payment: { network: "eip155:84532", price: "0.01 USDC" } });
  if (name === "alibi_summary") return toolResult({ status: "recorded_replay", input, data_status: "recorded", registration: registrationDocument().name });
  return toolResult({ error: "unknown_tool" });
}
