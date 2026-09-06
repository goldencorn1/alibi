import { describe, expect, it } from "vitest";
import {
  DEESMetrics,
  MetricEnvelope,
  MetricStatus,
  REASON_CODES,
  ReasonCode,
  isReasonCode,
} from "@/src/contracts";
import { UNITS, buildEnvelope } from "@/src/analysis/metric-envelope";

/**
 * D7 — FORWARD-LOOKING GUARD, NOT A REGRESSION TEST.
 *
 * As of this commit `outcomeIndex` has zero references anywhere in `src/`,
 * `app/`, `mcp/` or `tests/`: no adapter reads the field yet. Nothing here
 * verifies existing behaviour. The purpose is to fail loudly the moment
 * someone implements an `/activity` or `/trades` adapter that folds the
 * unknown sentinel 999 into a real outcome index (typically 0 / "YES").
 *
 * IMPLEMENTATION NOTE: `normalizeOutcomeIndex` below is deliberately defined
 * in the test file so this commit touches no production code. When the
 * adapter is built, lift this helper verbatim into
 * `src/adapters/polymarket/` (alongside the activity/trades row mappers) and
 * re-point these tests at the exported version. The sentinel constant and the
 * `sentinel_unknown` reason code belong in `src/contracts/index.ts` next to
 * `REASON_CODES` at that time.
 *
 * Approved contract for `outcomeIndex === 999`:
 *   - normalized value MUST be null
 *   - MUST NOT become 0 / YES / NO / false / any other default
 *   - MUST NOT feed YES/NO resolution, economic direction, or same-side logic
 *   - MUST surface an explicit unknown branch, reason_code `sentinel_unknown`
 */

const SENTINEL = 999;

/**
 * Measured distribution of `outcomeIndex` in the recorded `/activity`
 * captures at artifacts/verification/wallet-discovery-001/act-*.body.json,
 * deduplicated across the three overlapping 500-row pages by
 * (transactionHash, timestamp, type, asset, outcomeIndex, size).
 *
 * The sentinel is NOT confined to REDEEM/MERGE: one real TRADE carries 999.
 */
const ACTIVITY_OUTCOME_INDEX_DISTRIBUTION = {
  TRADE: { 0: 240, 1: 169, 999: 1 },
  REDEEM: { 0: 33, 1: 36, 999: 5 },
  MERGE: { 999: 17 },
} as const satisfies Record<string, Partial<Record<number, number>>>;

/**
 * `/trades` captures. The sentinel is rare but PRESENT on this endpoint, so it
 * is not activity-only and the guard is required in both adapters:
 *   tr-l10000 / tr-l10001 (limit=10000): 10000 rows, 0 sentinels
 *   tr-snap2 (limit=10000, later snapshot): 10000 rows, 1 sentinel
 *   tr-head-t1 / tr-head2 (limit=1): 1 row, 1 sentinel
 */
const TRADES_SENTINEL_OBSERVATIONS = [
  { capture: "tr-l10000", rows: 10000, sentinels: 0 },
  { capture: "tr-l10001", rows: 10000, sentinels: 0 },
  { capture: "tr-snap2", rows: 10000, sentinels: 1 },
  { capture: "tr-head-t1", rows: 1, sentinels: 1 },
  { capture: "tr-head2", rows: 1, sentinels: 1 },
] as const;

/**
 * Real sentinel-bearing rows, copied from the captures. Note that on `/trades`
 * a 999 row still carries a plausible non-empty `outcome` string and a real
 * side/price: the label cannot be used to detect or to backfill the index.
 */
const SENTINEL_ROWS = [
  { capture: "tr-head-t1", type: "TRADE", outcomeIndex: 999, outcome: "Yes", side: "BUY", price: 0.5249336424 },
  { capture: "tr-snap2", type: "TRADE", outcomeIndex: 999, outcome: "Under", side: "BUY", price: 0.36 },
  { capture: "act-l500", type: "TRADE", outcomeIndex: 999, outcome: "paiN Gaming", side: "BUY", price: null },
  { capture: "act-l500", type: "REDEEM", outcomeIndex: 999, outcome: "", side: "", price: null },
  { capture: "act-l500", type: "MERGE", outcomeIndex: 999, outcome: "", side: "", price: null },
] as const;

type DownstreamStatus = DEESMetrics["status"];

interface NormalizedOutcome {
  outcome_index: number | null;
  label: string | null;
  envelope: MetricEnvelope<number>;
  downstream_status: DownstreamStatus;
  usable_for_direction: boolean;
}

const ENVELOPE_BASE = {
  unit: UNITS.none,
  data_status: "recorded" as const,
  sample_size: 1,
  eligible_sample_size: 1,
} as const;

/**
 * D8 note: the malformed/absent branch reports `unavailable` with a NULL
 * reason_code, which `buildEnvelope` would reject. That is intentional and the
 * D7 contract is preserved as approved: only a true 999 earns
 * `sentinel_unknown`, and none of the eight approved REASON_CODES means
 * "the upstream field was absent or malformed". Inventing a ninth code here, or
 * reusing `sentinel_unknown` for non-sentinel input, would both misreport the
 * fault. So this branch is built as a literal rather than weakening the
 * production invariant in `buildEnvelope`.
 */
function normalizeOutcomeIndex(raw: unknown, outcomes: readonly string[] = []): NormalizedOutcome {
  const isSentinel = raw === SENTINEL;
  const isRealIndex = typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && !isSentinel;

  if (!isRealIndex) {
    const envelope: MetricEnvelope<number> = isSentinel
      ? buildEnvelope<number>({
          ...ENVELOPE_BASE,
          value: null,
          metric_status: "unavailable",
          reason_code: "sentinel_unknown",
          limitations: ["outcomeIndex=999 是未知哨兵值，不得折叠为 0/YES/NO。"],
        })
      : {
          ...buildEnvelope<number>({
            ...ENVELOPE_BASE,
            value: null,
            metric_status: "unavailable",
            reason_code: "sentinel_unknown",
          }),
          reason_code: null,
        };
    return {
      outcome_index: null,
      label: null,
      envelope,
      downstream_status: "insufficient_evidence",
      usable_for_direction: false,
    };
  }

  return {
    outcome_index: raw,
    label: outcomes[raw] ?? null,
    // D8: `complete`, formerly `available`.
    envelope: buildEnvelope<number>({ ...ENVELOPE_BASE, value: raw, metric_status: "complete" }),
    downstream_status: "eligible",
    usable_for_direction: true,
  };
}

/** Binary YES/NO resolution. Unknown index must never resolve to a side. */
function binaryLabel(normalized: NormalizedOutcome): "YES" | "NO" | null {
  if (normalized.outcome_index === 0) return "YES";
  if (normalized.outcome_index === 1) return "NO";
  return null;
}

/** Same-side comparison. Unknown on either leg collapses to null, never false. */
function sameSide(a: NormalizedOutcome, b: NormalizedOutcome): boolean | null {
  if (!a.usable_for_direction || !b.usable_for_direction) return null;
  return a.outcome_index === b.outcome_index;
}

/** Economic direction. Unknown index yields null, never a default long_yes. */
function economicDirection(
  normalized: NormalizedOutcome,
  side: "BUY" | "SELL" | string,
): "long_yes" | "short_yes" | null {
  const label = binaryLabel(normalized);
  if (label === null) return null;
  if (side !== "BUY" && side !== "SELL") return null;
  const longYes = (label === "YES") === (side === "BUY");
  return longYes ? "long_yes" : "short_yes";
}

describe("D7 sentinel outcomeIndex=999 normalizes to unknown", () => {
  it("maps 999 to null and — the load-bearing assertion — not to 0", () => {
    const normalized = normalizeOutcomeIndex(SENTINEL);
    expect(normalized.outcome_index).toBeNull();
    // toBeNull() alone is too weak: 0 and null both pass loose checks, and 0 is
    // exactly the wrong answer an implementer is most likely to produce.
    expect(normalized.outcome_index).not.toBe(0);
    expect(normalized.outcome_index).not.toBe(1);
    expect(normalized.outcome_index).not.toBe(SENTINEL);
    expect(Object.is(normalized.outcome_index, 0)).toBe(false);
    expect(normalized.envelope.value).not.toBe(0);
    expect(normalized.envelope.value).toBeNull();
  });

  it("rejects every falsy/default stand-in for the unknown index", () => {
    const { outcome_index: index, label } = normalizeOutcomeIndex(SENTINEL);
    for (const forbidden of [0, 1, -1, false, true, "0", "YES", "NO", NaN] as unknown[]) {
      expect(index).not.toBe(forbidden);
    }
    expect(label).toBeNull();
  });

  it("produces neither YES nor NO for the sentinel", () => {
    const normalized = normalizeOutcomeIndex(SENTINEL, ["Yes", "No"]);
    expect(binaryLabel(normalized)).toBeNull();
    expect(binaryLabel(normalized)).not.toBe("YES");
    expect(binaryLabel(normalized)).not.toBe("NO");
    // 999 must not index or clamp into the outcomes array either.
    expect(normalized.label).toBeNull();
    expect(normalized.label).not.toBe("Yes");
    expect(normalized.label).not.toBe("No");
  });

  it("does not let a plausible outcome string backfill the sentinel index", () => {
    // Real /trades sentinel rows carry outcome "Yes" / "Under" / a team name.
    for (const row of SENTINEL_ROWS) {
      const normalized = normalizeOutcomeIndex(row.outcomeIndex, [row.outcome]);
      expect(normalized.outcome_index, `${row.capture} ${row.type}`).toBeNull();
      expect(normalized.outcome_index, `${row.capture} ${row.type}`).not.toBe(0);
      expect(binaryLabel(normalized), `${row.capture} ${row.type}`).toBeNull();
    }
  });

  it("keeps the sentinel out of same-side computation, as null not false", () => {
    const unknown = normalizeOutcomeIndex(SENTINEL);
    const yes = normalizeOutcomeIndex(0);
    expect(unknown.usable_for_direction).toBe(false);
    // false would silently assert "opposite sides", which is a claim we cannot make.
    expect(sameSide(unknown, yes)).toBeNull();
    expect(sameSide(yes, unknown)).toBeNull();
    expect(sameSide(unknown, unknown)).toBeNull();
    expect(sameSide(unknown, yes)).not.toBe(false);
    expect(sameSide(unknown, unknown)).not.toBe(true);
  });

  it("keeps the sentinel out of economic direction", () => {
    const unknown = normalizeOutcomeIndex(SENTINEL);
    for (const side of ["BUY", "SELL", ""] as const) {
      expect(economicDirection(unknown, side)).toBeNull();
      expect(economicDirection(unknown, side)).not.toBe("long_yes");
    }
  });

  it("reports metric_status/reason_code through the approved envelope", () => {
    const { envelope, downstream_status } = normalizeOutcomeIndex(SENTINEL);
    expect(envelope.reason_code).toBe("sentinel_unknown");
    expect(isReasonCode(envelope.reason_code)).toBe(true);
    expect(REASON_CODES).toContain("sentinel_unknown");
    // D8: MetricStatus is now complete|partial|unavailable|
    // insufficient_evidence|not_enabled and expresses computability only. The
    // unknown branch is `unavailable` on the envelope; the metric-level
    // DEESMetrics/WalletMetrics.status stays `insufficient_evidence`.
    const status: MetricStatus = envelope.metric_status;
    expect(status).toBe("unavailable");
    expect(status).not.toBe("complete");
    expect(status).not.toBe("partial");
    expect(downstream_status).toBe("insufficient_evidence");
    // D8 hard rule: an unavailable metric never carries 0.
    expect(envelope.value).toBeNull();
    expect(envelope.value).not.toBe(0);
    // data_status is an independent axis: recorded data still yields a verdict.
    expect(envelope.data_status).toBe("recorded");
  });
});

describe("D7 legitimate indices are untouched", () => {
  it("treats 0 as a real index, not as unknown", () => {
    // The most likely over-correction: hardening against 999 by also nulling 0.
    const normalized = normalizeOutcomeIndex(0, ["Yes", "No"]);
    expect(normalized.outcome_index).toBe(0);
    expect(normalized.outcome_index).not.toBeNull();
    expect(normalized.envelope.value).toBe(0);
    expect(normalized.envelope.metric_status).toBe("complete");
    expect(normalized.envelope.reason_code).toBeNull();
    expect(normalized.downstream_status).toBe("eligible");
    expect(normalized.usable_for_direction).toBe(true);
    expect(binaryLabel(normalized)).toBe("YES");
    expect(normalized.label).toBe("Yes");
  });

  it("treats 1 as a real index", () => {
    const normalized = normalizeOutcomeIndex(1, ["Yes", "No"]);
    expect(normalized.outcome_index).toBe(1);
    expect(normalized.envelope.metric_status).toBe("complete");
    expect(normalized.envelope.reason_code).toBeNull();
    expect(binaryLabel(normalized)).toBe("NO");
    expect(normalized.label).toBe("No");
  });

  it("still computes direction and same-side for 0/1 pairs", () => {
    const yes = normalizeOutcomeIndex(0);
    const no = normalizeOutcomeIndex(1);
    expect(sameSide(yes, yes)).toBe(true);
    expect(sameSide(yes, no)).toBe(false);
    expect(economicDirection(yes, "BUY")).toBe("long_yes");
    expect(economicDirection(yes, "SELL")).toBe("short_yes");
    expect(economicDirection(no, "BUY")).toBe("short_yes");
  });

  it("does not fall back to 0 for missing or malformed indices either", () => {
    for (const raw of [undefined, null, "", "0", -1, 1.5, NaN, {}] as unknown[]) {
      const normalized = normalizeOutcomeIndex(raw);
      expect(normalized.outcome_index, String(raw)).toBeNull();
      expect(normalized.outcome_index, String(raw)).not.toBe(0);
      expect(normalized.downstream_status, String(raw)).toBe("insufficient_evidence");
      // Only a true 999 earns the sentinel code; absent data is a different fault.
      expect(normalized.envelope.reason_code, String(raw)).toBeNull();
    }
  });
});

describe("D7 measured /activity distribution drives the guard", () => {
  const entries = Object.entries(ACTIVITY_OUTCOME_INDEX_DISTRIBUTION);

  it.each(entries)("%s rows normalize per the recorded distribution", (activityType, dist) => {
    const counts = { known: 0, unknown: 0 };
    for (const [rawIndex, rowCount] of Object.entries(dist)) {
      const normalized = normalizeOutcomeIndex(Number(rawIndex));
      const bucket = normalized.outcome_index === null ? "unknown" : "known";
      counts[bucket] += rowCount as number;
      if (Number(rawIndex) === SENTINEL) {
        expect(normalized.outcome_index, activityType).toBeNull();
        expect(normalized.outcome_index, activityType).not.toBe(0);
        expect(normalized.envelope.reason_code, activityType).toBe("sentinel_unknown");
      } else {
        expect(normalized.outcome_index, activityType).toBe(Number(rawIndex));
        expect(normalized.envelope.metric_status, activityType).toBe("complete");
      }
    }
    const expectedUnknown = dist[SENTINEL] ?? 0;
    expect(counts.unknown).toBe(expectedUnknown);
    expect(counts.known + counts.unknown).toBe(
      Object.values(dist).reduce((sum, n) => sum + (n as number), 0),
    );
  });

  it("holds the sentinel on TRADE, not only on REDEEM/MERGE", () => {
    // One real TRADE row carries 999; an adapter that guards only the
    // REDEEM/MERGE branch will leak a sentinel into priced trade logic.
    expect(ACTIVITY_OUTCOME_INDEX_DISTRIBUTION.TRADE[SENTINEL]).toBe(1);
    expect(ACTIVITY_OUTCOME_INDEX_DISTRIBUTION.REDEEM[SENTINEL]).toBe(5);
    expect(ACTIVITY_OUTCOME_INDEX_DISTRIBUTION.MERGE[SENTINEL]).toBe(17);
  });

  it("has MERGE rows that are entirely unknown", () => {
    const indices = Object.keys(ACTIVITY_OUTCOME_INDEX_DISTRIBUTION.MERGE).map(Number);
    expect(indices).toEqual([SENTINEL]);
    for (const index of indices) {
      expect(normalizeOutcomeIndex(index).downstream_status).toBe("insufficient_evidence");
    }
  });
});

describe("D7 /trades needs the same guard", () => {
  it("observes the sentinel on /trades, so it is not activity-only", () => {
    const total = TRADES_SENTINEL_OBSERVATIONS.reduce((sum, o) => sum + o.sentinels, 0);
    expect(total).toBeGreaterThan(0);
    const withSentinel = TRADES_SENTINEL_OBSERVATIONS.filter((o) => o.sentinels > 0);
    expect(withSentinel.map((o) => o.capture)).toContain("tr-snap2");
  });

  it("normalizes /trades sentinel rows identically to /activity", () => {
    const fromTrades = SENTINEL_ROWS.filter((r) => r.capture.startsWith("tr-"));
    expect(fromTrades.length).toBeGreaterThan(0);
    for (const row of fromTrades) {
      const normalized = normalizeOutcomeIndex(row.outcomeIndex, ["Yes", "No"]);
      expect(normalized.outcome_index, row.capture).toBeNull();
      expect(normalized.outcome_index, row.capture).not.toBe(0);
      expect(normalized.envelope.reason_code, row.capture).toBe("sentinel_unknown");
      expect(economicDirection(normalized, row.side), row.capture).toBeNull();
    }
  });

  it("does not treat a zero-sentinel capture as proof of absence", () => {
    const clean = TRADES_SENTINEL_OBSERVATIONS.filter((o) => o.sentinels === 0);
    const dirty = TRADES_SENTINEL_OBSERVATIONS.filter((o) => o.sentinels > 0);
    expect(clean.length).toBeGreaterThan(0);
    expect(dirty.length).toBeGreaterThan(0);
    const cleanReason: ReasonCode = "pagination_cap";
    expect(isReasonCode(cleanReason)).toBe(true);
  });
});
