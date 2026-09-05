import {
  DataStatus,
  MakerTaker,
  MarketRecord,
  PricePoint,
  Trade,
  TradeSide,
  TradeSourceType,
} from "@/src/contracts";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(number) ? number : null;
}

function tokenIdsFromMarket(raw: Record<string, unknown>): string[] {
  const value = raw.clobTokenIds ?? raw.tokens;
  if (Array.isArray(value)) {
    return value.map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object") return asString((entry as Record<string, unknown>).token_id ?? (entry as Record<string, unknown>).tokenId) ?? "";
      return "";
    }).filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function normalizeMarket(raw: Record<string, unknown>, dataStatus: DataStatus, sourceBase = "https://polymarket.com"): MarketRecord | null {
  const marketId = asString(raw.conditionId ?? raw.condition_id ?? raw.id);
  const slug = asString(raw.slug ?? raw.marketSlug ?? raw.eventSlug);
  if (!marketId || !slug) return null;
  const title = asString(raw.question ?? raw.title) ?? slug;
  return {
    market_id: marketId,
    slug,
    title,
    question: title,
    source_url: `${sourceBase}/event/${slug}`,
    token_ids: tokenIdsFromMarket(raw),
    data_status: dataStatus,
  };
}

export function normalizePriceHistory(
  marketId: string,
  tokenId: string,
  raw: unknown,
  dataStatus: DataStatus,
  source: string,
  fidelityMinutes: number | null = 1,
): PricePoint[] {
  const history: unknown[] = raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).history)
    ? ((raw as Record<string, unknown>).history as unknown[])
    : Array.isArray(raw) ? raw : [];
  return history.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    const timestamp = asNumber(record.t ?? record.timestamp);
    const price = asNumber(record.p ?? record.price);
    if (timestamp === null || price === null || price < 0 || price > 1) return [];
    return [{
      market_id: marketId,
      token_id: tokenId,
      timestamp: new Date(timestamp < 2_000_000_000 ? timestamp * 1000 : timestamp).toISOString(),
      price,
      source,
      fidelity_minutes: fidelityMinutes,
      data_status: dataStatus,
    }];
  });
}

function normalizeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const upper = asString(value)?.toUpperCase() as T | undefined;
  return upper && allowed.includes(upper) ? upper : fallback;
}

export function normalizeTrade(raw: Record<string, unknown>, dataStatus: DataStatus): Trade | null {
  const wallet = asString(raw.proxyWallet ?? raw.wallet ?? raw.user);
  const marketId = asString(raw.conditionId ?? raw.condition_id ?? raw.market);
  const timestamp = asNumber(raw.timestamp ?? raw.t);
  if (!wallet || !marketId || timestamp === null) return null;
  const side = normalizeEnum<TradeSide>(raw.side, ["BUY", "SELL", "UNKNOWN"], "UNKNOWN");
  const makerTaker = normalizeEnum<MakerTaker>(raw.maker_taker ?? raw.makerTaker, ["MAKER", "TAKER", "UNKNOWN"], "UNKNOWN");
  const sourceType = normalizeEnum<TradeSourceType>(raw.source_type ?? raw.sourceType, ["DIRECT", "NEG_RISK", "SPLIT", "MERGE", "TRANSFER", "REDEEM", "UNKNOWN"], "UNKNOWN");
  return {
    wallet: wallet.toLowerCase(),
    market_id: marketId,
    token_id: asString(raw.asset ?? raw.token_id ?? raw.tokenId),
    timestamp: new Date(timestamp < 2_000_000_000 ? timestamp * 1000 : timestamp).toISOString(),
    side,
    outcome: asString(raw.outcome),
    price: asNumber(raw.price),
    size: asNumber(raw.size),
    transaction_hash: asString(raw.transactionHash ?? raw.transaction_hash),
    maker_taker: makerTaker,
    source_type: sourceType,
    data_status: dataStatus,
  };
}
