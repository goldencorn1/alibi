import { MarketRecord, Trade } from "@/src/contracts";

export interface WalletUniverseRecord { wallet: string; observed_trades: number; markets: number; first_seen: string | null; last_seen: string | null; data_status: "live" | "recorded" | "synthetic" | "cached"; }
export function buildWalletUniverse(trades: Trade[]): WalletUniverseRecord[] {
  const byWallet = new Map<string, Trade[]>();
  for (const trade of trades) byWallet.set(trade.wallet, [...(byWallet.get(trade.wallet) ?? []), trade]);
  return [...byWallet.entries()].map(([wallet, items]) => ({ wallet, observed_trades: items.length, markets: new Set(items.map((item) => item.market_id)).size, first_seen: items.map((item) => item.timestamp).sort()[0] ?? null, last_seen: items.map((item) => item.timestamp).sort().at(-1) ?? null, data_status: items[0]?.data_status ?? "recorded" }));
}

export function marketUniverse(markets: MarketRecord[]): string[] { return [...new Set(markets.map((market) => market.market_id))].sort(); }
