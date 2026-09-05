import { describe, expect, it } from "vitest";
import type { AuditReport } from "@/src/contracts";
import { renderAuditMarkdown } from "@/src/reports/markdown";

const report = {
  kind: "audit",
  meta: {
    schema_version: "1.1.0",
    run_id: "run-recorded-001",
    generated_at: "2026-09-05T00:00:00.000Z",
    status: "completed",
    data_status: "recorded",
    worker_count: 1,
    event_count: 1,
    total_duration_ms: 123,
    total_cost_usd: 0,
    limitations: ["Original source: https://example.test/source|raw"],
    disclaimer: "No investment advice.",
  },
  workers: [{
    agent_id: "evidence",
    status: "ok",
    event_count: 1,
    started_at: null,
    completed_at: null,
    duration_ms: 123,
    data_status: "recorded",
    input_digest: "hash",
    output_artifact: null,
    source_count: 1,
    coverage: 1,
    retry_count: 0,
    cost_usd: 0,
    error_code: null,
    policy_flags: ["recorded_replay"],
  }],
  events: [],
  exports: { json: "/audit?format=json", markdown: "/audit?format=markdown" },
} satisfies AuditReport;

describe("Audit Markdown renderer", () => {
  it("localizes headings while preserving raw IDs, statuses, URLs, flags, and disclaimer", () => {
    const zh = renderAuditMarkdown(report, "zh-CN");
    const en = renderAuditMarkdown(report, "en");
    expect(zh).toContain("# Alibi 审计与报告");
    expect(en).toContain("# Alibi Audit & Report");
    for (const output of [zh, en]) {
      expect(output).toContain("run-recorded-001");
      expect(output).toContain("recorded_replay");
      expect(output).toContain("https://example.test/source|raw");
      expect(output).toContain("No investment advice.");
    }
  });
});
