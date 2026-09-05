import type { AuditReport } from "@/src/contracts";
import type { Locale } from "@/src/ui/i18n";
import { glossaryLabel, workerMetricTermId } from "@/src/ui/glossary";

const labels = {
  en: {
    title: "Alibi Audit & Report",
    runId: "run_id",
    status: "status",
    dataStatus: "data_status",
    workers: "workers",
    events: "events",
    duration: "duration_ms",
    cost: "cost_usd",
    worker: "Worker",
    workerStatus: "Status",
    workerDataStatus: "Data status",
    durationHeader: "Duration ms",
    sources: "Sources",
    coverage: "Coverage",
    retry: "Retry",
    costHeader: "Cost USD",
    policyFlags: "Policy flags",
    limitations: "Limitations",
  },
  "zh-CN": {
    title: "Alibi 审计与报告",
    runId: "运行编号",
    status: "状态",
    dataStatus: "数据状态",
    workers: "代理数",
    events: "事件数",
    duration: "耗时毫秒",
    cost: "成本美元",
    worker: "代理",
    workerStatus: "状态",
    workerDataStatus: "数据状态",
    durationHeader: "耗时毫秒",
    sources: "来源数",
    coverage: "覆盖率",
    retry: "重试",
    costHeader: "成本美元",
    policyFlags: "策略标记",
    limitations: "限制",
  },
} as const;

function raw(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "—" : String(value);
}

export function renderAuditMarkdown(report: AuditReport, locale: Locale): string {
  const t = labels[locale];
  const rows = report.workers.map((worker) => [
    worker.agent_id,
    worker.status,
    worker.data_status,
    raw(worker.duration_ms),
    raw(worker.source_count),
    worker.coverage === null ? "—" : String((worker.coverage * 100).toFixed(2)) + "%",
    worker.retry_count,
    worker.cost_usd === null ? "—" : worker.cost_usd,
    worker.policy_flags.join(", ") || "—",
  ].map((value) => String(value).replaceAll("|", "\\|")).join(" | ")).join("\n");

  const contexts = report.workers.flatMap((worker) => {
    const workerId = worker.agent_id;
    return [
      "- " + workerId + ": " + glossaryLabel(workerMetricTermId(workerId, "sources"), locale) + "; " + glossaryLabel(workerMetricTermId(workerId, "coverage"), locale) + "; " + glossaryLabel(workerMetricTermId(workerId, "cost"), locale),
    ];
  });

  return [
    "# " + t.title,
    "",
    "- " + t.runId + ": " + report.meta.run_id,
    "- " + t.status + ": " + report.meta.status,
    "- " + t.dataStatus + ": " + report.meta.data_status,
    "- " + t.workers + ": " + report.meta.worker_count,
    "- " + t.events + ": " + report.meta.event_count,
    "- " + t.duration + ": " + report.meta.total_duration_ms,
    "- " + t.cost + ": " + report.meta.total_cost_usd.toFixed(4),
    "",
    "| " + t.worker + " | " + t.workerStatus + " | " + t.workerDataStatus + " | " + t.durationHeader + " | " + t.sources + " | " + t.coverage + " | " + t.retry + " | " + t.costHeader + " | " + t.policyFlags + " |",
    "|---|---|---:|---:|---:|---:|---:|---:|---|",
    rows,
    "",
    "## " + (locale === "zh-CN" ? "指标语义" : "Metric semantics"),
    "",
    ...contexts,
    "",
    "## " + t.limitations,
    "",
    ...report.meta.limitations.map((item) => "- " + item),
    "",
    report.meta.disclaimer,
    "",
  ].join("\n");
}
