import { describe, expect, it } from "vitest";
import {
  RECORDED_DETAIL_WALLETS,
  RECORDED_LEADERBOARD,
  RECORDED_LEADERBOARD_CAPTURED_AT,
  RECORDED_LEADERBOARD_SOURCE,
} from "@/src/rankings/recorded-leaderboard";
import { GLOSSARY, pendingDefinitionCount } from "@/src/ui/glossary";

describe("recorded wallet discovery snapshot", () => {
  it("contains exactly twenty source rows with stable ranks and recorded provenance", () => {
    expect(RECORDED_LEADERBOARD).toHaveLength(20);
    expect(RECORDED_LEADERBOARD.map((row) => row.rank)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
    expect(new Set(RECORDED_LEADERBOARD.map((row) => row.wallet)).size).toBe(20);
    expect(RECORDED_LEADERBOARD.every((row) => row.data_status === "recorded")).toBe(true);
    expect(RECORDED_LEADERBOARD.every((row) => Number.isFinite(row.pnl_usd) && Number.isFinite(row.volume_usd))).toBe(true);
    expect(RECORDED_LEADERBOARD_CAPTURED_AT).toMatch(/^2026-09-05T/);
    expect(RECORDED_LEADERBOARD_SOURCE).toContain("data-api.polymarket.com/v1/leaderboard");
  });

  it("keeps detail presets separate from leaderboard metrics", () => {
    expect(RECORDED_DETAIL_WALLETS).toHaveLength(2);
    expect(RECORDED_DETAIL_WALLETS.every((wallet) => /^0x[0-9a-f]{40}$/.test(wallet))).toBe(true);
    expect(RECORDED_LEADERBOARD.some((row) => RECORDED_DETAIL_WALLETS.includes(row.wallet as (typeof RECORDED_DETAIL_WALLETS)[number]))).toBe(false);
  });

  it("has approved bilingual glossary entries for all newly visible wallet fields", () => {
    const ids = [
      "wallet_discovery", "leaderboard", "recorded_snapshot", "wallet_detail", "source_pnl", "source_volume",
      "realized_pnl_7d", "win_rate", "avg_buy_price", "flip_rate", "median_exposure_minutes", "lead_rate",
      "coverage", "data_provenance", "outcome", "attribution_surface", "fit_surface", "detail_not_captured",
      "observed_trades", "profile_age_days", "active_markets", "category_mix", "portfolio_value", "rebate_income",
    ] as const;
    expect(ids.every((id) => GLOSSARY[id])).toBe(true);
    expect(ids.every((id) => GLOSSARY[id].display === "approved")).toBe(true);
    expect(pendingDefinitionCount()).toBe(0);
  });
});
