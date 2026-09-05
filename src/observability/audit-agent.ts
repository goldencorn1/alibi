import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  AgentEvent,
  AgentEventStatus,
  AgentWorkerReport,
  AuditReport,
  AuditReportStatus,
  DataStatus,
  DISCLAIMER,
  ErrorCode,
  LOGICAL_AGENT_IDS,
  LogicalAgentId,
  PolicyFlag,
  SCHEMA_VERSION,
  WorkerReportStatus,
  mergeDataStatuses,
} from "@/src/contracts";
import { createInputDigest, validateAgentEvent, validateEventSequence, WorkerEventMetadata } from "@/src/observability/events";

const RUN_ROOT = path.join(process.cwd(), "artifacts", "agent-runs");
const activeRuns = new Map<string, AuditReportAgent>();

export interface WorkerToken {
  agent_id: LogicalAgentId;
  started_at: string;
}

function artifactPath(runId: string, name: "events" | "json" | "markdown"): string {
  const file = name === "events" ? "events.jsonl" : name === "json" ? "report.json" : "report.md";
  return path.join(RUN_ROOT, runId, file);
}

function relativeArtifactPath(runId: string, name: "events" | "json" | "markdown"): string {
  const file = name === "events" ? "events.jsonl" : name === "json" ? "report.json" : "report.md";
  return `artifacts/agent-runs/${runId}/${file}`;
}

function now(): string {
  return new Date().toISOString();
}

function statusFromEvent(event: AgentEvent): WorkerReportStatus {
  if (event.event_type === "skipped") return "skipped";
  if (event.status === "running") return "running";
  if (event.status === "insufficient") return "insufficient";
  if (event.status === "blocked") return "blocked";
  if (event.status === "failed") return "failed";
  return "ok";
}

function latestTerminal(events: AgentEvent[]): AgentEvent | null {
  const latestStartedIndex = [...events].map((event) => event.event_type).lastIndexOf("started");
  const currentAttempt = latestStartedIndex >= 0 ? events.slice(latestStartedIndex) : events;
  return [...currentAttempt].reverse().find((event) => event.event_type !== "started") ?? null;
}

function workerReport(agentId: LogicalAgentId, events: AgentEvent[]): AgentWorkerReport {
  const latestStartedIndex = [...events].map((event) => event.event_type).lastIndexOf("started");
  const currentAttempt = latestStartedIndex >= 0 ? events.slice(latestStartedIndex) : events;
  const terminal = latestTerminal(events);
  const started = currentAttempt.find((event) => event.event_type === "started") ?? null;
  const statuses = events.map((event) => event.data_status);
  const flags = [...new Set(events.flatMap((event) => event.policy_flags))] as PolicyFlag[];
  const costs = events.filter((event) => event.event_type !== "started").map((event) => event.cost_usd).filter((value): value is number => value !== null);
  return {
    agent_id: agentId,
    status: terminal ? statusFromEvent(terminal) : "running",
    event_count: events.length,
    started_at: started?.started_at ?? null,
    completed_at: terminal?.completed_at ?? null,
    duration_ms: terminal?.duration_ms ?? null,
    data_status: mergeDataStatuses(statuses),
    input_digest: terminal?.input_digest ?? started?.input_digest ?? null,
    output_artifact: terminal?.output_artifact ?? started?.output_artifact ?? null,
    source_count: terminal?.source_count ?? started?.source_count ?? null,
    coverage: terminal?.coverage ?? started?.coverage ?? null,
    retry_count: terminal?.retry_count ?? started?.retry_count ?? 0,
    cost_usd: costs.length ? costs.reduce((total, value) => total + value, 0) : null,
    error_code: terminal?.error_code ?? null,
    policy_flags: flags,
  };
}

function reportStatus(workers: AgentWorkerReport[]): AuditReportStatus {
  if (workers.some((worker) => worker.status === "failed")) return "failed";
  if (workers.some((worker) => worker.status === "running")) return "running";
  if (workers.some((worker) => worker.status === "blocked" || worker.status === "insufficient")) return "partial";
  return "completed";
}

function limitationsFor(workers: AgentWorkerReport[]): string[] {
  const flags = new Set(workers.flatMap((worker) => worker.policy_flags));
  return [
    "Audit & Report Agent 只汇总事件，不修改业务结果。",
    ...(flags.has("credentials_missing") ? ["Anthropic 凭据缺失；live attribution 未验证。"] : []),
    ...(flags.has("coverage_below_gate") ? ["Coverage 低于 40%；不输出钱包能力或先手率结论。"] : []),
    ...(flags.has("unattributed") || flags.has("no_verified_evidence") ? ["没有足够的可验证来源；窗口保持 Unattributed。"] : []),
    ...(flags.has("payment_required") ? ["Detail 需要 x402 payment；未支付时不展示付费结果。"] : []),
  ];
}

export function buildAuditReport(events: AgentEvent[], runId: string): AuditReport {
  const validEvents = events.map(validateAgentEvent).sort((a, b) => a.sequence - b.sequence);
  validateEventSequence(validEvents);
  if (validEvents.some((event) => event.run_id !== runId)) throw new Error("event_run_id_mismatch");
  const workers = LOGICAL_AGENT_IDS.map((agentId) => workerReport(agentId, validEvents.filter((event) => event.agent_id === agentId)));
  const terminalDurations = workers.map((worker) => worker.duration_ms ?? 0);
  const workerCosts = workers.map((worker) => worker.cost_usd ?? 0);
  const status = reportStatus(workers);
  const dataStatus = mergeDataStatuses(validEvents.map((event) => event.data_status));
  return {
    kind: "audit",
    meta: {
      schema_version: SCHEMA_VERSION,
      run_id: runId,
      generated_at: now(),
      status,
      data_status: dataStatus,
      worker_count: LOGICAL_AGENT_IDS.length,
      event_count: validEvents.length,
      total_duration_ms: terminalDurations.reduce((total, value) => total + value, 0),
      total_cost_usd: workerCosts.reduce((total, value) => total + value, 0),
      limitations: limitationsFor(workers),
      disclaimer: DISCLAIMER,
    },
    workers,
    events: validEvents,
    exports: {
      json: relativeArtifactPath(runId, "json"),
      markdown: relativeArtifactPath(runId, "markdown"),
    },
  };
}

export function renderAuditMarkdown(report: AuditReport): string {
  const rows = report.workers.map((worker) => `| ${worker.agent_id} | ${worker.status} | ${worker.data_status} | ${worker.duration_ms ?? "—"} | ${worker.source_count ?? "—"} | ${worker.coverage === null ? "—" : `${(worker.coverage * 100).toFixed(2)}%`} | ${worker.retry_count} | ${worker.cost_usd ?? "—"} | ${worker.policy_flags.join(", ") || "—"} |`).join("\n");
  return [
    "# Alibi Audit & Report",
    "",
    `- run_id: ${report.meta.run_id}`,
    `- status: ${report.meta.status}`,
    `- data_status: ${report.meta.data_status}`,
    `- workers: ${report.meta.worker_count}`,
    `- events: ${report.meta.event_count}`,
    `- duration_ms: ${report.meta.total_duration_ms}`,
    `- cost_usd: ${report.meta.total_cost_usd.toFixed(4)}`,
    "",
    "| Worker | Status | Data status | Duration ms | Sources | Coverage | Retry | Cost USD | Policy flags |",
    "|---|---|---:|---:|---:|---:|---:|---:|---|",
    rows,
    "",
    "## Limitations",
    "",
    ...report.meta.limitations.map((item) => `- ${item}`),
    "",
    report.meta.disclaimer,
    "",
  ].join("\n");
}

export class AuditReportAgent {
  readonly run_id: string;
  readonly input_digest: string;
  private readonly events: AgentEvent[] = [];
  private sequence = 0;
  private writeChain: Promise<void> = Promise.resolve();

  private constructor(runId: string, inputDigest: string) {
    this.run_id = runId;
    this.input_digest = inputDigest;
  }

  static async create(rawInput: string): Promise<AuditReportAgent> {
    const run = new AuditReportAgent(randomUUID(), createInputDigest(rawInput));
    await mkdir(path.join(RUN_ROOT, run.run_id), { recursive: true });
    activeRuns.set(run.run_id, run);
    return run;
  }

  private async append(event: Omit<AgentEvent, "sequence">): Promise<AgentEvent> {
    const validated = validateAgentEvent({ ...event, sequence: this.sequence + 1 });
    this.sequence = validated.sequence;
    this.events.push(validated);
    this.writeChain = this.writeChain.then(() => appendFile(artifactPath(this.run_id, "events"), `${JSON.stringify(validated)}\n`, "utf8"));
    await this.writeChain;
    await this.persistReport();
    return validated;
  }

  private metadataDefaults(metadata: WorkerEventMetadata): Required<WorkerEventMetadata> {
    return {
      data_status: metadata.data_status,
      output_artifact: metadata.output_artifact ?? null,
      source_count: metadata.source_count ?? null,
      coverage: metadata.coverage ?? null,
      retry_count: metadata.retry_count ?? 0,
      cost_usd: metadata.cost_usd ?? null,
      error_code: metadata.error_code ?? null,
      policy_flags: metadata.policy_flags ?? [],
    };
  }

  async startWorker(agentId: LogicalAgentId, metadata: WorkerEventMetadata): Promise<WorkerToken> {
    const startedAt = now();
    const defaults = this.metadataDefaults(metadata);
    await this.append({
      run_id: this.run_id,
      agent_id: agentId,
      event_type: "started",
      status: "running",
      started_at: startedAt,
      completed_at: null,
      duration_ms: null,
      input_digest: this.input_digest,
      ...defaults,
    });
    return { agent_id: agentId, started_at: startedAt };
  }

  async completeWorker(token: WorkerToken, metadata: WorkerEventMetadata, status: Exclude<AgentEventStatus, "pending" | "running"> = "ok"): Promise<AgentEvent> {
    const completedAt = now();
    const defaults = this.metadataDefaults(metadata);
    const duration = Math.max(0, Date.parse(completedAt) - Date.parse(token.started_at));
    return this.append({
      run_id: this.run_id,
      agent_id: token.agent_id,
      event_type: "completed",
      status,
      started_at: token.started_at,
      completed_at: completedAt,
      duration_ms: duration,
      input_digest: this.input_digest,
      ...defaults,
    });
  }

  async skipWorker(agentId: LogicalAgentId, metadata: WorkerEventMetadata): Promise<AgentEvent> {
    const timestamp = now();
    const defaults = this.metadataDefaults(metadata);
    return this.append({
      run_id: this.run_id,
      agent_id: agentId,
      event_type: "skipped",
      status: "ok",
      started_at: timestamp,
      completed_at: timestamp,
      duration_ms: 0,
      input_digest: this.input_digest,
      ...defaults,
    });
  }

  async failWorker(token: WorkerToken, errorCode: ErrorCode, metadata: WorkerEventMetadata): Promise<AgentEvent> {
    return this.completeWorker(token, { ...metadata, error_code: errorCode }, "failed");
  }

  async getReport(): Promise<AuditReport> {
    return buildAuditReport(this.events, this.run_id);
  }

  private async persistReport(): Promise<void> {
    const report = await this.getReport();
    await writeFile(artifactPath(this.run_id, "json"), JSON.stringify(report, null, 2), "utf8");
    await writeFile(artifactPath(this.run_id, "markdown"), renderAuditMarkdown(report), "utf8");
  }
}

export function getActiveAuditRun(runId: string): AuditReportAgent | undefined {
  return activeRuns.get(runId);
}

export async function createAuditRun(rawInput: string): Promise<AuditReportAgent> {
  return AuditReportAgent.create(rawInput);
}

export async function getAuditReport(runId: string): Promise<AuditReport | null> {
  const active = getActiveAuditRun(runId);
  if (active) return active.getReport();
  const file = artifactPath(runId, "events");
  try {
    const raw = await readFile(file, "utf8");
    const events = raw.split(/\r?\n/).filter(Boolean).map((line) => validateAgentEvent(JSON.parse(line)));
    return events.length ? buildAuditReport(events, runId) : null;
  } catch {
    return null;
  }
}

export function isValidRunId(runId: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(runId);
}
