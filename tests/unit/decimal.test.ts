import { describe, expect, it } from "vitest";
import { fixedToString, multiplyFixed, parseFixed } from "@/src/analysis/decimal";

describe("fixed-point arithmetic", () => {
  it("parses decimal strings without binary threshold drift", () => {
    const size = parseFixed("12.345678");
    const price = parseFixed("0.810000");
    expect(size).not.toBeNull();
    expect(price).not.toBeNull();
    expect(fixedToString(multiplyFixed(size as bigint, price as bigint))).toBe("9.999999");
  });

  it("rejects invalid size, price and over-precise values", () => {
    expect(parseFixed("0")).toBe(0n);
    expect(parseFixed("0.1234567")).toBeNull();
    expect(parseFixed("NaN")).toBeNull();
    expect(parseFixed("-1")).toBe(-1_000_000n);
  });
});

