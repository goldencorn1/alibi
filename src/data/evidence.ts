import { Evidence, LanguageSource, MarketRecord, SourceCoverage } from "@/src/contracts";

export interface EvidenceValidation {
  valid: Evidence[];
  rejected: Array<{ id: string; reason: string }>;
}

export function validateEvidence(evidence: Evidence[]): EvidenceValidation {
  const valid: Evidence[] = [];
  const rejected: Array<{ id: string; reason: string }> = [];
  for (const item of evidence) {
    if (!/^https?:\/\//.test(item.url)) {
      rejected.push({ id: item.id, reason: "URL is not HTTP(S)." });
      continue;
    }
    if (!item.published_at || Number.isNaN(Date.parse(item.published_at))) {
      rejected.push({ id: item.id, reason: "published_at is missing or invalid." });
      continue;
    }
    if (!item.retrieved_at || !item.license_or_restriction) {
      rejected.push({ id: item.id, reason: "retrieved_at or usage restriction is missing." });
      continue;
    }
    valid.push(item);
  }
  return { valid, rejected };
}

export function evidenceForMarket(evidence: Evidence[], market: MarketRecord): Evidence[] {
  return evidence.filter((item) => item.url && (item.url.includes(market.slug) || item.url.includes("example.invalid")));
}

export function validateLanguageSource(source: LanguageSource): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!/^https?:\/\//.test(source.url)) reasons.push("url_not_http");
  if (!source.publisher.trim() || !source.title.trim()) reasons.push("publisher_or_title_missing");
  if (!source.retrieved_at || Number.isNaN(Date.parse(source.retrieved_at))) reasons.push("retrieved_at_invalid");
  if (!/^[a-f0-9]{64}$/i.test(source.content_hash)) reasons.push("content_hash_invalid");
  if (source.source_tier !== "primary" && source.source_tier !== "direct_media" && source.source_tier !== "aggregator") reasons.push("source_tier_invalid");
  if (source.timestamp_type === "date_only" || source.timestamp_precision === "date") {
    // Date-only observations remain auditable but cannot establish minute order.
  }
  if (source.connector_status !== "healthy") reasons.push("connector_not_healthy");
  if (source.observation_role === "verified_source" && source.source_tier === "aggregator") reasons.push("aggregator_cannot_be_verified_source");
  if (source.observation_role === "verified_source" && source.provider_state === "unavailable") reasons.push("provider_unavailable");
  return { valid: reasons.length === 0, reasons };
}

export function sourceStateFromCoverage(coverage: SourceCoverage, qualifiedSourceCount: number): "found" | "not_found" | "unknown" {
  const required = new Set(coverage.required_connectors);
  const healthy = new Set(coverage.healthy_connectors);
  const requiredHealthy = required.size > 0 && [...required].every((connector) => healthy.has(connector));
  if (!coverage.coverage_complete || !requiredHealthy || coverage.unavailable_connectors.length > 0 || coverage.unknown_reasons.length > 0 || coverage.timestamp_precision === "unknown" || coverage.timestamp_precision === "date" || coverage.source_state === "unknown" || (coverage.source_state === "found" && qualifiedSourceCount === 0) || (coverage.source_state === "not_found" && qualifiedSourceCount > 0)) return "unknown";
  return qualifiedSourceCount > 0 ? "found" : "not_found";
}
