import { TimestampPrecision, TimestampType } from "@/src/contracts";

export interface ParsedTime {
  raw: string;
  iso: string;
  epochMs: number;
  timestamp_type: TimestampType;
  timestamp_precision: TimestampPrecision;
  timestamp_uncertainty_seconds: number | null;
}

export function parseTime(
  raw: string,
  timestampType: TimestampType = "published",
  precision: TimestampPrecision = "second",
  uncertaintySeconds: number | null = precision === "date" ? 43_200 : null,
): ParsedTime | null {
  const epochMs = Date.parse(raw);
  if (!raw || Number.isNaN(epochMs)) return null;
  return {
    raw,
    iso: new Date(epochMs).toISOString(),
    epochMs,
    timestamp_type: timestampType,
    timestamp_precision: precision,
    timestamp_uncertainty_seconds: uncertaintySeconds,
  };
}

export function inClosedOpenWindow(timeMs: number, startMs: number, endMs: number): boolean {
  return timeMs > startMs && timeMs <= endMs;
}

