import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.join(process.cwd(), "fixtures", "recorded", "iran-2026-02-28");
const required = ["manifest.json", "market.json", "trades.ndjson", "prices.ndjson", "profiles.ndjson", "sources.json", "derived-result.json", "README.md", "SHA256SUMS.txt"];

async function main(): Promise<void> {
  const missing: string[] = [];
  for (const file of required) {
    try {
      await access(path.join(root, file));
    } catch {
      missing.push(file);
    }
  }
  if (missing.length > 0) {
    console.log(JSON.stringify({ status: "CASE_NOT_REPRODUCED", case: "iran-2026-02-28", missing }, null, 2));
    return;
  }
  const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8")) as { fixture_status?: string; algorithm_version?: string };
  if (manifest.fixture_status !== "recorded") {
    console.log(JSON.stringify({ status: "CASE_NOT_REPRODUCED", case: "iran-2026-02-28", reason: "fixture_status_not_recorded" }, null, 2));
    return;
  }
  console.log(JSON.stringify({ status: "RECORDED_CASE_READY_FOR_REPLAY", case: "iran-2026-02-28", algorithm_version: manifest.algorithm_version ?? null }, null, 2));
}

void main();

