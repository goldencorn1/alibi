import { describe, expect, it } from "vitest";
import { createInputDigest, assertSafeObservabilityText, validateAgentEvent, validateEventSequence } from "@/src/observability/events";

function event(overrides: Record<string, unknown> = {}) {
  return {
    run_id: "11111111-1111-4111-8111-111111111111",
    sequence: 1,
    agent_id: "input",
    event_type: "completed",
    status: "ok",
    started_at: "2026-09-04T00:00:00.000Z",
    completed_at: "2026-09-04T00:00:01.000Z",
    duration_ms: 1000,
    data_status: "recorded",
    input_digest: createInputDigest("market"),
    output_artifact: "artifacts/agent-runs/11111111-1111-4111-8111-111111111111/report.json",
    source_count: 1,
    coverage: null,
    retry_count: 0,
    cost_usd: null,
    error_code: null,
    policy_flags: ["recorded_replay"],
    ...overrides,
  };
}

describe("audit observability contract", () => {
  it("validates a safe event and enforces monotonically increasing sequences", () => {
    const first = validateAgentEvent(event());
    const second = validateAgentEvent(event({ sequence: 2, agent_id: "report" }));
    expect(first.output_artifact).not.toMatch(/[A-Z]:\\/);
    expect(() => validateEventSequence([first, second])).not.toThrow();
    expect(() => validateEventSequence([second, first])).toThrow("event_sequence_not_monotonic");
  });

  it("rejects credentials, payment signatures, JWTs, and private-key-shaped text", () => {
    expect(() => assertSafeObservabilityText("api_key: sk-ant-test-secret-value")).toThrow("observability_redaction_violation");
    expect(() => assertSafeObservabilityText("PAYMENT-SIGNATURE=opaque-payload")).toThrow("observability_redaction_violation");
    expect(() => assertSafeObservabilityText("eyJ" + "a".repeat(40))).toThrow("observability_redaction_violation");
    expect(() => assertSafeObservabilityText("0x" + "a".repeat(64))).toThrow("observability_redaction_violation");
  });

  it("rejects absolute artifact paths and out-of-budget event cost", () => {
    expect(() => validateAgentEvent(event({ output_artifact: "C:\\secrets\\report.json" }))).toThrow("absolute_output_artifact");
    expect(() => validateAgentEvent(event({ cost_usd: 10.01 }))).toThrow("invalid_cost");
  });
});
