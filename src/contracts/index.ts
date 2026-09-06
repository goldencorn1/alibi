export const SCHEMA_VERSION = "1.1.0" as const;

export type DataStatus = "live" | "recorded" | "synthetic" | "cached";
export type InputKind = "market" | "profile" | "wallet";
export type AttributionStatus =
  | "information_consistent"
  | "capital_consistent"
  | "unattributed"
  | "insufficient_evidence";
export type UiState =
  | "idle"
  | "loading"
  | "error"
  | "insufficient"
  | "unattributed"
  | "payment_required"
  | "indeterminate"
  | "success";

export const LOGICAL_AGENT_IDS = [
  "input",
  "market-data",
  "repricing",
  "evidence",
  "attribution",
  "wallet-analysis",
  "policy-verification",
  "report",
  "payment",
] as const;

export type LogicalAgentId = (typeof LOGICAL_AGENT_IDS)[number];
export type AgentEventType = "started" | "completed" | "skipped" | "failed";
export type AgentEventStatus = "pending" | "running" | "ok" | "blocked" | "failed" | "insufficient";
export type AuditReportStatus = "running" | "completed" | "partial" | "failed";
export type WorkerReportStatus = "running" | "ok" | "blocked" | "failed" | "insufficient" | "skipped";
export type PolicyFlag =
  | "coverage_below_gate"
  | "unattributed"
  | "payment_required"
  | "credentials_missing"
  | "not_requested"
  | "no_verified_evidence"
  | "recorded_replay"
  | "synthetic_test"
  | "audit_partial"
  | "rag_degraded"
  | "database_unavailable"
  | "provider_unavailable"
  | "stale_data"
  | "not_enabled"
  | "live_unverified";

export type PlatformAgentId = "evidence" | "attribution" | "quality-risk" | "audit-report";
export const PLATFORM_AGENT_IDS = ["evidence", "attribution", "quality-risk", "audit-report"] as const;

export type PlatformRunStatus = "queued" | "running" | "completed" | "partial" | "failed";
export type AvailabilityStatus = "available" | "unavailable" | "not_enabled" | "recorded";

export interface DEESMetrics {
  wallet: string | null;
  decision_count: number;
  evidence_supported_decisions: number;
  execution_count: number;
  execution_alignment: number | null;
  strategy_score: number | null;
  coverage_rate: number | null;
  status: "eligible" | "insufficient_evidence" | "not_applicable";
  data_status: DataStatus;
}

export interface QualityRiskReport {
  coverage_gate_passed: boolean;
  coverage_rate: number | null;
  evidence_count: number;
  source_count: number;
  risk_flags: string[];
  limitations: string[];
  data_status: DataStatus;
}

export interface FinalStateReport {
  state: "success" | "insufficient_evidence" | "unattributed" | "provider_unavailable" | "database_unavailable" | "payment_required" | "error";
  data_status: DataStatus;
  policy_flags: PolicyFlag[];
  limitations: string[];
}

export interface AgentEvent {
  run_id: string;
  sequence: number;
  agent_id: LogicalAgentId;
  event_type: AgentEventType;
  status: AgentEventStatus;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  data_status: DataStatus;
  input_digest: string;
  output_artifact: string | null;
  source_count: number | null;
  coverage: number | null;
  retry_count: number;
  cost_usd: number | null;
  error_code: ErrorCode | null;
  policy_flags: PolicyFlag[];
}

export interface AgentWorkerReport {
  agent_id: LogicalAgentId;
  status: WorkerReportStatus;
  event_count: number;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  data_status: DataStatus;
  input_digest: string | null;
  output_artifact: string | null;
  source_count: number | null;
  coverage: number | null;
  retry_count: number;
  cost_usd: number | null;
  error_code: ErrorCode | null;
  policy_flags: PolicyFlag[];
}

export interface AuditReport {
  kind: "audit";
  meta: {
    schema_version: typeof SCHEMA_VERSION;
    run_id: string;
    generated_at: string;
    status: AuditReportStatus;
    data_status: DataStatus;
    worker_count: number;
    event_count: number;
    total_duration_ms: number;
    total_cost_usd: number;
    limitations: string[];
    disclaimer: string;
  };
  workers: AgentWorkerReport[];
  events: AgentEvent[];
  exports: {
    json: string;
    markdown: string;
  };
}

export const DISCLAIMER =
  "不构成投资建议；不提供买卖方向；不指控任何主体。时间上的先后关系不等于因果、内幕交易或确定的信息优势。";

export const DEFAULTS = {
  observationWindowMinutes: 60,
  /**
   * @deprecated C15 abolished this linear gate; the engine applies
   * `REPRICING_DELTA_LOGODDS_THRESHOLD` (clipped-logit magnitude) instead.
   * Retained only as the historical Spec constant. Do not use it as a
   * threshold and do not publish it as the effective threshold.
   */
  absoluteChangeThreshold: 0.08,
  walletWindowDays: 90,
  coverageThreshold: 0.4,
} as const;

export interface InputRef {
  kind: InputKind;
  raw: string;
  normalized_id: string;
  source_url: string | null;
}

export interface MarketRecord {
  market_id: string;
  slug: string;
  title: string;
  question: string;
  source_url: string;
  token_ids: string[];
  data_status: DataStatus;
}

export interface PricePoint {
  market_id: string;
  token_id: string;
  timestamp: string;
  price: number;
  source: string;
  fidelity_minutes: number | null;
  data_status: DataStatus;
}

export type TradeSide = "BUY" | "SELL" | "UNKNOWN";
export type MakerTaker = "MAKER" | "TAKER" | "UNKNOWN";
export type TradeSourceType =
  | "DIRECT"
  | "NEG_RISK"
  | "SPLIT"
  | "MERGE"
  | "TRANSFER"
  | "REDEEM"
  | "UNKNOWN";

export interface Trade {
  wallet: string;
  market_id: string;
  token_id: string | null;
  timestamp: string;
  side: TradeSide;
  outcome: string | null;
  price: number | null;
  size: number | null;
  transaction_hash: string | null;
  maker_taker: MakerTaker;
  source_type: TradeSourceType;
  data_status: DataStatus;
}

export type EvidenceTimeRelation = "before" | "during" | "after" | "unknown";

export interface Evidence {
  id: string;
  url: string;
  title: string;
  published_at: string | null;
  retrieved_at: string;
  source_level: string;
  license_or_restriction: string;
  data_status: DataStatus;
  time_relation: EvidenceTimeRelation;
  excerpt?: string;
}

export type ClusterDimensionState = "pass" | "fail" | "unknown";
export type ClusterAlertState = "formal_alert" | "cluster_observation" | "restricted" | "insufficient_baseline";
export type ClusterSourceState = "found" | "not_found" | "unknown";
export type EvidenceQuality = "high" | "medium" | "low";

export interface ClusterDimensionResult {
  id: "D1" | "D2" | "D3" | "D4" | "D5" | "D6";
  state: ClusterDimensionState;
  value: number | null;
  threshold: string;
  reason: string;
  coverage: number | null;
  known_count: number;
  member_count: number;
}

export interface ClusterAlert {
  alert_id: string;
  alert_type: "cluster_without_verified_source";
  created_at: string;
  evidence_cutoff_at: string;
  revision: number;
  supersedes_revision: number | null;
  condition_id: string;
  cluster_size: number;
  addresses: string[];
  dominant_outcome: string | null;
  cluster_span_minutes: number | null;
  baseline_p99_usdc: string | null;
  baseline_sample_count: number;
  baseline_algorithm_version: string;
  dimensions: ClusterDimensionResult[];
  dimensions_evaluable: number;
  dimensions_passed: number;
  herding_like_pattern: boolean | "unknown";
  source_state: ClusterSourceState;
  state: ClusterAlertState;
  evidence_quality: EvidenceQuality;
  data_status: DataStatus;
  limitations: string[];
}

export type LanguageCode = "en" | "zh-Hant" | "zh-Hans" | "other";
export type SourceTier = "primary" | "direct_media" | "aggregator";
export type TimestampType = "published" | "filed" | "first_seen" | "date_only";
export type TimestampPrecision = "subsecond" | "second" | "minute" | "date" | "unknown";
export type LanguageGap = "gap_open" | "gap_closed" | "gap_unknown";
export type ReleaseOrder = "local_first" | "english_first" | "simultaneous" | "indeterminate" | "unknown";
export type ProviderPriority = "P0" | "P1" | "optional";
export type ProviderState = "validated" | "documented" | "unavailable" | "unknown";
export type ObservationRole = "verified_source" | "discovery_only" | "coverage_observation";

export interface TimestampCalibration {
  cohort: string;
  sample_count: number;
  absolute_error_p95_seconds: number | null;
  median_absolute_error_seconds?: number | null;
  algorithm_version: string;
  sample_hash: string | null;
}

export interface SourceObservation {
  observation_id: string;
  provider: string;
  provider_priority: ProviderPriority;
  provider_state: ProviderState;
  observation_role: ObservationRole;
  raw_timestamp: string | null;
  utc_timestamp: string | null;
  timestamp_source_field: string | null;
  requested_start?: string | null;
  requested_end?: string | null;
  actual_coverage_start?: string | null;
  actual_coverage_end?: string | null;
  pagination_complete?: boolean;
  page_count?: number;
  next_cursor?: string | null;
  calibration?: TimestampCalibration | null;
  source_state?: ClusterSourceState;
  evidence_cutoff_at?: string | null;
  revision?: number;
  supersedes_revision?: number | null;
  data_status: DataStatus;
  limitations?: string[];
}
export type WalletLanguageRelation =
  | "pre_verified_public_source_entry"
  | "within_documented_language_window"
  | "post_english_publication_entry"
  | "indeterminate";

export interface LanguageSource {
  observation_id?: string;
  provider?: string;
  provider_priority?: ProviderPriority;
  provider_state?: ProviderState;
  observation_role?: ObservationRole;
  url: string;
  publisher: string;
  title: string;
  language: LanguageCode;
  source_tier: SourceTier;
  official_release_id: string | null;
  official_cross_link?: string | null;
  normalized_topic?: string | null;
  published_date?: string | null;
  original_or_translation: "original" | "translation" | "unknown";
  published_at: string | null;
  first_seen_at: string | null;
  raw_timestamp?: string | null;
  utc_timestamp?: string | null;
  timestamp_source_field?: string | null;
  retrieved_at: string;
  timestamp_type: TimestampType;
  timestamp_precision: TimestampPrecision;
  /**
   * C13: half-width of the timestamp uncertainty interval, in MINUTES.
   *
   * Renamed from `timestamp_uncertainty_seconds`. The previous name declared
   * seconds while callers and the release-order arithmetic disagreed about the
   * unit, so a value of 60 could mean either one minute or one hour: a silent
   * 60x error. The `_minutes` suffix is load-bearing; any arithmetic converting
   * this to milliseconds must multiply by 60_000, never 1_000.
   *
   * Calibrated magnitudes: SEC EDGAR acceptance ~0.1, vertical/primary
   * publishers ~1, aggregators such as GDELT ~15, date-only rows 720 (12h).
   * `null` means the uncertainty is unknown, which is not the same as zero.
   * 0 asserts a perfectly certain timestamp and no real source warrants it.
   */
  source_timestamp_uncertainty_minutes: number | null;
  content_hash: string;
  connector_status: "healthy" | "unavailable" | "unknown";
  requested_start?: string | null;
  requested_end?: string | null;
  actual_coverage_start?: string | null;
  actual_coverage_end?: string | null;
  pagination_complete?: boolean;
  page_count?: number;
  calibration?: TimestampCalibration | null;
  evidence_cutoff_at?: string | null;
  revision?: number;
  supersedes_revision?: number | null;
  limitations?: string[];
}

export interface LanguageWindow {
  window_id: string;
  alert_id: string | null;
  local_source: LanguageSource | null;
  english_source: LanguageSource | null;
  pairing: "verified" | "pairing_unverified";
  source_state: ClusterSourceState;
  evidence_cutoff_at: string;
  gap: LanguageGap;
  release_order: ReleaseOrder;
  wallet_relations: Array<{ address: string; relation: WalletLanguageRelation }>;
  evidence_quality: EvidenceQuality;
  data_status: DataStatus;
  limitations: string[];
  revision?: number;
  supersedes_revision?: number | null;
}

export interface SourceCoverage {
  required_connectors: string[];
  healthy_connectors: string[];
  unavailable_connectors: string[];
  coverage_ratio: number | null;
  coverage_complete: boolean;
  timestamp_precision: TimestampPrecision;
  retrieved_at?: string | null;
  /** C13: MINUTES, not seconds. See `LanguageSource`. */
  source_timestamp_uncertainty_minutes?: number | null;
  source_state: ClusterSourceState;
  unknown_reasons: string[];
  requested_start?: string | null;
  requested_end?: string | null;
  actual_coverage_start?: string | null;
  actual_coverage_end?: string | null;
  pagination_complete?: boolean;
  page_count?: number;
  next_cursor?: string | null;
  provider_states?: Record<string, ProviderState>;
  calibrations?: TimestampCalibration[];
  observations?: SourceObservation[];
}

export interface RepricingWindow {
  id: string;
  market_id: string;
  token_id: string;
  start_at: string;
  end_at: string;
  start_price: number;
  end_price: number;
  /**
   * Linear |p_j - p_i|. Retained for backward compatibility and display only.
   * C15: this scale compresses tail moves ~5x and is no longer the detection
   * gate. Use `repricing_delta_logodds` for magnitude comparisons.
   */
  absolute_change: number;
  /**
   * C15: clipped-logit (log-odds) difference, the authoritative repricing
   * magnitude. Null when either endpoint price cannot be parsed.
   */
  repricing_delta_logodds?: number | null;
  direction: "UP" | "DOWN";
  /** Log-odds scale gate; see REPRICING_DELTA_LOGODDS_THRESHOLD. */
  threshold: number;
  observation_window_minutes: 60;
  sample_fidelity_minutes: number | null;
  merged_window_ids: string[];
  attribution_status: AttributionStatus;
  evidence_ids: string[];
  confidence: number | null;
  data_status: DataStatus;
  limitation: string;
}

export interface WalletTradeAlignment {
  trade: Trade;
  window_id: string | null;
  time_relation: "before" | "during" | "after" | "unmatched";
  estimated_directional_return: number | null;
  included_in_coverage: boolean;
  exclusion_reason: string | null;
}

export interface WalletMetrics {
  wallet: string;
  analysis_start: string;
  analysis_end: string;
  observed_trades: number;
  aligned_trades: number;
  /**
   * C6: nullable. With zero observed trades the rate is undefined, and the
   * previous `observed.length === 0 ? 0 : ...` collapsed "no samples" into the
   * same value as "measured 0% alignment" - the strongest possible negative
   * claim, fabricated from no evidence.
   *
   * `null` means not computable and MUST be accompanied by
   * `coverage_rate_status = "unavailable"` and a `coverage_rate_reason_code`.
   * Never substitute 0 for an absent rate, and never treat `null` as passing
   * the coverage gate.
   */
  coverage_rate: number | null;
  /** C6: required companion to `coverage_rate`. */
  coverage_rate_status: MetricStatus;
  /** C6: why the rate is unavailable; `null` only when status is `complete`. */
  coverage_rate_reason_code: ReasonCode | null;
  attributable_profitable_trades: number;
  early_profitable_trades: number;
  information_lead_rate: number | null;
  status: "information_pattern" | "judgment_pattern" | "insufficient_evidence";
  estimated_return_note: string;
  alignments: WalletTradeAlignment[];
  limitations: string[];
  data_status: DataStatus;
  /** D8: per-metric envelopes carrying computability, window and provenance. */
  metric_envelopes: WalletMetricEnvelopes;
}

/**
 * D8 envelopes for the wallet surface.
 *
 * `flip_rate` and `median_exposure_minutes` are typed as envelopes and never as
 * bare numbers, because there is no measurement behind them: the `/trades` feed
 * exposes no exit leg. Keeping them envelope-only makes "we did not observe
 * this" the sole representable answer, so no caller can read a 0.
 */
export interface WalletMetricEnvelopes {
  coverage_rate: MetricEnvelope<number>;
  information_lead_rate: MetricEnvelope<number>;
  /** Always unavailable: requested 90d exceeds measured ~20.72d of history. */
  ninety_day_trade_count: MetricEnvelope<number>;
  /** Always unavailable: no exit events observed. Never 0. */
  flip_rate: MetricEnvelope<number>;
  /** Always unavailable: no exit events observed. Never 0. */
  median_exposure_minutes: MetricEnvelope<number>;
}

export interface DataSourceStatus {
  source: string;
  source_url: string;
  data_status: DataStatus;
  retrieved_at: string;
  http_status: number | null;
  attempts: number;
  retryable: boolean;
  error_code?: string;
}

export type ErrorCode =
  | "invalid_input"
  | "not_found"
  | "upstream_unavailable"
  | "rate_limited"
  | "partial_data"
  | "insufficient_evidence"
  | "unattributed"
  | "payment_required"
  | "payment_invalid"
  | "provider_unavailable"
  | "budget_exceeded"
  | "timeout"
  | "invalid_output"
  | "database_unavailable"
  | "embedding_unavailable"
  | "contract_unavailable"
  | "mcp_unavailable"
  | "stale_data";

/**
 * The only legal reason codes. A metric that cannot be computed must report
 * `value = null` together with a `metric_status` and one of these codes.
 * Filling an uncomputable metric with 0 is forbidden: it collapses
 * "zero samples" and "genuinely zero" into the same value.
 */
export const REASON_CODES = [
  "incomplete_window",
  "pagination_cap",
  "exit_events_unavailable",
  "profile_endpoint_unverified",
  "provider_unavailable",
  "coverage_below_gate",
  "sentinel_unknown",
  "timestamp_uncertain",
] as const;

export type ReasonCode = (typeof REASON_CODES)[number];

/**
 * D8 — `metric_status` answers exactly one question: is this metric computable
 * from what we actually observed? It says NOTHING about where the bytes came
 * from. That is `data_status`'s only job. The two axes are independent and
 * MUST NOT be conflated:
 *
 *   - `recorded` is NOT "uncomputable". A recorded fixture can yield a
 *     perfectly `complete` metric.
 *   - `unavailable` is NOT "the data source was fake". A `live` source that
 *     only covers 20 of a requested 90 days is `live` + `unavailable`.
 *
 * Every pair in the 4x4 grid is legal. Any code that derives one from the
 * other is a bug.
 *
 * Values:
 *   - `complete`              fully covered requested window, all integrity
 *                             checks passed; the value stands on its own.
 *   - `partial`               computed, but over less than the requested
 *                             window or sample. Value is present and MUST be
 *                             read together with `observed_window`/`coverage`.
 *   - `unavailable`           not computable. `value` MUST be null.
 *   - `insufficient_evidence` samples exist but fall below the evidentiary
 *                             gate, so publishing a number would overstate
 *                             what we know. `value` MUST be null.
 *   - `not_enabled`           retained (not part of the D8 four) for features
 *                             that are switched off rather than unmeasurable,
 *                             e.g. the subscription surface. "Off" is not the
 *                             same claim as "we tried and could not compute
 *                             it", so it is not folded into `unavailable`.
 */
export const METRIC_STATUSES = [
  "complete",
  "partial",
  "unavailable",
  "insufficient_evidence",
  "not_enabled",
] as const;

export type MetricStatus = (typeof METRIC_STATUSES)[number];

/** Statuses whose contract requires `value === null`. */
export const NULL_VALUE_METRIC_STATUSES = ["unavailable", "insufficient_evidence", "not_enabled"] as const;

export interface TimeWindowRef {
  start: string | null;
  end: string | null;
}

/**
 * How `as_of` was obtained. `client_clock` is deliberately absent: the local
 * completion time is never an acceptable freshness claim. See `deriveAsOf`.
 */
export type AsOfSource = "response_date" | "last_modified" | "age_adjusted" | "payload_field" | "unknown";

export interface SourceProvenance {
  source: string;
  source_url: string | null;
  endpoint: string | null;
  data_status: DataStatus;
  retrieved_at: string | null;
  http_status: number | null;
  response_hash: string | null;
}

/**
 * Rate-limit observability. `UNKNOWN` is the honest default: not having seen a
 * 429 is not evidence that no limit exists, only that we did not hit it.
 */
export type RateLimitState = "UNKNOWN" | "OBSERVED_LIMITED";

/**
 * D8 metric envelope. Every published metric travels with its own
 * computability verdict, the window it actually covers, and enough
 * provenance to re-fetch and re-verify it.
 *
 * Invariant: when `metric_status` is one of `NULL_VALUE_METRIC_STATUSES`,
 * `value` MUST be null and `reason_code` MUST be set. Filling an uncomputable
 * metric with 0 is forbidden — see `REASON_CODES`.
 */
export interface MetricEnvelope<T> {
  value: T | null;
  unit: string;
  requested_window: TimeWindowRef | null;
  observed_window: TimeWindowRef | null;
  /** Server-derived freshness. Never the client's completion time. */
  as_of: string | null;
  as_of_source: AsOfSource;
  sample_size: number | null;
  eligible_sample_size: number | null;
  coverage: number | null;
  /** Data-origin mode ONLY. Not a computability signal. */
  data_status: DataStatus;
  /** Computability ONLY. Not a data-origin signal. */
  metric_status: MetricStatus;
  reason_code: ReasonCode | null;
  source_provenance: SourceProvenance[];
  calculation_version: string;
  limitations: string[];
  retrieved_at: string | null;
  source_url: string | null;
  http_status: number | null;
  response_hash: string | null;
  rate_limit_state: RateLimitState;
}

export function isReasonCode(value: unknown): value is ReasonCode {
  return typeof value === "string" && (REASON_CODES as readonly string[]).includes(value);
}

export function isMetricStatus(value: unknown): value is MetricStatus {
  return typeof value === "string" && (METRIC_STATUSES as readonly string[]).includes(value);
}

/** True when the status contract forbids a non-null value. */
export function requiresNullValue(status: MetricStatus): boolean {
  return (NULL_VALUE_METRIC_STATUSES as readonly string[]).includes(status);
}

export interface ApiErrorEnvelope {
  error: {
    code: ErrorCode;
    message: string;
    retryable: boolean;
    data_status: DataStatus;
    retrieved_at: string;
    details?: Record<string, unknown>;
  };
}

export interface ReportMeta {
  schema_version: typeof SCHEMA_VERSION;
  input: InputRef;
  data_status: DataStatus;
  analyzed_at: string;
  analysis_window: {
    observation_minutes: 60;
    /**
     * C20: previously the literal type `90`, which asserted a 90-day wallet
     * window as a compile-time fact. Measured `/trades` coverage reaches only
     * ~20.72 days, so the window is variable and must be reported as measured.
     * Never silently shorten the requested window and never extrapolate: when
     * the requested window is not fully covered, report the 90-day metric as
     * `wallet_days_status = "unavailable"` with
     * `wallet_days_reason_code = "incomplete_window"` and a null metric value.
     */
    wallet_days: number;
    wallet_days_requested?: number;
    wallet_days_status?: MetricStatus;
    wallet_days_reason_code?: ReasonCode | null;
    /**
     * Widened from the literal `0.08`; see C15 recalibration in
     * engine/repricing.ts. This is a clipped-logit (log-odds) magnitude, NOT a
     * linear probability delta. The abolished linear 0.08 gate is not
     * comparable to it: log-odds are unbounded while |p_j - p_i| <= 1.
     */
    threshold: number;
    coverage_threshold: 0.4;
  };
  coverage_rate: number | null;
  limitations: string[];
  disclaimer: string;
  source_status: DataSourceStatus[];
  evidence_cutoff_at?: string;
  source_coverage?: SourceCoverage;
  run_id?: string;
}

export interface SummaryReport {
  kind: "summary";
  meta: ReportMeta;
  title: string;
  headline: string;
  market_count: number;
  repricing_count: number;
  unattributed_count: number;
  recent_windows: Array<Pick<RepricingWindow, "id" | "start_at" | "end_at" | "absolute_change" | "direction" | "attribution_status" | "data_status">>;
  /** C6: `coverage_rate` may be null, so its status fields travel with it. */
  wallet_metrics: Pick<WalletMetrics, "wallet" | "coverage_rate" | "coverage_rate_status" | "coverage_rate_reason_code" | "information_lead_rate" | "status" | "data_status"> | null;
  cluster_alerts?: ClusterAlert[];
  language_windows?: LanguageWindow[];
  source_coverage?: SourceCoverage;
  evidence_cutoff_at?: string;
  detail_requires_payment: {
    price: "0.01 USDC";
    network: "eip155:84532";
  };
}

export interface DetailReport {
  kind: "detail";
  meta: ReportMeta;
  title: string;
  windows: RepricingWindow[];
  evidence: Evidence[];
  wallet_metrics: WalletMetrics | null;
  cluster_alerts?: ClusterAlert[];
  language_windows?: LanguageWindow[];
  source_coverage?: SourceCoverage;
  evidence_cutoff_at?: string;
  exclusions: string[];
  paid_access: {
    scheme: "exact";
    network: "eip155:84532";
    price: "0.01 USDC";
    access?: "paid" | "free_unattributed";
  };
}

export interface AnalysisBundle {
  input: InputRef;
  markets: MarketRecord[];
  prices: PricePoint[];
  windows: RepricingWindow[];
  evidence: Evidence[];
  trades: Trade[];
  wallet_metrics: WalletMetrics | null;
  source_status: DataSourceStatus[];
  data_status: DataStatus;
  limitations: string[];
  cluster_alerts?: ClusterAlert[];
  language_windows?: LanguageWindow[];
  source_coverage?: SourceCoverage;
  evidence_cutoff_at?: string;
  run_id?: string;
}

export interface PresetDemo {
  id: string;
  label: string;
  description: string;
  input: string;
  kind: InputKind;
  mode: "recorded" | "live";
}

export function isDataStatus(value: unknown): value is DataStatus {
  return value === "live" || value === "recorded" || value === "synthetic" || value === "cached";
}

export function isWalletAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function clampConfidence(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return Math.min(1, Math.max(0, value));
}

export function mergeDataStatuses(statuses: DataStatus[]): DataStatus {
  if (statuses.length === 0) return "synthetic";
  if (statuses.includes("live")) return "live";
  if (statuses.includes("cached")) return "cached";
  if (statuses.includes("recorded")) return "recorded";
  return "synthetic";
}

export function jsonResponse<T>(payload: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  dataStatus: DataStatus,
  retryable: boolean,
  status: number,
  details?: Record<string, unknown>,
): Response {
  return jsonResponse<ApiErrorEnvelope>(
    {
      error: {
        code,
        message,
        retryable,
        data_status: dataStatus,
        retrieved_at: new Date().toISOString(),
        ...(details ? { details } : {}),
      },
    },
    { status },
  );
}
