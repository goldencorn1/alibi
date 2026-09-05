import { NextResponse } from "next/server";
import { existsSync } from "node:fs";
import path from "node:path";
import { getSafeConfig } from "@/src/config";

export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({ status: "ok", service: "alibi", api_version: "v1", data_status: "recorded", capabilities: { summary: true, attribution: true, audit: true, local_rag: true, database_migration: existsSync(path.join(process.cwd(), "db", "migrations", "001_platform_core.sql")), database_status: process.env.DATABASE_URL ? "configured" : "unavailable", mcp: true, extension: true }, config: getSafeConfig() }, { headers: { "cache-control": "no-store" } });
}
