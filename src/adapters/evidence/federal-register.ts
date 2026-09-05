import { createHash } from "node:crypto";
import { fetchJsonWithRetry } from "@/src/data/http";
import { LanguageSource, SourceCoverage, SourceObservation } from "@/src/contracts";

export const FEDERAL_REGISTER_PUBLIC_INSPECTION_ENDPOINT = "https://www.federalregister.gov/api/v1/public-inspection-documents.json";

export interface FederalRegisterInspectionRecord {
  document_number?: string;
  title?: string;
  html_url?: string;
  public_inspection_at?: string | null;
  publication_date?: string | null;
  last_modified?: string | null;
}

export interface FederalRegisterResult {
  connector: "federal-register-public-inspection";
  status: "healthy" | "unavailable" | "unknown";
  sources: LanguageSource[];
  observations: SourceObservation[];
  coverage: SourceCoverage;
  retrieved_at: string;
  attempts: number;
  limitation?: string;
}

export async function fetchFederalRegisterPublicInspection(options: { endpoint?: string; fetcher?: typeof fetchJsonWithRetry; validatedEndpoint?: boolean } = {}): Promise<FederalRegisterResult> {
  const endpoint = options.endpoint ?? FEDERAL_REGISTER_PUBLIC_INSPECTION_ENDPOINT;
  const retrievedAt = new Date().toISOString();
  try {
    const result = await (options.fetcher ?? fetchJsonWithRetry)<unknown>(endpoint, { source: "federal-register-public-inspection" });
    const responseObject = result.data && typeof result.data === "object" ? result.data as Record<string, unknown> : null;
    const unavailableMessage = responseObject?.meta && typeof responseObject.meta === "object" && typeof (responseObject.meta as Record<string, unknown>).pil_unavailability_message === "string";
    const rows = responseObject && Array.isArray(responseObject.results) ? responseObject.results as unknown[] : Array.isArray(result.data) ? result.data : [];
    const sources = rows.flatMap((row) => {
      if (!row || typeof row !== "object") return [];
      const item = row as FederalRegisterInspectionRecord;
      if (!item.html_url || !item.title) return [];
      const rawTimestamp = item.public_inspection_at ?? item.last_modified ?? null;
      const published = item.publication_date && Number.isFinite(Date.parse(item.publication_date)) ? new Date(item.publication_date).toISOString() : null;
      return [{ url: item.html_url, publisher: "Federal Register", title: item.title, language: "en", source_tier: "primary", official_release_id: item.document_number ?? item.html_url, original_or_translation: "original", published_at: published, first_seen_at: rawTimestamp && Number.isFinite(Date.parse(rawTimestamp)) ? new Date(rawTimestamp).toISOString() : null, retrieved_at: result.sourceStatus.retrieved_at, timestamp_type: rawTimestamp ? "first_seen" : "date_only", timestamp_precision: rawTimestamp ? "second" : "unknown", timestamp_uncertainty_seconds: rawTimestamp ? 0 : null, content_hash: createHash("sha256").update(JSON.stringify(item)).digest("hex"), connector_status: "healthy", provider: "federal-register-public-inspection", provider_priority: "P0", provider_state: options.validatedEndpoint ? "validated" : "documented", observation_role: "verified_source", raw_timestamp: rawTimestamp, utc_timestamp: rawTimestamp && Number.isFinite(Date.parse(rawTimestamp)) ? new Date(rawTimestamp).toISOString() : null, timestamp_source_field: item.public_inspection_at ? "public_inspection_at" : item.last_modified ? "last_modified" : null } satisfies LanguageSource];
    });
    const coverage: SourceCoverage = { required_connectors: ["federal-register-public-inspection"], healthy_connectors: unavailableMessage ? [] : ["federal-register-public-inspection"], unavailable_connectors: unavailableMessage ? ["federal-register-public-inspection"] : [], coverage_ratio: unavailableMessage ? null : 1, coverage_complete: Boolean(options.validatedEndpoint) && !unavailableMessage, timestamp_precision: sources.some((source) => source.timestamp_precision === "second") ? "second" : "unknown", retrieved_at: result.sourceStatus.retrieved_at, source_state: unavailableMessage || !options.validatedEndpoint ? "unknown" : sources.length > 0 ? "found" : "not_found", unknown_reasons: unavailableMessage ? ["Public Inspection list is temporarily unavailable according to the official response."] : options.validatedEndpoint ? [] : ["Official endpoint shape has not been independently validated by this call."], pagination_complete: !unavailableMessage, page_count: 1 };
    const observations = sources.map((source) => ({ observation_id: `${source.provider}:${source.official_release_id ?? source.url}`, provider: source.provider ?? "federal-register-public-inspection", provider_priority: "P0" as const, provider_state: source.provider_state ?? "documented", observation_role: "verified_source" as const, raw_timestamp: source.raw_timestamp ?? null, utc_timestamp: source.utc_timestamp ?? null, timestamp_source_field: source.timestamp_source_field ?? null, pagination_complete: true, page_count: 1, data_status: "live" as const, source_state: coverage.source_state, evidence_cutoff_at: retrievedAt }));
    return { connector: "federal-register-public-inspection", status: "healthy", sources, observations, coverage, retrieved_at: result.sourceStatus.retrieved_at, attempts: result.sourceStatus.attempts, limitation: options.validatedEndpoint ? undefined : "Endpoint must be confirmed against current official documentation before it can produce not_found." };
  } catch (error) {
    return { connector: "federal-register-public-inspection", status: "unavailable", sources: [], observations: [], coverage: { required_connectors: ["federal-register-public-inspection"], healthy_connectors: [], unavailable_connectors: ["federal-register-public-inspection"], coverage_ratio: null, coverage_complete: false, timestamp_precision: "unknown", retrieved_at: retrievedAt, source_state: "unknown", unknown_reasons: ["Public Inspection endpoint unavailable"] }, retrieved_at: retrievedAt, attempts: 3, limitation: error instanceof Error ? error.message : "Public Inspection endpoint unavailable" };
  }
}
