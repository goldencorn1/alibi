import { describe, expect, it } from "vitest";
import { LanguageSource } from "@/src/contracts";
import { evaluateLanguageWindow } from "@/src/analysis/cluster-language";
import { discoveryOnly, normalizeDiscoveryLanguage } from "@/src/adapters/evidence/aggregator-discovery";
import { parseRssRecords } from "@/src/adapters/evidence/hong-kong";
import { fetchSecEdgarSubmissions } from "@/src/adapters/evidence/sec-edgar";
import { parseTime } from "@/src/analysis/time-window";

/**
 * C13 unit guard.
 *
 * `source_timestamp_uncertainty_minutes` is denominated in MINUTES. The field
 * was previously named `..._seconds` while the release-order arithmetic and the
 * adapters disagreed about the unit, so a value like 60 silently meant either
 * one minute or one hour: a 60x error that no assertion could catch.
 *
 * These tests are the recurrence guard. They assert calibrated values sit in
 * the minute band rather than the second band, so re-introducing a seconds-scale
 * value (60 instead of 1, 43_200 instead of 720) fails here instead of silently
 * corrupting release ordering.
 */

const SECONDS_SCALE_FLOOR = 60;

function edgarFetcher(acceptance: string | null) {
  return async <T>() => ({
    data: {
      filings: {
        recent: {
          accessionNumber: ["0000320193-26-000001"],
          filingDate: ["2026-09-04"],
          ...(acceptance ? { acceptanceDateTime: [acceptance] } : {}),
          form: ["8-K"],
        },
      },
    } as T,
    sourceStatus: {
      source: "sec-edgar",
      source_url: "https://data.sec.gov",
      data_status: "live" as const,
      retrieved_at: "2026-09-04T17:00:00.000Z",
      http_status: 200,
      attempts: 1,
      retryable: false,
    },
  });
}

describe("source_timestamp_uncertainty_minutes is denominated in minutes", () => {
  it("keeps a precise EDGAR acceptance timestamp below one minute, not at 60", async () => {
    const result = await fetchSecEdgarSubmissions("0000320193", { fetcher: edgarFetcher("2026-09-04T16:30:00.000Z") });
    const uncertainty = result.sources[0]?.source_timestamp_uncertainty_minutes;

    expect(uncertainty).not.toBeNull();
    // The authoritative EDGAR magnitude is ~0.1 minutes. A value of 60 would
    // mean this is still carrying a seconds-scale number.
    expect(uncertainty).toBeCloseTo(0.1);
    expect(uncertainty as number).toBeLessThan(1);
    expect(uncertainty as number).toBeLessThan(SECONDS_SCALE_FLOOR);
  });

  it("expresses a date-only row as 720 minutes rather than 43200 seconds", async () => {
    const result = await fetchSecEdgarSubmissions("0000320193", { fetcher: edgarFetcher(null) });
    expect(result.sources[0]?.timestamp_precision).toBe("date");
    // 12 hours. 43_200 would be the seconds-scale value for the same interval.
    expect(result.sources[0]?.source_timestamp_uncertainty_minutes).toBe(720);

    expect(parseTime("2026-09-04", "date_only", "date")?.source_timestamp_uncertainty_minutes).toBe(720);
    // Unknown uncertainty stays null; it must never be coerced to 0.
    expect(parseTime("2026-09-04T12:00:00.000Z", "published", "second")?.source_timestamp_uncertainty_minutes).toBeNull();
  });

  it("records the known GDELT aggregator lag as 15 minutes instead of null (C4)", () => {
    const result = discoveryOnly([{
      url: "https://example.org/story",
      title: "story",
      publisher: "example.org",
      retrieved_at: "2026-09-04T12:00:00.000Z",
      content_hash: "b".repeat(64),
      seendate: "20260904120000",
    }]);

    // Previously null, which claimed an unknown lag for a measured one.
    expect(result.sources[0]?.source_timestamp_uncertainty_minutes).toBe(15);
    expect(result.sources[0]?.source_timestamp_uncertainty_minutes).toBeLessThan(SECONDS_SCALE_FLOOR);
  });

  it("never claims zero uncertainty for a Hong Kong RSS item (C26)", () => {
    const records = parseRssRecords(
      "<rss><channel><item><title><![CDATA[Release]]></title><link>https://example.gov/release/1</link><guid>r1</guid><pubDate>Fri, 04 Sep 2026 12:00:00 GMT</pubDate></item></channel></rss>",
      "zh-Hant",
      "HKSAR ISD",
    );

    const uncertainty = records[0]?.source_timestamp_uncertainty_minutes;
    // A feed generation time is not a publication instant, so 0 was a
    // calibration error in the optimistic direction.
    expect(uncertainty).not.toBe(0);
    expect(uncertainty).toBe(1);
  });

  it("preserves the real GDELT language instead of hard-coding other (C27)", () => {
    const record = {
      url: "https://example.org/story",
      title: "story",
      publisher: "example.org",
      retrieved_at: "2026-09-04T12:00:00.000Z",
      content_hash: "c".repeat(64),
      seendate: "20260904120000",
    };

    expect(discoveryOnly([{ ...record, language: "en" }]).sources[0]?.language).toBe("en");
    expect(discoveryOnly([{ ...record, language: "zh-Hant" }]).sources[0]?.language).toBe("zh-Hant");
    // Values outside the closed LanguageCode union, and missing values, fall
    // back to "other" rather than being cast into it.
    expect(discoveryOnly([{ ...record, language: "sw" }]).sources[0]?.language).toBe("other");
    expect(discoveryOnly([record]).sources[0]?.language).toBe("other");
    expect(normalizeDiscoveryLanguage("ENGLISH")).toBe("en");
    expect(normalizeDiscoveryLanguage(null)).toBe("other");
  });
});

describe("release-order arithmetic converts minutes with the 60000 factor", () => {
  function source(language: "en" | "zh-Hant", published: string, uncertaintyMinutes: number): LanguageSource {
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
      timestamp_type: "published",
      timestamp_precision: "second",
      source_timestamp_uncertainty_minutes: uncertaintyMinutes,
      content_hash: "a".repeat(64),
      connector_status: "healthy",
    };
  }

  it("treats a 30-second gap under 1-minute uncertainty as indeterminate", () => {
    // local  12:00:00 +/- 1min => [11:59:00, 12:01:00]
    // english 12:00:30 +/- 1min => [11:59:30, 12:01:30]  -> intervals overlap
    //
    // Under the abolished x1_000 factor these would be +/- 1 SECOND, the
    // intervals would separate, and the pair would be falsely reported as
    // local_first. This asserts the x60_000 conversion.
    const window = evaluateLanguageWindow(
      source("zh-Hant", "2026-09-04T12:00:00.000Z", 1),
      source("en", "2026-09-04T12:00:30.000Z", 1),
      { cutoff: "2026-09-04T13:00:00.000Z", dataStatus: "recorded" },
    );

    expect(window.release_order).toBe("indeterminate");
  });

  it("still resolves an order when the gap exceeds the combined uncertainty", () => {
    // local 12:00 +/- 1min ends 12:01; english 12:10 +/- 1min starts 12:09.
    const window = evaluateLanguageWindow(
      source("zh-Hant", "2026-09-04T12:00:00.000Z", 1),
      source("en", "2026-09-04T12:10:00.000Z", 1),
      { cutoff: "2026-09-04T13:00:00.000Z", dataStatus: "recorded" },
    );

    expect(window.release_order).toBe("local_first");
  });
});
