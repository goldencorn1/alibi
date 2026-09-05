import { MarketWsEvent, WsState, acceptWsEvent, markReconnect, markStale, newWsState } from "@/src/adapters/polymarket/ws-state";

export interface RecordedWsReplay { events: MarketWsEvent[]; reconnect_at: number | null; stale_detected: boolean; data_status: "recorded"; }
export function replayMarketWs(events: MarketWsEvent[], options: { disconnectAfter?: number; now?: number } = {}): RecordedWsReplay {
  let state: WsState = newWsState("recorded"); const accepted: MarketWsEvent[] = []; let reconnectAt: number | null = null;
  events.forEach((event, index) => { if (options.disconnectAfter !== undefined && index === options.disconnectAfter) { state = markReconnect(state); reconnectAt = index; } const next = acceptWsEvent(state, event); state = next.state; if (next.accepted) accepted.push(event); });
  state = markStale(state, options.now); return { events: accepted, reconnect_at: reconnectAt, stale_detected: state.status === "stale", data_status: "recorded" };
}

/** Market Channel/RTDS events are deliberately reduced to a trigger. They never carry wallet identity. */
export interface MarketChannelTrigger {
  event_id: string;
  market_id: string;
  token_id: string;
  timestamp: string;
  price: number;
  data_status: "live";
  trigger_only: true;
}

export function parseMarketChannelTrigger(value: unknown): MarketChannelTrigger | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const marketId = typeof row.market_id === "string" ? row.market_id : typeof row.condition_id === "string" ? row.condition_id : typeof row.market === "string" ? row.market : null;
  const tokenId = typeof row.token_id === "string" ? row.token_id : typeof row.asset_id === "string" ? row.asset_id : null;
  const timestamp = typeof row.timestamp === "string" ? row.timestamp : typeof row.timestamp_ms === "number" ? new Date(row.timestamp_ms).toISOString() : null;
  const price = typeof row.price === "number" ? row.price : typeof row.price === "string" ? Number(row.price) : Number.NaN;
  if (!marketId || !tokenId || !timestamp || !Number.isFinite(Date.parse(timestamp)) || !Number.isFinite(price) || price < 0 || price > 1) return null;
  return { event_id: typeof row.event_id === "string" ? row.event_id : `${marketId}:${tokenId}:${timestamp}:${price}`, market_id: marketId, token_id: tokenId, timestamp: new Date(timestamp).toISOString(), price, data_status: "live", trigger_only: true };
}

export function hydrationRequestForTrigger(trigger: MarketChannelTrigger): { condition_id: string; token_id: string; start: string; end: string; source: "data-api-trades" } {
  return { condition_id: trigger.market_id, token_id: trigger.token_id, start: new Date(Date.parse(trigger.timestamp) - 3 * 60 * 60 * 1000).toISOString(), end: trigger.timestamp, source: "data-api-trades" };
}
