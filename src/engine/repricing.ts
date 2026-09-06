import { DataStatus, DEFAULTS, PricePoint, RepricingWindow, mergeDataStatuses } from "@/src/contracts";
import { parseFixed } from "@/src/analysis/decimal";
import { clippedLogit } from "@/src/analysis/statistics";

/**
 * C15 threshold recalibration.
 *
 * `absolute_change = |p_j - p_i|` measures probability moves on a linear scale,
 * where a fixed step is not equally informative everywhere. The logit
 * derivative is d/dp log(p/(1-p)) = 1/(p(1-p)): 4.0 at p=0.50 but 21.1 at
 * p=0.05. A linear threshold therefore under-weights tail moves by roughly 5×
 * (21.1/4.0), which is the tail compression this fix removes.
 *
 * Recalibration basis: the logit-scale threshold is anchored at p=0.50, where
 * the linear scale is least distorted, so the new gate is equivalent to the
 * approved 0.08 linear gate at mid-market:
 *
 *   0.08 x 1/(0.5 x 0.5) = 0.08 x 4 = 0.32 log-odds
 *
 * The 0.08 linear value cannot be carried over directly: log-odds are unbounded
 * while |p_j - p_i| <= 1, so the two scales are not comparable.
 */
export const REPRICING_DELTA_LOGODDS_THRESHOLD = 0.32;

/** Reuses the D5 clipped-logit implementation; does not re-derive it. */
export function repricingDeltaLogOdds(startPrice: number, endPrice: number): number | null {
  const start = parseFixed(startPrice.toFixed(6));
  const end = parseFixed(endPrice.toFixed(6));
  if (start === null || end === null) return null;
  return clippedLogit(end).value - clippedLogit(start).value;
}

interface Candidate {
  start: PricePoint;
  end: PricePoint;
  absoluteChange: number;
  deltaLogOdds: number | null;
}

export function detectRepricingWindows(points: PricePoint[], threshold = REPRICING_DELTA_LOGODDS_THRESHOLD): RepricingWindow[] {
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
        const deltaLogOdds = repricingDeltaLogOdds(sorted[i].price, sorted[j].price);
        // C15: the gate is the clipped-logit magnitude, not the linear delta.
        // A null delta means a price could not be parsed; it is not treated as 0.
        if (deltaLogOdds === null) continue;
        const magnitude = Math.abs(deltaLogOdds);
        if (magnitude >= threshold && (!best || magnitude > Math.abs(best.deltaLogOdds ?? 0))) {
          best = { start: sorted[i], end: sorted[j], absoluteChange, deltaLogOdds };
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
      // C15: retain the largest move on the log-odds scale, matching the gate.
      const previousMagnitude = Math.abs(previous.repricing_delta_logodds ?? 0);
      const windowMagnitude = Math.abs(window.repricing_delta_logodds ?? 0);
      const keep = previousMagnitude >= windowMagnitude ? previous : window;
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
    repricing_delta_logodds: candidate.deltaLogOdds,
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
