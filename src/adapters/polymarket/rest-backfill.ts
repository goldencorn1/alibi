import { fetchJsonWithRetry } from "@/src/data/http";

const REST_BACKOFF_MS = [0, 2_000, 5_000, 10_000] as const;

export interface RestBackfillResult<T> {
  data: T | null;
  data_status: "live";
  attempts: number;
  coverage_complete: boolean;
  reconcile_required: boolean;
  fallback_interval_ms: 15_000;
  error_code?: string;
}

export interface RestBackfillOptions {
  attempts?: number;
  sleep?: (milliseconds: number) => Promise<void>;
}

export interface RestPage<T> {
  items: T[];
  next_cursor: string | null;
}

export interface PaginatedBackfillResult<T> {
  items: T[];
  pages: number;
  coverage_complete: boolean;
  reconcile_required: boolean;
}

export function polymarketTradeDedupKey(item: Record<string, unknown>): string {
  return [item.transactionHash ?? item.transaction_hash ?? "missing", item.proxyWallet ?? item.proxy_wallet ?? item.user ?? "missing", item.conditionId ?? item.condition_id ?? "missing", item.asset ?? item.token_id ?? "missing", item.timestamp ?? "missing", item.side ?? "missing", item.size ?? "missing", item.price ?? "missing"].map(String).join("|");
}

const defaultSleep = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function restBackfill<T>(url: string, source = "polymarket-rest-backfill", options: RestBackfillOptions = {}): Promise<RestBackfillResult<T>> {
  const attempts = Math.max(1, Math.min(options.attempts ?? REST_BACKOFF_MS.length, REST_BACKOFF_MS.length));
  const sleep = options.sleep ?? defaultSleep;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) await sleep(REST_BACKOFF_MS[attempt] ?? REST_BACKOFF_MS[REST_BACKOFF_MS.length - 1]);
    try {
      const result = await fetchJsonWithRetry<T>(url, { source, attempts: 1 });
      const complete = result.data !== null && result.data !== undefined;
      return { data: result.data, data_status: "live", attempts: attempt + 1, coverage_complete: complete, reconcile_required: true, fallback_interval_ms: 15_000 };
    } catch (error) {
      lastError = error;
    }
  }
  return { data: null, data_status: "live", attempts, coverage_complete: false, reconcile_required: true, fallback_interval_ms: 15_000, error_code: lastError instanceof Error ? lastError.message : "upstream_unavailable" };
}

export async function paginateRest<T>(loadPage: (cursor: string | null) => Promise<RestPage<T>>, options: { maxPages?: number; dedupKey?: (item: T) => string } = {}): Promise<PaginatedBackfillResult<T>> {
  const maxPages = Math.max(1, Math.min(options.maxPages ?? 100, 100));
  const dedupKey = options.dedupKey ?? ((item: T) => JSON.stringify(item));
  const seen = new Set<string>();
  const items: T[] = [];
  let cursor: string | null = null;
  let pages = 0;
  let coverageComplete = false;
  while (pages < maxPages) {
    const page = await loadPage(cursor);
    pages += 1;
    for (const item of page.items) {
      const key = dedupKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(item);
    }
    if (!page.next_cursor) {
      coverageComplete = true;
      break;
    }
    cursor = page.next_cursor;
  }
  return { items, pages, coverage_complete: coverageComplete, reconcile_required: true };
}

export function reconcileRows<T>(streamRows: T[], restRows: T[], dedupKey: (item: T) => string): T[] {
  const merged: T[] = [];
  const seen = new Set<string>();
  for (const item of [...restRows, ...streamRows]) {
    const key = dedupKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

export function reconcilePolymarketTrades<T extends Record<string, unknown>>(streamRows: T[], restRows: T[]): T[] {
  return reconcileRows(streamRows, restRows, polymarketTradeDedupKey);
}
