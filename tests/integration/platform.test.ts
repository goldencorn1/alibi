import { describe, expect, it } from "vitest";
import { runInvestigation } from "@/src/agents/orchestrator";

describe("v0.7 platform orchestrator", () => {
  it("runs one deterministic orchestrator and keeps recorded status visible", async () => {
    const run = await runInvestigation("0x674887d1ac838099a48b629dff53f25b7b87ee08", "recorded");
    expect(run.result.ok).toBe(true);
    expect(run.data_status).toBe("recorded");
    expect(run.reports.map((report) => report.agent_id)).toEqual(["evidence", "attribution", "quality-risk", "audit-report"]);
    expect(run.final_state.data_status).toBe("recorded");
    expect(run.final_state.state).toBe("insufficient_evidence");
  });
});
