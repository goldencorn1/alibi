import { MCP_TOOL_NAMES } from "@/mcp/tools/catalog";
import { createAlibiMcpServer } from "@/mcp/server";

const server = createAlibiMcpServer();
console.log(JSON.stringify({ package_versions: { server: "2.0.0", client: "2.0.0" }, node_major: Number(process.versions.node.split(".")[0]), tools: MCP_TOOL_NAMES, stdio_server_constructed: Boolean(server), streamable_http_route: "/mcp", public_endpoint: false }, null, 2));
await server.close();
