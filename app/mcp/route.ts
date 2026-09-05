import { createMcpHandler } from "@modelcontextprotocol/server";
import { createAlibiMcpServer } from "@/mcp/server";

export const runtime = "nodejs";
const handler = createMcpHandler(async () => createAlibiMcpServer());
export async function POST(request: Request): Promise<Response> { return handler.fetch(request); }
export async function GET(request: Request): Promise<Response> { return handler.fetch(request); }
export async function DELETE(request: Request): Promise<Response> { return handler.fetch(request); }
