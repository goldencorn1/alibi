import { LanguageSource, SourceCoverage, SourceObservation } from "@/src/contracts";
import { EvidenceConnectorResult, APPROVED_HONG_KONG_SOURCES, fetchTextWithRetry, normalizeHongKongRecord, parseRssRecords } from "@/src/adapters/evidence/hong-kong";

export interface HksarIsdRssResult {
  english: EvidenceConnectorResult;
  local: EvidenceConnectorResult;
  coverage: SourceCoverage;
  observations: SourceObservation[];
}

function connectorCoverage(connector: string, result: EvidenceConnectorResult): SourceCoverage {
  return result.coverage ?? {
    required_connectors: [connector],
    healthy_connectors: result.status === "healthy" ? [connector] : [],
    unavailable_connectors: result.status === "unavailable" ? [connector] : [],
    coverage_ratio: result.status === "healthy" ? 1 : null,
    coverage_complete: result.status === "healthy",
    timestamp_precision: result.sources.some((source) => source.timestamp_precision === "second") ? "second" : "unknown",
    retrieved_at: result.retrieved_at,
    source_state: result.status === "healthy" ? result.sources.length > 0 ? "found" : "not_found" : "unknown",
    unknown_reasons: result.status === "healthy" ? [] : [result.limitation ?? "connector unavailable"],
  };
}

async function readFeed(connector: string, url: string, language: "en" | "zh-Hant", publisher: string): Promise<EvidenceConnectorResult> {
  try {
    const result = await fetchTextWithRetry(url, { source: connector });
    const records = parseRssRecords(result.text, language, publisher).map((record) => ({
      ...record,
      actual_coverage_start: record.published_at,
      actual_coverage_end: record.published_at,
      pagination_complete: true,
      page_count: 1,
    }));
    const sources = records.map((record) => normalizeHongKongRecord(record, result.retrieved_at));
    return {
      connector,
      status: "healthy",
      sources,
      retrieved_at: result.retrieved_at,
      attempts: result.attempts,
      coverage: {
        required_connectors: [connector], healthy_connectors: [connector], unavailable_connectors: [], coverage_ratio: 1, coverage_complete: true,
        timestamp_precision: sources.every((source) => source.timestamp_precision === "second") ? "second" : "unknown", retrieved_at: result.retrieved_at,
        source_state: sources.length > 0 ? "found" : "not_found", unknown_reasons: [], actual_coverage_start: sources.map((source) => source.published_at).filter(Boolean).sort()[0] ?? null,
        actual_coverage_end: sources.map((source) => source.published_at).filter(Boolean).sort().at(-1) ?? null, pagination_complete: true, page_count: 1,
      },
    };
  } catch (error) {
    return { connector, status: "unavailable", sources: [], retrieved_at: new Date().toISOString(), attempts: 3, limitation: error instanceof Error ? error.message : "RSS unavailable", coverage: { required_connectors: [connector], healthy_connectors: [], unavailable_connectors: [connector], coverage_ratio: null, coverage_complete: false, timestamp_precision: "unknown", retrieved_at: new Date().toISOString(), source_state: "unknown", unknown_reasons: ["RSS unavailable"] } };
  }
}

export async function fetchHksarIsdRss(options: { englishUrl?: string; localUrl?: string } = {}): Promise<HksarIsdRssResult> {
  const english = await readFeed("hksar-isd-en-rss", options.englishUrl ?? APPROVED_HONG_KONG_SOURCES.giaEnglishRss, "en", "Hong Kong Government Information Services Department");
  const local = await readFeed("hksar-isd-zh-rss", options.localUrl ?? APPROVED_HONG_KONG_SOURCES.giaTraditionalChineseRss, "zh-Hant", "Hong Kong Government Information Services Department");
  const englishCoverage = connectorCoverage("hksar-isd-en-rss", english);
  const localCoverage = connectorCoverage("hksar-isd-zh-rss", local);
  const coverage: SourceCoverage = {
    required_connectors: [...englishCoverage.required_connectors, ...localCoverage.required_connectors],
    healthy_connectors: [...englishCoverage.healthy_connectors, ...localCoverage.healthy_connectors],
    unavailable_connectors: [...englishCoverage.unavailable_connectors, ...localCoverage.unavailable_connectors],
    coverage_ratio: englishCoverage.coverage_ratio !== null && localCoverage.coverage_ratio !== null ? (englishCoverage.coverage_ratio + localCoverage.coverage_ratio) / 2 : null,
    coverage_complete: englishCoverage.coverage_complete && localCoverage.coverage_complete,
    timestamp_precision: englishCoverage.timestamp_precision === "second" && localCoverage.timestamp_precision === "second" ? "second" : "unknown",
    retrieved_at: new Date().toISOString(),
    source_state: englishCoverage.source_state === "unknown" || localCoverage.source_state === "unknown" ? "unknown" : english.sources.length + local.sources.length > 0 ? "found" : "not_found",
    unknown_reasons: [...englishCoverage.unknown_reasons, ...localCoverage.unknown_reasons],
    actual_coverage_start: [englishCoverage.actual_coverage_start, localCoverage.actual_coverage_start].filter(Boolean).sort()[0] ?? null,
    actual_coverage_end: [englishCoverage.actual_coverage_end, localCoverage.actual_coverage_end].filter(Boolean).sort().at(-1) ?? null,
    pagination_complete: Boolean(englishCoverage.pagination_complete && localCoverage.pagination_complete), page_count: (englishCoverage.page_count ?? 0) + (localCoverage.page_count ?? 0),
    provider_states: { "hksar-isd-en-rss": "documented", "hksar-isd-zh-rss": "documented" },
  };
  const observations: SourceObservation[] = [...english.sources, ...local.sources].map((source) => ({
    observation_id: source.observation_id ?? `${source.provider ?? "hksar-isd"}:${source.official_release_id ?? source.url}`,
    provider: source.provider ?? "hksar-isd",
    provider_priority: "P0",
    provider_state: "documented",
    observation_role: "verified_source",
    raw_timestamp: source.raw_timestamp ?? source.published_at,
    utc_timestamp: source.utc_timestamp ?? source.published_at,
    timestamp_source_field: source.timestamp_source_field ?? "pubDate",
    actual_coverage_start: source.actual_coverage_start ?? source.published_at,
    actual_coverage_end: source.actual_coverage_end ?? source.published_at,
    pagination_complete: source.pagination_complete ?? true,
    page_count: source.page_count ?? 1,
    data_status: "live",
    source_state: coverage.source_state,
    evidence_cutoff_at: coverage.retrieved_at,
  }));
  return { english, local, coverage, observations };
}
