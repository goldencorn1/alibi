import { createHash } from "node:crypto";
import { fetchJsonWithRetry } from "@/src/data/http";
import { LanguageSource, SourceCoverage, SourceObservation } from "@/src/contracts";

export const SEC_SUBMISSIONS_ENDPOINT = "https://data.sec.gov/submissions/CIK";

export interface SecEdgarResult {
  connector: "sec-edgar";
  status: "healthy" | "unavailable" | "unknown";
  sources: LanguageSource[];
  observations: SourceObservation[];
  coverage: SourceCoverage;
  retrieved_at: string;
  attempts: number;
  limitation?: string;
}

export async function fetchSecEdgarSubmissions(cik: string, options: { fetcher?: typeof fetchJsonWithRetry; userAgent?: string } = {}): Promise<SecEdgarResult> {
  const normalizedCik = cik.replace(/\D/g, "").padStart(10, "0");
  const url = `${SEC_SUBMISSIONS_ENDPOINT}${normalizedCik}.json`;
  const retrievedAt = new Date().toISOString();
  try {
    const result = await (options.fetcher ?? fetchJsonWithRetry)<unknown>(url, { source: "sec-edgar", headers: { "user-agent": options.userAgent ?? "alibi-read-only-contact" } });
    const recent = result.data && typeof result.data === "object" && (result.data as Record<string, unknown>).filings && typeof (result.data as Record<string, unknown>).filings === "object" ? ((result.data as Record<string, unknown>).filings as Record<string, unknown>).recent : null;
    const rows = recent && typeof recent === "object" ? Object.keys(recent as object).length > 0 ? Array.from({ length: Number((recent as Record<string, unknown>).accessionNumber && Array.isArray((recent as Record<string, unknown>).accessionNumber) ? ((recent as Record<string, unknown>).accessionNumber as unknown[]).length : 0) }, (_, index) => Object.fromEntries(Object.entries(recent as Record<string, unknown>).map(([key, value]) => [key, Array.isArray(value) ? value[index] : value]))) : [] : [];
    const sources = rows.flatMap((row) => {
      const item = row as Record<string, unknown>;
      const accession = typeof item.accessionNumber === "string" ? item.accessionNumber : null;
      const filed = typeof item.filingDate === "string" ? item.filingDate : null;
      const acceptance = typeof item.acceptanceDateTime === "string" ? item.acceptanceDateTime : null;
      if (!accession || !filed) return [];
      const urlForFiling = `https://www.sec.gov/Archives/edgar/data/${Number(normalizedCik)}/${accession.replace(/-/g, "")}/${accession}-index.html`;
      const raw = acceptance ?? filed;
      return [{ url: urlForFiling, publisher: "U.S. Securities and Exchange Commission", title: `${String(item.form ?? "filing")} ${accession}`, language: "en", source_tier: "primary", official_release_id: accession, original_or_translation: "original", published_at: null, first_seen_at: new Date(raw).toISOString(), retrieved_at: result.sourceStatus.retrieved_at, timestamp_type: acceptance ? "filed" : "date_only", timestamp_precision: acceptance ? "second" : "date", source_timestamp_uncertainty_minutes: acceptance ? 0.1 : 720, content_hash: createHash("sha256").update(JSON.stringify(item)).digest("hex"), connector_status: "healthy", provider: "sec-edgar", provider_priority: "P1", provider_state: "validated", observation_role: "coverage_observation", raw_timestamp: raw, utc_timestamp: acceptance ? new Date(acceptance).toISOString() : null, timestamp_source_field: acceptance ? "acceptanceDateTime" : "filingDate" } satisfies LanguageSource];
    });
    const coverage: SourceCoverage = { required_connectors: ["sec-edgar"], healthy_connectors: ["sec-edgar"], unavailable_connectors: [], coverage_ratio: 1, coverage_complete: true, timestamp_precision: sources.some((source) => source.timestamp_precision === "second") ? "second" : "date", retrieved_at: result.sourceStatus.retrieved_at, source_state: sources.length > 0 ? "found" : "not_found", unknown_reasons: [], pagination_complete: true, page_count: 1 };
    const observations = sources.map((source) => ({ observation_id: `${source.provider}:${source.official_release_id}`, provider: "sec-edgar", provider_priority: "P1" as const, provider_state: "validated" as const, observation_role: "coverage_observation" as const, raw_timestamp: source.raw_timestamp ?? null, utc_timestamp: source.utc_timestamp ?? null, timestamp_source_field: source.timestamp_source_field ?? null, data_status: "live" as const, source_state: coverage.source_state, evidence_cutoff_at: retrievedAt }));
    return { connector: "sec-edgar", status: "healthy", sources, observations, coverage, retrieved_at: result.sourceStatus.retrieved_at, attempts: result.sourceStatus.attempts };
  } catch (error) {
    return { connector: "sec-edgar", status: "unavailable", sources: [], observations: [], coverage: { required_connectors: ["sec-edgar"], healthy_connectors: [], unavailable_connectors: ["sec-edgar"], coverage_ratio: null, coverage_complete: false, timestamp_precision: "unknown", retrieved_at: retrievedAt, source_state: "unknown", unknown_reasons: ["SEC EDGAR unavailable"] }, retrieved_at: retrievedAt, attempts: 3, limitation: error instanceof Error ? error.message : "SEC EDGAR unavailable" };
  }
}
