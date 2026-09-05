import { describe, expect, it } from "vitest";
import { MCP_TOOL_NAMES, toolCatalog } from "@/mcp/tools/catalog";
import { handleTool } from "@/mcp/tools/handlers";

describe("MCP local eight-tool contract", () => {
  it("has exactly eight read-only tools", () => { expect(MCP_TOOL_NAMES).toHaveLength(8); expect(toolCatalog().every((tool) => tool.mutates_business_result === false)).toBe(true); });
  it("does not expose a secret in tool output", () => { const result = handleTool("alibi_health"); expect(JSON.stringify(result)).not.toMatch(/api[_-]?key|private[_-]?key|authorization|payment-signature/i); });
  it("keeps detail behind the payment boundary", () => { expect(JSON.stringify(handleTool("alibi_detail"))).toContain("payment_required"); });
});
