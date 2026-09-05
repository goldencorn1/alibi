import { mkdir, writeFile } from "node:fs/promises";
import { fetchJsonWithRetry } from "@/src/data/http";
import { normalizeMarket, normalizePriceHistory, normalizeTrade } from "@/src/normalize";
import { detectRepricingWindows } from "@/src/engine/repricing";
import { isWalletAddress, MarketRecord } from "@/src/contracts";

const GAMMA = "https://gamma-api.polymarket.com";
const CLOB = "https://clob.polymarket.com";
const DATA = "https://data-api.polymarket.com";

async function main() {
  const checkedAt = new Date().toISOString();
  const candidates: Array<{ market: MarketRecord; windows: number; source_status: unknown[] }> = [];
  const rejected: Array<{ market: string; reason: string }> = [];
  const marketResponse = await fetchJsonWithRetry<unknown[]>(`${GAMMA}/markets?active=true&closed=false&order=volume24hr&ascending=false&limit=100`, { source: "gamma-market-selection" });
  const rawMarkets = Array.isArray(marketResponse.data) ? marketResponse.data : [];
  for (const raw of rawMarkets.slice(0, 30)) {
    if (!raw || typeof raw !== "object") continue;
    const market = normalizeMarket(raw as Record<string, unknown>, "live");
    if (!market || market.token_ids.length === 0) continue;
    const sourceStatus: unknown[] = [marketResponse.sourceStatus];
    const priceUrl = `${CLOB}/prices-history?market=${encodeURIComponent(market.token_ids[0])}&interval=1m&fidelity=10`;
    try {
      const priceResponse = await fetchJsonWithRetry<unknown>(priceUrl, { source: "clob-market-selection" });
      sourceStatus.push(priceResponse.sourceStatus);
      const prices = normalizePriceHistory(market.market_id, market.token_ids[0], priceResponse.data, "live", priceUrl, 10);
      candidates.push({ market, windows: detectRepricingWindows(prices).length, source_status: sourceStatus });
    } catch (error) {
      rejected.push({ market: market.slug, reason: error instanceof Error ? error.message : "price history unavailable" });
    }
    if (candidates.filter((item) => item.windows > 0).length >= 3) break;
  }

  let tradeResponse: Awaited<ReturnType<typeof fetchJsonWithRetry<unknown[]>>> | null = null;
  try {
    tradeResponse = await fetchJsonWithRetry<unknown[]>(`${DATA}/trades?limit=1000&offset=0`, { source: "data-wallet-selection" });
  } catch (error) {
    rejected.push({ market: "wallet-selection", reason: error instanceof Error ? error.message : "wallet endpoint unavailable" });
  }
  const wallets = new Map<string, { trades: number; status: unknown }>();
  for (const raw of Array.isArray(tradeResponse?.data) ? tradeResponse.data : []) {
    if (!raw || typeof raw !== "object") continue;
    const trade = normalizeTrade(raw as Record<string, unknown>, "live");
    if (!trade || !isWalletAddress(trade.wallet)) continue;
    const current = wallets.get(trade.wallet);
    wallets.set(trade.wallet, { trades: (current?.trades ?? 0) + 1, status: tradeResponse?.sourceStatus ?? null });
  }
  const selectedMarkets = candidates.filter((item) => item.windows > 0).slice(0, 3);
  const selectedWallets = [...wallets.entries()].sort((a, b) => b[1].trades - a[1].trades).slice(0, 2).map(([wallet, info]) => ({ wallet, trades: info.trades, source_status: info.status }));
  const result = {
    schema_version: "1.0.0",
    selected_at: checkedAt,
    selection_status: selectedMarkets.length >= 3 && selectedWallets.length >= 2 ? "candidate-set-ready" : "insufficient-candidates",
    markets: selectedMarkets.map((item) => ({ ...item.market, windows_detected: item.windows, source_status: item.source_status })),
    wallets: selectedWallets,
    rejected,
    limitations: ["Selection is read-only and deterministic; it does not prove information advantage or causality."],
  };
  await mkdir("artifacts/verification", { recursive: true });
  await writeFile("artifacts/verification/demo-selection.json", JSON.stringify(result, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ selection_status: result.selection_status, market_count: result.markets.length, wallet_count: result.wallets.length, output: "artifacts/verification/demo-selection.json" }));
  if (result.selection_status !== "candidate-set-ready") process.exitCode = 2;
}

main().catch((error) => { console.error(JSON.stringify({ status: "failed", error: error instanceof Error ? error.message : "unknown" })); process.exitCode = 1; });
