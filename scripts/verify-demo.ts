import { mkdir, writeFile } from "node:fs/promises";
import { analyze } from "@/src/engine/analyze";
import { DEMO_PRESETS } from "@/src/presets";
import { budgetSnapshot } from "@/src/budget";
import { hasAnthropicCredentials, hasPaymentConfiguration, PAYMENT_NETWORK } from "@/src/config";

const mode = process.argv.includes("--mode") ? process.argv[process.argv.indexOf("--mode") + 1] : "recorded";

async function main() {
  if (mode !== "live" && mode !== "recorded") throw new Error("mode must be live or recorded");
  const results = [];
  for (const preset of DEMO_PRESETS) {
    const result = await analyze(preset.input, mode);
    results.push(result.ok
      ? { preset: preset.id, ok: true, data_status: result.bundle.data_status, market_count: result.bundle.markets.length, price_count: result.bundle.prices.length, trade_count: result.bundle.trades.length, window_count: result.bundle.windows.length, unattributed_count: result.bundle.windows.filter((item) => item.attribution_status === "unattributed").length, evidence_count: result.bundle.evidence.length, attribution_verified: result.bundle.windows.some((item) => item.attribution_status === "information_consistent" || item.attribution_status === "capital_consistent"), wallet: result.bundle.wallet_metrics ? { coverage_rate: result.bundle.wallet_metrics.coverage_rate, information_lead_rate: result.bundle.wallet_metrics.information_lead_rate, status: result.bundle.wallet_metrics.status } : null }
      : { preset: preset.id, ok: false, code: result.code, data_status: result.data_status, message: result.message });
  }
  const readonlyPassed = results.every((result) => result.ok);
  const livePrerequisites = hasAnthropicCredentials() && hasPaymentConfiguration() && Boolean(process.env.BASE_SEPOLIA_RPC_URL) && Boolean(process.env.BUYER_AGENT_PRIVATE_KEY) && process.env.X402_NETWORK === PAYMENT_NETWORK;
  const attributionVerified = results.some((result) => result.ok && result.attribution_verified);
  const passed = readonlyPassed && (mode === "recorded" || (livePrerequisites && attributionVerified));
  const report = { schema_version: "1.0.0", verification_mode: mode, status: passed ? "passed" : readonlyPassed ? "partial" : "blocked", generated_at: new Date().toISOString(), results, budget: budgetSnapshot(), live_prerequisites: mode === "live" ? { credentials_configured: livePrerequisites, attribution_verified: attributionVerified } : null, limitations: ["This report does not validate live Anthropic attribution or real Base Sepolia settlement unless those resources are configured."] };
  await mkdir("artifacts/verification", { recursive: true });
  await writeFile(`artifacts/verification/verify-${mode}.json`, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ status: report.status, mode, results: results.map((result) => ({ preset: result.preset, ok: result.ok, data_status: result.data_status })), output: `artifacts/verification/verify-${mode}.json` }));
  if (!passed) process.exitCode = 2;
}

main().catch((error) => { console.error(JSON.stringify({ status: "failed", error: error instanceof Error ? error.message : "unknown" })); process.exitCode = 1; });
