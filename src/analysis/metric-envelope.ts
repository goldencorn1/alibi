import {
  AsOfSource,
  DataSourceStatus,
  DataStatus,
  MetricEnvelope,
  MetricStatus,
  RateLimitState,
  ReasonCode,
  SourceProvenance,
  TimeWindowRef,
  requiresNullValue,
} from "@/src/contracts";

/**
 * Bump when the arithmetic behind any metric changes, so a consumer can tell a
 * recomputed value from a differently-computed one.
 */
export const CALCULATION_VERSION = "p2-d8-1";

/** Canonical unit strings. `"ratio"` is 0..1, never a pre-multiplied percent. */
export const UNITS = {
  ratio: "ratio",
  minutes: "minutes",
  days: "days",
  count: "count",
  usdc: "USDC",
  logodds: "log_odds",
  none: "none",
} as const;

export interface ResponseFreshnessHeaders {
  date?: string | null;
  "last-modified"?: string | null;
  age?: string | null;
}

export interface DerivedAsOf {
  as_of: string | null;
  as_of_source: AsOfSource;
}

/**
 * Derive `as_of` from the response itself.
 *
 * The client's completion time is NOT an acceptable source and is not
 * reachable from here by design. Measured against the live endpoints, the same
 * URL fetched seconds apart returned different cache freshness, with `age` as
 * high as 1150s: a local `new Date()` would have claimed ~19 minutes of
 * freshness the payload did not have.
 *
 * When both `date` and `age` are present the origin generation time is
 * `date - age`, which is the conservative (older) reading. Preferring the
 * larger of the two possible answers would overstate freshness, so it is
 * deliberately not done.
 *
 * Returns `{ as_of: null, as_of_source: "unknown" }` when the response carries
 * no usable timestamp. Null here means unknown freshness, not "fresh now".
 */
export function deriveAsOf(
  headers: ResponseFreshnessHeaders | null | undefined,
  payloadTimestamp?: string | null,
): DerivedAsOf {
  if (payloadTimestamp) {
    const parsed = Date.parse(payloadTimestamp);
    if (Number.isFinite(parsed)) {
      return { as_of: new Date(parsed).toISOString(), as_of_source: "payload_field" };
    }
  }
  const dateHeader = headers?.date ?? null;
  const lastModified = headers?.["last-modified"] ?? null;
  const ageHeader = headers?.age ?? null;

  const dateMs = dateHeader ? Date.parse(dateHeader) : Number.NaN;
  if (Number.isFinite(dateMs)) {
    const ageSeconds = ageHeader === null || ageHeader === undefined ? Number.NaN : Number(ageHeader);
    if (Number.isFinite(ageSeconds) && ageSeconds > 0) {
      return {
        as_of: new Date(dateMs - ageSeconds * 1000).toISOString(),
        as_of_source: "age_adjusted",
      };
    }
    return { as_of: new Date(dateMs).toISOString(), as_of_source: "response_date" };
  }

  const lastModifiedMs = lastModified ? Date.parse(lastModified) : Number.NaN;
  if (Number.isFinite(lastModifiedMs)) {
    return { as_of: new Date(lastModifiedMs).toISOString(), as_of_source: "last_modified" };
  }
  return { as_of: null, as_of_source: "unknown" };
}

export function provenanceFromSourceStatus(status: DataSourceStatus[]): SourceProvenance[] {
  return status.map((item) => ({
    source: item.source,
    source_url: item.source_url,
    endpoint: item.source,
    data_status: item.data_status,
    retrieved_at: item.retrieved_at,
    http_status: item.http_status,
    response_hash: null,
  }));
}

export interface EnvelopeInit<T> {
  value?: T | null;
  unit: string;
  metric_status: MetricStatus;
  reason_code?: ReasonCode | null;
  data_status: DataStatus;
  requested_window?: TimeWindowRef | null;
  observed_window?: TimeWindowRef | null;
  as_of?: string | null;
  as_of_source?: AsOfSource;
  sample_size?: number | null;
  eligible_sample_size?: number | null;
  coverage?: number | null;
  source_provenance?: SourceProvenance[];
  calculation_version?: string;
  limitations?: string[];
  retrieved_at?: string | null;
  source_url?: string | null;
  http_status?: number | null;
  response_hash?: string | null;
  /**
   * Defaults to `UNKNOWN`. Not observing a 429 is not evidence that no rate
   * limit exists, so the default must not be an all-clear.
   */
  rate_limit_state?: RateLimitState;
}

/**
 * Build an envelope, enforcing the D8 invariant.
 *
 * A non-null value under `unavailable` / `insufficient_evidence` /
 * `not_enabled` is a contract violation and throws rather than shipping a
 * fabricated number. A missing `reason_code` under those statuses likewise
 * throws: "no value, no explanation" is exactly the state D8 removes.
 */
export function buildEnvelope<T>(init: EnvelopeInit<T>): MetricEnvelope<T> {
  const nullRequired = requiresNullValue(init.metric_status);
  const value = init.value ?? null;
  if (nullRequired && value !== null) {
    throw new Error(
      `MetricEnvelope invariant: metric_status=${init.metric_status} requires value=null, received ${JSON.stringify(value)}.`,
    );
  }
  if (nullRequired && !init.reason_code) {
    throw new Error(`MetricEnvelope invariant: metric_status=${init.metric_status} requires a reason_code.`);
  }
  const provenance = init.source_provenance ?? [];
  return {
    value,
    unit: init.unit,
    requested_window: init.requested_window ?? null,
    observed_window: init.observed_window ?? null,
    as_of: init.as_of ?? null,
    as_of_source: init.as_of_source ?? "unknown",
    sample_size: init.sample_size ?? null,
    eligible_sample_size: init.eligible_sample_size ?? null,
    coverage: init.coverage ?? null,
    data_status: init.data_status,
    metric_status: init.metric_status,
    reason_code: init.reason_code ?? null,
    source_provenance: provenance,
    calculation_version: init.calculation_version ?? CALCULATION_VERSION,
    limitations: init.limitations ?? [],
    retrieved_at: init.retrieved_at ?? provenance[0]?.retrieved_at ?? null,
    source_url: init.source_url ?? provenance[0]?.source_url ?? null,
    http_status: init.http_status ?? provenance[0]?.http_status ?? null,
    response_hash: init.response_hash ?? provenance[0]?.response_hash ?? null,
    rate_limit_state: init.rate_limit_state ?? "UNKNOWN",
  };
}

/** Convenience for the uncomputable case; keeps `value: null` unforgeable. */
export function unavailableEnvelope<T>(
  init: Omit<EnvelopeInit<T>, "value" | "metric_status" | "reason_code"> & { reason_code: ReasonCode },
): MetricEnvelope<T> {
  return buildEnvelope<T>({ ...init, value: null, metric_status: "unavailable" });
}

export interface WindowCompleteness {
  metric_status: Extract<MetricStatus, "complete" | "partial" | "unavailable">;
  reason_code: ReasonCode | null;
  observed_window: TimeWindowRef;
  coverage: number | null;
}

export interface WindowCompletenessInput {
  requested_start_ms: number;
  requested_end_ms: number;
  oldest_observed_ms: number | null;
  newest_observed_ms: number | null;
  /** False when the pager stopped early, e.g. at the measured offset cap. */
  pagination_complete: boolean;
  /** False when de-duplication or snapshot-consistency checks did not pass. */
  integrity_checks_passed?: boolean;
}

/**
 * Window-completeness judgement.
 *
 * `complete` requires BOTH that the observed data reaches back to the
 * requested start AND that pagination/de-duplication/snapshot-consistency
 * checks passed. Anything less is `partial`, and no observations at all is
 * `unavailable`. The requested window is never silently shortened to whatever
 * happened to come back, and coverage is never extrapolated past
 * `newest_observed`.
 */
export function evaluateWindowCompleteness(input: WindowCompletenessInput): WindowCompleteness {
  const { requested_start_ms: start, requested_end_ms: end, oldest_observed_ms: oldest, newest_observed_ms: newest } = input;
  const integrityOk = input.integrity_checks_passed ?? true;
  const observed: TimeWindowRef = {
    start: oldest === null ? null : new Date(oldest).toISOString(),
    end: newest === null ? null : new Date(newest).toISOString(),
  };
  if (oldest === null || newest === null) {
    return { metric_status: "unavailable", reason_code: "incomplete_window", observed_window: observed, coverage: null };
  }
  const requestedSpan = end - start;
  const observedSpan = Math.max(0, Math.min(newest, end) - Math.max(oldest, start));
  const coverage = requestedSpan > 0 ? Math.min(1, observedSpan / requestedSpan) : null;

  if (oldest <= start && integrityOk && input.pagination_complete) {
    return { metric_status: "complete", reason_code: null, observed_window: observed, coverage };
  }
  const reason: ReasonCode = !input.pagination_complete
    ? "pagination_cap"
    : !integrityOk
      ? "timestamp_uncertain"
      : "incomplete_window";
  return { metric_status: "partial", reason_code: reason, observed_window: observed, coverage };
}

/**
 * MEASURED CEILING on `/trades` history, in days.
 *
 * The endpoint returned only ~20.72 days of history and hard-caps `offset` at
 * 10000, so a 90-day request cannot be satisfied. This is an observed property
 * of the upstream API, not a configuration value to raise.
 */
export const OBSERVED_TRADES_HISTORY_DAYS = 20.72;

/** Requested wallet window that the measured history cannot cover. */
export const UNSATISFIABLE_WINDOW_DAYS = 90;

export interface NinetyDayEnvelopeInit {
  unit: string;
  data_status: DataStatus;
  requested_window?: TimeWindowRef | null;
  observed_window?: TimeWindowRef | null;
  sample_size?: number | null;
  eligible_sample_size?: number | null;
  as_of?: string | null;
  as_of_source?: AsOfSource;
  source_provenance?: SourceProvenance[];
  extra_limitations?: string[];
}

/**
 * Any metric scoped to the 90-day window.
 *
 * Always `unavailable` + `incomplete_window` with `value = null`. The three
 * tempting alternatives are all forbidden: extrapolating from ~20.72 days to
 * 90, silently relabelling the window as 20 days, and filling 0.
 */
export function ninetyDayEnvelope<T>(init: NinetyDayEnvelopeInit): MetricEnvelope<T> {
  return unavailableEnvelope<T>({
    unit: init.unit,
    data_status: init.data_status,
    reason_code: "incomplete_window",
    requested_window: init.requested_window ?? null,
    observed_window: init.observed_window ?? null,
    sample_size: init.sample_size ?? null,
    eligible_sample_size: init.eligible_sample_size ?? null,
    as_of: init.as_of ?? null,
    as_of_source: init.as_of_source ?? "unknown",
    source_provenance: init.source_provenance ?? [],
    coverage: null,
    limitations: [
      `请求的 ${UNSATISFIABLE_WINDOW_DAYS} 日窗口无法满足：实测 /trades 仅覆盖约 ${OBSERVED_TRADES_HISTORY_DAYS} 天，offset 硬封顶 10000。`,
      "不外推、不缩短窗口、不填 0；该指标标记为不可计算。",
      ...(init.extra_limitations ?? []),
    ],
  });
}

export interface ExitBehaviourEnvelopeInit {
  unit: string;
  data_status: DataStatus;
  requested_window?: TimeWindowRef | null;
  observed_window?: TimeWindowRef | null;
  sample_size?: number | null;
  as_of?: string | null;
  as_of_source?: AsOfSource;
  source_provenance?: SourceProvenance[];
}

/**
 * Metrics that require observed exit events: `flip_rate` and
 * `median_exposure_minutes`.
 *
 * Always `unavailable` + `exit_events_unavailable`. In 10000 sampled `/trades`
 * rows every single one carried `side=BUY`, so the feed exposes no sell/close
 * leg. Deriving exits from `/trades.side` is therefore forbidden: it would
 * measure the absence of a field rather than the behaviour, and a 0 flip rate
 * would read as "this wallet never flips" — a strong claim from no evidence.
 */
export function exitBehaviourEnvelope<T>(init: ExitBehaviourEnvelopeInit): MetricEnvelope<T> {
  return unavailableEnvelope<T>({
    unit: init.unit,
    data_status: init.data_status,
    reason_code: "exit_events_unavailable",
    requested_window: init.requested_window ?? null,
    observed_window: init.observed_window ?? null,
    sample_size: init.sample_size ?? null,
    eligible_sample_size: 0,
    as_of: init.as_of ?? null,
    as_of_source: init.as_of_source ?? "unknown",
    source_provenance: init.source_provenance ?? [],
    coverage: null,
    limitations: [
      "实测 10000 行 /trades 全部为 side=BUY，未观测到任何退出事件。",
      "禁止用 /trades.side 推导退出行为；缺少卖出腿时不输出 0。",
    ],
  });
}

/** Named accessors so callers cannot accidentally compute these. */
export function flipRateEnvelope(init: Omit<ExitBehaviourEnvelopeInit, "unit">): MetricEnvelope<number> {
  return exitBehaviourEnvelope<number>({ ...init, unit: UNITS.ratio });
}

export function medianExposureMinutesEnvelope(init: Omit<ExitBehaviourEnvelopeInit, "unit">): MetricEnvelope<number> {
  return exitBehaviourEnvelope<number>({ ...init, unit: UNITS.minutes });
}
