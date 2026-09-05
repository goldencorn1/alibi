import { McpServer } from "@modelcontextprotocol/server";
import { MCP_TOOL_NAMES } from "@/mcp/tools/catalog";
import { handleTool } from "@/mcp/tools/handlers";

export function createAlibiMcpServer(): McpServer {
  const server = new McpServer({ name: "alibi-evidence-agent", version: "0.7.0" });
  for (const name of MCP_TOOL_NAMES) {
    server.registerTool(name, { description: `Read-only ${name} over recorded or explicitly live-labeled Alibi data.` }, async (args) => handleTool(name, args));
  }
  return server;
}
