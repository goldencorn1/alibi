import {
  AnalysisBundle,
  DetailReport,
  ReportMeta,
  SummaryReport,
  DEFAULTS,
  DISCLAIMER,
  SCHEMA_VERSION,
} from "@/src/contracts";
import { REPRICING_DELTA_LOGODDS_THRESHOLD } from "@/src/engine/repricing";

function buildMeta(bundle: AnalysisBundle): ReportMeta {
  return {
    schema_version: SCHEMA_VERSION,
    input: bundle.input,
    data_status: bundle.data_status,
    analyzed_at: new Date().toISOString(),
    analysis_window: {
      observation_minutes: DEFAULTS.observationWindowMinutes,
      /**
       * C20/D8: report the REQUESTED window alongside an explicit status rather
       * than publishing 90 as if it were covered. Measured `/trades` history is
       * ~20.72 days with `offset` capped at 10000, so a 90-day window is not
       * satisfiable. The window is neither silently shortened to the observed
       * span nor extrapolated to 90; it is declared unavailable.
       */
      wallet_days: DEFAULTS.walletWindowDays,
      wallet_days_requested: DEFAULTS.walletWindowDays,
      wallet_days_status: "unavailable",
      wallet_days_reason_code: "incomplete_window",
      // C15: publish the active log-odds gate. `DEFAULTS.absoluteChangeThreshold`
      // (0.08) is the abolished linear threshold and must not be reported as the
      // effective threshold, or consumers read a value the engine never applies.
      threshold: REPRICING_DELTA_LOGODDS_THRESHOLD,
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
      // C6: never arithmetic on a null rate. `null * 100` is 0, which would
      // print a fabricated "0.0%" - the exact zero-sample collapse this fix
      // removes. An unavailable rate is stated as unavailable.
      : wallet.coverage_rate === null
        ? `观察到 ${wallet.observed_trades} 笔公开交易，覆盖率不可计算。`
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
          coverage_rate_status: wallet.coverage_rate_status,
          coverage_rate_reason_code: wallet.coverage_rate_reason_code,
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
