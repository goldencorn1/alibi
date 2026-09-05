import { describe, expect, it } from "vitest";
import { parseInput } from "@/src/input/parser";

describe("parseInput", () => {
  it("accepts wallet, market, event and profile inputs", () => {
    expect(parseInput("0x1234567890123456789012345678901234567890").ok).toBe(true);
    const market = parseInput("https://polymarket.com/market/example-market");
    const event = parseInput("https://polymarket.com/event/example-event");
    const profile = parseInput("https://polymarket.com/profile/0x1234567890123456789012345678901234567890");
    expect(market.ok && market.value).toMatchObject({ kind: "market", normalized_id: "example-market" });
    expect(event.ok && event.value).toMatchObject({ kind: "market", normalized_id: "example-event" });
    expect(profile.ok && profile.value).toMatchObject({ kind: "profile" });
  });

  it("rejects malformed and unsupported inputs before any upstream call", () => {
    expect(parseInput("")).toMatchObject({ ok: false, code: "invalid_input" });
    expect(parseInput("https://example.com/market/foo")).toMatchObject({ ok: false, code: "invalid_input" });
    expect(parseInput("0x1234")).toMatchObject({ ok: false, code: "invalid_input" });
  });
});
