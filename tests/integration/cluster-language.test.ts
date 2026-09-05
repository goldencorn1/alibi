import { describe, expect, it } from "vitest";
import { runInvestigation } from "@/src/agents/orchestrator";

describe("cluster/language report integration", () => {
  it("keeps recorded status and exposes conservative cluster fields", async () => {
    const run = await runInvestigation("0x674887d1ac838099a48b629dff53f25b7b87ee08", "recorded");
    expect(run.result.ok).toBe(true);
    if (!run.result.ok) return;
    expect(run.result.bundle.data_status).toBe("recorded");
    expect(run.result.bundle.cluster_alerts?.[0]?.source_state).toBe("unknown");
    expect(run.result.bundle.cluster_alerts?.[0]?.state).toBe("insufficient_baseline");
    expect(run.result.bundle.language_windows).toEqual([]);
  });
});

