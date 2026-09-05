import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const forbidden = /(-----BEGIN (?:RSA|EC|OPENSSH|PRIVATE) KEY-----|\bsk-[A-Za-z0-9]{20,}|PRIVATE_KEY|PAYMENT-SIGNATURE)/i;

async function jsonFiles(root: string, relative = ""): Promise<string[]> {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const next = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await jsonFiles(root, next));
    else if (entry.name.endsWith(".json") || entry.name.endsWith(".ndjson")) files.push(next);
  }
  return files;
}

async function main(): Promise<void> {
  const root = path.join(process.cwd(), "fixtures", "recorded");
  const files = await jsonFiles(root);
  const findings: string[] = [];
  for (const file of files) {
    const body = await readFile(path.join(root, file), "utf8");
    if (forbidden.test(body)) findings.push(file);
  }
  console.log(JSON.stringify({ status: findings.length ? "SECRET_SCAN_FAILED" : "CLEAN", scanned_files: files.length, findings }, null, 2));
  if (findings.length) process.exitCode = 1;
}

void main();
