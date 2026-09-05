import {
  ClusterAlert,
  ClusterDimensionResult,
  ClusterSourceState,
  DataStatus,
  EvidenceQuality,
  LanguageSource,
  LanguageWindow,
  ReleaseOrder,
  SourceCoverage,
  WalletLanguageRelation,
} from "@/src/contracts";
import { compareFixed, fixedToString, multiplyFixed, parseFixed, DECIMAL_SCALE } from "@/src/analysis/decimal";
import { clamp, clippedLogit, nearestRankP99, populationStdDev, quantileR7, spearmanRankCorrelation } from "@/src/analysis/statistics";
import { inClosedOpenWindow, parseTime } from "@/src/analysis/time-window";

const CLUSTER_WINDOW_MS = 180 * 60 * 1000;
const P99_MINIMUM_BASELINE = 200;
const P99_ALGORITHM_VERSION = "p99-nearest-rank-v1";

export interface ClusterTradeInput {
  condition_id: string;
  proxy_wallet: string;
  asset: string;
  side: "BUY" | "SELL" | "UNKNOWN";
  outcome: string | null;
  size: string | number;
  price: string | number;
  timestamp: string;
  transaction_hash: string | null;
  taker_only?: boolean;
  prior_trade_count?: number | null;
  prior_market_trade_count?: number | null;
  profile_created_at?: string | null;
  profile_complete?: boolean;
  history_complete?: boolean;
}

export interface ClusterEvaluationInput {
  condition_id: string;
  evaluation_time: string;
  trades: ClusterTradeInput[];
  baseline_trades: ClusterTradeInput[];
  source_state: ClusterSourceState;
  source_coverage: SourceCoverage;
  data_status: DataStatus;
  revision?: number;
  alert_id?: string;
}

export interface ClusterLanguageEvaluation {
  cluster_alerts: ClusterAlert[];
  language_windows: LanguageWindow[];
  source_coverage: SourceCoverage;
  evidence_cutoff_at: string;
}

function dedupKey(trade: ClusterTradeInput, timestamp: string): string {
  return [
    trade.transaction_hash ?? "missing",
    trade.proxy_wallet.toLowerCase(),
    trade.asset,
    trade.side,
    String(trade.size),
    String(trade.price),
    timestamp,
  ].join("|");
}

function dimension(
  id: ClusterDimensionResult["id"],
  state: ClusterDimensionResult["state"],
  value: number | null,
  threshold: string,
  reason: string,
  known: number,
  members: number,
): ClusterDimensionResult {
  return { id, state, value, threshold, reason, coverage: members ? known / members : null, known_count: known, member_count: members };
}

type Entry = { trade: ClusterTradeInput; timestamp: NonNullable<ReturnType<typeof parseTime>>; price: bigint; notional: bigint };

function eligibleEntries(input: ClusterEvaluationInput, p99: bigint): Entry[] {
  const evalMs = Date.parse(input.evaluation_time);
  const startMs = evalMs - CLUSTER_WINDOW_MS;
  const seen = new Set<string>();
  const entries = input.trades.flatMap((trade) => {
    const parsed = parseTime(trade.timestamp, "published", "second");
    const size = parseFixed(trade.size);
    const price = parseFixed(trade.price);
    if (trade.condition_id !== input.condition_id || trade.side !== "BUY" || trade.taker_only !== true || !parsed || !inClosedOpenWindow(parsed.epochMs, startMs, evalMs) || size === null || price === null || size <= 0n || price < 0n || price > DECIMAL_SCALE) return [];
    const key = dedupKey(trade, parsed.iso);
    if (seen.has(key)) return [];
    seen.add(key);
    const notional = multiplyFixed(size, price);
    return compareFixed(notional, p99) >= 0 ? [{ trade, timestamp: parsed, price, notional }] : [];
  });
  const byWallet = new Map<string, Entry>();
  for (const entry of entries.sort((left, right) => left.timestamp.epochMs - right.timestamp.epochMs)) {
    const wallet = entry.trade.proxy_wallet.toLowerCase();
    if (!byWallet.has(wallet)) byWallet.set(wallet, entry);
  }
  return [...byWallet.values()];
}

function validBaseline(input: ClusterEvaluationInput): bigint[] {
  const evalMs = Date.parse(input.evaluation_time);
  const startMs = evalMs - CLUSTER_WINDOW_MS;
  const baselineStart = startMs - 7 * 86_400_000;
  const seen = new Set<string>();
  return input.baseline_trades.flatMap((trade) => {
    const parsed = parseTime(trade.timestamp);
    const size = parseFixed(trade.size);
    const price = parseFixed(trade.price);
    if (!parsed || size === null || price === null || size <= 0n || price < 0n || price > DECIMAL_SCALE || trade.condition_id !== input.condition_id || trade.side !== "BUY" || trade.taker_only !== true) return [];
    if (parsed.epochMs < baselineStart || parsed.epochMs >= startMs) return [];
    const key = dedupKey(trade, parsed.iso);
    if (seen.has(key)) return [];
    seen.add(key);
    return [multiplyFixed(size, price)];
  });
}

function calculateDimensions(entries: Entry[]): ClusterDimensionResult[] {
  const members = entries.length;
  const yes = entries.filter((entry) => entry.trade.outcome?.toUpperCase() === "YES").length;
  const no = entries.filter((entry) => entry.trade.outcome?.toUpperCase() === "NO").length;
  const knownDirection = yes + no;
  const dominant = yes >= no ? "YES" : "NO";
  const dominantCount = Math.max(yes, no);
  const d1RatioPass = knownDirection > 0 && dominantCount * 100 >= 85 * knownDirection && yes !== no;
  const d1 = dimension("D1", knownDirection === 0 ? "unknown" : d1RatioPass ? "pass" : "fail", knownDirection ? dominantCount / knownDirection : null, ">=0.85", yes === no ? "Dominance is tied; stable YES tie-break cannot pass the 0.85 gate." : "Same-side BUY ratio.", knownDirection, members);

  const times = entries.map((entry) => entry.timestamp.epochMs / 1000);
  const q1 = quantileR7(times, 0.25);
  const q3 = quantileR7(times, 0.75);
  const iqr = q1 !== null && q3 !== null ? q3 - q1 : null;
  const d2Score = iqr === null ? null : clamp(1 - iqr / 10_800);
  const d2 = dimension("D2", times.length < 3 || iqr === null ? "unknown" : iqr <= 4_320 ? "pass" : "fail", d2Score, ">=0.60", times.length < 3 || iqr === null ? "Fewer than three calculable representative timestamps." : "IQR=" + iqr.toFixed(0) + " seconds.", times.length, members);

  const profileRows = entries.map((entry) => {
    const created = entry.trade.profile_created_at ? parseTime(entry.trade.profile_created_at, "first_seen", "second") : null;
    if (!created || entry.trade.profile_complete === false || created.epochMs > entry.timestamp.epochMs) return null;
    return Math.floor((entry.timestamp.epochMs - created.epochMs) / 86_400_000);
  }).filter((value): value is number => value !== null);
  const profileCoverage = members ? profileRows.length / members : 0;
  const profileMedian = profileRows.length ? (quantileR7(profileRows, 0.5) ?? null) : null;
  const d3 = dimension("D3", profileRows.length >= 3 && profileCoverage >= 0.8 ? profileMedian !== null && profileMedian <= 30 ? "pass" : "fail" : "unknown", profileMedian, "<=30 days", "profile_age_days is measured from profile.createdAt to representative entry; it is not wallet/account age.", profileRows.length, members);

  const historyRows = entries.map((entry) => entry.trade.history_complete === false || entry.trade.prior_trade_count === null || entry.trade.prior_trade_count === undefined ? null : entry.trade.prior_trade_count).filter((value): value is number => value !== null);
  const historyCoverage = members ? historyRows.length / members : 0;
  const thinRatio = historyRows.length ? historyRows.filter((value) => value <= 2).length / historyRows.length : null;
  const d4 = dimension("D4", historyRows.length >= 3 && historyCoverage >= 0.8 ? (thinRatio ?? 0) >= 0.5 ? "pass" : "fail" : "unknown", thinRatio, ">=0.50", "Prior trades are counted only before representative entry; incomplete history is unknown, not zero.", historyRows.length, members);

  const dominantEntries = entries.filter((entry) => entry.trade.outcome?.toUpperCase() === dominant);
  const logits: number[] = [];
  let clipCount = 0;
  for (const entry of dominantEntries) {
    const clipped = clippedLogit(entry.price);
    logits.push(clipped.value);
    if (clipped.clipped) clipCount += 1;
  }
  const dispersion = logits.length >= 3 ? populationStdDev(logits) : null;
  const d5 = dimension("D5", dispersion === null ? "unknown" : dispersion <= 0.5 ? "pass" : "fail", dispersion, "<=0.50", "Dominant-outcome logit population stddev; clip_count=" + clipCount + ".", logits.length, dominantEntries.length);

  const marketHistoryRows = entries.map((entry) => entry.trade.history_complete === false || entry.trade.prior_market_trade_count === null || entry.trade.prior_market_trade_count === undefined ? null : entry.trade.prior_market_trade_count).filter((value): value is number => value !== null);
  const marketCoverage = members ? marketHistoryRows.length / members : 0;
  const familiarityRatio = marketHistoryRows.length ? marketHistoryRows.filter((value) => value === 0).length / marketHistoryRows.length : null;
  const d6 = dimension("D6", marketHistoryRows.length >= 3 && marketCoverage >= 0.8 ? (familiarityRatio ?? 0) >= 0.8 ? "pass" : "fail" : "unknown", familiarityRatio, ">=0.80", "Compatibility name retained: this means previously did not trade this market, not greater familiarity.", marketHistoryRows.length, members);

  return [d1, d2, d3, d4, d5, d6];
}

function herding(entries: Entry[], dominant: string | null): boolean | "unknown" {
  const dominantEntries = entries.filter((entry) => entry.trade.outcome?.toUpperCase() === dominant);
  const timestamps = new Set(dominantEntries.map((entry) => entry.timestamp.epochMs));
  const prices = new Set(dominantEntries.map((entry) => entry.price.toString()));
  if (dominantEntries.length < 5 || timestamps.size < 3 || prices.size < 3 || dominantEntries[dominantEntries.length - 1]?.timestamp.epochMs === dominantEntries[0]?.timestamp.epochMs) return "unknown";
  const ordered = [...dominantEntries].sort((a, b) => a.timestamp.epochMs - b.timestamp.epochMs || (a.trade.transaction_hash ?? "").localeCompare(b.trade.transaction_hash ?? ""));
  if (ordered[ordered.length - 1]!.timestamp.epochMs === ordered[0]!.timestamp.epochMs) return "unknown";
  const rho = spearmanRankCorrelation(ordered.map((_, index) => index + 1), ordered.map((entry) => Number(entry.price)));
  const first = Number(ordered[0]?.price ?? 0);
  const second = Number(ordered[1]?.price ?? 0);
  const last = Number(ordered[ordered.length - 1]?.price ?? 0);
  const g = last === first ? 0 : (second - first) / (last - first);
  return rho !== null && Math.round(rho * 100) >= 70 && g >= 0.3;
}

export function evaluateCluster(input: ClusterEvaluationInput): ClusterAlert {
  const baselineValues = validBaseline(input);
  const p99 = nearestRankP99(baselineValues);
  const baselineInsufficient = baselineValues.length < 200;
  const entries = p99 === null || baselineInsufficient ? [] : eligibleEntries(input, p99);
  const wallets = [...new Set(entries.map((entry) => entry.trade.proxy_wallet.toLowerCase()))];
  const yes = entries.filter((entry) => entry.trade.outcome?.toUpperCase() === "YES").length;
  const no = entries.filter((entry) => entry.trade.outcome?.toUpperCase() === "NO").length;
  const dominant = entries.length === 0 ? null : yes >= no ? "YES" : "NO";
  const dimensions = entries.length ? calculateDimensions(entries) : [];
  const evaluable = dimensions.filter((item) => item.state !== "unknown").length;
  const passed = dimensions.filter((item) => item.state === "pass").length;
  const herd = entries.length ? herding(entries, dominant) : "unknown";
  const requiredConnectors = new Set(input.source_coverage.required_connectors);
  const healthyConnectors = new Set(input.source_coverage.healthy_connectors);
  const coverageHealthy = input.source_coverage.coverage_complete && requiredConnectors.size > 0 && [...requiredConnectors].every((connector) => healthyConnectors.has(connector)) && input.source_coverage.unavailable_connectors.length === 0 && input.source_coverage.unknown_reasons.length === 0 && input.source_coverage.timestamp_precision !== "unknown" && input.source_coverage.timestamp_precision !== "date" && input.source_coverage.source_state === "not_found";
  const gate = !baselineInsufficient && wallets.length >= 5 && yes + no > 0 && Math.max(yes, no) * 100 >= 85 * (yes + no) && evaluable >= 5 && passed >= 4 && herd === false && input.source_state === "not_found" && coverageHealthy;
  const state: ClusterAlert["state"] = baselineInsufficient ? "insufficient_baseline" : gate ? "formal_alert" : wallets.length >= 3 ? "cluster_observation" : "restricted";
  const timestamps = entries.map((entry) => entry.timestamp.epochMs);
  const spanMinutes = timestamps.length > 1 ? (Math.max(...timestamps) - Math.min(...timestamps)) / 60_000 : timestamps.length === 1 ? 0 : null;
  const limitations = [
    "Addresses do not establish identity or personhood; this observation does not establish coordination, insider trading, language ability, skill, causality or common control.",
    "This is evidence-only and does not provide buy, sell, entry, follow, copy, position or investment advice.",
    ...(baselineInsufficient ? ["insufficient_baseline: " + baselineValues.length + " valid baseline rows; at least 200 are required."] : []),
    ...(input.source_state !== "not_found" ? ["source_state=" + input.source_state + "; a formal alert requires not_found with healthy coverage."] : []),
    ...(!coverageHealthy ? ["source_coverage is incomplete, unhealthy, date-only or internally inconsistent; formal alert is blocked."] : []),
    ...(herd !== false ? ["herding_like_pattern=" + String(herd) + "; formal alert is blocked unless it is false."] : []),
  ];
  const quality: EvidenceQuality = gate && input.source_coverage.coverage_complete && evaluable === 6 && input.source_coverage.timestamp_precision !== "unknown"
    ? input.source_coverage.coverage_ratio !== null && input.source_coverage.coverage_ratio >= 0.9 ? "high" : "medium"
    : "low";
  return {
    alert_id: input.alert_id ?? "cluster-" + input.condition_id + "-" + input.evaluation_time,
    alert_type: "cluster_without_verified_source",
    created_at: input.evaluation_time,
    evidence_cutoff_at: input.evaluation_time,
    revision: input.revision ?? 1,
    supersedes_revision: input.revision && input.revision > 1 ? input.revision - 1 : null,
    condition_id: input.condition_id,
    cluster_size: wallets.length,
    addresses: wallets,
    dominant_outcome: dominant,
    cluster_span_minutes: spanMinutes,
    baseline_p99_usdc: p99 === null ? null : fixedToString(p99),
    baseline_sample_count: baselineValues.length,
    baseline_algorithm_version: P99_ALGORITHM_VERSION,
    dimensions,
    dimensions_evaluable: evaluable,
    dimensions_passed: passed,
    herding_like_pattern: herd,
    source_state: input.source_state,
    state,
    evidence_quality: quality,
    data_status: input.data_status,
    limitations,
  };
}

export function emptySourceCoverage(): SourceCoverage {
  return {
    required_connectors: [],
    healthy_connectors: [],
    unavailable_connectors: [],
    coverage_ratio: null,
    coverage_complete: false,
    timestamp_precision: "unknown",
    source_state: "unknown",
    unknown_reasons: ["No approved language-source connector result is available for this evaluation."],
  };
}

export function evaluateLanguageWindow(
  localSource: LanguageSource | null,
  englishSource: LanguageSource | null,
  options: { cutoff: string; alertId?: string | null; addressRelations?: Array<{ address: string; relation: WalletLanguageRelation }>; dataStatus: DataStatus; coverage?: SourceCoverage; revision?: number; supersedesRevision?: number | null },
): LanguageWindow {
  const cutoffMs = Date.parse(options.cutoff);
  const localPublished = localSource?.published_at ? Date.parse(localSource.published_at) : Number.NaN;
  const englishPublished = englishSource?.published_at ? Date.parse(englishSource.published_at) : Number.NaN;
  const eligibleLocal = localSource && Number.isFinite(localPublished) && localPublished <= cutoffMs ? localSource : null;
  const eligibleEnglish = englishSource && Number.isFinite(englishPublished) && englishPublished <= cutoffMs ? englishSource : null;
  const healthyLocal = Boolean(eligibleLocal && eligibleLocal.connector_status === "healthy" && eligibleLocal.observation_role !== "discovery_only" && eligibleLocal.source_tier !== "aggregator");
  const healthyEnglish = Boolean(eligibleEnglish && eligibleEnglish.connector_status === "healthy" && eligibleEnglish.observation_role !== "discovery_only" && eligibleEnglish.source_tier !== "aggregator");
  const coverageComplete = Boolean(options.coverage?.coverage_complete && (options.coverage?.unavailable_connectors.length ?? 0) === 0 && (options.coverage?.unknown_reasons.length ?? 0) === 0);
  const sourceState: ClusterSourceState = healthyLocal && healthyEnglish
    ? "found"
    : healthyLocal && !eligibleEnglish && coverageComplete
      ? "found"
      : "unknown";
  const stableOfficialId = Boolean(healthyLocal && healthyEnglish && eligibleLocal?.official_release_id && eligibleLocal.official_release_id === eligibleEnglish?.official_release_id);
  const crossLinked = Boolean(
    eligibleLocal && eligibleEnglish &&
    eligibleLocal.source_tier !== "aggregator" && eligibleEnglish.source_tier !== "aggregator" &&
    eligibleLocal.official_cross_link && eligibleLocal.official_cross_link === eligibleEnglish.official_cross_link &&
    eligibleLocal.publisher.trim().toLowerCase() === eligibleEnglish.publisher.trim().toLowerCase() &&
    eligibleLocal.normalized_topic && eligibleLocal.normalized_topic === eligibleEnglish.normalized_topic &&
    eligibleLocal.published_date && eligibleLocal.published_date === eligibleEnglish.published_date,
  );
  const pairing = healthyLocal && healthyEnglish && eligibleLocal && eligibleEnglish && (stableOfficialId || crossLinked) ? "verified" : "pairing_unverified";
  const localPrecisionKnown = eligibleLocal?.timestamp_precision === "minute" || eligibleLocal?.timestamp_precision === "second" || eligibleLocal?.timestamp_precision === "subsecond";
  const englishPrecisionKnown = eligibleEnglish?.timestamp_precision === "minute" || eligibleEnglish?.timestamp_precision === "second" || eligibleEnglish?.timestamp_precision === "subsecond";
  const localUncertainty = eligibleLocal?.timestamp_uncertainty_seconds;
  const englishUncertainty = eligibleEnglish?.timestamp_uncertainty_seconds;
  const knownOrder = Number.isFinite(localPublished) && Number.isFinite(englishPublished) && localPrecisionKnown && englishPrecisionKnown && localUncertainty !== null && englishUncertainty !== null;
  const localStart = localPublished - (localUncertainty ?? 0) * 1000;
  const localEnd = localPublished + (localUncertainty ?? 0) * 1000;
  const englishStart = englishPublished - (englishUncertainty ?? 0) * 1000;
  const englishEnd = englishPublished + (englishUncertainty ?? 0) * 1000;
  const releaseOrder: ReleaseOrder = !knownOrder || pairing !== "verified"
    ? "unknown"
    : localPublished === englishPublished && localUncertainty === 0 && englishUncertainty === 0
      ? "simultaneous"
      : localEnd < englishStart
        ? "local_first"
        : englishEnd < localStart
          ? "english_first"
          : "indeterminate";
  const gap: LanguageWindow["gap"] = !eligibleLocal
    ? "gap_unknown"
    : !eligibleEnglish
      ? sourceState === "found" ? "gap_open" : "gap_unknown"
      : releaseOrder === "local_first" ? "gap_open" : releaseOrder === "english_first" || releaseOrder === "simultaneous" || releaseOrder === "indeterminate" ? "gap_closed" : "gap_unknown";
  const walletRelations = (options.addressRelations ?? []).map((relation) => ({
    ...relation,
    relation: releaseOrder === "indeterminate" && relation.relation === "within_documented_language_window" ? "indeterminate" : relation.relation,
  }));
  const quality: EvidenceQuality = sourceState === "found" && pairing === "verified" && releaseOrder !== "unknown" ? "medium" : "low";
  return {
    window_id: "language-" + options.cutoff,
    alert_id: options.alertId ?? null,
    local_source: eligibleLocal,
    english_source: eligibleEnglish,
    pairing,
    source_state: sourceState,
    evidence_cutoff_at: options.cutoff,
    gap,
    release_order: releaseOrder,
    wallet_relations: walletRelations,
    evidence_quality: quality,
    data_status: options.dataStatus,
    ...(options.revision !== undefined ? { revision: options.revision } : {}),
    ...(options.supersedesRevision !== undefined ? { supersedes_revision: options.supersedesRevision } : {}),
    limitations: [
      "A documented language window only places wallet entries relative to public timestamps; it does not imply language reading, relationship, copying or causality.",
      ...(sourceState === "unknown" ? ["Source coverage or connector health is incomplete; not_found is not inferred."] : []),
      ...(pairing === "pairing_unverified" ? ["Pairing is unverified; semantic similarity or same-day timing is not sufficient."] : []),
      ...(releaseOrder === "indeterminate" ? ["Timestamp uncertainty intervals overlap; no language release order is asserted."] : []),
    ],
  };
}

export function evaluateClusterLanguage(input: ClusterEvaluationInput): ClusterLanguageEvaluation {
  return {
    cluster_alerts: [evaluateCluster(input)],
    language_windows: [],
    source_coverage: input.source_coverage,
    evidence_cutoff_at: input.evaluation_time,
  };
}
