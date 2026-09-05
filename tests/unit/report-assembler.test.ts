import { describe, expect, it } from "vitest";
import { assembleReports } from "@/src/reports/assembler";
import { AnalysisBundle } from "@/src/contracts";

const bundle = {
  input: { kind: "market", raw: "market-slug", normalized_id: "market-slug", source_url: null },
  markets: [], prices: [], windows: [], evidence: [], trades: [], wallet_metrics: null,
  source_status: [], data_status: "recorded", limitations: [],
} as AnalysisBundle;

describe("report assembler", () => {
  it("builds the public Summary and Detail contracts without changing the bundle", () => {
    const reports = assembleReports(bundle);
    expect(reports.summary.kind).toBe("summary");
    expect(reports.detail.kind).toBe("detail");
    expect(bundle.data_status).toBe("recorded");
  });
});
