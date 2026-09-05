import { mkdir, readFile, writeFile } from "node:fs/promises";
import { analyze } from "@/src/engine/analyze";
import { AnalysisBundle, DataSourceStatus, Evidence, MarketRecord, PricePoint, Trade } from "@/src/contracts";

interface Selection { markets: Array<{ source_url: string }>; wallets: Array<{ wallet: string }>; }

async function readSelection(): Promise<Selection> {
  return JSON.parse(await readFile("artifacts/verification/demo-selection.json", "utf8")) as Selection;
}

function asRecorded<T extends { data_status: string }>(items: T[]): T[] {
  return items.map((item) => ({ ...item, data_status: "recorded" })) as T[];
}

function recordedStatus(item: DataSourceStatus): DataSourceStatus {
  return { ...item, data_status: "recorded", source_url: item.source_url.replace(/([?&](?:key|token|api_key|apikey)=[^&]*)/gi, "<<redacted>>") };
}

function toRecorded(bundle: AnalysisBundle): AnalysisBundle {
  return {
    ...bundle,
    markets: asRecorded<MarketRecord>(bundle.markets),
    prices: asRecorded<PricePoint>(bundle.prices),
    trades: asRecorded<Trade>(bundle.trades),
    evidence: asRecorded<Evidence>(bundle.evidence),
    windows: asRecorded(bundle.windows),
    wallet_metrics: bundle.wallet_metrics ? {
      ...bundle.wallet_metrics,
      data_status: "recorded",
      alignments: bundle.wallet_metrics.alignments.map((alignment) => ({ ...alignment, trade: { ...alignment.trade, data_status: "recorded" } })),
    } : null,
    data_status: "recorded",
    source_status: bundle.source_status.map(recordedStatus),
    limitations: [...bundle.limitations, "这是此前成功联网流程的脱敏 recorded 回放，不是当前实时调查。"],
  };
}

async function main() {
  const selection = await readSelection();
  if (selection.markets.length === 0 || selection.wallets.length === 0) throw new Error("No live-selected markets or wallets are available; refusing to fabricate recorded data.");
  const marketBundles: AnalysisBundle[] = [];
  for (const market of selection.markets) {
    const result = await analyze(market.source_url, "live");
    if (!result.ok || result.bundle.data_status !== "live") throw new Error(`Live market capture failed for ${market.source_url}.`);
    marketBundles.push(result.bundle);
  }
  const combinedMarket: AnalysisBundle = {
    ...marketBundles[0],
    markets: marketBundles.flatMap((item) => item.markets),
    prices: marketBundles.flatMap((item) => item.prices),
    trades: [],
    evidence: marketBundles.flatMap((item) => item.evidence),
    source_status: marketBundles.flatMap((item) => item.source_status),
    limitations: [...new Set(marketBundles.flatMap((item) => item.limitations))],
  };
  const walletBundles: Array<{ wallet: string; bundle: AnalysisBundle }> = [];
  for (const candidate of selection.wallets) {
    const result = await analyze(candidate.wallet, "live");
    if (!result.ok || result.bundle.data_status !== "live") throw new Error(`Live wallet capture failed for ${candidate.wallet}.`);
    walletBundles.push({ wallet: candidate.wallet, bundle: result.bundle });
  }
  await mkdir("fixtures/recorded", { recursive: true });
  const marketRecorded = toRecorded(combinedMarket);
  await writeFile("fixtures/recorded/demo-market.json", JSON.stringify({ schema_version: "1.0.0", fixture_status: "recorded", captured_at: new Date().toISOString(), markets: marketRecorded.markets, prices: marketRecorded.prices, trades: marketRecorded.trades, evidence: marketRecorded.evidence, source_status: marketRecorded.source_status, data_status: marketRecorded.data_status, limitations: marketRecorded.limitations }, null, 2) + "\n", "utf8");
  for (const item of walletBundles) {
    const recorded = toRecorded(item.bundle);
    await writeFile(`fixtures/recorded/${item.wallet.toLowerCase()}.json`, JSON.stringify({ schema_version: "1.0.0", fixture_status: "recorded", captured_at: new Date().toISOString(), markets: recorded.markets, prices: recorded.prices, trades: recorded.trades, evidence: recorded.evidence, source_status: recorded.source_status, data_status: recorded.data_status, limitations: recorded.limitations }, null, 2) + "\n", "utf8");
  }
  const manifest = { schema_version: "1.0.0", fixture_status: "recorded", captured_at: new Date().toISOString(), files: ["demo-market.json", ...walletBundles.map((item) => `${item.wallet.toLowerCase()}.json`)], source_status: [...marketBundles, ...walletBundles.map((item) => item.bundle)].flatMap((item) => item.source_status).map(recordedStatus), sanitizer: "status-only-normalizer-v1; no secrets or profile metadata retained", limitations: ["Recorded replay is not live and does not establish Anthropic attribution."] };
  await writeFile("fixtures/recorded/manifest.json", JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ status: "recorded-captured", files: manifest.files, output: "fixtures/recorded/manifest.json" }));
}

main().catch((error) => { console.error(JSON.stringify({ status: "blocked", error: error instanceof Error ? error.message : "unknown" })); process.exitCode = 1; });
