import { DataStatus, MarketRecord, PricePoint, Trade } from "@/src/contracts";
import { normalizeMarket, normalizePriceHistory, normalizeTrade } from "@/src/normalize";

export const NORMALIZER_VERSION = "alibi-normalizer-v1";
export function normalizeMarketRecord(value: Record<string, unknown>, status: DataStatus): MarketRecord | null { return normalizeMarket(value, status); }
export function normalizePriceRecords(marketId: string, tokenId: string, value: unknown, status: DataStatus, sourceUrl: string, fidelity: number | null): PricePoint[] { return normalizePriceHistory(marketId, tokenId, value, status, sourceUrl, fidelity); }
export function normalizeTradeRecord(value: Record<string, unknown>, status: DataStatus): Trade | null { return normalizeTrade(value, status); }
