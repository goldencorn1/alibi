import { analyze, AnalysisResult } from "@/src/engine/analyze";
import { AppMode } from "@/src/config";
import { createAuditRun } from "@/src/observability/audit-agent";
import { createInputDigest } from "@/src/observability/events";
import { PlatformAgentReport, PlatformRunResult } from "@/src/agents/contracts";
import { runQualityRiskAgent } from "@/src/agents/quality-risk";
import { summarizeAttributionAgent } from "@/src/agents/attribution";
import { runEvidenceAgent } from "@/src/agents/evidence";

/** The only execution coordinator. Logical agents are deterministic modules, not LLM workers. */
export async function runInvestigation(rawInput: string, mode: AppMode = "recorded"): Promise<PlatformRunResult & { result: AnalysisResult }> {
  const audit = await createAuditRun(rawInput);
  const result = await analyze(rawInput, mode, { auditRun: audit });
  if (!result.ok) {
    return {
      run_id: audit.run_id,
      bundle: null,
      reports: [],
      data_status: result.data_status,
      final_state: { state: result.code === "invalid_input" ? "error" : "insufficient_evidence", data_status: result.data_status, policy_flags: [], limitations: [result.message] },
      result,
    };
  }
  const context = { run_id: audit.run_id, input_digest: createInputDigest(rawInput), mode, data_status: result.bundle.data_status, now: new Date().toISOString() };
  const evidence = runEvidenceAgent(result.bundle.evidence, context, result.bundle.cluster_alerts ?? [], result.bundle.language_windows ?? []);
  const attribution = summarizeAttributionAgent(result.bundle, context);
  const qualityRisk = runQualityRiskAgent(result.bundle, context);
  const reportWorker = await audit.startWorker("report", { data_status: result.bundle.data_status, output_artifact: `artifacts/agent-runs/${audit.run_id}/report.json`, source_count: result.bundle.markets.length });
  await audit.completeWorker(reportWorker, { data_status: result.bundle.data_status, output_artifact: `artifacts/agent-runs/${audit.run_id}/report.json`, source_count: result.bundle.markets.length });
  await audit.skipWorker("payment", { data_status: result.bundle.data_status, policy_flags: ["not_requested"] });
  const report = await audit.getReport();
  const reportFor = (id: "evidence" | "attribution" | "quality-risk" | "audit-report") => report.workers.find((worker) => worker.agent_id === id);
  const reports: PlatformAgentReport[] = [evidence, attribution, qualityRisk].map((agent) => {
    const worker = reportFor(agent.agent_id);
    return { agent_id: agent.agent_id, started_at: worker?.started_at ?? context.now, completed_at: worker?.completed_at ?? context.now, duration_ms: worker?.duration_ms ?? 0, status: worker?.status === "blocked" ? "blocked" as const : worker?.status === "insufficient" ? "insufficient" as const : "ok" as const, data_status: context.data_status, output_artifact: worker?.output_artifact ?? null, error_code: worker?.error_code ?? null };
  });
  reports.push({ agent_id: "audit-report", started_at: report.meta.generated_at, completed_at: report.meta.generated_at, duration_ms: 0, status: report.meta.status === "failed" ? "failed" : "ok", data_status: report.meta.data_status, output_artifact: report.exports.json, error_code: null });
  return { run_id: audit.run_id, bundle: result.bundle, reports, data_status: result.bundle.data_status, final_state: qualityRisk.final_state, result };
}
