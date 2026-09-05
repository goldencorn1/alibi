import { createHash } from "node:crypto";
import {
  AgentEvent,
  AgentEventStatus,
  AgentEventType,
  DataStatus,
  ErrorCode,
  LOGICAL_AGENT_IDS,
  LogicalAgentId,
  PolicyFlag,
} from "@/src/contracts";

const RUN_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DIGEST_PATTERN = /^[0-9a-f]{64}$/;

export interface WorkerEventMetadata {
  data_status: DataStatus;
  output_artifact?: string | null;
  source_count?: number | null;
  coverage?: number | null;
  retry_count?: number;
  cost_usd?: number | null;
  error_code?: ErrorCode | null;
  policy_flags?: PolicyFlag[];
}

export function createInputDigest(input: string): string {
  return createHash("sha256").update(input.trim(), "utf8").digest("hex");
}

export function isLogicalAgentId(value: unknown): value is LogicalAgentId {
  return typeof value === "string" && (LOGICAL_AGENT_IDS as readonly string[]).includes(value);
}

export function isAgentEventType(value: unknown): value is AgentEventType {
  return value === "started" || value === "completed" || value === "skipped" || value === "failed";
}

export function isAgentEventStatus(value: unknown): value is AgentEventStatus {
  return value === "pending" || value === "running" || value === "ok" || value === "blocked" || value === "failed" || value === "insufficient";
}

export function assertSafeObservabilityText(value: string): void {
  const forbidden = [
    /sk-ant-[a-z0-9_-]{8,}/i,
    /sk-[a-z0-9_-]{16,}/i,
    /(?:private[_ -]?key|api[_ -]?key|authorization|cookie|payment-signature)\s*[:=]/i,
    /eyJ[a-z0-9_-]{32,}/i,
    /0x[a-f0-9]{64}/i,
  ];
  if (forbidden.some((pattern) => pattern.test(value))) throw new Error("observability_redaction_violation");
}

export function validateAgentEvent(value: unknown): AgentEvent {
  if (!value || typeof value !== "object") throw new Error("invalid_agent_event");
  const event = value as Partial<AgentEvent>;
  const durationMs = event.duration_ms ?? null;
  const sourceCount = event.source_count ?? null;
  const coverage = event.coverage ?? null;
  const retryCount = event.retry_count ?? 0;
  const costUsd = event.cost_usd ?? null;
  if (typeof event.run_id !== "string" || !RUN_ID_PATTERN.test(event.run_id)) throw new Error("invalid_run_id");
  if (!Number.isInteger(event.sequence) || (event.sequence as number) < 1) throw new Error("invalid_sequence");
  if (!isLogicalAgentId(event.agent_id)) throw new Error("invalid_agent_id");
  if (!isAgentEventType(event.event_type) || !isAgentEventStatus(event.status)) throw new Error("invalid_event_status");
  if (typeof event.started_at !== "string" || !Number.isFinite(Date.parse(event.started_at))) throw new Error("invalid_started_at");
  if (event.completed_at !== null && (typeof event.completed_at !== "string" || !Number.isFinite(Date.parse(event.completed_at)))) throw new Error("invalid_completed_at");
  if (durationMs !== null && (!Number.isInteger(durationMs) || durationMs < 0)) throw new Error("invalid_duration");
  if (event.data_status !== "live" && event.data_status !== "recorded" && event.data_status !== "synthetic" && event.data_status !== "cached") throw new Error("invalid_data_status");
  if (typeof event.input_digest !== "string" || !DIGEST_PATTERN.test(event.input_digest)) throw new Error("invalid_input_digest");
  if (event.output_artifact !== null && typeof event.output_artifact !== "string") throw new Error("invalid_output_artifact");
  if (event.output_artifact && (event.output_artifact.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(event.output_artifact))) throw new Error("absolute_output_artifact");
  if (sourceCount !== null && (!Number.isInteger(sourceCount) || sourceCount < 0)) throw new Error("invalid_source_count");
  if (coverage !== null && (typeof coverage !== "number" || !Number.isFinite(coverage) || coverage < 0 || coverage > 1)) throw new Error("invalid_coverage");
  if (!Number.isInteger(retryCount) || retryCount < 0) throw new Error("invalid_retry_count");
  if (costUsd !== null && (typeof costUsd !== "number" || !Number.isFinite(costUsd) || costUsd < 0 || costUsd > 10)) throw new Error("invalid_cost");
  if (event.policy_flags && (!Array.isArray(event.policy_flags) || event.policy_flags.some((flag) => typeof flag !== "string"))) throw new Error("invalid_policy_flags");
  assertSafeObservabilityText(JSON.stringify(event));
  return {
    run_id: event.run_id,
    sequence: event.sequence as number,
    agent_id: event.agent_id,
    event_type: event.event_type,
    status: event.status,
    started_at: event.started_at,
    completed_at: event.completed_at,
    duration_ms: durationMs,
    data_status: event.data_status,
    input_digest: event.input_digest,
    output_artifact: event.output_artifact ?? null,
    source_count: sourceCount,
    coverage,
    retry_count: retryCount,
    cost_usd: costUsd,
    error_code: event.error_code ?? null,
    policy_flags: [...(event.policy_flags ?? [])],
  };
}

export function validateEventSequence(events: AgentEvent[]): void {
  let previous = 0;
  for (const event of events) {
    if (event.sequence <= previous) throw new Error("event_sequence_not_monotonic");
    previous = event.sequence;
  }
}
