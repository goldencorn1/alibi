import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { createAlibiMcpServer } from "@/mcp/server";

const server = createAlibiMcpServer();
await server.connect(new StdioServerTransport());
