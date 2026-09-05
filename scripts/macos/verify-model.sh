#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"
export ALIBI_MODEL_PATH="${ALIBI_MODEL_PATH:-./models}"

node --input-type=module <<'NODE'
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const manifestPath = path.join(process.cwd(), "artifacts", "rag", "model-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const base = path.join(process.cwd(), "models", manifest.model);
let failed = false;
for (const item of manifest.files) {
  const file = path.join(base, item.path);
  try {
    const bytes = await readFile(file);
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (bytes.length !== item.bytes || digest !== item.sha256) {
      console.log(`MODEL_FILE=FAILED:${item.path}`);
      failed = true;
    } else {
      console.log(`MODEL_FILE=PASSED:${item.path}`);
    }
  } catch {
    console.log(`MODEL_FILE=MISSING:${item.path}`);
    failed = true;
  }
}
try {
  await stat(path.join(base, manifest.revision, "onnx", "model_q4.onnx"));
  console.log("MODEL_REVISION=present");
} catch {
  console.log("MODEL_REVISION=missing");
  failed = true;
}
console.log(`MODEL_MANIFEST=${failed ? "FAILED" : "PASSED"}`);
if (failed) process.exitCode = 1;
NODE
