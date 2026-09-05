import { describe, expect, it } from "vitest";
import { calibrateTimestamp, CALIBRATION_MINIMUM_SAMPLE_COUNT, timestampUncertainty } from "@/src/analysis/source-calibration";

describe("timestamp calibration", () => {
  it("refuses to create a safety bound below thirty independent samples", () => {
    const result = calibrateTimestamp("hksar/en/published", [1, 2, 3], [1, 2, 4]);
    expect(result.sample_count).toBe(3);
    expect(result.absolute_error_p95_seconds).toBeNull();
    expect(timestampUncertainty(result)).toBeNull();
  });

  it("uses absolute-error nearest-rank P95 at the minimum sample count", () => {
    const observed = Array.from({ length: CALIBRATION_MINIMUM_SAMPLE_COUNT }, (_, index) => index);
    const reference = observed.map((value, index) => value - (index === 29 ? 12 : 2));
    const result = calibrateTimestamp("hksar/en/published", observed, reference);
    expect(result.sample_count).toBe(30);
    expect(result.absolute_error_p95_seconds).toBe(2);
    expect(result.median_absolute_error_seconds).toBe(2);
    expect(result.sample_hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("does not substitute the median for the safety bound", () => {
    const observed = Array.from({ length: 30 }, (_, index) => index);
    const reference = observed.map((value, index) => value - (index >= 28 ? 60 : 1));
    const result = calibrateTimestamp("provider-a", observed, reference);
    expect(result.median_absolute_error_seconds).toBe(1);
    expect(result.absolute_error_p95_seconds).toBe(60);
    expect(result.absolute_error_p95_seconds).not.toBe(result.median_absolute_error_seconds);
  });
});
