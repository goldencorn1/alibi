import { jsonResponse } from "@/src/contracts";
import { existsSync } from "node:fs";
import path from "node:path";
import { getSafeConfig } from "@/src/config";

export const runtime = "nodejs";

export async function GET() {
  return jsonResponse({
    status: "ok",
    service: "alibi",
    schema_version: "1.0.0",
    fixture_status: {
      recorded: existsSync(path.join(process.cwd(), "fixtures", "recorded")),
      synthetic: false,
    },
    external_calls: false,
    config: getSafeConfig(),
  });
}
