import { describe, expect, it } from "vitest";
import synthetic from "@/fixtures/synthetic/demo.json";
import { fixtureBundle, FixtureDocument } from "@/src/data/fixtures";
import { parseInput } from "@/src/input/parser";
import { detectRepricingWindows } from "@/src/engine/repricing";
import { attributeWindows } from "@/src/engine/attribution";
import { calculateWalletMetrics } from "@/src/engine/wallet";
import { DEMO_PRESETS } from "@/src/presets";

describe("synthetic contract and fault path", () => {
  it("keeps synthetic data out of the user Demo presets", () => {
    expect(DEMO_PRESETS).toHaveLength(3);
    expect(DEMO_PRESETS.every((preset) => preset.mode === "recorded")).toBe(true);
    expect(DEMO_PRESETS.some((preset) => preset.input.includes("synthetic"))).toBe(false);
  });

  it("keeps synthetic data explicit and becomes unattributed when live Anthropic is unavailable", async () => {
    const parsed = parseInput("https://polymarket.com/event/synthetic-election-market");
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const bundle = fixtureBundle(parsed.value, synthetic as FixtureDocument);
    const windows = detectRepricingWindows(bundle.prices);
    const attribution = await attributeWindows(windows, bundle.evidence);
    expect(bundle.data_status).toBe("synthetic");
    expect(attribution.windows.every((item) => item.data_status === "synthetic")).toBe(true);
    expect(attribution.windows.every((item) => item.attribution_status === "unattributed")).toBe(true);
    const metrics = calculateWalletMetrics(bundle.trades, attribution.windows, new Date("2026-09-04T00:00:00.000Z"));
    expect(metrics.data_status).toBe("synthetic");
  });
});
