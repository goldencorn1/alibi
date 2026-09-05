import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/server";

export function createMcpHttpTransport() { return new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined }); }
