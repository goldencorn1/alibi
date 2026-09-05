import { createHash } from "node:crypto";

export type MarketWsStatus = "idle" | "connecting" | "connected" | "stale" | "stream_degraded" | "reconnecting" | "closed";
export interface MarketWsEvent { event_id: string; market_id: string; token_id: string; timestamp: string; price: number; data_status: "live" | "recorded"; }
export interface WsState {
  status: MarketWsStatus;
  last_event_at: string | null;
  reconnect_count: number;
  stale_after_ms: number;
  fallback_interval_ms: number;
  seen_event_ids: string[];
  data_status: "live" | "recorded";
  coverage_complete: boolean;
}
export function newWsState(dataStatus: "live" | "recorded" = "recorded", staleAfterMs = 30_000): WsState { return { status: "idle", last_event_at: null, reconnect_count: 0, stale_after_ms: staleAfterMs, fallback_interval_ms: 15_000, seen_event_ids: [], data_status: dataStatus, coverage_complete: dataStatus === "recorded" }; }
export function eventId(event: Pick<MarketWsEvent, "market_id" | "token_id" | "timestamp" | "price">): string { return createHash("sha256").update(JSON.stringify(event)).digest("hex").slice(0, 32); }
export function acceptWsEvent(state: WsState, event: MarketWsEvent): { state: WsState; accepted: boolean } { if (state.seen_event_ids.includes(event.event_id)) return { state, accepted: false }; return { state: { ...state, status: "connected", last_event_at: event.timestamp, seen_event_ids: [...state.seen_event_ids, event.event_id].slice(-1000), coverage_complete: state.data_status === "recorded" }, accepted: true }; }
export function markStale(state: WsState, now = Date.now()): WsState { return state.last_event_at && now - Date.parse(state.last_event_at) > state.stale_after_ms ? { ...state, status: "stale" } : state; }
export function markReconnect(state: WsState): WsState { return { ...state, status: "stream_degraded", reconnect_count: state.reconnect_count + 1, coverage_complete: false }; }
export function shouldUseRestFallback(state: WsState, now = Date.now()): boolean {
  return state.data_status === "live" && (state.status === "stale" || state.status === "stream_degraded" || state.status === "reconnecting" || !state.last_event_at || now - Date.parse(state.last_event_at) > state.stale_after_ms);
}
export function markRestFallback(state: WsState): WsState {
  return { ...state, status: "reconnecting", coverage_complete: false };
}
export function reconcileWsState(state: WsState, eventIds: string[]): WsState {
  return { ...state, status: eventIds.length > 0 ? "connected" : "stream_degraded", coverage_complete: eventIds.length > 0, seen_event_ids: [...new Set([...state.seen_event_ids, ...eventIds])].slice(-1000) };
}
