import { createHash } from "node:crypto";
import { TimestampCalibration } from "@/src/contracts";

export const CALIBRATION_ALGORITHM_VERSION = "absolute-error-p95-nearest-rank-v1";
export const CALIBRATION_MINIMUM_SAMPLE_COUNT = 30;

export function nearestRankQuantile(values: number[], quantile: number): number | null {
  const finite = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (finite.length === 0) return null;
  const rank = Math.max(1, Math.ceil(quantile * finite.length));
  return finite[rank - 1] ?? null;
}

export function absoluteErrors(observed: number[], reference: number[]): number[] {
  const size = Math.min(observed.length, reference.length);
  return Array.from({ length: size }, (_, index) => Math.abs(observed[index] - reference[index])).filter(Number.isFinite);
}

export function calibrationSampleHash(observed: number[], reference: number[]): string {
  return createHash("sha256").update(JSON.stringify({ observed, reference })).digest("hex");
}

export function calibrateTimestamp(
  cohort: string,
  observed: number[],
  independentReference: number[],
): TimestampCalibration {
  const errors = absoluteErrors(observed, independentReference);
  const p95 = errors.length >= CALIBRATION_MINIMUM_SAMPLE_COUNT ? nearestRankQuantile(errors, 0.95) : null;
  return {
    cohort,
    sample_count: errors.length,
    absolute_error_p95_seconds: p95,
    median_absolute_error_seconds: nearestRankQuantile(errors, 0.5),
    algorithm_version: CALIBRATION_ALGORITHM_VERSION,
    sample_hash: calibrationSampleHash(observed, independentReference),
  };
}

export function timestampUncertainty(calibration: TimestampCalibration | null | undefined): number | null {
  if (!calibration || calibration.sample_count < CALIBRATION_MINIMUM_SAMPLE_COUNT) return null;
  return calibration.absolute_error_p95_seconds;
}
