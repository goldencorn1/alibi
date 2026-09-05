import { describe, expect, it } from "vitest";
import { GLOSSARY, pendingDefinitionCount, type TermId } from "@/src/ui/glossary";

describe("approved glossary", () => {
  it("has unique approved definitions with no pending entries", () => {
    const entries = Object.values(GLOSSARY);
    expect(new Set(entries.map((item) => item.term_id)).size).toBe(entries.length);
    expect(pendingDefinitionCount()).toBe(0);
    expect(entries.every((item) => item.display === "approved")).toBe(true);
  });

  it("keeps D1 BUY-only and D4 conservative", () => {
    const d1 = GLOSSARY.same_side_ratio;
    const d4 = GLOSSARY.first_trade_ratio;
    expect(d1.definition.en).toContain("eligible BUY entry records");
    expect(d1.definition.en).toContain("SELL records are context only");
    expect(d1.definition.en.toLowerCase()).not.toContain("economic-direction");
    expect(d4.label.en).toBe("Thin-History Ratio");
    expect(d4.definition.en).toContain("at most two");
    expect(d4.definition.en).toContain("Unknown history is excluded");
  });

  it("covers every displayed metric and protected status", () => {
    const required: TermId[] = [
      "summary", "attribution", "time_evidence_chain", "repricing_window", "language_window",
      "documented_language_window", "unattributed", "insufficient_evidence", "indeterminate",
      "data_status", "live", "recorded", "synthetic", "cluster", "same_side_ratio",
      "time_concentration", "median_profile_age_days", "first_trade_ratio", "entry_price_dispersion",
      "market_novelty_ratio", "herding_pattern", "confidence", "timestamp_uncertainty", "x402",
      "payment_required", "base_sepolia", "mcp", "erc8004", "provider_unavailable",
      "upstream_unavailable", "unavailable", "loading", "empty", "success", "error",
      "payment_invalid", "timeout", "unsupported_language", "cluster_without_verified_source",
    ];
    expect(required.every((termId) => GLOSSARY[termId])).toBe(true);
  });
});
