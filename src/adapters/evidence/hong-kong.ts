import { createHash } from "node:crypto";
import { LanguageSource, ObservationRole, ProviderPriority, ProviderState, SourceCoverage, SourceObservation, SourceTier, TimestampPrecision, TimestampType } from "@/src/contracts";

export const APPROVED_HONG_KONG_SOURCES = {
  giaEnglishRss: "https://www.info.gov.hk/gia/rss/general_en.xml",
  giaTraditionalChineseRss: "https://www.info.gov.hk/gia/rss/general_zh.xml",
  pressReleaseSearch: "https://api.data.gov.hk/v1/pressrelease/search",
  hkmaEnglish: "https://api.hkma.gov.hk/public/press-releases?lang=en",
  hkmaTraditionalChinese: "https://api.hkma.gov.hk/public/press-releases?lang=tc",
} as const;

export interface EvidenceConnectorResult {
  connector: string;
  status: "healthy" | "unavailable" | "unknown";
  sources: LanguageSource[];
  retrieved_at: string;
  attempts: number;
  limitation?: string;
  coverage?: SourceCoverage;
  observations?: SourceObservation[];
}

export interface HongKongSourceRecord {
  url: string;
  publisher: string;
  title: string;
  language: "en" | "zh-Hant";
  official_release_id?: string | null;
  published_at?: string | null;
  first_seen_at?: string | null;
  timestamp_type?: TimestampType;
  timestamp_precision?: TimestampPrecision;
  /** C13: MINUTES, not seconds. See `LanguageSource` in contracts. */
  source_timestamp_uncertainty_minutes?: number | null;
  content_hash: string;
  source_tier?: SourceTier;
  provider?: string;
  provider_priority?: ProviderPriority;
  provider_state?: ProviderState;
  observation_role?: ObservationRole;
  timestamp_source_field?: string | null;
  raw_timestamp?: string | null;
  actual_coverage_start?: string | null;
  actual_coverage_end?: string | null;
  pagination_complete?: boolean;
  page_count?: number;
  calibration?: LanguageSource["calibration"];
}

export function approvedHongKongSources(): string[] {
  return Object.values(APPROVED_HONG_KONG_SOURCES);
}

export function normalizeHongKongRecord(record: HongKongSourceRecord, retrievedAt: string): LanguageSource {
  return {
    url: record.url,
    publisher: record.publisher,
    title: record.title,
    language: record.language,
    source_tier: record.source_tier ?? "primary",
    official_release_id: record.official_release_id ?? null,
    original_or_translation: "original",
    published_at: record.published_at ?? null,
    first_seen_at: record.first_seen_at ?? null,
    retrieved_at: retrievedAt,
    timestamp_type: record.timestamp_type ?? "published",
    timestamp_precision: record.timestamp_precision ?? "unknown",
    source_timestamp_uncertainty_minutes: record.source_timestamp_uncertainty_minutes ?? null,
    content_hash: record.content_hash,
    connector_status: "healthy",
    ...(record.provider ? { provider: record.provider } : {}),
    ...(record.provider_priority ? { provider_priority: record.provider_priority } : {}),
    ...(record.provider_state ? { provider_state: record.provider_state } : {}),
    ...(record.observation_role ? { observation_role: record.observation_role } : {}),
    ...(record.timestamp_source_field !== undefined ? { timestamp_source_field: record.timestamp_source_field } : {}),
    ...(record.raw_timestamp !== undefined ? { raw_timestamp: record.raw_timestamp } : {}),
    ...(record.actual_coverage_start !== undefined ? { actual_coverage_start: record.actual_coverage_start } : {}),
    ...(record.actual_coverage_end !== undefined ? { actual_coverage_end: record.actual_coverage_end } : {}),
    ...(record.pagination_complete !== undefined ? { pagination_complete: record.pagination_complete } : {}),
    ...(record.page_count !== undefined ? { page_count: record.page_count } : {}),
    ...(record.calibration !== undefined ? { calibration: record.calibration } : {}),
  };
}

export function connectorFromRecords(
  connector: string,
  records: HongKongSourceRecord[],
  retrievedAt = new Date().toISOString(),
): EvidenceConnectorResult {
  return {
    connector,
    status: "healthy",
    sources: records.map((record) => normalizeHongKongRecord(record, retrievedAt)),
    retrieved_at: retrievedAt,
    attempts: 1,
    coverage: {
      required_connectors: [connector],
      healthy_connectors: [connector],
      unavailable_connectors: [],
      coverage_ratio: 1,
      coverage_complete: true,
      timestamp_precision: records.every((record) => (record.timestamp_precision ?? "unknown") !== "unknown") ? (records.some((record) => record.timestamp_precision === "subsecond") ? "subsecond" : records.some((record) => record.timestamp_precision === "second") ? "second" : "minute") : "unknown",
      retrieved_at: retrievedAt,
      source_state: records.length > 0 ? "found" : "not_found",
      unknown_reasons: [],
      actual_coverage_start: records.map((record) => record.published_at).filter(Boolean).sort()[0] ?? null,
      actual_coverage_end: records.map((record) => record.published_at).filter(Boolean).sort().at(-1) ?? null,
      pagination_complete: true,
      page_count: 1,
    },
  };
}

export function unavailableHongKongConnector(connector: string, reason: string): EvidenceConnectorResult {
  return {
    connector,
    status: "unavailable",
    sources: [],
    retrieved_at: new Date().toISOString(),
    attempts: 0,
    limitation: reason,
    coverage: {
      required_connectors: [connector],
      healthy_connectors: [],
      unavailable_connectors: [connector],
      coverage_ratio: null,
      coverage_complete: false,
      timestamp_precision: "unknown",
      retrieved_at: new Date().toISOString(),
      source_state: "unknown",
      unknown_reasons: [reason],
    },
  };
}

export interface TextFetchResult {
  text: string;
  status: number;
  attempts: number;
  retrieved_at: string;
  headers: Headers;
}

export async function fetchTextWithRetry(url: string, options: { source: string; attempts?: number; timeoutMs?: number; headers?: HeadersInit } ): Promise<TextFetchResult> {
  const attempts = Math.max(1, Math.min(options.attempts ?? 3, 3));
  const timeoutMs = options.timeoutMs ?? 12_000;
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { headers: { accept: "application/rss+xml, application/xml, text/xml, application/json", ...(options.headers ?? {}) }, signal: controller.signal, cache: "no-store" });
      const text = await response.text();
      if (!response.ok) throw new Error(`${options.source} returned HTTP ${response.status}`);
      return { text, status: response.status, attempts: attempt, retrieved_at: new Date().toISOString(), headers: response.headers };
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * 2 ** (attempt - 1), 5000)));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`${options.source} is unavailable`);
}

function xmlValue(item: string, tag: string): string | null {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim() || null;
}

export function parseRssRecords(xml: string, language: "en" | "zh-Hant", publisher: string, provider = "hksar-isd"): HongKongSourceRecord[] {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].flatMap((match) => {
    const item = match[1];
    const url = xmlValue(item, "link");
    const title = xmlValue(item, "title");
    const rawTimestamp = xmlValue(item, "pubDate") ?? xmlValue(item, "dc:date") ?? xmlValue(item, "date");
    if (!url || !title) return [];
    const parsed = rawTimestamp && Number.isFinite(Date.parse(rawTimestamp)) ? new Date(rawTimestamp).toISOString() : null;
    const hash = createHash("sha256").update(item).digest("hex");
    return [{
      url,
      publisher,
      title,
      language,
      official_release_id: xmlValue(item, "guid") ?? url,
      published_at: parsed,
      first_seen_at: null,
      timestamp_type: parsed ? "published" : "date_only",
      timestamp_precision: parsed ? "second" : "unknown",
      // C13/C26: minutes. Previously `0`, which asserted a perfectly certain
      // publication instant. An RSS `pubDate` records when the feed item was
      // generated, not when the release became public, and that lag is real, so
      // 0 was a calibration error in the optimistic direction. Calibrated to
      // ~1 minute for a primary publisher feed. Unknown stays `null`, never 0.
      source_timestamp_uncertainty_minutes: parsed ? 1 : null,
      content_hash: hash,
      source_tier: "primary",
      provider,
      provider_priority: "P0",
      provider_state: "documented",
      observation_role: "verified_source",
      raw_timestamp: rawTimestamp,
      timestamp_source_field: rawTimestamp?.includes("T") ? "dc:date" : "pubDate",
    } satisfies HongKongSourceRecord];
  });
}
