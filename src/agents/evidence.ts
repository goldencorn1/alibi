import { EvidenceAgentResult, PlatformAgentContext } from "@/src/agents/contracts";
import { validateEvidence } from "@/src/data/evidence";
import { ClusterAlert, Evidence, LanguageWindow } from "@/src/contracts";

export function runEvidenceAgent(evidence: Evidence[], context: PlatformAgentContext, clusterAlerts: ClusterAlert[] = [], languageWindows: LanguageWindow[] = []): EvidenceAgentResult {
  const validation = validateEvidence(evidence);
  return {
    agent_id: "evidence",
    evidence_count: evidence.length,
    accepted_count: validation.valid.length,
    rejected_count: validation.rejected.length,
    evidence_ids: validation.valid.map((item) => item.id),
    data_status: context.data_status,
    policy_flags: validation.valid.length === 0 && evidence.length > 0 ? ["no_verified_evidence"] : [],
    cluster_alert_count: clusterAlerts.length,
    language_window_count: languageWindows.length,
    source_state: clusterAlerts[0]?.source_state ?? "unknown",
  };
}
