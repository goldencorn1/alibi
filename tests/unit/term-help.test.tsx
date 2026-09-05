import { describe, expect, it } from "vitest";
import { GLOSSARY, pendingDefinitionCount } from "@/src/ui/glossary";
import { TermHelp, TermHelpProvider } from "@/src/ui/term-help";

describe("TermHelp integration contract", () => {
  it("exports a reusable provider and button component with approved terms", () => {
    expect(typeof TermHelpProvider).toBe("function");
    expect(typeof TermHelp).toBe("function");
    expect(GLOSSARY.same_side_ratio.term_id).toBe("same_side_ratio");
    expect(GLOSSARY.first_trade_ratio.term_id).toBe("first_trade_ratio");
    expect(pendingDefinitionCount()).toBe(0);
  });
});
