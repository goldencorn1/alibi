import { createHash } from "node:crypto";
import { fetchJsonWithRetry } from "@/src/data/http";
import { LanguageSource, SourceCoverage } from "@/src/contracts";

export interface DiscoveryRecord {
  url: string;
  title: string;
  publisher: string;
  retrieved_at: string;
  content_hash: string;
  seendate?: string | null;
  language?: string | null;
  source_domain?: string | null;
}

export interface DiscoveryOnlyResult {
  sources: LanguageSource[];
  verified: false;
  limitation: string;
}

function parseDiscoveryTimestamp(value: string | null | undefined): string | null {
  if (!value) return null;
  const compact = value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  const parsed = compact ? Date.parse(`${compact[1]}-${compact[2]}-${compact[3]}T${compact[4]}:${compact[5]}:${compact[6]}Z`) : Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

export function discoveryOnly(records: DiscoveryRecord[]): DiscoveryOnlyResult {
  return {
    verified: false,
    sources: records.map((record) => ({
      url: record.url,
      publisher: record.publisher,
      title: record.title,
      language: "other",
      source_tier: "aggregator",
      official_release_id: null,
      original_or_translation: "unknown",
      published_at: null,
      first_seen_at: parseDiscoveryTimestamp(record.seendate),
      retrieved_at: record.retrieved_at,
      timestamp_type: "first_seen",
      timestamp_precision: "unknown",
      timestamp_uncertainty_seconds: null,
      content_hash: record.content_hash,
      connector_status: "healthy",
      provider: "gdelt",
      provider_priority: "P0",
      provider_state: "validated",
      observation_role: "discovery_only",
      raw_timestamp: record.seendate ?? null,
      utc_timestamp: parseDiscoveryTimestamp(record.seendate),
      timestamp_source_field: "seendate",
    })),
    limitation: "Aggregator and GDELT records are discovery-only and cannot verify source_state or formal alerts.",
  };
}

export const GDELT_DOC_ENDPOINT = "https://api.gdeltproject.org/api/v2/doc/doc";

export interface GdeltDiscoveryResult {
  connector: "gdelt-doc";
  status: "healthy" | "unavailable" | "unknown";
  sources: LanguageSource[];
  retrieved_at: string;
  attempts: number;
  coverage: SourceCoverage;
  limitation: string;
}

export async function fetchGdeltDiscovery(query: string, options: { startdatetime?: string; enddatetime?: string; maxrecords?: number; fetcher?: typeof fetchJsonWithRetry } = {}): Promise<GdeltDiscoveryResult> {
  const params = new URLSearchParams({ query, mode: "artlist", format: "json", maxrecords: String(Math.min(options.maxrecords ?? 250, 250)), ...(options.startdatetime ? { startdatetime: options.startdatetime } : {}), ...(options.enddatetime ? { enddatetime: options.enddatetime } : {}) });
  const url = `${GDELT_DOC_ENDPOINT}?${params.toString()}`;
  const retrievedAt = new Date().toISOString();
  try {
    const result = await (options.fetcher ?? fetchJsonWithRetry)<unknown>(url, { source: "gdelt-doc" });
    const rows = result.data && typeof result.data === "object" && Array.isArray((result.data as Record<string, unknown>).articles) ? (result.data as Record<string, unknown>).articles as unknown[] : [];
    const records = rows.flatMap((row) => {
      if (!row || typeof row !== "object") return [];
      const item = row as Record<string, unknown>;
      const itemUrl = typeof item.url === "string" ? item.url : null;
      const title = typeof item.title === "string" ? item.title : null;
      if (!itemUrl || !title) return [];
      const seendate = typeof item.seendate === "string" ? item.seendate : null;
      return [{ url: itemUrl, title, publisher: typeof item.domain === "string" ? item.domain : "GDELT discovery", retrieved_at: result.sourceStatus.retrieved_at, content_hash: createHash("sha256").update(JSON.stringify(item)).digest("hex"), seendate, language: typeof item.language === "string" ? item.language : null, source_domain: typeof item.domain === "string" ? item.domain : null } satisfies DiscoveryRecord];
    });
    const discovered = discoveryOnly(records).sources;
    return {
      connector: "gdelt-doc",
      status: "healthy",
      sources: discovered,
      retrieved_at: result.sourceStatus.retrieved_at,
      attempts: result.sourceStatus.attempts,
      coverage: {
        required_connectors: ["gdelt-doc"], healthy_connectors: ["gdelt-doc"], unavailable_connectors: [], coverage_ratio: null, coverage_complete: true, timestamp_precision: "second", retrieved_at: result.sourceStatus.retrieved_at, source_state: "unknown", unknown_reasons: ["GDELT is discovery-only and cannot establish verified source_state."], requested_start: options.startdatetime ?? null, requested_end: options.enddatetime ?? null, actual_coverage_start: records.map((record) => record.seendate).filter(Boolean).sort()[0] ?? null, actual_coverage_end: records.map((record) => record.seendate).filter(Boolean).sort().at(-1) ?? null, pagination_complete: true, page_count: 1,
      },
      limitation: "GDELT seendate is retained only as first_seen_at; published_at remains null and this connector cannot establish verified evidence.",
    };
  } catch (error) {
    return {
      connector: "gdelt-doc", status: "unavailable", sources: [], retrieved_at: retrievedAt, attempts: 3,
      coverage: { required_connectors: ["gdelt-doc"], healthy_connectors: [], unavailable_connectors: ["gdelt-doc"], coverage_ratio: null, coverage_complete: false, timestamp_precision: "unknown", retrieved_at: retrievedAt, source_state: "unknown", unknown_reasons: [error instanceof Error ? error.message : "gdelt_unavailable"] },
      limitation: "GDELT discovery was unavailable; no verified source conclusion is allowed.",
    };
  }
}
