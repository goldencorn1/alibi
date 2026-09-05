import { AnalysisBundle, DataStatus, InputRef, LanguageSource, mergeDataStatuses } from "@/src/contracts";
import { AppMode, hasAnthropicCredentials } from "@/src/config";
import { parseInput, ParseInputResult } from "@/src/input/parser";
import { fetchLiveData } from "@/src/data/adapters";
import { fixtureBundle, loadFixture } from "@/src/data/fixtures";
import { detectRepricingWindows } from "@/src/engine/repricing";
import { attributeWindows } from "@/src/engine/attribution";
import { calculateWalletMetrics } from "@/src/engine/wallet";
import { validateEvidence } from "@/src/data/evidence";
import { AuditReportAgent } from "@/src/observability/audit-agent";
import { emptySourceCoverage, evaluateClusterLanguage, evaluateLanguageWindow, ClusterTradeInput } from "@/src/analysis/cluster-language";
import { fetchHksarIsdRss } from "@/src/adapters/evidence/hksar-isd";

export type AnalysisResult =
  | { ok: true; bundle: AnalysisBundle }
  | { ok: false; input: InputRef | null; code: "invalid_input" | "upstream_unavailable"; message: string; data_status: DataStatus };

export interface AnalyzeOptions {
  auditRun?: AuditReportAgent;
}

export async function analyze(raw: string, mode: AppMode, options: AnalyzeOptions = {}): Promise<AnalysisResult> {
  const auditRun = options.auditRun;
  const inputWorker = auditRun ? await auditRun.startWorker("input", { data_status: mode, source_count: 1, policy_flags: mode === "recorded" ? ["recorded_replay"] : [] }) : null;
  const parsed = parseInput(raw);
  if (!parsed.ok) {
    if (auditRun && inputWorker) await auditRun.failWorker(inputWorker, "invalid_input", { data_status: mode, source_count: 1 });
    return { ok: false, input: null, code: "invalid_input", message: parsed.message, data_status: mode === "recorded" ? "recorded" : "live" };
  }
  const input = parsed.value;
  if (auditRun && inputWorker) await auditRun.completeWorker(inputWorker, { data_status: mode, source_count: 1, policy_flags: mode === "recorded" ? ["recorded_replay"] : [] });
  const marketDataWorker = auditRun ? await auditRun.startWorker("market-data", { data_status: mode, policy_flags: mode === "recorded" ? ["recorded_replay"] : [] }) : null;
  let bundle: AnalysisBundle;
  let languageSources: LanguageSource[] = [];
  let sourceCoverage = emptySourceCoverage();
  if (mode === "recorded") {
    const fixture = await loadFixture(input, mode);
    if (!fixture) {
      if (auditRun && marketDataWorker) await auditRun.failWorker(marketDataWorker, "upstream_unavailable", { data_status: "recorded" });
      return { ok: false, input, code: "upstream_unavailable", message: "No verified recorded fixture is available for this input yet.", data_status: "recorded" };
    }
    bundle = fixtureBundle(input, fixture);
  } else {
    const live = await fetchLiveData(input);
    if (live.markets.length === 0 && live.prices.length === 0 && live.trades.length === 0) {
      if (auditRun && marketDataWorker) await auditRun.failWorker(marketDataWorker, "upstream_unavailable", { data_status: "live", retry_count: live.sourceStatus.reduce((total, item) => total + Math.max(0, item.attempts - 1), 0), source_count: live.sourceStatus.length });
      return { ok: false, input, code: "upstream_unavailable", message: "No usable live data was returned by the approved read-only sources.", data_status: "live" };
    }
    try {
      const sourceResult = await fetchHksarIsdRss();
      languageSources = [...sourceResult.english.sources, ...sourceResult.local.sources];
      sourceCoverage = sourceResult.coverage;
    } catch {
      sourceCoverage = emptySourceCoverage();
    }
    bundle = { input, markets: live.markets, prices: live.prices, windows: [], evidence: [], trades: live.trades, wallet_metrics: null, source_status: live.sourceStatus, data_status: mergeDataStatuses(live.sourceStatus.map((item) => item.data_status)), limitations: [...live.limitations, ...(sourceCoverage.unknown_reasons.length ? ["Approved bilingual source coverage is incomplete; language state remains unknown."] : [])], cluster_alerts: [], language_windows: [], source_coverage: sourceCoverage, evidence_cutoff_at: live.sourceStatus[0]?.retrieved_at ?? new Date().toISOString() };
  }
  if (auditRun && marketDataWorker) await auditRun.completeWorker(marketDataWorker, { data_status: bundle.data_status, source_count: bundle.source_status.length, retry_count: bundle.source_status.reduce((total, item) => total + Math.max(0, item.attempts - 1), 0), policy_flags: bundle.data_status === "recorded" ? ["recorded_replay"] : [] });
  const repricingWorker = auditRun ? await auditRun.startWorker("repricing", { data_status: bundle.data_status, source_count: bundle.prices.length }) : null;
  const windows = detectRepricingWindows(bundle.prices);
  if (auditRun && repricingWorker) await auditRun.completeWorker(repricingWorker, { data_status: bundle.data_status, source_count: windows.length });
  const evidenceWorker = auditRun ? await auditRun.startWorker("evidence", { data_status: bundle.data_status, source_count: bundle.evidence.length }) : null;
  const evidenceValidation = validateEvidence(bundle.evidence);
  if (auditRun && evidenceWorker) await auditRun.completeWorker(evidenceWorker, { data_status: bundle.data_status, source_count: evidenceValidation.valid.length, policy_flags: evidenceValidation.valid.length === 0 && windows.length > 0 ? ["no_verified_evidence", "unattributed"] : [] }, evidenceValidation.valid.length === 0 && windows.length > 0 ? "insufficient" : "ok");
  const attributionWorker = auditRun ? await auditRun.startWorker("attribution", { data_status: bundle.data_status, source_count: evidenceValidation.valid.length }) : null;
  const attribution = await attributeWindows(windows, bundle.evidence);
  if (auditRun && attributionWorker) {
    const attributionFlags = [
      ...(attribution.verified ? [] : ["unattributed" as const]),
      ...(evidenceValidation.valid.length === 0 && windows.length > 0 ? ["no_verified_evidence" as const] : []),
      ...(!hasAnthropicCredentials() && windows.length > 0 ? ["credentials_missing" as const] : []),
    ];
    const attributionStatus = attribution.verified ? "ok" : evidenceValidation.valid.length === 0 && windows.length > 0 ? "insufficient" : "blocked";
    await auditRun.completeWorker(attributionWorker, { data_status: bundle.data_status, source_count: attribution.windows.length, policy_flags: attributionFlags }, attributionStatus);
  }
  const withAttribution = { ...bundle, windows: attribution.windows, limitations: [...bundle.limitations, ...attribution.limitations] };
  const evidenceCutoffAt = bundle.evidence_cutoff_at ?? bundle.source_status[0]?.retrieved_at ?? new Date().toISOString();
  const clusterCondition = bundle.trades.find((trade) => trade.market_id)?.market_id ?? null;
  const clusterTrades: ClusterTradeInput[] = bundle.trades.map((trade) => ({
    condition_id: trade.market_id,
    proxy_wallet: trade.wallet,
    asset: trade.token_id ?? "",
    side: trade.side,
    outcome: trade.outcome,
    size: trade.size ?? "0",
    price: trade.price ?? "-1",
    timestamp: trade.timestamp,
    transaction_hash: trade.transaction_hash,
    taker_only: trade.maker_taker === "TAKER",
  }));
  const clusterResult = clusterCondition
    ? evaluateClusterLanguage({
        condition_id: clusterCondition,
        evaluation_time: evidenceCutoffAt,
        trades: clusterTrades,
        baseline_trades: [],
        source_state: bundle.source_coverage?.source_state ?? "unknown",
        source_coverage: bundle.source_coverage ?? emptySourceCoverage(),
        data_status: bundle.data_status,
      })
    : { cluster_alerts: [], language_windows: [], source_coverage: bundle.source_coverage ?? emptySourceCoverage(), evidence_cutoff_at: evidenceCutoffAt };
  const sourceByRelease = new Map<string, { local: LanguageSource | null; english: LanguageSource | null }>();
  for (const source of languageSources) {
    const id = source.official_release_id ?? source.url;
    const current = sourceByRelease.get(id) ?? { local: null, english: null };
    if (source.language === "en") current.english = source;
    if (source.language === "zh-Hant" || source.language === "zh-Hans") current.local = source;
    sourceByRelease.set(id, current);
  }
  const languageWindows = [...sourceByRelease.values()]
    .filter((pair) => pair.local || pair.english)
    .slice(0, 25)
    .map((pair) => evaluateLanguageWindow(pair.local, pair.english, { cutoff: evidenceCutoffAt, dataStatus: bundle.data_status, coverage: bundle.source_coverage }));
  const walletWorker = auditRun ? await auditRun.startWorker("wallet-analysis", { data_status: bundle.data_status }) : null;
  if (input.kind === "wallet" || input.kind === "profile") {
    withAttribution.wallet_metrics = calculateWalletMetrics(bundle.trades, attribution.windows);
  }
  if (auditRun && walletWorker) {
    if (withAttribution.wallet_metrics) {
      await auditRun.completeWorker(walletWorker, { data_status: withAttribution.wallet_metrics.data_status, source_count: withAttribution.wallet_metrics.observed_trades, coverage: withAttribution.wallet_metrics.coverage_rate, policy_flags: withAttribution.wallet_metrics.status === "insufficient_evidence" ? ["coverage_below_gate"] : [] }, withAttribution.wallet_metrics.status === "insufficient_evidence" ? "insufficient" : "ok");
    } else {
      await auditRun.skipWorker("wallet-analysis", { data_status: bundle.data_status, policy_flags: ["not_requested"] });
    }
  }
  const policyWorker = auditRun ? await auditRun.startWorker("policy-verification", { data_status: bundle.data_status, source_count: withAttribution.windows.length }) : null;
  const policyFlags = [
    ...(withAttribution.windows.some((window) => window.attribution_status === "unattributed") ? ["unattributed" as const] : []),
    ...(withAttribution.wallet_metrics?.status === "insufficient_evidence" ? ["coverage_below_gate" as const] : []),
  ];
  if (auditRun && policyWorker) await auditRun.completeWorker(policyWorker, { data_status: bundle.data_status, source_count: withAttribution.windows.length, coverage: withAttribution.wallet_metrics?.coverage_rate ?? null, policy_flags: policyFlags });
  return { ok: true, bundle: { ...withAttribution, ...clusterResult, language_windows: languageWindows, run_id: auditRun?.run_id } };
}
