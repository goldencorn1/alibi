import { AttributionAgentResult, PlatformAgentContext } from "@/src/agents/contracts";
import { AnalysisBundle } from "@/src/contracts";
import { hasAnthropicCredentials } from "@/src/config";

export function summarizeAttributionAgent(bundle: AnalysisBundle, context: PlatformAgentContext): AttributionAgentResult {
  const attributed = bundle.windows.filter((window) => window.attribution_status !== "unattributed").length;
  const unattributed = bundle.windows.length - attributed;
  const providerAvailable = hasAnthropicCredentials();
  return {
    agent_id: "attribution",
    provider: providerAvailable ? "anthropic" : "none",
    status: providerAvailable && attributed > 0 ? "verified" : bundle.windows.length === 0 ? "insufficient_evidence" : providerAvailable ? "unattributed" : "provider_unavailable",
    attributed_count: attributed,
    unattributed_count: unattributed,
    data_status: context.data_status,
    policy_flags: providerAvailable ? (unattributed > 0 ? ["unattributed"] : []) : ["provider_unavailable", "live_unverified"],
  };
}
