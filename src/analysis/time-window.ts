import { TimestampPrecision, TimestampType } from "@/src/contracts";

export interface ParsedTime {
  raw: string;
  iso: string;
  epochMs: number;
  timestamp_type: TimestampType;
  timestamp_precision: TimestampPrecision;
  /** C13: MINUTES, not seconds. See `LanguageSource` in contracts. */
  source_timestamp_uncertainty_minutes: number | null;
}

export function parseTime(
  raw: string,
  timestampType: TimestampType = "published",
  precision: TimestampPrecision = "second",
  // C13: minutes. A date-only row is +/-12h, which is 720 minutes (was 43_200
  // seconds). Non-date precision stays `null` (unknown), never 0.
  uncertaintyMinutes: number | null = precision === "date" ? 720 : null,
): ParsedTime | null {
  const epochMs = Date.parse(raw);
  if (!raw || Number.isNaN(epochMs)) return null;
  return {
    raw,
    iso: new Date(epochMs).toISOString(),
    epochMs,
    timestamp_type: timestampType,
    timestamp_precision: precision,
    source_timestamp_uncertainty_minutes: uncertaintyMinutes,
  };
}

export function inClosedOpenWindow(timeMs: number, startMs: number, endMs: number): boolean {
  return timeMs > startMs && timeMs <= endMs;
}

