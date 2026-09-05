import { AnalysisBundle, ClusterAlert, DataStatus, FinalStateReport, LanguageWindow, PlatformAgentId, QualityRiskReport } from "@/src/contracts";

export interface PlatformAgentContext {
  run_id: string;
  input_digest: string;
  mode: "live" | "recorded";
  data_status: DataStatus;
  now: string;
}

export interface EvidenceAgentResult {
  agent_id: "evidence";
  evidence_count: number;
  accepted_count: number;
  rejected_count: number;
  evidence_ids: string[];
  data_status: DataStatus;
  policy_flags: string[];
  cluster_alert_count: number;
  language_window_count: number;
  source_state: "found" | "not_found" | "unknown";
}

export interface AttributionAgentResult {
  agent_id: "attribution";
  provider: "anthropic" | "none";
  status: "verified" | "provider_unavailable" | "unattributed" | "insufficient_evidence";
  attributed_count: number;
  unattributed_count: number;
  data_status: DataStatus;
  policy_flags: string[];
}

export interface QualityRiskAgentResult {
  agent_id: "quality-risk";
  quality: QualityRiskReport;
  final_state: FinalStateReport;
}

export interface PlatformAgentReport {
  agent_id: PlatformAgentId;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  status: "ok" | "blocked" | "insufficient" | "failed";
  data_status: DataStatus;
  output_artifact: string | null;
  error_code: string | null;
}

export interface PlatformRunResult {
  run_id: string;
  bundle: AnalysisBundle | null;
  reports: PlatformAgentReport[];
  data_status: DataStatus;
  final_state: FinalStateReport;
}
