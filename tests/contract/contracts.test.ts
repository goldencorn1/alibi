import { describe, expect, it } from "vitest";
import {
  DEFAULTS,
  DISCLAIMER,
  SCHEMA_VERSION,
  clampConfidence,
  isDataStatus,
  isWalletAddress,
  mergeDataStatuses,
} from "@/src/contracts";

describe("approved contract constants", () => {
  it("keeps the Spec defaults immutable", () => {
    expect(DEFAULTS).toEqual({
      observationWindowMinutes: 60,
      absoluteChangeThreshold: 0.08,
      walletWindowDays: 90,
      coverageThreshold: 0.4,
    });
    expect(SCHEMA_VERSION).toBe("1.1.0");
    expect(DISCLAIMER).toContain("不构成投资建议");
  });

  it("recognizes only the four approved data statuses", () => {
    expect(["live", "recorded", "synthetic", "cached"].every(isDataStatus)).toBe(true);
    expect(isDataStatus("mock")).toBe(false);
  });

  it("validates wallet shape without implying identity", () => {
    expect(isWalletAddress("0x1234567890123456789012345678901234567890")).toBe(true);
    expect(isWalletAddress("0x1234")).toBe(false);
  });

  it("clamps confidence and preserves conservative status precedence", () => {
    expect(clampConfidence(-1)).toBe(0);
    expect(clampConfidence(1.4)).toBe(1);
    expect(clampConfidence(Number.NaN)).toBeNull();
    expect(mergeDataStatuses(["recorded", "synthetic"])).toBe("recorded");
    expect(mergeDataStatuses(["cached", "recorded"])).toBe("cached");
    expect(mergeDataStatuses(["live", "recorded"])).toBe("live");
  });
});
