import { createHash } from "node:crypto";
import { fetchJsonWithRetry } from "@/src/data/http";
import { LanguageSource, SourceCoverage, SourceObservation } from "@/src/contracts";
import { APPROVED_HONG_KONG_SOURCES } from "@/src/adapters/evidence/hong-kong";

export interface HkmaResult {
  connector: "hkma";
  status: "healthy" | "unavailable" | "unknown";
  sources: LanguageSource[];
  observations: SourceObservation[];
  coverage: SourceCoverage;
  retrieved_at: string;
  attempts: number;
  limitation?: string;
}

function rowsFrom(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"));
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  for (const key of ["data", "result", "results", "items", "records", "press_releases"]) if (Array.isArray(record[key])) return rowsFrom(record[key]);
  if (record.result && typeof record.result === "object") return rowsFrom(record.result);
  return [];
}

export async function fetchHkmaPressReleases(options: { englishUrl?: string; localUrl?: string; fetcher?: typeof fetchJsonWithRetry } = {}): Promise<HkmaResult> {
  const fetcher = options.fetcher ?? fetchJsonWithRetry;
  const urls = [{ url: options.englishUrl ?? APPROVED_HONG_KONG_SOURCES.hkmaEnglish, language: "en" as const }, { url: options.localUrl ?? APPROVED_HONG_KONG_SOURCES.hkmaTraditionalChinese, language: "zh-Hant" as const }];
  const sources: LanguageSource[] = [];
  const observations: SourceObservation[] = [];
  const coverageParts: SourceCoverage[] = [];
  let attempts = 0;
  for (const entry of urls) {
    try {
      const result = await fetcher<unknown>(entry.url, { source: `hkma-${entry.language}` });
      attempts += result.sourceStatus.attempts;
      const normalized = rowsFrom(result.data).flatMap((row) => {
        const link = typeof row.url === "string" ? row.url : typeof row.link === "string" ? row.link : null;
        const title = typeof row.title === "string" ? row.title : typeof row.subject === "string" ? row.subject : null;
        const id = typeof row.id === "string" ? row.id : typeof row.release_id === "string" ? row.release_id : link;
        const rawDate = typeof row.datetime === "string" ? row.datetime : typeof row.date === "string" ? row.date : null;
        if (!link || !title || !id) return [];
        const precise = Boolean(rawDate && /T|:\d\d/.test(rawDate) && Number.isFinite(Date.parse(rawDate)));
        const utc = precise ? new Date(rawDate as string).toISOString() : null;
        return [{ url: link, publisher: "Hong Kong Monetary Authority", title, language: entry.language, source_tier: "primary", official_release_id: id, original_or_translation: "original", published_at: utc, first_seen_at: utc, retrieved_at: result.sourceStatus.retrieved_at, timestamp_type: precise ? "published" : "date_only", timestamp_precision: precise ? "minute" : "date", timestamp_uncertainty_seconds: precise ? 60 : 43_200, content_hash: createHash("sha256").update(JSON.stringify(row)).digest("hex"), connector_status: "healthy", provider: "hkma", provider_priority: "P1", provider_state: "documented", observation_role: "verified_source", raw_timestamp: rawDate, utc_timestamp: utc, timestamp_source_field: precise ? "datetime" : "date" } satisfies LanguageSource];
      });
      sources.push(...normalized);
      observations.push(...normalized.map((source) => ({ observation_id: `${source.provider}:${source.official_release_id}`, provider: "hkma", provider_priority: "P1" as const, provider_state: "documented" as const, observation_role: "verified_source" as const, raw_timestamp: source.raw_timestamp ?? null, utc_timestamp: source.utc_timestamp ?? null, timestamp_source_field: source.timestamp_source_field ?? null, data_status: "live" as const, source_state: normalized.length > 0 ? "found" as const : "unknown" as const, evidence_cutoff_at: result.sourceStatus.retrieved_at })));
      coverageParts.push({ required_connectors: [`hkma-${entry.language}`], healthy_connectors: [`hkma-${entry.language}`], unavailable_connectors: [], coverage_ratio: 1, coverage_complete: true, timestamp_precision: normalized.some((source) => source.timestamp_precision === "minute") ? "minute" : "date", retrieved_at: result.sourceStatus.retrieved_at, source_state: normalized.length > 0 ? "found" : "not_found", unknown_reasons: [], pagination_complete: true, page_count: 1 });
    } catch (error) {
      coverageParts.push({ required_connectors: [`hkma-${entry.language}`], healthy_connectors: [], unavailable_connectors: [`hkma-${entry.language}`], coverage_ratio: null, coverage_complete: false, timestamp_precision: "unknown", retrieved_at: new Date().toISOString(), source_state: "unknown", unknown_reasons: [error instanceof Error ? error.message : "HKMA unavailable"] });
    }
  }
  const coverage: SourceCoverage = { required_connectors: coverageParts.flatMap((part) => part.required_connectors), healthy_connectors: coverageParts.flatMap((part) => part.healthy_connectors), unavailable_connectors: coverageParts.flatMap((part) => part.unavailable_connectors), coverage_ratio: coverageParts.every((part) => part.coverage_ratio !== null) ? coverageParts.reduce((sum, part) => sum + (part.coverage_ratio ?? 0), 0) / coverageParts.length : null, coverage_complete: coverageParts.length === 2 && coverageParts.every((part) => part.coverage_complete), timestamp_precision: coverageParts.every((part) => part.timestamp_precision !== "unknown") ? coverageParts.some((part) => part.timestamp_precision === "minute") ? "minute" : "date" : "unknown", retrieved_at: new Date().toISOString(), source_state: coverageParts.some((part) => part.source_state === "unknown") ? "unknown" : sources.length > 0 ? "found" : "not_found", unknown_reasons: coverageParts.flatMap((part) => part.unknown_reasons), pagination_complete: coverageParts.every((part) => part.pagination_complete), page_count: coverageParts.reduce((sum, part) => sum + (part.page_count ?? 0), 0), provider_states: { hkma: "documented" } };
  return { connector: "hkma", status: coverage.unknown_reasons.length > 0 ? "unavailable" : "healthy", sources, observations, coverage, retrieved_at: coverage.retrieved_at ?? new Date().toISOString(), attempts, limitation: coverage.unknown_reasons.length > 0 ? "HKMA coverage is incomplete; date-only records cannot establish minute order." : undefined };
}
