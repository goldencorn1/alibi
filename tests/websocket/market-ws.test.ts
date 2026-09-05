import { describe, expect, it, vi } from "vitest";
import { replayMarketWs } from "@/src/adapters/polymarket/market-ws";
import { hydrateMarketChannelTrigger } from "@/src/data/adapters";
import { paginateRest, reconcileRows, restBackfill } from "@/src/adapters/polymarket/rest-backfill";
import { acceptWsEvent, markReconnect, markRestFallback, markStale, newWsState, reconcileWsState, shouldUseRestFallback } from "@/src/adapters/polymarket/ws-state";

const event = (id: string, timestamp: string) => ({ event_id: id, market_id: "m1", token_id: "t1", timestamp, price: 0.5, data_status: "recorded" as const });

describe("public Polymarket market websocket replay", () => {
  it("deduplicates events and records reconnect", () => {
    const result = replayMarketWs([event("a", "2026-09-01T00:00:00.000Z"), event("a", "2026-09-01T00:00:00.000Z"), event("b", "2026-09-01T00:01:00.000Z")], { disconnectAfter: 1 });
    expect(result.events).toHaveLength(2);
    expect(result.reconnect_at).toBe(1);
    expect(result.data_status).toBe("recorded");
  });

  it("marks a stream stale without treating it as live", () => {
    const state = newWsState("recorded", 1000);
    const accepted = acceptWsEvent(state, event("a", "2026-09-01T00:00:00.000Z"));
    expect(markStale(accepted.state, Date.parse("2026-09-01T00:00:02.000Z")).status).toBe("stale");
  });

  it("uses a bounded REST fallback and reconciles after reconnect", () => {
    const live = newWsState("live", 1000);
    const reconnecting = markReconnect(live);
    expect(reconnecting.coverage_complete).toBe(false);
    expect(markRestFallback(reconnecting).fallback_interval_ms).toBe(15_000);
    expect(shouldUseRestFallback(markRestFallback(reconnecting))).toBe(true);
    expect(reconcileWsState(reconnecting, ["backfill-1"]).coverage_complete).toBe(true);
  });

  it("paginates until the cursor ends and deduplicates hydration rows", async () => {
    const calls: Array<string | null> = [];
    const result = await paginateRest(async (cursor) => {
      calls.push(cursor);
      return cursor === null
        ? { items: [{ id: "a" }, { id: "b" }], next_cursor: "next" }
        : { items: [{ id: "b" }, { id: "c" }], next_cursor: null };
    }, { dedupKey: (item) => item.id });
    expect(calls).toEqual([null, "next"]);
    expect(result.items.map((item) => item.id)).toEqual(["a", "b", "c"]);
    expect(result.coverage_complete).toBe(true);
    expect(reconcileRows([{ id: "stream" }, { id: "b" }], result.items, (item) => item.id).map((item) => item.id)).toEqual(["a", "b", "c", "stream"]);
  });

  it("uses the four bounded hydration attempts without changing live status", async () => {
    const calls: number[] = [];
    const sleeps: number[] = [];
    vi.stubGlobal("fetch", vi.fn(async () => {
      calls.push(calls.length + 1);
      if (calls.length < 4) throw new Error("temporary upstream failure");
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }));
    const result = await restBackfill<{ ok: boolean }>("https://example.invalid/trades", "trades", { sleep: async (milliseconds) => { sleeps.push(milliseconds); } });
    expect(result.data).toEqual({ ok: true });
    expect(result.data_status).toBe("live");
    expect(result.attempts).toBe(4);
    expect(sleeps).toEqual([2_000, 5_000, 10_000]);
    vi.unstubAllGlobals();
  });

  it("hydrates a market trigger from the public Data API and reconciles duplicate rows", async () => {
    const rawTrade = { transactionHash: "tx-1", proxyWallet: "0xabc", conditionId: "m1", asset: "t1", timestamp: 1_757_000_000, side: "BUY", price: 0.5, size: 2 };
    const calls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      return new Response(JSON.stringify([rawTrade, ...(calls.length === 1 ? [rawTrade] : [])]), { status: 200 });
    }));
    const result = await hydrateMarketChannelTrigger({
      event_id: "event-1", market_id: "m1", token_id: "t1", timestamp: "2026-09-04T12:00:00.000Z", price: 0.5, data_status: "live", trigger_only: true,
    });
    expect(result.trades).toHaveLength(1);
    expect(result.trades[0]?.wallet).toBe("0xabc");
    expect(result.coverage_complete).toBe(true);
    expect(result.reconcile_required).toBe(true);
    expect(calls[0]).toContain("market=m1");
    expect(calls[0]).toContain("asset=t1");
    vi.unstubAllGlobals();
  });
});
