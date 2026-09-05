import { describe, expect, it } from "vitest";
import { evaluateLanguageWindow } from "@/src/analysis/cluster-language";
import { pairLanguageSources } from "@/src/adapters/evidence/pairing";
import { LanguageSource } from "@/src/contracts";
import { sourceStateFromCoverage } from "@/src/data/evidence";
import { discoveryOnly } from "@/src/adapters/evidence/aggregator-discovery";
import { parseRssRecords } from "@/src/adapters/evidence/hong-kong";
import { fetchHkmaPressReleases } from "@/src/adapters/evidence/hkma";
import { nextLanguageRevision } from "@/src/adapters/evidence/revisions";

function source(language: "en" | "zh-Hant", published: string, precision: "second" | "date" = "second"): LanguageSource {
  return {
    url: "https://www.info.gov.hk/" + language,
    publisher: "Hong Kong Government",
    title: language + " release",
    language,
    source_tier: "primary",
    official_release_id: "release-1",
    original_or_translation: "original",
    published_at: published,
    first_seen_at: published,
    retrieved_at: "2026-09-04T12:30:00.000Z",
    timestamp_type: precision === "date" ? "date_only" : "published",
    timestamp_precision: precision,
    timestamp_uncertainty_seconds: precision === "date" ? 43_200 : 0,
    content_hash: "a".repeat(64),
    connector_status: "healthy",
  };
}

describe("documented_language_window", () => {
  it("requires precise paired public timestamps for a language gap", () => {
    const window = evaluateLanguageWindow(source("zh-Hant", "2026-09-04T12:00:00.000Z"), source("en", "2026-09-04T12:10:00.000Z"), {
      cutoff: "2026-09-04T13:00:00.000Z",
      dataStatus: "recorded",
      addressRelations: [{ address: "0x1", relation: "within_documented_language_window" }],
    });
    expect(window.pairing).toBe("verified");
    expect(window.release_order).toBe("local_first");
    expect(window.gap).toBe("gap_open");
  });

  it("keeps date-only timing unknown", () => {
    const window = evaluateLanguageWindow(source("zh-Hant", "2026-09-04T00:00:00.000Z", "date"), source("en", "2026-09-04T00:00:00.000Z", "date"), {
      cutoff: "2026-09-04T13:00:00.000Z",
      dataStatus: "recorded",
    });
    expect(window.release_order).toBe("unknown");
    expect(window.gap).toBe("gap_unknown");
  });

  it("does not verify a pair from publisher equality alone", () => {
    const local = source("zh-Hant", "2026-09-04T12:00:00.000Z");
    const english = { ...source("en", "2026-09-04T12:10:00.000Z"), official_release_id: "release-2" };
    expect(pairLanguageSources(local, english)).toBe("pairing_unverified");
    expect(evaluateLanguageWindow(local, english, {
      cutoff: "2026-09-04T13:00:00.000Z",
      dataStatus: "recorded",
    }).pairing).toBe("pairing_unverified");
  });

  it("does not let discovery-only observations pass official-id pairing", () => {
    expect(pairLanguageSources({ ...source("zh-Hant", "2026-09-04T12:00:00.000Z"), observation_role: "discovery_only" }, source("en", "2026-09-04T12:10:00.000Z"))).toBe("pairing_unverified");
  });

  it("accepts an official cross-link only with normalized publisher, topic and date", () => {
    const local = { ...source("zh-Hant", "2026-09-04T12:00:00.000Z"), official_release_id: null, official_cross_link: "https://example.gov/release/1", normalized_topic: "policy-rate", published_date: "2026-09-04" };
    const english = { ...source("en", "2026-09-04T12:10:00.000Z"), official_release_id: null, official_cross_link: "https://example.gov/release/1", normalized_topic: "policy-rate", published_date: "2026-09-04" };
    expect(pairLanguageSources(local, english)).toBe("verified");
    expect(evaluateLanguageWindow(local, english, {
      cutoff: "2026-09-04T13:00:00.000Z",
      dataStatus: "recorded",
    }).pairing).toBe("verified");
  });

  it("returns indeterminate when calibrated timestamp intervals overlap", () => {
    const local = { ...source("zh-Hant", "2026-09-04T12:00:00.000Z"), timestamp_uncertainty_seconds: 600 };
    const english = { ...source("en", "2026-09-04T12:05:00.000Z"), timestamp_uncertainty_seconds: 600 };
    const window = evaluateLanguageWindow(local, english, { cutoff: "2026-09-04T13:00:00.000Z", dataStatus: "recorded" });
    expect(window.release_order).toBe("indeterminate");
    expect(window.gap).toBe("gap_closed");
    expect(window.limitations.join(" ")).toContain("overlap");
  });

  it("does not derive not_found from incomplete or date-only coverage", () => {
    expect(sourceStateFromCoverage({ required_connectors: ["en"], healthy_connectors: ["en"], unavailable_connectors: [], coverage_ratio: 1, coverage_complete: true, timestamp_precision: "date", source_state: "not_found", unknown_reasons: [] }, 0)).toBe("unknown");
    expect(sourceStateFromCoverage({ required_connectors: ["en"], healthy_connectors: [], unavailable_connectors: ["en"], coverage_ratio: null, coverage_complete: false, timestamp_precision: "unknown", source_state: "unknown", unknown_reasons: ["unavailable"] }, 0)).toBe("unknown");
  });

  it("keeps GDELT seendate as discovery first-seen, never published_at", () => {
    const result = discoveryOnly([{ url: "https://example.org/story", title: "story", publisher: "example.org", retrieved_at: "2026-09-04T12:00:00.000Z", content_hash: "b".repeat(64), seendate: "20260904120000" }]);
    expect(result.verified).toBe(false);
    expect(result.sources[0]?.published_at).toBeNull();
    expect(result.sources[0]?.first_seen_at).toBe("2026-09-04T12:00:00.000Z");
    expect(result.sources[0]?.observation_role).toBe("discovery_only");
  });

  it("normalizes bilingual RSS items with public provenance", () => {
    const records = parseRssRecords("<rss><channel><item><title><![CDATA[Release]]></title><link>https://example.gov/release/1</link><guid>r1</guid><pubDate>Fri, 04 Sep 2026 12:00:00 GMT</pubDate></item></channel></rss>", "zh-Hant", "HKSAR ISD");
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ official_release_id: "r1", timestamp_type: "published", timestamp_precision: "second", provider: "hksar-isd", observation_role: "verified_source" });
  });

  it("reads the HKMA result.records shape without promoting date-only rows", async () => {
    const result = await fetchHkmaPressReleases({ fetcher: async <T>() => ({ data: { result: { records: [{ id: "hk-1", title: "Release", link: "https://hkma.example/release/1", date: "2026-09-04" }] } } as T, sourceStatus: { source: "hkma", source_url: "https://hkma.example", data_status: "live", retrieved_at: "2026-09-04T12:00:00.000Z", http_status: 200, attempts: 1, retryable: false } }) });
    expect(result.sources).toHaveLength(2);
    expect(result.sources[0]?.timestamp_type).toBe("date_only");
    expect(result.coverage.timestamp_precision).toBe("date");
  });

  it("keeps a late language observation as a new revision", () => {
    expect(nextLanguageRevision({ window_id: "w", evidence_cutoff_at: "2026-09-04T12:00:00.000Z", revision: 1, supersedes_revision: null }, "w", "2026-09-04T13:00:00.000Z")).toEqual({ window_id: "w", evidence_cutoff_at: "2026-09-04T13:00:00.000Z", revision: 2, supersedes_revision: 1 });
  });
});
