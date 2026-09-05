import type { Locale } from "@/src/ui/i18n";

export type BaseTermId =
  | "summary" | "attribution" | "time_evidence_chain" | "repricing_window" | "language_window"
  | "documented_language_window" | "unattributed" | "insufficient_evidence" | "indeterminate"
  | "data_status" | "live" | "recorded" | "synthetic" | "cached" | "cluster" | "same_side_ratio"
  | "time_concentration" | "median_profile_age_days" | "first_trade_ratio" | "entry_price_dispersion"
  | "market_novelty_ratio" | "herding_pattern" | "confidence" | "timestamp_uncertainty" | "x402"
  | "payment_required" | "base_sepolia" | "mcp" | "erc8004" | "provider_unavailable"
  | "upstream_unavailable" | "unavailable" | "loading" | "empty" | "success" | "error"
  | "payment_invalid" | "timeout" | "unsupported_language" | "cluster_without_verified_source";

export type ConsoleTermId =
  | "agent_evidence" | "agent_attribution" | "agent_quality_risk" | "agent_audit_report"
  | "worker_input" | "worker_market_data" | "worker_repricing" | "worker_evidence"
  | "worker_attribution" | "worker_wallet_analysis" | "worker_policy_verification" | "worker_report" | "worker_payment"
  | "metric_status" | "metric_data_status" | "worker_events" | "worker_latency" | "worker_retries" | "worker_errors"
  | "metric_policy_flags" | "metric_run_id" | "metric_limitations"
  | "worker_input_sources" | "worker_market_data_sources" | "worker_repricing_windows" | "worker_evidence_sources"
  | "worker_attribution_windows" | "worker_wallet_observed_trades" | "worker_policy_attributed_windows" | "worker_report_markets" | "worker_payment_sources"
  | "worker_input_coverage" | "worker_market_data_coverage" | "worker_repricing_coverage" | "worker_evidence_coverage"
  | "worker_attribution_coverage" | "worker_wallet_analysis_coverage" | "worker_policy_verification_coverage" | "worker_report_coverage" | "worker_payment_coverage"
  | "worker_input_cost" | "worker_market_data_cost" | "worker_repricing_cost" | "worker_evidence_cost"
  | "worker_attribution_cost" | "worker_wallet_analysis_cost" | "worker_policy_verification_cost" | "worker_report_cost" | "worker_payment_cost"
  | "worker_total_tracked_cost" | "status_pending" | "status_running" | "status_ok" | "status_blocked" | "status_failed"
  | "status_insufficient" | "status_skipped" | "status_completed" | "status_partial" | "value_na" | "value_none"
  | "flag_coverage_below_gate" | "flag_unattributed" | "flag_payment_required" | "flag_credentials_missing" | "flag_not_requested"
  | "flag_no_verified_evidence" | "flag_recorded_replay" | "flag_synthetic_test" | "flag_audit_partial" | "flag_rag_degraded"
  | "flag_database_unavailable" | "flag_provider_unavailable" | "flag_stale_data" | "flag_not_enabled" | "flag_live_unverified";

export type TermId = BaseTermId | ConsoleTermId;

export interface GlossaryEntry {
  term_id: TermId;
  label: Record<Locale, string>;
  definition: Record<Locale, string>;
  limitation?: Record<Locale, string>;
  display: "approved" | "pending_definition";
}

const entry = (term_id: TermId, zhLabel: string, enLabel: string, zhDefinition: string, enDefinition: string, zhLimitation?: string, enLimitation?: string): GlossaryEntry => ({
  term_id,
  label: { "zh-CN": zhLabel, en: enLabel },
  definition: { "zh-CN": zhDefinition, en: enDefinition },
  ...(zhLimitation && enLimitation ? { limitation: { "zh-CN": zhLimitation, en: enLimitation } } : {}),
  display: "approved",
});

const baseGlossary = {
  summary: entry("summary", "摘要", "Summary", "免费的汇总视图；不等于归因或投资建议。", "Free aggregate view; not attribution or investment advice."),
  attribution: entry("attribution", "归因详情", "Attribution", "将窗口与合格来源进行可审计匹配；找不到合格证据时为未归因。", "Auditable matching of windows to qualified sources; no qualified match is unattributed."),
  time_evidence_chain: entry("time_evidence_chain", "时间证据链", "Time Evidence Chain", "展示成交、市场变化和来源时间关系；时间先后不证明因果。", "Shows trade, market-change, and source timing; order does not prove causality."),
  repricing_window: entry("repricing_window", "重定价窗口", "Repricing Window", "按既定规则计算的市场变化区间，不是交易建议。", "Market-change interval calculated by defined rules; not a trading recommendation."),
  language_window: entry("language_window", "语言时间窗", "Language Window", "语言来源时间证据的区间模型；不表示任何人的语言能力或内幕来源。", "Interval model for language-source timing evidence; not language ability or privileged access."),
  documented_language_window: entry("documented_language_window", "已记录语言时间窗", "Documented Language Window", "成交时间落在已验证的本地语言来源与英文来源时间区间之间；不推断钱包持有人会某种语言。", "Trade time falls between verified local-language and English-source intervals; does not infer that a wallet holder speaks a language."),
  unattributed: entry("unattributed", "未归因", "Unattributed", "当前检索范围内未找到合格证据；不表示不存在公开信息。", "No qualified evidence within the current retrieval scope; not proof that no public information exists."),
  insufficient_evidence: entry("insufficient_evidence", "证据不足", "Insufficient Evidence", "覆盖率或证据质量不足；不补齐、不猜测。", "Coverage or evidence quality is insufficient; no completion or guess is made."),
  indeterminate: entry("indeterminate", "不确定", "Indeterminate", "时间区间重叠、校准不足或证据无法区分时使用；不输出方向性结论。", "Used when intervals overlap, calibration is insufficient, or evidence cannot distinguish an order; no directional conclusion."),
  data_status: entry("data_status", "数据状态", "Data Status", "描述 recorded、live、synthetic 等状态，不保证真实性。", "Identifies recorded, live, or synthetic state; not a truth guarantee."),
  live: entry("live", "实时", "Live", "只在实际实时 contract 成立时显示。", "Shown only when the actual live contract is satisfied."),
  recorded: entry("recorded", "已记录", "Recorded", "来自可复现数据或 fixture；必须标记且不得冒充 live。", "From reproducible data or fixtures; must be labeled and never presented as live."),
  synthetic: entry("synthetic", "合成", "Synthetic", "测试或演示生成的数据；禁止进入用户 Demo。", "Test or demo-generated data; prohibited from user demos."),
  cached: entry("cached", "缓存", "Cached", "来自缓存的数据状态；不等于实时或已验证。", "Data served from a cache; not equivalent to live or verified."),
  cluster: entry("cluster", "集群", "Cluster", "满足既定维度规则的交易集合；不表示内幕、操纵或共同控制。", "Trade-member set satisfying defined dimensions; not insider activity, manipulation, or common control."),
  same_side_ratio: entry("same_side_ratio", "同向比例", "Same-side Ratio", "符合候选条件的 BUY 进场记录中，占比最高的 YES 或 NO outcome 比例。SELL 仅作为上下文，不进入该指标。该指标不证明协调、因果或内幕行为。", "The highest YES-or-NO outcome share among eligible BUY entry records. SELL records are context only and are excluded from this metric. The metric does not establish coordination, causality, or insider activity."),
  time_concentration: entry("time_concentration", "时间集中度", "Time Concentration", "按既定时间离散度规则衡量交易是否集中；不是协同或因果证据。", "Measures temporal concentration under the defined dispersion rule; not coordination or causality evidence."),
  median_profile_age_days: entry("median_profile_age_days", "中位资料年龄", "Median Profile Age", "依据 public profile 的 createdAt 到代表性成交时间计算。unknown 成员不进入中位数；必须显示 coverage 与 unknown 数量。不得称账户、钱包或链上地址年龄。", "Measured from public profile createdAt to representative trade time. Unknown members are excluded; coverage and unknown count must be shown. Never call it account, wallet, or on-chain address age."),
  first_trade_ratio: entry("first_trade_ratio", "交易历史稀薄度", "Thin-History Ratio", "兼容内部字段名 first_trade_ratio；截至 as-of cutoff，历史成交笔数小于等于 2 的 eligible BUY 成员比例。unknown history 不进入分子或分母；必须显示 coverage；不得称首次交易比例。", "Compatibility field first_trade_ratio; eligible BUY-member share with at most two historical trades as of the cutoff. Unknown history is excluded from numerator and denominator; coverage must be shown. Do not call it a first-trade ratio."),
  entry_price_dispersion: entry("entry_price_dispersion", "入场价格离散度", "Entry-price Dispersion", "按既定价格变换与离散规则衡量入场价格差异；不是收益预测。", "Measures entry-price differences under defined rules; not a return forecast."),
  market_novelty_ratio: entry("market_novelty_ratio", "市场陌生度比例", "Market Novelty Ratio", "eligible 成员中此前没有在该市场交易的比例；内部 API 字段保持 market_familiarity_ratio，不得写成越高越熟悉。", "Share of eligible members with no prior trade in the market; internal field remains market_familiarity_ratio. Never say higher means more familiar."),
  herding_pattern: entry("herding_pattern", "跟随模式", "Herding Pattern", "满足既定跟随特征规则的结果，并作为否决门；不指控抄袭、操纵或共同控制。", "Result of the defined following-pattern rule and veto gate; not an accusation of copying, manipulation, or common control."),
  confidence: entry("confidence", "置信度", "Confidence", "当前数据覆盖和证据质量等级；不表示投资成功概率。", "Grade of current data coverage and evidence quality; not investment success probability."),
  timestamp_uncertainty: entry("timestamp_uncertainty", "时间戳不确定性", "Timestamp Uncertainty", "至少 30 个样本的绝对误差 P95；样本不足为 unknown，不使用中位数作为安全边界。", "P95 absolute error from at least 30 samples; unknown when insufficient, and median is not a safety bound."),
  x402: entry("x402", "x402 支付协议", "x402", "HTTP 402 保护资源的支付协议边界；UI 不接收或显示私钥。", "Payment boundary for HTTP 402 protected resources; the UI never accepts or displays private keys."),
  payment_required: entry("payment_required", "需要付款", "Payment Required", "资源需要现有 x402 V2 challenge；不表示付款成功，也不执行支付。", "Resource requires the existing x402 V2 challenge; does not mean payment succeeded and performs no payment."),
  base_sepolia: entry("base_sepolia", "Base Sepolia", "Base Sepolia", "现有测试网标识 eip155:84532。", "Existing test-network identifier eip155:84532."),
  mcp: entry("mcp", "MCP", "MCP", "工具和审计入口协议名；不改变权限或结果。", "Protocol name for tool and audit entry points; does not change permissions or results."),
  erc8004: entry("erc8004", "ERC-8004", "ERC-8004", "既有身份／代理协议边界；不增加身份或能力证明。", "Existing identity/agent protocol boundary; does not add proof of identity or capability."),
  provider_unavailable: entry("provider_unavailable", "Provider 不可用", "Provider Unavailable", "分析 provider 无法提供结果；保持 unavailable。", "The analysis provider cannot provide a result; retain unavailable."),
  upstream_unavailable: entry("upstream_unavailable", "上游不可用", "Upstream Unavailable", "外部来源不可用或未返回合格数据；不生成虚假 recorded 响应。", "External source is unavailable or returned no qualified data; do not fabricate a recorded response."),
  unavailable: entry("unavailable", "不可用", "Unavailable", "当前可信 payload 没有提供可安全显示的结果；不补算、不补零。", "The trusted payload does not provide a result that can be safely displayed; no client-side calculation or zero fill."),
  loading: entry("loading", "加载中", "Loading", "请求或审计仍在进行；不把中间状态当作结果。", "A request or audit is in progress; an intermediate state is not a result."),
  empty: entry("empty", "暂无数据", "Empty", "当前响应没有可显示记录；不生成 synthetic 内容。", "The current response has no displayable records; synthetic content is not generated."),
  success: entry("success", "成功", "Success", "请求返回可显示结果；仍需查看 data_status、覆盖率和限制。", "A request returned a displayable result; data_status, coverage, and limitations still apply."),
  error: entry("error", "错误", "Error", "请求失败或响应不可用；不会把错误当作证据。", "The request failed or the response is unavailable; an error is not evidence."),
  payment_invalid: entry("payment_invalid", "付款无法验证", "Payment Could Not Be Verified", "x402 payment payload 未通过验证；不表示付款成功。", "The x402 payment payload was not verified; this does not mean payment succeeded."),
  timeout: entry("timeout", "请求超时", "Request Timed Out", "请求在允许时间内未完成；不生成补造结果。", "The request did not complete within the allowed time; no fabricated result is generated."),
  unsupported_language: entry("unsupported_language", "不支持的语言", "Unsupported Language", "来源语言不在已验证范围；保留原文和语言标签。", "Source language is outside the verified set; preserve original text and language label."),
  cluster_without_verified_source: entry("cluster_without_verified_source", "无已验证信源的集群", "Cluster Without Verified Source", "集群规则成立但当前没有合格公开来源；不称内幕集群或协同操纵。", "Cluster rules pass but no qualified public source is found; do not call it an insider cluster or coordinated manipulation."),
} satisfies Record<BaseTermId, GlossaryEntry>;

const agent = (id: ConsoleTermId, zh: string, en: string, zhDef: string, enDef: string) => entry(id, zh, en, zhDef, enDef, "这是运行角色说明，不是身份、能力、风险或投资判断。", "This describes a runtime role, not identity, capability, risk, or investment judgment.");
const metric = (id: ConsoleTermId, zh: string, en: string, zhDef: string, enDef: string) => entry(id, zh, en, zhDef, enDef, "数值缺失或 n/a 不得被补算为 0。", "Missing or n/a values must not be filled or interpreted as zero.");
const state = (id: ConsoleTermId, zh: string, en: string, zhDef: string, enDef: string) => entry(id, zh, en, zhDef, enDef, "状态不构成法律判断、投资评级或对用户的指责。", "A state is not a legal judgment, investment rating, or user blame.");
const flag = (id: ConsoleTermId, value: string, zhDef: string, enDef: string) => entry(id, value, value, zhDef, enDef, "Policy flag 是机器可读限制，不是违法认定或投资评级。", "A policy flag is a machine-readable limitation, not a legal finding or investment rating.");

const consoleGlossary = {
  agent_evidence: agent("agent_evidence", "证据代理", "Evidence Agent", "负责证据检索与验证编排。", "Coordinates evidence retrieval and validation."),
  agent_attribution: agent("agent_attribution", "归因代理", "Attribution Agent", "负责时间对齐与有限归因状态编排。", "Coordinates temporal alignment and bounded attribution states."),
  agent_quality_risk: agent("agent_quality_risk", "质量风险代理", "Quality-Risk Agent", "负责覆盖、质量和限制检查。", "Checks coverage, quality, and limitations."),
  agent_audit_report: agent("agent_audit_report", "审计报告代理", "Audit-Report Agent", "记录运行事件、状态和可导出的审计报告。", "Records run events, states, and exportable audit reports."),
  worker_input: agent("worker_input", "输入处理 Worker", "Input Worker", "接收并规范化市场 URL、Profile URL、钱包地址或其他已支持输入，检查格式和支持范围；不负责归因，也不判断交易质量。", "Receives and normalizes supported market URLs, profile URLs, wallet addresses, or other supported inputs and validates format and scope; it does not perform attribution or judge trade quality."),
  worker_market_data: agent("worker_market_data", "市场数据 Worker", "Market-Data Worker", "读取和规范化 Polymarket 市场、交易及价格数据。", "Reads and normalizes Polymarket market, trade, and price data."),
  worker_repricing: agent("worker_repricing", "重定价 Worker", "Repricing Worker", "按照确定性阈值检测价格变化窗口；不预测未来价格，也不证明新闻导致价格变化。", "Detects price-change windows using deterministic thresholds; it does not predict future prices or prove news caused a move."),
  worker_evidence: agent("worker_evidence", "证据 Worker", "Evidence Worker", "检索并验证公开信源 URL、来源语言和时间戳；insufficient 表示合格证据不足。", "Retrieves and validates public-source URLs, languages, and timestamps; insufficient means qualified evidence is lacking."),
  worker_attribution: agent("worker_attribution", "归因 Worker", "Attribution Worker", "对交易、公开信源和重定价窗口进行时间对齐，并输出有限状态或弃权；不判断内幕、身份或主观意图。", "Aligns trades, public sources, and repricing windows and emits bounded states or abstention; it does not judge insider status, identity, or intent."),
  worker_wallet_analysis: agent("worker_wallet_analysis", "钱包分析 Worker", "Wallet-Analysis Worker", "计算受支持的钱包交易覆盖和指标，覆盖不足时保持 insufficient。", "Computes supported wallet-trade coverage and metrics, retaining insufficient when coverage is inadequate."),
  worker_policy_verification: agent("worker_policy_verification", "策略核验 Worker", "Policy-Verification Worker", "检查数据覆盖、时间不确定性、证据限制和输出政策。", "Checks data coverage, timestamp uncertainty, evidence limitations, and output policy."),
  worker_report: agent("worker_report", "报告 Worker", "Report Worker", "组装当前运行可导出的报告，不改变分析结果。", "Assembles the exportable report for the current run without changing analysis results."),
  worker_payment: agent("worker_payment", "支付 Worker", "Payment Worker", "记录受保护详情的支付边界和请求状态；不代表付款成功。", "Records the payment boundary and request state for protected detail; it does not mean payment succeeded."),
  metric_status: metric("metric_status", "状态", "Status", "当前 Agent 或 Worker 的运行状态；insufficient 不等于 failed。", "Current Agent or Worker execution state; insufficient is not failed."),
  metric_data_status: metric("metric_data_status", "数据状态", "Data Status", "当前 Worker 使用的 recorded、live、synthetic 或 cached 状态。", "The recorded, live, synthetic, or cached state used by the Worker."),
  worker_events: metric("worker_events", "审计事件", "Audit Events", "该 Worker 产生或记录的审计事件数量，不是市场事件数量。", "The number of audit events recorded by this Worker, not the number of market events."),
  worker_latency: metric("worker_latency", "本地耗时", "Local Latency", "该 Worker 的本地处理 duration_ms，不是信源发布延迟、网络总延迟或市场反应时间。", "The Worker's local processing duration_ms, not source publication delay, total network latency, or market reaction time."),
  worker_retries: metric("worker_retries", "重试", "Retries", "该 Worker 本次运行中的重试次数，不是累计历史次数。", "Retries during this Worker run, not a historical cumulative count."),
  worker_errors: metric("worker_errors", "错误", "Errors", "该 Worker 记录的终态 error_code；无错误不保证上游数据完整。", "The Worker's terminal error_code; no recorded error does not guarantee complete upstream data."),
  metric_policy_flags: metric("metric_policy_flags", "policy_flags", "policy_flags", "机器可读的运行限制、数据状态或安全标记，不是违规认定、法律判断或投资风险评分。", "Machine-readable run limitations, data states, or safety markers; not violation findings, legal judgments, or investment risk scores."),
  metric_run_id: metric("metric_run_id", "运行编号", "Run ID", "当前审计运行的标识符，用于关联观察结果。", "Identifier for the current audit run used to associate observations."),
  metric_limitations: metric("metric_limitations", "限制", "Limitations", "当前 Worker 或运行的已知限制，不是投资评级。", "Known limitations of the Worker or run, not an investment rating."),
  worker_input_sources: metric("worker_input_sources", "输入来源项", "Input Source Items", "输入 Worker 的 source_count=1 表示一个已解析或规范化的输入项，不是新闻条数。", "Input Worker's source_count=1 represents one parsed or normalized input item, not a news count."),
  worker_market_data_sources: metric("worker_market_data_sources", "市场数据来源状态", "Market-Data Source Status", "市场数据 Worker 的 source_count 是 bundle.source_status.length，即来源状态或连接器条目数，不是交易记录数。", "Market-data source_count is bundle.source_status.length: source-status or connector entries, not trade-record count."),
  worker_repricing_windows: metric("worker_repricing_windows", "重定价窗口数", "Repricing Windows", "重定价 Worker 的终态 source_count 是 windows.length，即检测到的重定价窗口数，不是信源数量。", "Repricing Worker's terminal source_count is windows.length: detected repricing windows, not source count."),
  worker_evidence_sources: metric("worker_evidence_sources", "有效证据记录", "Valid Evidence Records", "证据 Worker 的终态 source_count 是 evidenceValidation.valid.length，即接受的有效证据记录数，不是候选 URL 总数。", "Evidence Worker's terminal source_count is evidenceValidation.valid.length: accepted evidence records, not total candidate URLs."),
  worker_attribution_windows: metric("worker_attribution_windows", "归因窗口数", "Attribution Windows", "归因 Worker 的终态 source_count 是 attribution.windows.length，即归因窗口数，不是证据来源数。", "Attribution Worker's terminal source_count is attribution.windows.length: attribution windows, not evidence-source count."),
  worker_wallet_observed_trades: metric("worker_wallet_observed_trades", "观察到的交易数", "Observed Trades", "钱包分析 Worker 的 source_count 是 observed_trades，即其处理范围内观察到的交易数。", "Wallet-analysis source_count is observed_trades: trades observed within its processing scope."),
  worker_policy_attributed_windows: metric("worker_policy_attributed_windows", "已归因窗口数", "Attributed Windows", "策略核验 Worker 的 source_count 是 withAttribution.windows.length，即检查的已归因窗口数。", "Policy-verification source_count is withAttribution.windows.length: attributed windows checked."),
  worker_report_markets: metric("worker_report_markets", "报告市场数", "Reported Markets", "报告 Worker 的 source_count 是 bundle.markets.length，即处理的市场数。", "Report Worker's source_count is bundle.markets.length: markets processed."),
  worker_payment_sources: metric("worker_payment_sources", "支付来源数", "Payment Sources", "支付 Worker 没有适用的 source_count；n/a 表示不适用，不伪造计数。", "Payment Worker has no applicable source_count; n/a means not applicable and is not fabricated."),
  worker_input_coverage: metric("worker_input_coverage", "输入覆盖率", "Input Coverage", "输入 Worker 的 coverage 只有在 contract 提供时才显示；不适用时为 n/a。", "Input coverage is shown only when provided by the contract; otherwise it is n/a."),
  worker_market_data_coverage: metric("worker_market_data_coverage", "市场数据覆盖率", "Market-Data Coverage", "市场数据 Worker 的覆盖率仅按实际 contract 的可评估市场数据范围解释。", "Market-data coverage is interpreted only against the contract's evaluable market-data scope."),
  worker_repricing_coverage: metric("worker_repricing_coverage", "重定价覆盖率", "Repricing Coverage", "重定价 Worker 的覆盖率仅在 contract 提供窗口可评估范围时显示。", "Repricing coverage is shown only when the contract provides an evaluable-window basis."),
  worker_evidence_coverage: metric("worker_evidence_coverage", "证据覆盖率", "Evidence Coverage", "证据 Worker 的覆盖率表示证据可验证范围，不等于公开信息不存在。", "Evidence coverage is the verifiable evidence scope, not proof that public information does not exist."),
  worker_attribution_coverage: metric("worker_attribution_coverage", "归因覆盖率", "Attribution Coverage", "归因 Worker 的覆盖率表示归因窗口的可评估范围。", "Attribution coverage is the evaluable scope of attribution windows."),
  worker_wallet_analysis_coverage: metric("worker_wallet_analysis_coverage", "钱包对齐覆盖率", "Wallet-Alignment Coverage", "钱包分析 Worker 的 coverage 是钱包对齐覆盖率；分母按 eligible wallet records 确定，unknown 不补为 0。", "Wallet-analysis coverage is wallet-alignment coverage; its denominator is defined by eligible wallet records, and unknown is not filled as zero."),
  worker_policy_verification_coverage: metric("worker_policy_verification_coverage", "策略核验覆盖率", "Policy-Verification Coverage", "策略核验 Worker 使用 wallet coverage；不适用时为 n/a。", "Policy-verification uses wallet coverage; it is n/a when not applicable."),
  worker_report_coverage: metric("worker_report_coverage", "报告覆盖率", "Report Coverage", "报告 Worker 的覆盖率仅按报告 contract 的可评估范围解释。", "Report coverage is interpreted only against the report contract's evaluable scope."),
  worker_payment_coverage: metric("worker_payment_coverage", "支付覆盖率", "Payment Coverage", "支付 Worker 没有适用 coverage；n/a 不等于 0%。", "Payment Worker has no applicable coverage; n/a does not mean 0%."),
  worker_input_cost: metric("worker_input_cost", "输入成本", "Input Cost", "输入 Worker 的被追踪外部调用成本；未追踪时为 n/a，不表示免费。", "Tracked external-call cost for Input; n/a when untracked, not a claim of free service."),
  worker_market_data_cost: metric("worker_market_data_cost", "市场数据成本", "Market-Data Cost", "市场数据 Worker 的被追踪 provider/API 成本，不是产品价格。", "Tracked provider/API cost for Market-Data, not product price."),
  worker_repricing_cost: metric("worker_repricing_cost", "重定价成本", "Repricing Cost", "重定价 Worker 的被追踪外部调用成本；通常不适用。", "Tracked external-call cost for Repricing; usually not applicable."),
  worker_evidence_cost: metric("worker_evidence_cost", "证据成本", "Evidence Cost", "证据 Worker 的被追踪信源/API 成本，不是证据价值评级。", "Tracked source/API cost for Evidence, not a value rating for evidence."),
  worker_attribution_cost: metric("worker_attribution_cost", "归因调用成本", "Attribution Call Cost", "归因 Worker 本次被追踪的 provider/API/模型成本，不是 0.01 USDC 支付金额。", "Tracked provider/API/model cost for Attribution, not the 0.01 USDC payment amount."),
  worker_wallet_analysis_cost: metric("worker_wallet_analysis_cost", "钱包分析成本", "Wallet-Analysis Cost", "钱包分析 Worker 的被追踪外部调用成本；未追踪时为 n/a。", "Tracked external-call cost for Wallet-Analysis; n/a when untracked."),
  worker_policy_verification_cost: metric("worker_policy_verification_cost", "策略核验成本", "Policy-Verification Cost", "策略核验 Worker 的被追踪调用成本；n/a 不等于免费。", "Tracked call cost for Policy-Verification; n/a is not equivalent to free."),
  worker_report_cost: metric("worker_report_cost", "报告成本", "Report Cost", "报告 Worker 的被追踪组装或外部调用成本，不是报告质量。", "Tracked assembly or external-call cost for Report, not report quality."),
  worker_payment_cost: metric("worker_payment_cost", "支付成本", "Payment Cost", "支付 Worker 的成本字段在不适用时为 n/a；不表示付款成功或免费。", "Payment cost is n/a when not applicable; this does not mean payment succeeded or was free."),
  worker_total_tracked_cost: metric("worker_total_tracked_cost", "已追踪总成本", "Total Tracked Cost", "审计报告汇总的实际非 start 事件 cost_usd 之和；n/a 表示未追踪或不适用。", "Sum of actual non-start event cost_usd values in the audit report; n/a means untracked or not applicable."),
  status_pending: state("status_pending", "待处理", "Pending", "任务已登记但尚未完成。", "The task is registered but not complete."),
  status_running: state("status_running", "运行中", "Running", "任务正在执行。", "The task is executing."),
  status_ok: state("status_ok", "正常", "OK", "该 Worker 完成且没有记录阻断错误。", "The Worker completed without a recorded blocking error."),
  status_blocked: state("status_blocked", "受阻", "Blocked", "该 Worker 受到已记录的阻断条件影响。", "The Worker is affected by a recorded blocking condition."),
  status_failed: state("status_failed", "失败", "Failed", "该 Worker 记录了执行失败；这不是证据结论。", "The Worker recorded an execution failure; this is not an evidence conclusion."),
  status_insufficient: state("status_insufficient", "不足", "Insufficient", "证据或覆盖不足，不能安全完成相关判断；不等于执行失败。", "Evidence or coverage is insufficient for a safe result; it is not execution failure."),
  status_skipped: state("status_skipped", "跳过", "Skipped", "该 Worker 在当前运行中未被请求或不适用。", "The Worker was not requested or is not applicable in this run."),
  status_completed: state("status_completed", "已完成", "Completed", "审计运行已完成。", "The audit run completed."),
  status_partial: state("status_partial", "部分完成", "Partial", "审计运行仅部分步骤完成，限制仍适用。", "Only part of the audit run completed; limitations still apply."),
  value_na: state("value_na", "不适用", "n/a", "该指标不适用于当前 Worker 或无法计算；不等于 0，也不等于免费。", "The metric is not applicable or cannot be computed for this Worker; it is not zero or free."),
  value_none: state("value_none", "无", "none", "本次没有记录该值或错误；不保证上游数据完整。", "No value or error was recorded for this run; upstream completeness is not guaranteed."),
  flag_coverage_below_gate: flag("flag_coverage_below_gate", "coverage_below_gate", "覆盖率低于门槛的机器标记。", "Machine flag indicating coverage is below the gate."),
  flag_unattributed: flag("flag_unattributed", "unattributed", "当前检索范围内没有合格归因。", "No qualified attribution was found within the retrieval scope."),
  flag_payment_required: flag("flag_payment_required", "payment_required", "资源需要现有支付 challenge。", "The resource requires the existing payment challenge."),
  flag_credentials_missing: flag("flag_credentials_missing", "credentials_missing", "所需凭据缺失，相关路径保持不可用。", "Required credentials are missing; the affected path remains unavailable."),
  flag_not_requested: flag("flag_not_requested", "not_requested", "该能力未在本次运行中请求。", "The capability was not requested in this run."),
  flag_no_verified_evidence: flag("flag_no_verified_evidence", "no_verified_evidence", "当前范围内没有合格已验证证据。", "No qualified verified evidence was found in the current scope."),
  flag_recorded_replay: flag("flag_recorded_replay", "recorded_replay", "本次运行使用已记录回放。", "This run uses recorded replay."),
  flag_synthetic_test: flag("flag_synthetic_test", "synthetic_test", "这是隔离测试标记，不能进入用户 Demo。", "This is an isolated test flag and must not enter a user demo."),
  flag_audit_partial: flag("flag_audit_partial", "audit_partial", "审计记录仅部分完成。", "The audit record is only partially complete."),
  flag_rag_degraded: flag("flag_rag_degraded", "rag_degraded", "RAG 能力降级；不代表证据不存在。", "RAG capability is degraded; this does not mean evidence does not exist."),
  flag_database_unavailable: flag("flag_database_unavailable", "database_unavailable", "数据库不可用，相关数据范围受限。", "The database is unavailable and the affected data scope is limited."),
  flag_provider_unavailable: flag("flag_provider_unavailable", "provider_unavailable", "分析 provider 不可用。", "The analysis provider is unavailable."),
  flag_stale_data: flag("flag_stale_data", "stale_data", "数据可能超过当前 freshness 边界。", "Data may be outside the current freshness boundary."),
  flag_not_enabled: flag("flag_not_enabled", "not_enabled", "该能力在当前环境未启用。", "The capability is not enabled in the current environment."),
  flag_live_unverified: flag("flag_live_unverified", "live_unverified", "实时数据尚未完成验证。", "Live data has not completed verification."),
} satisfies Record<ConsoleTermId, GlossaryEntry>;

export const GLOSSARY: Record<TermId, GlossaryEntry> = { ...baseGlossary, ...consoleGlossary };

export const PLATFORM_AGENT_TERM_IDS = {
  evidence: "agent_evidence", attribution: "agent_attribution", "quality-risk": "agent_quality_risk", "audit-report": "agent_audit_report",
} as const;
export const WORKER_TERM_IDS = {
  input: "worker_input", "market-data": "worker_market_data", repricing: "worker_repricing", evidence: "worker_evidence", attribution: "worker_attribution", "wallet-analysis": "worker_wallet_analysis", "policy-verification": "worker_policy_verification", report: "worker_report", payment: "worker_payment",
} as const;
export const WORKER_METRIC_TERM_IDS = {
  input: { sources: "worker_input_sources", coverage: "worker_input_coverage", cost: "worker_input_cost" },
  "market-data": { sources: "worker_market_data_sources", coverage: "worker_market_data_coverage", cost: "worker_market_data_cost" },
  repricing: { sources: "worker_repricing_windows", coverage: "worker_repricing_coverage", cost: "worker_repricing_cost" },
  evidence: { sources: "worker_evidence_sources", coverage: "worker_evidence_coverage", cost: "worker_evidence_cost" },
  attribution: { sources: "worker_attribution_windows", coverage: "worker_attribution_coverage", cost: "worker_attribution_cost" },
  "wallet-analysis": { sources: "worker_wallet_observed_trades", coverage: "worker_wallet_analysis_coverage", cost: "worker_wallet_analysis_cost" },
  "policy-verification": { sources: "worker_policy_attributed_windows", coverage: "worker_policy_verification_coverage", cost: "worker_policy_verification_cost" },
  report: { sources: "worker_report_markets", coverage: "worker_report_coverage", cost: "worker_report_cost" },
  payment: { sources: "worker_payment_sources", coverage: "worker_payment_coverage", cost: "worker_payment_cost" },
} as const;

export const CONSOLE_VISIBLE_TERM_IDS: readonly TermId[] = [
  ...Object.values(PLATFORM_AGENT_TERM_IDS), ...Object.values(WORKER_TERM_IDS),
  "metric_status", "metric_data_status", "worker_events", "worker_latency", "worker_retries", "worker_errors", "metric_policy_flags", "metric_run_id", "metric_limitations",
  ...Object.values(WORKER_METRIC_TERM_IDS).flatMap((terms) => Object.values(terms)), "worker_total_tracked_cost",
  "status_pending", "status_running", "status_ok", "status_blocked", "status_failed", "status_insufficient", "status_skipped", "status_completed", "status_partial", "value_na", "value_none",
  "flag_coverage_below_gate", "flag_unattributed", "flag_payment_required", "flag_credentials_missing", "flag_not_requested", "flag_no_verified_evidence", "flag_recorded_replay", "flag_synthetic_test", "flag_audit_partial", "flag_rag_degraded", "flag_database_unavailable", "flag_provider_unavailable", "flag_stale_data", "flag_not_enabled", "flag_live_unverified",
];

export function glossaryEntry(termId: TermId): GlossaryEntry { return GLOSSARY[termId]; }
export function glossaryLabel(termId: TermId, locale: Locale): string { return glossaryEntry(termId).label[locale]; }
export function pendingDefinitionCount(): number { return Object.values(GLOSSARY).filter((item) => item.display === "pending_definition").length; }

export function workerMetricTermId(workerId: keyof typeof WORKER_METRIC_TERM_IDS, metricName: "sources" | "coverage" | "cost"): TermId {
  return WORKER_METRIC_TERM_IDS[workerId][metricName];
}

export function statusTermId(value: string): TermId {
  const map: Record<string, ConsoleTermId> = { pending: "status_pending", running: "status_running", ok: "status_ok", blocked: "status_blocked", failed: "status_failed", insufficient: "status_insufficient", skipped: "status_skipped", completed: "status_completed", partial: "status_partial", "n/a": "value_na", none: "value_none" };
  return map[value] ?? "error";
}

export function policyFlagTermId(value: string): TermId {
  return ("flag_" + value) in GLOSSARY ? ("flag_" + value) as ConsoleTermId : "error";
}

export function coverageReport(termIds: readonly TermId[] = CONSOLE_VISIBLE_TERM_IDS) {
  const unique = [...new Set(termIds)];
  const duplicate_term_ids = termIds.filter((id, index) => termIds.indexOf(id) !== index);
  const unmapped_terms = unique.filter((id) => !GLOSSARY[id] || GLOSSARY[id].display === "pending_definition");
  const mapped_terms = unique.filter((id) => Boolean(GLOSSARY[id]) && GLOSSARY[id].display === "approved");
  return { visible_terms: unique, mapped_terms, unmapped_terms, duplicate_term_ids: [...new Set(duplicate_term_ids)], pending_definition: pendingDefinitionCount(), coverage_percentage: unique.length === 0 ? 0 : Math.round(mapped_terms.length / unique.length * 100), status: unmapped_terms.length === 0 && duplicate_term_ids.length === 0 && pendingDefinitionCount() === 0 ? "PASS" : "FAIL" as const };
}
