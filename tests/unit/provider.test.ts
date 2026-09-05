import { afterEach, describe, expect, it, vi } from "vitest";
import { parseAttributionDecision, requestAnthropicAttribution } from "@/src/providers/anthropic";
import { RepricingWindow, Evidence } from "@/src/contracts";

const window = { id: "rw-synthetic", market_id: "m1", token_id: "t1", start_at: "2026-09-01T09:00:00.000Z", end_at: "2026-09-01T09:30:00.000Z", start_price: 0.2, end_price: 0.3, absolute_change: 0.1, direction: "UP", threshold: 0.08, observation_window_minutes: 60, sample_fidelity_minutes: 1, merged_window_ids: [], attribution_status: "unattributed", evidence_ids: [], confidence: null, data_status: "synthetic", limitation: "synthetic test only" } as RepricingWindow;
const evidence = [{ id: "synthetic-evidence-1", url: "https://example.invalid/synthetic", title: "Synthetic evidence", published_at: "2026-09-01T09:15:00.000Z", retrieved_at: "2026-09-04T00:00:00.000Z", source_level: "synthetic-test-only", license_or_restriction: "Synthetic only", data_status: "synthetic", time_relation: "during" }] as Evidence[];

afterEach(() => vi.unstubAllEnvs());

describe("Anthropic attribution contract", () => {
  it("accepts only supplied evidence IDs in an explicitly synthetic response", () => {
    const result = parseAttributionDecision(JSON.stringify({ status: "information_consistent", evidence_ids: ["synthetic-evidence-1", "hallucinated-url"], confidence: 0.75, explanation: "Synthetic contract response only.", limitation: "Synthetic; not a live attribution." }), ["synthetic-evidence-1"]);
    expect(result?.status).toBe("information_consistent");
    expect(result?.evidence_ids).toEqual(["synthetic-evidence-1"]);
  });

  it("downgrades a response with no valid cited evidence to unattributed", () => {
    const result = parseAttributionDecision(JSON.stringify({ status: "capital_consistent", evidence_ids: ["not-supplied"], confidence: 0.9 }), ["synthetic-evidence-1"]);
    expect(result?.status).toBe("unattributed");
    expect(result?.evidence_ids).toEqual([]);
  });

  it("rejects invalid JSON and exposes missing live credentials without calling another provider", async () => {
    expect(parseAttributionDecision("not json", ["synthetic-evidence-1"])).toBeNull();
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const result = await requestAnthropicAttribution({ window, evidence });
    expect(result).toMatchObject({ ok: false, verified: false, provider: "anthropic", error_code: "credentials_missing" });
  });
});
