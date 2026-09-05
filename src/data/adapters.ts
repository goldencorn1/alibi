import { DataSourceStatus, InputRef, MarketRecord, PricePoint, Trade } from "@/src/contracts";
import { MarketChannelTrigger, hydrationRequestForTrigger } from "@/src/adapters/polymarket/market-ws";
import { paginateRest, polymarketTradeDedupKey, reconcilePolymarketTrades } from "@/src/adapters/polymarket/rest-backfill";
import { fetchJsonWithRetry, UpstreamHttpError } from "@/src/data/http";
import { normalizeMarket, normalizePriceHistory, normalizeTrade } from "@/src/normalize";
import { walletAddressFromInput } from "@/src/input/parser";

const GAMMA = "https://gamma-api.polymarket.com";
const CLOB = "https://clob.polymarket.com";
const DATA = "https://data-api.polymarket.com";

export interface LiveDataResult {
  markets: MarketRecord[];
  prices: PricePoint[];
  trades: Trade[];
  sourceStatus: DataSourceStatus[];
  limitations: string[];
}

export interface MarketChannelHydrationResult {
  trades: Trade[];
  sourceStatus: DataSourceStatus[];
  pages: number;
  coverage_complete: boolean;
  reconcile_required: boolean;
  limitations: string[];
}

export async function fetchLiveData(input: InputRef): Promise<LiveDataResult> {
  if (input.kind === "market") return fetchMarketData(input);
  return fetchWalletData(input);
}

/**
 * Hydrate a public Market Channel trigger through the Data API. The stream
 * event is intentionally not used as a trade row because it carries no
 * authoritative wallet identity or transaction hash.
 */
export async function hydrateMarketChannelTrigger(
  trigger: MarketChannelTrigger,
  streamRows: Array<Record<string, unknown>> = [],
): Promise<MarketChannelHydrationResult> {
  const request = hydrationRequestForTrigger(trigger);
  const sourceStatus: DataSourceStatus[] = [];
  const pageSize = 10_000;
  let hydration: Awaited<ReturnType<typeof paginateRest<Record<string, unknown>>>> | null = null;

  try {
    hydration = await paginateRest(async (cursor) => {
      const offset = cursor ? Number(cursor) : 0;
      const url = `${DATA}/trades?market=${encodeURIComponent(request.condition_id)}&asset=${encodeURIComponent(request.token_id)}&start=${Math.floor(Date.parse(request.start) / 1000)}&end=${Math.floor(Date.parse(request.end) / 1000)}&limit=${pageSize}&offset=${offset}`;
      const result = await fetchJsonWithRetry<unknown>(url, { source: "data-api-trades" });
      sourceStatus.push(result.sourceStatus);
      const items = Array.isArray(result.data) ? result.data.filter((row): row is Record<string, unknown> => Boolean(row && typeof row === "object")) : [];
      return { items, next_cursor: items.length === pageSize ? String(offset + items.length) : null };
    }, { dedupKey: polymarketTradeDedupKey });
  } catch (error) {
    if (sourceStatus.length === 0) sourceStatus.push(sourceStatusFromError(error, "data-api-trades", DATA));
    return {
      trades: [],
      sourceStatus,
      pages: hydration?.pages ?? 0,
      coverage_complete: false,
      reconcile_required: true,
      limitations: ["Data API hydration is incomplete; formal cluster evaluation is blocked."],
    };
  }

  const reconciled = reconcilePolymarketTrades(streamRows, hydration.items);
  const trades = reconciled.flatMap((raw) => {
    const normalized = normalizeTrade(raw, "live");
    return normalized ? [normalized] : [];
  });
  return {
    trades,
    sourceStatus,
    pages: hydration.pages,
    coverage_complete: hydration.coverage_complete,
    reconcile_required: hydration.reconcile_required,
    limitations: hydration.coverage_complete ? [] : ["Data API pagination did not reach a terminal page; formal cluster evaluation is blocked."],
  };
}

async function fetchMarketData(input: InputRef): Promise<LiveDataResult> {
  const sourceStatus: DataSourceStatus[] = [];
  let rawMarkets: unknown[] = [];
  try {
    const result = await fetchJsonWithRetry<unknown[]>(`${GAMMA}/markets?slug=${encodeURIComponent(input.normalized_id)}&limit=20`, { source: "gamma-markets" });
    rawMarkets = Array.isArray(result.data) ? result.data : [];
    sourceStatus.push(result.sourceStatus);
  } catch (error) {
    sourceStatus.push(sourceStatusFromError(error, "gamma-markets", `${GAMMA}/markets`));
  }
  if (rawMarkets.length === 0) {
    try {
      const result = await fetchJsonWithRetry<unknown>(`${GAMMA}/events?slug=${encodeURIComponent(input.normalized_id)}&limit=5`, { source: "gamma-events" });
      sourceStatus.push(result.sourceStatus);
      rawMarkets = extractMarketsFromEvent(result.data);
    } catch (error) {
      sourceStatus.push(sourceStatusFromError(error, "gamma-events", `${GAMMA}/events`));
    }
  }
  const markets = rawMarkets.flatMap((raw) => raw && typeof raw === "object" ? [normalizeMarket(raw as Record<string, unknown>, "live")] : []).filter((value): value is MarketRecord => value !== null).slice(0, 1);
  const prices: PricePoint[] = [];
  for (const market of markets) {
    for (const tokenId of market.token_ids.slice(0, 2)) {
      try {
        const url = `${CLOB}/prices-history?market=${encodeURIComponent(tokenId)}&interval=1m&fidelity=10`;
        const result = await fetchJsonWithRetry<unknown>(url, { source: "clob-prices-history" });
        sourceStatus.push(result.sourceStatus);
        prices.push(...normalizePriceHistory(market.market_id, tokenId, result.data, "live", url, 10));
      } catch (error) {
        sourceStatus.push(sourceStatusFromError(error, "clob-prices-history", CLOB));
      }
    }
  }
  return { markets, prices, trades: [], sourceStatus, limitations: markets.length === 0 ? ["Gamma did not return a matching market."] : [] };
}

async function fetchWalletData(input: InputRef): Promise<LiveDataResult> {
  const sourceStatus: DataSourceStatus[] = [];
  const wallet = walletAddressFromInput(input);
  if (!wallet) {
    return { markets: [], prices: [], trades: [], sourceStatus: [], limitations: ["Profile URL must contain a resolvable public wallet address in this read-only demo."] };
  }
  const end = Math.floor(Date.now() / 1000);
  const start = end - 90 * 24 * 60 * 60;
  const url = `${DATA}/trades?user=${encodeURIComponent(wallet)}&start=${start}&end=${end}&limit=10000&offset=0`;
  let rawTrades: unknown[] = [];
  try {
    const result = await fetchJsonWithRetry<unknown[]>(url, { source: "data-api-trades" });
    sourceStatus.push(result.sourceStatus);
    rawTrades = Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    sourceStatus.push(sourceStatusFromError(error, "data-api-trades", url));
  }
  const trades = rawTrades.flatMap((raw) => raw && typeof raw === "object" ? [normalizeTrade(raw as Record<string, unknown>, "live")] : []).filter((value): value is Trade => value !== null);
  const marketMap = new Map<string, MarketRecord>();
  for (const raw of rawTrades) {
    if (!raw || typeof raw !== "object") continue;
    const record = raw as Record<string, unknown>;
    const marketId = typeof record.conditionId === "string" ? record.conditionId : null;
    if (!marketId || marketMap.has(marketId)) continue;
    const slug = typeof record.slug === "string" ? record.slug : marketId;
    const tokenId = typeof record.asset === "string" ? record.asset : "";
    marketMap.set(marketId, {
      market_id: marketId,
      slug,
      title: typeof record.title === "string" ? record.title : slug,
      question: typeof record.title === "string" ? record.title : slug,
      source_url: `https://polymarket.com/event/${slug}`,
      token_ids: tokenId ? [tokenId] : [],
      data_status: "live",
    });
  }
  const markets = [...marketMap.values()].slice(0, 5);
  const prices: PricePoint[] = [];
  for (const market of markets) {
    for (const tokenId of market.token_ids.slice(0, 2)) {
      // CLOB rejects long start/end intervals. Six <=15-day 1h slices
      // preserve the approved 90-day wallet window and 60-minute gap.
      for (let chunkEnd = end; chunkEnd > start; chunkEnd -= 15 * 24 * 60 * 60) {
        const chunkStart = Math.max(start, chunkEnd - 15 * 24 * 60 * 60 + 1);
        try {
          const priceUrl = `${CLOB}/prices-history?market=${encodeURIComponent(tokenId)}&interval=1h&fidelity=1&startTs=${chunkStart}&endTs=${chunkEnd}`;
          const result = await fetchJsonWithRetry<unknown>(priceUrl, { source: "clob-prices-history" });
          sourceStatus.push(result.sourceStatus);
          prices.push(...normalizePriceHistory(market.market_id, tokenId, result.data, "live", priceUrl, 60));
        } catch (error) {
          sourceStatus.push(sourceStatusFromError(error, "clob-prices-history", CLOB));
        }
      }
    }
  }
  return { markets, prices, trades, sourceStatus, limitations: trades.length === 0 ? ["Data API returned no public trades in the 90-day window."] : [] };
}

function extractMarketsFromEvent(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap((event) => event && typeof event === "object" && Array.isArray((event as Record<string, unknown>).markets) ? (event as Record<string, unknown>).markets as unknown[] : []);
  return value && typeof value === "object" && Array.isArray((value as Record<string, unknown>).markets) ? (value as Record<string, unknown>).markets as unknown[] : [];
}

function sourceStatusFromError(error: unknown, source: string, url: string): DataSourceStatus {
  if (error instanceof UpstreamHttpError) return error.source;
  return { source, source_url: url, data_status: "live", retrieved_at: new Date().toISOString(), http_status: null, attempts: 3, retryable: true, error_code: "upstream_unavailable" };
}
