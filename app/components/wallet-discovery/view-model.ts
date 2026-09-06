import {
  MetricEnvelope,
  MetricStatus,
  ReasonCode,
  requiresNullValue,
} from "@/src/contracts";
import { UNITS, buildEnvelope, unavailableEnvelope } from "@/src/analysis/metric-envelope";
import {
  ATTRIBUTION_FIXTURE_WALLETS,
  DETAIL_WALLET,
  DETAIL_WALLET_METRICS,
  LeaderboardServiceRow,
  LeaderboardView,
  WalletOutcomeMetrics,
  getDetailWallets,
  getRecordedLeaderboard,
} from "@/src/wallet-discovery";
import type { TermId } from "@/src/ui/glossary";

/**
 * Presentation logic for the Wallet Discovery surfaces.
 *
 * Kept as plain TypeScript (no JSX) for two reasons: the vitest config only
 * collects `tests/**\/*.test.ts`, so the honesty invariants below are only
 * testable if they live outside a `.tsx` component; and the routes and the
 * pages then share one formatter instead of each inventing its own.
 *
 * The rules encoded here are the ones that must not drift:
 *   - a null value renders as an em dash, never as `0`;
 *   - a null coverage renders as `n/a`, never as `0%`;
 *   - a lead rate under the coverage gate is forced back to null;
 *   - the Fit group is unavailable by construction, not by data.
 */

/** Evidentiary gate for lead-rate style metrics. Mirrors `DEFAULTS.coverageThreshold`. */
export const COVERAGE_GATE = 0.4;

/** Rendered for every null value. Never `0`, never an empty cell. */
export const MISSING_TEXT = "—";

/** Rendered when a ratio is not observed at all, to keep it distinct from `0%`. */
export const NOT_APPLICABLE_TEXT = "n/a";

export type AnyEnvelope = MetricEnvelope<unknown>;

/**
 * How to render a value. Deliberately explicit per field rather than derived
 * from `unit`: `avg_buy_price` and `win_rate` are both `ratio`, but one is a
 * 0..1 market price and the other a percentage, and formatting one as the other
 * would misstate it.
 */
export type MetricDisplay =
  | "usdc"
  | "percent"
  | "price"
  | "minutes"
  | "days"
  | "count"
  | "timestamp"
  | "record"
  | "boolean"
  | "list";

export const STATUS_LABELS: Record<MetricStatus, string> = {
  complete: "Complete",
  partial: "Partial",
  unavailable: "Unavailable",
  insufficient_evidence: "Insufficient evidence",
  not_enabled: "Not enabled",
};

export function statusLabel(status: MetricStatus): string {
  return STATUS_LABELS[status];
}

function formatNumber(value: number, fractionDigits: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/**
 * Format a ratio as a percentage.
 *
 * Returns `n/a` for null instead of `0%`: "we did not observe this" and
 * "we observed zero" are different claims and must not share a rendering.
 */
export function formatRatioAsPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return NOT_APPLICABLE_TEXT;
  return `${formatNumber(value * 100, 1)}%`;
}

/**
 * Render an envelope's value.
 *
 * A null value always yields `MISSING_TEXT`. There is no code path that
 * substitutes a default, a zero, or a neighbouring row's value.
 */
export function formatEnvelopeValue(envelope: AnyEnvelope, display: MetricDisplay): string {
  const value = envelope.value;
  if (value === null || value === undefined) return MISSING_TEXT;
  switch (display) {
    case "usdc":
      return typeof value === "number" ? `${formatNumber(value, 2)} USDC` : MISSING_TEXT;
    case "percent":
      return typeof value === "number" ? formatRatioAsPercent(value) : MISSING_TEXT;
    case "price":
      return typeof value === "number" ? formatNumber(value, 4) : MISSING_TEXT;
    case "minutes":
      return typeof value === "number" ? `${formatNumber(value, 1)} min` : MISSING_TEXT;
    case "days":
      return typeof value === "number" ? `${formatNumber(value, 1)} d` : MISSING_TEXT;
    case "count":
      return typeof value === "number" ? formatNumber(value, 0) : MISSING_TEXT;
    case "timestamp":
      return typeof value === "string" ? value : MISSING_TEXT;
    case "boolean":
      return typeof value === "boolean" ? (value ? "true" : "false") : MISSING_TEXT;
    case "list":
      return Array.isArray(value) && value.length > 0 ? value.join(", ") : MISSING_TEXT;
    case "record":
      return typeof value === "object" ? JSON.stringify(value) : MISSING_TEXT;
    default:
      return MISSING_TEXT;
  }
}

export interface RenderedMetric {
  /** The value, or `MISSING_TEXT`. */
  text: string;
  /** True when nothing was published, so the UI can mark it rather than pad it. */
  is_missing: boolean;
  status: MetricStatus;
  status_text: string;
  reason_code: ReasonCode | null;
  unit: string;
  sample_size_text: string;
  coverage_text: string;
  window_text: string;
  as_of_text: string;
  limitations: string[];
  /** One-line summary for a `title` attribute. Not the only place it appears. */
  title: string;
}

function windowText(envelope: AnyEnvelope): string {
  const requested = envelope.requested_window;
  const observed = envelope.observed_window;
  const fmt = (start: string | null, end: string | null) =>
    start === null && end === null ? NOT_APPLICABLE_TEXT : `${start ?? "?"} → ${end ?? "?"}`;
  const requestedText = requested ? fmt(requested.start, requested.end) : NOT_APPLICABLE_TEXT;
  const observedText = observed ? fmt(observed.start, observed.end) : NOT_APPLICABLE_TEXT;
  return `requested ${requestedText} · observed ${observedText}`;
}

/** Build everything the UI needs from one envelope, with no value invented. */
export function renderMetric(envelope: AnyEnvelope, display: MetricDisplay): RenderedMetric {
  const text = formatEnvelopeValue(envelope, display);
  const is_missing = text === MISSING_TEXT;
  const sample_size_text = envelope.sample_size === null ? NOT_APPLICABLE_TEXT : formatNumber(envelope.sample_size, 0);
  const coverage_text = formatRatioAsPercent(envelope.coverage);
  const as_of_text = envelope.as_of ?? "unknown";
  const status_text = statusLabel(envelope.metric_status);
  const title = [
    `${status_text}${envelope.reason_code ? ` (${envelope.reason_code})` : ""}`,
    `unit=${envelope.unit}`,
    `sample=${sample_size_text}`,
    `coverage=${coverage_text}`,
    `as_of=${as_of_text} (${envelope.as_of_source})`,
    ...envelope.limitations,
  ].join(" | ");
  return {
    text,
    is_missing,
    status: envelope.metric_status,
    status_text,
    reason_code: envelope.reason_code,
    unit: envelope.unit,
    sample_size_text,
    coverage_text,
    window_text: windowText(envelope),
    as_of_text,
    limitations: envelope.limitations,
    title,
  };
}

/**
 * Enforce the coverage gate on a lead-rate style metric.
 *
 * A published rate whose coverage sits under the gate would state more than the
 * sample supports, so the value is dropped and the envelope is rebuilt through
 * `buildEnvelope` — which enforces the null-value invariant — rather than being
 * mutated in place. Envelopes that are already null pass through untouched so
 * their original, more specific reason code survives.
 */
export function enforceCoverageGate<T>(envelope: MetricEnvelope<T>, gate = COVERAGE_GATE): MetricEnvelope<T> {
  if (envelope.value === null) return envelope;
  if (envelope.coverage === null || envelope.coverage >= gate) return envelope;
  return buildEnvelope<T>({
    value: null,
    unit: envelope.unit,
    metric_status: "insufficient_evidence",
    reason_code: "coverage_below_gate",
    data_status: envelope.data_status,
    requested_window: envelope.requested_window,
    observed_window: envelope.observed_window,
    as_of: envelope.as_of,
    as_of_source: envelope.as_of_source,
    sample_size: envelope.sample_size,
    eligible_sample_size: envelope.eligible_sample_size,
    coverage: envelope.coverage,
    source_provenance: envelope.source_provenance,
    calculation_version: envelope.calculation_version,
    limitations: [
      ...envelope.limitations,
      `coverage=${formatRatioAsPercent(envelope.coverage)} 低于门槛 ${formatRatioAsPercent(gate)}，不发布该比率。`,
      "该值被置为 null 是覆盖率门槛的结果，不表示比率为 0。",
    ],
  });
}

export type LeaderboardMetricKey =
  | "realized_pnl_7d"
  | "win_rate_7d"
  | "avg_buy_price_7d"
  | "flip_rate_7d"
  | "median_exposure_minutes_7d"
  | "last_trade_at"
  | "information_lead_rate_7d"
  | "coverage_7d";

export interface LeaderboardColumn {
  key: LeaderboardMetricKey;
  header: string;
  display: MetricDisplay;
  termId: TermId;
}

/** The metric columns, in table order. Header text carries the window. */
export const LEADERBOARD_COLUMNS: readonly LeaderboardColumn[] = [
  { key: "realized_pnl_7d", header: "7D Realized PnL", display: "usdc", termId: "realized_pnl_7d" },
  { key: "win_rate_7d", header: "Win Rate (7D)", display: "percent", termId: "win_rate" },
  { key: "avg_buy_price_7d", header: "Avg Buy Price (7D)", display: "price", termId: "avg_buy_price" },
  { key: "flip_rate_7d", header: "Flip Rate (7D)", display: "percent", termId: "flip_rate" },
  {
    key: "median_exposure_minutes_7d",
    header: "Median Exposure (7D)",
    display: "minutes",
    termId: "median_exposure_minutes",
  },
  { key: "last_trade_at", header: "Last Trade", display: "timestamp", termId: "last_trade_at" },
  { key: "information_lead_rate_7d", header: "Lead Rate (7D)", display: "percent", termId: "lead_rate" },
  { key: "coverage_7d", header: "Coverage (7D)", display: "percent", termId: "coverage" },
];

/** Metrics whose publication is gated on coverage. */
const COVERAGE_GATED_KEYS: readonly LeaderboardMetricKey[] = ["information_lead_rate_7d"];

export function leaderboardEnvelope(row: LeaderboardServiceRow, key: LeaderboardMetricKey): AnyEnvelope {
  const envelope = row[key] as MetricEnvelope<unknown>;
  return COVERAGE_GATED_KEYS.includes(key) ? enforceCoverageGate(envelope) : envelope;
}

export interface LeaderboardRowViewModel {
  rank: number;
  rank_raw: string;
  wallet: string;
  /** Upstream display name, or null when upstream sent an empty string. */
  user_name: string | null;
  verified_badge: boolean;
  /** Upstream self-reported 30d volume. Not an Alibi-derived metric. */
  source_vol_30d: number;
  source_vol_text: string;
  /** Upstream self-reported 30d PnL. Not a 7-day realized figure. */
  source_pnl_30d: number;
  source_pnl_text: string;
  detail_captured: boolean;
  /** Null for every row without captured detail, so no dead link is rendered. */
  detail_href: string | null;
  data_status: "recorded";
  metrics: Record<LeaderboardMetricKey, RenderedMetric>;
}

function renderRow(row: LeaderboardServiceRow): LeaderboardRowViewModel {
  const metrics = {} as Record<LeaderboardMetricKey, RenderedMetric>;
  for (const column of LEADERBOARD_COLUMNS) {
    metrics[column.key] = renderMetric(leaderboardEnvelope(row, column.key), column.display);
  }
  return {
    rank: row.rank,
    rank_raw: row.rank_raw,
    wallet: row.wallet,
    user_name: row.user_name,
    verified_badge: row.verified_badge,
    source_vol_30d: row.vol,
    source_vol_text: `${formatNumber(row.vol, 2)} USDC`,
    source_pnl_30d: row.pnl,
    source_pnl_text: `${formatNumber(row.pnl, 2)} USDC`,
    detail_captured: row.detail_captured,
    detail_href: row.detail_captured ? walletDetailHref(row.wallet) : null,
    data_status: row.data_status,
    metrics,
  };
}

export function walletDetailHref(wallet: string): string {
  return `/wallet-discovery/${wallet.toLowerCase()}`;
}

export interface AttributionFixtureEntry {
  wallet: string;
  /** Always null: measured absent from the recorded top-50 response. */
  rank: null;
  detail_href: string;
  fixture: string;
  note: string;
}

export interface LeaderboardViewModel {
  window: "30d";
  data_status: "recorded";
  as_of: string | null;
  as_of_text: string;
  as_of_source: string;
  source_url: string;
  rows_available_in_response: number;
  rows_returned: number;
  detail_captured_count: number;
  uncaptured_count: number;
  rows: LeaderboardRowViewModel[];
  /**
   * Wallets that support a detail view but are NOT ranked here. Kept in a
   * separate list so they cannot be read as leaderboard entries.
   */
  attribution_fixture_wallets: AttributionFixtureEntry[];
  limitations: string[];
}

export function buildLeaderboardViewModel(): LeaderboardViewModel {
  const view: LeaderboardView = getRecordedLeaderboard();
  const rows = view.rows.map(renderRow);
  const attribution = getDetailWallets()
    .filter((entry) => entry.rank === null)
    .map((entry) => ({
      wallet: entry.wallet,
      rank: null as null,
      detail_href: walletDetailHref(entry.wallet),
      fixture: entry.fixture,
      note: entry.note,
    }));
  return {
    window: view.window,
    data_status: view.data_status,
    as_of: view.as_of,
    as_of_text: view.as_of ?? "unknown",
    as_of_source: view.as_of_source,
    source_url: view.source_url,
    rows_available_in_response: view.rows_available_in_response,
    rows_returned: rows.length,
    detail_captured_count: view.detail_captured_count,
    uncaptured_count: rows.filter((row) => !row.detail_captured).length,
    rows,
    attribution_fixture_wallets: attribution,
    limitations: view.limitations,
  };
}

/* ------------------------------------------------------------------ *
 * Wallet detail
 * ------------------------------------------------------------------ */

export type OutcomeMetricKey = keyof Omit<WalletOutcomeMetrics, "wallet" | "data_status" | "as_of">;

export interface OutcomeField {
  key: OutcomeMetricKey;
  label: string;
  display: MetricDisplay;
  /** Omitted where no approved glossary term exists; no term is repurposed. */
  termId?: TermId;
}

export const OUTCOME_FIELDS: readonly OutcomeField[] = [
  { key: "realized_pnl_7d", label: "Realized PnL (7D)", display: "usdc", termId: "realized_pnl_7d" },
  { key: "win_rate_7d", label: "Win Rate (7D)", display: "percent", termId: "win_rate" },
  { key: "avg_buy_price_7d", label: "Avg Buy Price (7D)", display: "price", termId: "avg_buy_price" },
  { key: "total_trades_7d", label: "Observed Trades (7D)", display: "count", termId: "observed_trades" },
  { key: "active_markets_7d", label: "Active Markets (7D)", display: "count", termId: "active_markets" },
  { key: "last_trade_at", label: "Last Trade At", display: "timestamp", termId: "last_trade_at" },
  { key: "flip_rate_7d", label: "Flip Rate (7D)", display: "percent", termId: "flip_rate" },
  {
    key: "median_exposure_minutes_7d",
    label: "Median Exposure (7D)",
    display: "minutes",
    termId: "median_exposure_minutes",
  },
  { key: "profile_age_days", label: "Profile Age", display: "days", termId: "profile_age_days" },
  { key: "first_deposit_at", label: "First Deposit At", display: "timestamp", termId: "first_deposit_at" },
  { key: "rebate_income_7d", label: "Rebate Income (7D)", display: "usdc", termId: "rebate_income" },
  { key: "portfolio_value", label: "Portfolio Value", display: "usdc", termId: "portfolio_value" },
  { key: "category_mix", label: "Category Mix", display: "record", termId: "category_mix" },
  { key: "information_lead_rate_7d", label: "Lead Rate (7D)", display: "percent", termId: "lead_rate" },
  { key: "realized_pnl_90d", label: "Realized PnL (90D)", display: "usdc" },
  { key: "win_rate_90d", label: "Win Rate (90D)", display: "percent" },
];

const OUTCOME_UNITS: Record<OutcomeMetricKey, string> = {
  realized_pnl_7d: UNITS.usdc,
  win_rate_7d: UNITS.ratio,
  avg_buy_price_7d: UNITS.ratio,
  total_trades_7d: UNITS.count,
  active_markets_7d: UNITS.count,
  last_trade_at: UNITS.none,
  flip_rate_7d: UNITS.ratio,
  median_exposure_minutes_7d: UNITS.minutes,
  profile_age_days: UNITS.days,
  first_deposit_at: UNITS.none,
  rebate_income_7d: UNITS.usdc,
  portfolio_value: UNITS.usdc,
  category_mix: UNITS.ratio,
  information_lead_rate_7d: UNITS.ratio,
  realized_pnl_90d: UNITS.usdc,
  win_rate_90d: UNITS.ratio,
};

/** Why a wallet has no Outcome observations. The two causes stay distinct. */
export type OutcomeAbsence = "leaderboard_row_only" | "outside_capture";

const ABSENCE_REASON: Record<OutcomeAbsence, ReasonCode> = {
  // In the recorded response, but only the row itself was captured.
  leaderboard_row_only: "incomplete_window",
  // Never part of this capture at all, so no endpoint was ever probed.
  outside_capture: "provider_unavailable",
};

const ABSENCE_LIMITATIONS: Record<OutcomeAbsence, string[]> = {
  leaderboard_row_only: [
    "本钱包只捕获了排行榜行本身，未抓取 /trades、/closed-positions、/activity。",
    "value=null 表示未观测，不是 0，也不是「无交易」。",
    "不从 vol/pnl 反推指标，不用同榜其他钱包插值。",
    "reason_code=incomplete_window 为八个合法码中最接近者；语义上应为「钱包未捕获」。",
  ],
  outside_capture: [
    "该地址不在本次 recorded 采集范围内，没有任何针对它的端点观测。",
    "因此不对该地址作出任何陈述；全部指标为 null。",
    "这不表示该地址无交易，只表示本次采集未观测它。",
  ],
};

/** A full Outcome group with every value null, for wallets without detail. */
export function buildAbsentOutcomeMetrics(
  wallet: string,
  absence: OutcomeAbsence,
  asOf: string | null,
): Record<OutcomeMetricKey, AnyEnvelope> {
  const group = {} as Record<OutcomeMetricKey, AnyEnvelope>;
  for (const field of OUTCOME_FIELDS) {
    group[field.key] = unavailableEnvelope<unknown>({
      unit: OUTCOME_UNITS[field.key],
      reason_code: ABSENCE_REASON[absence],
      data_status: "recorded",
      requested_window: null,
      observed_window: null,
      as_of: absence === "leaderboard_row_only" ? asOf : null,
      as_of_source: absence === "leaderboard_row_only" ? "age_adjusted" : "unknown",
      sample_size: 0,
      eligible_sample_size: 0,
      coverage: null,
      source_provenance: [],
      limitations: ABSENCE_LIMITATIONS[absence],
    });
  }
  void wallet;
  return group;
}

function presentOutcomeMetrics(metrics: WalletOutcomeMetrics): Record<OutcomeMetricKey, AnyEnvelope> {
  const group = {} as Record<OutcomeMetricKey, AnyEnvelope>;
  for (const field of OUTCOME_FIELDS) {
    const envelope = metrics[field.key] as MetricEnvelope<unknown>;
    group[field.key] =
      field.key === "information_lead_rate_7d" ? enforceCoverageGate(envelope) : envelope;
  }
  return group;
}

/* ---------------------------- Attribution ---------------------------- */

export type AttributionFieldKey =
  | "lead_rate"
  | "coverage"
  | "sample_size"
  | "verdict_distribution"
  | "language_lead_rate"
  | "median_source_lead_minutes"
  | "source_langs_checked"
  | "indexes_checked"
  | "discriminability";

export interface AttributionField {
  key: AttributionFieldKey;
  label: string;
  display: MetricDisplay;
  unit: string;
  termId?: TermId;
}

export const ATTRIBUTION_FIELDS: readonly AttributionField[] = [
  { key: "lead_rate", label: "lead_rate", display: "percent", unit: UNITS.ratio, termId: "lead_rate" },
  { key: "coverage", label: "coverage", display: "percent", unit: UNITS.ratio, termId: "coverage" },
  { key: "sample_size", label: "sample_size", display: "count", unit: UNITS.count, termId: "sample_size" },
  {
    key: "verdict_distribution",
    label: "verdict_distribution",
    display: "record",
    unit: UNITS.count,
    termId: "verdict_distribution",
  },
  {
    key: "language_lead_rate",
    label: "language_lead_rate",
    display: "percent",
    unit: UNITS.ratio,
    termId: "language_lead_rate",
  },
  {
    key: "median_source_lead_minutes",
    label: "median_source_lead_minutes",
    display: "minutes",
    unit: UNITS.minutes,
  },
  {
    key: "source_langs_checked",
    label: "source_langs_checked",
    display: "list",
    unit: UNITS.none,
    termId: "source_langs_checked",
  },
  {
    key: "indexes_checked",
    label: "indexes_checked",
    display: "list",
    unit: UNITS.none,
    termId: "indexes_checked",
  },
  {
    key: "discriminability",
    label: "discriminability",
    display: "record",
    unit: UNITS.none,
    termId: "discriminability",
  },
];

/**
 * The only legal four-way verdicts. Listed so the UI can name the state space
 * without implying that any particular verdict was reached.
 */
export const ATTRIBUTION_VERDICTS = [
  "before_verified_source",
  "between_local_and_english",
  "after_verified_english",
  "unattributed",
] as const;

export type AttributionVerdict = (typeof ATTRIBUTION_VERDICTS)[number];

/** Why the Attribution group is empty for a given wallet. */
export type AttributionAbsence = "no_qualified_evidence" | "no_attribution_capture";

/**
 * MEASURED: both attribution fixtures carry `evidence: []`.
 *
 * The two captures (`0xc69b…`, `0x6748…`) hold markets, prices and trades and
 * every one of their `source_status` entries returned HTTP 200, so the sources
 * were reached. What they contain is zero evidence records with a verifiable
 * publication time — the fixtures state this themselves as
 * "没有带可验证发布时间的合格来源，标记为 [Unattributed]".
 *
 * Zero qualified sources is a coverage of 0, which sits under the 0.40 gate, so
 * the group is `insufficient_evidence` + `coverage_below_gate`: samples were
 * looked for and none cleared the bar. That is a different statement from
 * `no_attribution_capture`, where nothing was ever probed, and the two are not
 * collapsed into one code.
 */
const ATTRIBUTION_ABSENCE: Record<AttributionAbsence, { status: MetricStatus; reason_code: ReasonCode }> = {
  no_qualified_evidence: { status: "insufficient_evidence", reason_code: "coverage_below_gate" },
  no_attribution_capture: { status: "unavailable", reason_code: "provider_unavailable" },
};

const ATTRIBUTION_LIMITATIONS: Record<AttributionAbsence, string[]> = {
  no_qualified_evidence: [
    "该钱包的 recorded 采集中，带可验证发布时间的合格来源数为 0（fixture 自述标记为 [Unattributed]）。",
    "合格证据为 0 意味着 coverage=0，低于 0.40 门槛，故不输出 lead_rate 或任何四段判定。",
    "已采集 markets / prices / trades，且 source_status 全部为 HTTP 200：来源已触达，但没有可用于时间对齐的合格发布时间。",
    "本次范围内没有合格证据，不等于不存在公开信息。",
    "不输出单一 lead 值，不作因果表述，也不描述任何人的语言能力。",
  ],
  no_attribution_capture: [
    "本钱包没有任何归因采集：未采集 clob prices-history 重定价序列，也没有证据集合。",
    "缺少 observed_sequence，无法建立成交与来源之间的时间关系。",
    "不输出 source_lead_minutes / repricing_lead_minutes，也不用单一 lead 值代替。",
  ],
};

export interface AttributionGroup {
  absence: AttributionAbsence;
  status: MetricStatus;
  reason_code: ReasonCode;
  /** Always empty in this capture. Present so the shape is stable. */
  evidence: never[];
  fields: Record<AttributionFieldKey, AnyEnvelope>;
  verdict_space: readonly AttributionVerdict[];
  limitations: string[];
}

export function buildAttributionGroup(wallet: string, asOf: string | null): AttributionGroup {
  const normalized = wallet.toLowerCase();
  const hasCapture = (ATTRIBUTION_FIXTURE_WALLETS as readonly string[]).includes(normalized);
  const absence: AttributionAbsence = hasCapture ? "no_qualified_evidence" : "no_attribution_capture";
  const { status, reason_code } = ATTRIBUTION_ABSENCE[absence];
  const limitations = ATTRIBUTION_LIMITATIONS[absence];
  const fields = {} as Record<AttributionFieldKey, AnyEnvelope>;
  for (const field of ATTRIBUTION_FIELDS) {
    fields[field.key] = buildEnvelope<unknown>({
      value: null,
      unit: field.unit,
      metric_status: status,
      reason_code,
      data_status: "recorded",
      requested_window: null,
      observed_window: null,
      as_of: hasCapture ? asOf : null,
      as_of_source: "unknown",
      sample_size: 0,
      eligible_sample_size: 0,
      // Coverage of QUALIFIED evidence is a measured 0 where sources were
      // reached; unknown where nothing was probed. 0 and null are not merged.
      coverage: hasCapture ? 0 : null,
      source_provenance: [],
      limitations,
    });
  }
  return { absence, status, reason_code, evidence: [], fields, verdict_space: ATTRIBUTION_VERDICTS, limitations };
}

/* ------------------------------- Fit ------------------------------- */

export type FitFieldKey =
  | "effective_entry_price"
  | "slippage_bps"
  | "retained_return_ratio"
  | "max_deployable_usd"
  | "meets_policy"
  | "failed_criteria";

export interface FitField {
  key: FitFieldKey;
  label: string;
  display: MetricDisplay;
  unit: string;
}

export const FIT_FIELDS: readonly FitField[] = [
  { key: "effective_entry_price", label: "effective_entry_price", display: "price", unit: UNITS.ratio },
  { key: "slippage_bps", label: "slippage_bps", display: "count", unit: "bps" },
  { key: "retained_return_ratio", label: "retained_return_ratio", display: "percent", unit: UNITS.ratio },
  { key: "max_deployable_usd", label: "max_deployable_usd", display: "usdc", unit: UNITS.usdc },
  { key: "meets_policy", label: "meets_policy", display: "boolean", unit: UNITS.none },
  { key: "failed_criteria", label: "failed_criteria", display: "list", unit: UNITS.none },
];

/** Order-book depth was never captured, so no Fit field can be estimated. */
export const FIT_REASON_CODE: ReasonCode = "provider_unavailable";

const FIT_LIMITATIONS = [
  "本次采集没有任何订单簿深度数据（未采集 clob /book 或等价快照）。",
  "没有深度就无法得出有效成交价、滑点或可部署规模；这些字段一律为 null。",
  "禁止用中间价、最近成交价或 vol 估造上述任何字段。",
  "meets_policy 为 null 表示未评估，既不是通过也不是未通过。",
];

export interface FitGroup {
  status: Extract<MetricStatus, "unavailable">;
  reason_code: ReasonCode;
  fields: Record<FitFieldKey, AnyEnvelope>;
  limitations: string[];
}

/** Unavailable by construction: there is no input from which to compute it. */
export function buildFitGroup(): FitGroup {
  const fields = {} as Record<FitFieldKey, AnyEnvelope>;
  for (const field of FIT_FIELDS) {
    fields[field.key] = unavailableEnvelope<unknown>({
      unit: field.unit,
      reason_code: FIT_REASON_CODE,
      data_status: "recorded",
      requested_window: null,
      observed_window: null,
      as_of: null,
      as_of_source: "unknown",
      sample_size: 0,
      eligible_sample_size: 0,
      coverage: null,
      source_provenance: [],
      limitations: FIT_LIMITATIONS,
    });
  }
  return { status: "unavailable", reason_code: FIT_REASON_CODE, fields, limitations: FIT_LIMITATIONS };
}

/* --------------------------- Detail assembly --------------------------- */

export interface WalletDetailViewModel {
  wallet: string;
  /** Null when the wallet is absent from the recorded top-50 response. */
  rank: number | null;
  user_name: string | null;
  verified_badge: boolean;
  in_recorded_leaderboard: boolean;
  detail_captured: boolean;
  /** False when this address was never part of the capture in any form. */
  in_capture: boolean;
  data_status: "recorded";
  as_of: string | null;
  as_of_text: string;
  source_url: string;
  outcome: Record<OutcomeMetricKey, AnyEnvelope>;
  attribution: AttributionGroup;
  fit: FitGroup;
  limitations: string[];
}

export function buildWalletDetailViewModel(address: string): WalletDetailViewModel {
  const normalized = address.toLowerCase();
  const view = getRecordedLeaderboard();
  const row = view.rows.find((item) => item.wallet.toLowerCase() === normalized) ?? null;
  const isDetailWallet = normalized === DETAIL_WALLET;
  const hasAttributionCapture = (ATTRIBUTION_FIXTURE_WALLETS as readonly string[]).includes(normalized);
  const in_capture = row !== null || isDetailWallet || hasAttributionCapture;

  const outcome = isDetailWallet
    ? presentOutcomeMetrics(DETAIL_WALLET_METRICS)
    : buildAbsentOutcomeMetrics(
        normalized,
        row !== null ? "leaderboard_row_only" : "outside_capture",
        row !== null ? view.as_of : null,
      );

  const limitations = [
    "本页为 recorded 回放，不是实时数据，也不构成能力、身份或因果判断。",
    ...(row === null
      ? ["该地址不在 recorded 30 日排行榜的 20 行样本内，因此没有名次；未为其伪造名次。"]
      : []),
    ...(isDetailWallet
      ? ["本钱包有 /trades、/closed-positions、/activity 观测；部分指标仍不可计算，原因见各字段 reason_code。"]
      : row !== null
        ? ["本钱包只有排行榜行本身被捕获，全部 Outcome 指标为 null。"]
        : hasAttributionCapture
          ? ["本钱包有 markets/prices/trades 采集，但没有 Outcome 端点观测，故 Outcome 组全部为 null。"]
          : ["本次采集完全未观测该地址，页面不对其作出任何陈述。"]),
  ];

  return {
    wallet: normalized,
    rank: row?.rank ?? null,
    user_name: row?.user_name ?? null,
    verified_badge: row?.verified_badge ?? false,
    in_recorded_leaderboard: row !== null,
    detail_captured: isDetailWallet,
    in_capture,
    data_status: "recorded",
    as_of: isDetailWallet ? DETAIL_WALLET_METRICS.as_of : row !== null ? view.as_of : null,
    as_of_text: (isDetailWallet ? DETAIL_WALLET_METRICS.as_of : row !== null ? view.as_of : null) ?? "unknown",
    source_url: view.source_url,
    outcome,
    attribution: buildAttributionGroup(normalized, hasAttributionCapture ? view.as_of : null),
    fit: buildFitGroup(),
    limitations,
  };
}

/**
 * Assert the published shape never contradicts its own status.
 *
 * Used by the tests as a single choke point: any envelope that claims to be
 * uncomputable while still carrying a value is a contract break, and a `0`
 * standing in for an unobserved metric is the specific failure this project
 * cares most about.
 */
export function findEnvelopeViolations(envelopes: readonly AnyEnvelope[]): string[] {
  const problems: string[] = [];
  for (const envelope of envelopes) {
    if (requiresNullValue(envelope.metric_status)) {
      if (envelope.value !== null) {
        problems.push(`metric_status=${envelope.metric_status} carries value=${JSON.stringify(envelope.value)}`);
      }
      if (!envelope.reason_code) {
        problems.push(`metric_status=${envelope.metric_status} has no reason_code`);
      }
    }
    if (envelope.data_status !== "recorded") {
      problems.push(`data_status=${envelope.data_status} in a recorded surface`);
    }
  }
  return problems;
}
