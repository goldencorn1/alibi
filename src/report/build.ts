import {
  AnalysisBundle,
  DetailReport,
  ReportMeta,
  SummaryReport,
  DEFAULTS,
  DISCLAIMER,
  SCHEMA_VERSION,
} from "@/src/contracts";

function buildMeta(bundle: AnalysisBundle): ReportMeta {
  return {
    schema_version: SCHEMA_VERSION,
    input: bundle.input,
    data_status: bundle.data_status,
    analyzed_at: new Date().toISOString(),
    analysis_window: {
      observation_minutes: DEFAULTS.observationWindowMinutes,
      wallet_days: DEFAULTS.walletWindowDays,
      threshold: DEFAULTS.absoluteChangeThreshold,
      coverage_threshold: DEFAULTS.coverageThreshold,
    },
    coverage_rate: bundle.wallet_metrics?.coverage_rate ?? null,
    limitations: [...new Set(bundle.limitations)],
    disclaimer: DISCLAIMER,
    source_status: bundle.source_status,
    ...(bundle.evidence_cutoff_at ? { evidence_cutoff_at: bundle.evidence_cutoff_at } : {}),
    ...(bundle.source_coverage ? { source_coverage: bundle.source_coverage } : {}),
    ...(bundle.run_id ? { run_id: bundle.run_id } : {}),
  };
}

export function buildSummary(bundle: AnalysisBundle): SummaryReport {
  const wallet = bundle.wallet_metrics;
  const headline = wallet
    ? wallet.status === "insufficient_evidence"
      ? "数据不足以判断该钱包的先手模式。"
      : `观察到 ${wallet.observed_trades} 笔公开交易，覆盖率 ${(wallet.coverage_rate * 100).toFixed(1)}%。`
    : `观察到 ${bundle.windows.length} 个重定价窗口，${bundle.windows.filter((item) => item.attribution_status === "unattributed").length} 个窗口未能归因。`;

  return {
    kind: "summary",
    meta: buildMeta(bundle),
    title: bundle.markets[0]?.title ?? "Polymarket read-only analysis",
    headline,
    market_count: bundle.markets.length,
    repricing_count: bundle.windows.length,
    unattributed_count: bundle.windows.filter((item) => item.attribution_status === "unattributed").length,
    recent_windows: bundle.windows.slice(-5).map((window) => ({
      id: window.id,
      start_at: window.start_at,
      end_at: window.end_at,
      absolute_change: window.absolute_change,
      direction: window.direction,
      attribution_status: window.attribution_status,
      data_status: window.data_status,
    })),
    wallet_metrics: wallet
      ? {
          wallet: wallet.wallet,
          coverage_rate: wallet.coverage_rate,
          information_lead_rate: wallet.information_lead_rate,
          status: wallet.status,
          data_status: wallet.data_status,
        }
      : null,
    cluster_alerts: bundle.cluster_alerts ?? [],
    language_windows: bundle.language_windows ?? [],
    source_coverage: bundle.source_coverage,
    evidence_cutoff_at: bundle.evidence_cutoff_at,
    detail_requires_payment: {
      price: "0.01 USDC",
      network: "eip155:84532",
    },
  };
}

export function buildDetail(bundle: AnalysisBundle): DetailReport {
  return {
    kind: "detail",
    meta: buildMeta(bundle),
    title: bundle.markets[0]?.title ?? "Polymarket read-only detail",
    windows: bundle.windows,
    evidence: bundle.evidence,
    wallet_metrics: bundle.wallet_metrics,
    cluster_alerts: bundle.cluster_alerts ?? [],
    language_windows: bundle.language_windows ?? [],
    source_coverage: bundle.source_coverage,
    evidence_cutoff_at: bundle.evidence_cutoff_at,
    exclusions: bundle.wallet_metrics?.alignments
      .filter((item) => item.exclusion_reason)
      .map((item) => item.exclusion_reason as string) ?? [],
    paid_access: {
      scheme: "exact",
      network: "eip155:84532",
      price: "0.01 USDC",
      access: "paid",
    },
  };
}
