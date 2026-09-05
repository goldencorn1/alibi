import { DataStatus, DEFAULTS, PricePoint, RepricingWindow, mergeDataStatuses } from "@/src/contracts";

interface Candidate {
  start: PricePoint;
  end: PricePoint;
  absoluteChange: number;
}

export function detectRepricingWindows(points: PricePoint[], threshold = DEFAULTS.absoluteChangeThreshold): RepricingWindow[] {
  const byToken = new Map<string, PricePoint[]>();
  for (const point of points) {
    const key = `${point.market_id}:${point.token_id}`;
    const group = byToken.get(key) ?? [];
    group.push(point);
    byToken.set(key, group);
  }

  const candidates: Candidate[] = [];
  for (const group of byToken.values()) {
    const sorted = [...group].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
    for (let i = 0; i < sorted.length; i += 1) {
      let best: Candidate | null = null;
      const startAt = Date.parse(sorted[i].timestamp);
      for (let j = i + 1; j < sorted.length; j += 1) {
        const endAt = Date.parse(sorted[j].timestamp);
        if (endAt - startAt > DEFAULTS.observationWindowMinutes * 60_000) break;
        const absoluteChange = Math.abs(sorted[j].price - sorted[i].price);
        if (absoluteChange >= threshold && (!best || absoluteChange > best.absoluteChange)) {
          best = { start: sorted[i], end: sorted[j], absoluteChange };
        }
      }
      if (best) candidates.push(best);
    }
  }

  const windows = candidates
    .sort((a, b) => Date.parse(a.start.timestamp) - Date.parse(b.start.timestamp))
    .map((candidate, index) => makeWindow(candidate, threshold, index));

  const deduped: RepricingWindow[] = [];
  for (const window of windows) {
    const previous = deduped[deduped.length - 1];
    if (previous && previous.market_id === window.market_id && previous.token_id === window.token_id && Date.parse(window.start_at) <= Date.parse(previous.end_at)) {
      const keep = previous.absolute_change >= window.absolute_change ? previous : window;
      const discard = keep === previous ? window : previous;
      const merged: RepricingWindow = {
        ...keep,
        start_at: new Date(Math.min(Date.parse(previous.start_at), Date.parse(window.start_at))).toISOString(),
        end_at: new Date(Math.max(Date.parse(previous.end_at), Date.parse(window.end_at))).toISOString(),
        merged_window_ids: [...new Set([...previous.merged_window_ids, ...window.merged_window_ids, discard.id])],
        limitation: "Overlapping candidate windows were merged; the largest absolute change was retained.",
      };
      deduped[deduped.length - 1] = merged;
    } else {
      deduped.push(window);
    }
  }
  return deduped;
}

function makeWindow(candidate: Candidate, threshold: number, index: number): RepricingWindow {
  const { start, end } = candidate;
  const statuses: DataStatus[] = [start.data_status, end.data_status];
  return {
    id: `rw-${start.market_id.slice(0, 12)}-${start.token_id.slice(-8)}-${index + 1}`,
    market_id: start.market_id,
    token_id: start.token_id,
    start_at: start.timestamp,
    end_at: end.timestamp,
    start_price: start.price,
    end_price: end.price,
    absolute_change: candidate.absoluteChange,
    direction: end.price >= start.price ? "UP" : "DOWN",
    threshold,
    observation_window_minutes: 60,
    sample_fidelity_minutes: start.fidelity_minutes ?? end.fidelity_minutes,
    merged_window_ids: [],
    attribution_status: "unattributed",
    evidence_ids: [],
    confidence: null,
    data_status: mergeDataStatuses(statuses),
    limitation: "A price move is a time-series observation, not a causal finding.",
  };
}

export function applyWindowAttribution(
  windows: RepricingWindow[],
  byWindow: Map<string, { status: RepricingWindow["attribution_status"]; evidenceIds: string[]; confidence: number | null; limitation: string }>,
): RepricingWindow[] {
  return windows.map((window) => {
    const attribution = byWindow.get(window.id);
    return attribution ? { ...window, ...attribution } : window;
  });
}
