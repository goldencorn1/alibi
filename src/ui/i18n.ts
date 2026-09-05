export const LOCALE_COOKIE = "alibi_locale";
export const SUPPORTED_LOCALES = ["zh-CN", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh-CN";

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "en" || value === "zh-CN" ? value : DEFAULT_LOCALE;
}

export type UiKey =
  | "eyebrow"
  | "taglineLead"
  | "taglineAccent"
  | "intro"
  | "metadataTitle"
  | "metadataDescription"
  | "sessionRequestCount"
  | "recordedEvidenceFeed"
  | "livePreviewUnavailable"
  | "noRecordedAnalysis"
  | "runAnalyze"
  | "panelTitle"
  | "panelAria"
  | "readOnly"
  | "recordedReport"
  | "recordedApi"
  | "guiDescription"
  | "cliPayload"
  | "cliDescription"
  | "legacyQuery"
  | "inputLabel"
  | "inputPlaceholder"
  | "analyze"
  | "dataMode"
  | "recordedReplay"
  | "liveReadOnly"
  | "presetAria"
  | "presetDescription"
  | "recordedOnly"
  | "noSyntheticMetrics"
  | "ready"
  | "loading"
  | "error"
  | "insufficient"
  | "unattributed"
  | "paymentRequired"
  | "indeterminate"
  | "success"
  | "retry"
  | "summary"
  | "freeSummary"
  | "markets"
  | "coverage"
  | "repricingWindows"
  | "noResults"
  | "noResultsDetail"
  | "insufficientDetail"
  | "unattributedDetail"
  | "successDetail"
  | "requestDetail"
  | "freeUnattributed"
  | "noVerifiedAttribution"
  | "baseSepoliaExact"
  | "evidenceOnly"
  | "clusterLanguage"
  | "noClusterAlert"
  | "noClusterAlertDetail"
  | "addressCount"
  | "dominantOutcome"
  | "languageWindow"
  | "noLanguageWindow"
  | "pairing"
  | "walletRelations"
  | "cutoff"
  | "precision"
  | "uncertainty"
  | "evidenceDisclaimer"
  | "detailProtected"
  | "paymentInstructions"
  | "oneTimePayload"
  | "payloadPlaceholder"
  | "retryDetail"
  | "challengeStatus"
  | "freeUnattributedDetail"
  | "paidDetail"
  | "windows"
  | "evidenceRecords"
  | "agentConsole"
  | "runTelemetry"
  | "observation"
  | "noSecrets"
  | "collapse"
  | "expand"
  | "runStatus"
  | "dataStatus"
  | "events"
  | "cost"
  | "duration"
  | "sources"
  | "retryLabel"
  | "errorField"
  | "none"
  | "policyFlags"
  | "limitations"
  | "exportJson"
  | "exportMarkdown"
  | "disclaimer"
  | "languageToggle"
  | "explainTerm"
  | "originalEnglish"
  | "originalChinese"
  | "providerUnavailable"
  | "upstreamUnavailable"
  | "paymentInvalid"
  | "timeout"
  | "databaseUnavailable";

export type UiDictionary = Record<UiKey, string>;

const EN: UiDictionary = {
  eyebrow: "PREDICTION MARKET TRUST AGENT",
  taglineLead: "Every wallet has a story.",
  taglineAccent: "Alibi checks the timestamps.",
  intro: "Read-only analysis of Polymarket repricing timelines and public trades. Evidence, coverage, and limitations are shown without buy/sell direction or causal claims.",
  metadataTitle: "Alibi — Timestamp Trust Agent",
  metadataDescription: "Read-only Polymarket repricing and wallet evidence timeline.",
  sessionRequestCount: "Session request count",
  recordedEvidenceFeed: "Recorded evidence feed",
  livePreviewUnavailable: "Recorded preview is unavailable while live mode is selected.",
  noRecordedAnalysis: "No recorded analysis loaded. Run Analyze to populate this feed.",
  runAnalyze: "Run Analyze",
  panelTitle: "One event · three exits",
  panelAria: "Analysis output panels",
  readOnly: "read-only",
  recordedReport: "Recorded report",
  recordedApi: "recorded API",
  guiDescription: "GUI shows only the current recorded API response; it does not invent notifications.",
  cliPayload: "Recorded API payload",
  cliDescription: "CLI mirrors the recorded API payload and keeps payment and audit details observable.",
  legacyQuery: "Actual legacy API query",
  inputLabel: "MARKET / PROFILE / 0x ADDRESS",
  inputPlaceholder: "Paste a Polymarket market URL, profile URL or 0x address",
  analyze: "Analyze",
  dataMode: "Data mode",
  recordedReplay: "recorded replay",
  liveReadOnly: "live read-only",
  presetAria: "Recorded demo presets",
  presetDescription: "Presets use the current recorded API fixtures. Synthetic fixtures are never exposed here.",
  recordedOnly: "Recorded data only",
  noSyntheticMetrics: "no synthetic demo metrics",
  ready: "Ready",
  loading: "Loading",
  error: "Error",
  insufficient: "Insufficient data",
  unattributed: "Unattributed",
  paymentRequired: "Payment required",
  indeterminate: "Indeterminate timing",
  success: "Success",
  retry: "Retry request",
  summary: "Summary",
  freeSummary: "Free Summary",
  markets: "Markets",
  coverage: "Coverage",
  repricingWindows: "repricing windows",
  noResults: "No results",
  noResultsDetail: "The recorded API returned no repricing windows or evidence for this input.",
  insufficientDetail: "Evidence is insufficient to infer ability or information advantage. No timing lead is reported below the coverage gate.",
  unattributedDetail: "No qualified verifiable source supports these windows within the current retrieval scope. Timing order is not causality.",
  successDetail: "Recorded API response ready. No synthetic metrics are shown.",
  requestDetail: "Request Detail",
  freeUnattributed: "Free (unattributed)",
  noVerifiedAttribution: "No verified attribution is available; no payment is requested.",
  baseSepoliaExact: "Base Sepolia · eip155:84532 · exact",
  evidenceOnly: "Evidence-only analysis",
  clusterLanguage: "Cluster and language evidence",
  noClusterAlert: "No cluster alert",
  noClusterAlertDetail: "No formal or observational cluster result is available from the current API response. Missing or incomplete evidence remains unknown.",
  addressCount: "Address count",
  dominantOutcome: "dominant outcome",
  languageWindow: "Language window",
  noLanguageWindow: "No documented language window is available from this response.",
  pairing: "Pairing",
  walletRelations: "wallet relations are timestamp placement only",
  cutoff: "cutoff",
  precision: "precision",
  uncertainty: "uncertainty",
  evidenceDisclaimer: "This does not establish identity, coordination, language ability, copying, causality, or trading advice.",
  detailProtected: "Detail is protected by x402 V2",
  paymentInstructions: "A 0.01 USDC payment is required on Base Sepolia (eip155:84532). Use a local testnet signer outside this page to create a one-time payment payload, then paste it here to retry. Alibi does not receive private keys.",
  oneTimePayload: "One-time payment payload",
  payloadPlaceholder: "paste payload; never paste a private key",
  retryDetail: "Retry Detail",
  challengeStatus: "Challenge status",
  freeUnattributedDetail: "No verified attribution is available. This result is free and does not imply causality.",
  paidDetail: "Paid Detail",
  windows: "windows",
  evidenceRecords: "evidence records",
  agentConsole: "Agent Console · Audit & Report Agent",
  runTelemetry: "Run telemetry",
  observation: "observation only",
  noSecrets: "no secrets retained",
  collapse: "Collapse",
  expand: "Expand",
  runStatus: "Run status",
  dataStatus: "Data status",
  events: "Events",
  cost: "Cost",
  duration: "duration",
  sources: "sources",
  retryLabel: "retry",
  errorField: "error",
  none: "none",
  policyFlags: "policy_flags",
  limitations: "Limitations",
  exportJson: "Export JSON",
  exportMarkdown: "Export Markdown",
  disclaimer: "No investment advice; no buy/sell direction; no accusation of any person or entity. Temporal order is not causality, insider information, or a guaranteed information advantage.",
  languageToggle: "Language",
  explainTerm: "Explain",
  originalEnglish: "Original: English",
  originalChinese: "Original: 中文",
  providerUnavailable: "Provider unavailable",
  upstreamUnavailable: "Upstream unavailable",
  paymentInvalid: "Payment could not be verified",
  timeout: "Request timed out",
  databaseUnavailable: "Upstream unavailable",
};

const ZH: UiDictionary = {
  eyebrow: "预测市场可信代理",
  taglineLead: "每个钱包都有一段故事。",
  taglineAccent: "Alibi 检查时间戳。",
  intro: "只读分析 Polymarket 重定价时间线与公开交易记录，展示证据、覆盖率和限制。不输出买卖方向，也不把时间先后写成因果。",
  metadataTitle: "Alibi — 时间戳可信代理",
  metadataDescription: "只读分析 Polymarket 重定价与钱包证据时间线。",
  sessionRequestCount: "本地会话请求次数",
  recordedEvidenceFeed: "已记录证据流",
  livePreviewUnavailable: "当前选择实时模式，已记录预览不可用。",
  noRecordedAnalysis: "尚未加载已记录分析。运行分析后此处会显示结果。",
  runAnalyze: "运行分析",
  panelTitle: "同一个事件 · 三个出口",
  panelAria: "分析输出面板",
  readOnly: "只读",
  recordedReport: "已记录报告",
  recordedApi: "已记录 API",
  guiDescription: "GUI 只显示当前已记录 API 响应，不虚构通知。",
  cliPayload: "已记录 API payload",
  cliDescription: "CLI 镜像已记录 API payload，使支付和审计细节可观察。",
  legacyQuery: "现有 legacy API 查询",
  inputLabel: "市场／资料／0x 地址",
  inputPlaceholder: "粘贴 Polymarket 市场 URL、资料 URL 或 0x 地址",
  analyze: "分析",
  dataMode: "数据模式",
  recordedReplay: "已记录回放",
  liveReadOnly: "实时只读",
  presetAria: "已记录演示预设",
  presetDescription: "预设使用当前已记录 API fixtures；合成 fixtures 不会在此暴露。",
  recordedOnly: "仅已记录数据",
  noSyntheticMetrics: "不含合成演示指标",
  ready: "就绪",
  loading: "加载中",
  error: "错误",
  insufficient: "数据不足",
  unattributed: "未归因",
  paymentRequired: "需要付款",
  indeterminate: "时间不确定",
  success: "成功",
  retry: "重试请求",
  summary: "摘要",
  freeSummary: "免费摘要",
  markets: "市场",
  coverage: "覆盖率",
  repricingWindows: "重定价窗口",
  noResults: "暂无结果",
  noResultsDetail: "已记录 API 没有为该输入返回重定价窗口或证据。",
  insufficientDetail: "证据不足以推断能力或信息优势；低于覆盖率门槛时不报告时间先手。",
  unattributedDetail: "当前检索范围内没有合格可验证来源支持这些窗口；时间先后不等于因果。",
  successDetail: "已记录 API 响应就绪；未显示合成指标。",
  requestDetail: "请求详情",
  freeUnattributed: "免费（未归因）",
  noVerifiedAttribution: "没有可验证归因，不请求付款。",
  baseSepoliaExact: "Base Sepolia · eip155:84532 · exact",
  evidenceOnly: "仅证据分析",
  clusterLanguage: "集群与语言证据",
  noClusterAlert: "无集群警报",
  noClusterAlertDetail: "当前 API 响应没有可用的正式或观察性集群结果。缺失或不完整证据保持 unknown。",
  addressCount: "地址数量",
  dominantOutcome: "主导结果",
  languageWindow: "语言时间窗",
  noLanguageWindow: "该响应没有可用的已记录语言时间窗。",
  pairing: "配对",
  walletRelations: "钱包关系仅表示时间位置",
  cutoff: "截止时间",
  precision: "精度",
  uncertainty: "不确定性",
  evidenceDisclaimer: "这不证明身份、协同、语言能力、抄袭、因果或交易建议。",
  detailProtected: "详情受 x402 V2 保护",
  paymentInstructions: "需要在 Base Sepolia（eip155:84532）支付 0.01 USDC。请在页面外使用本地测试网 signer 生成一次性 payment payload，再粘贴到此处重试。Alibi 不接收私钥。",
  oneTimePayload: "一次性 payment payload",
  payloadPlaceholder: "粘贴 payload；绝不要粘贴私钥",
  retryDetail: "重试详情",
  challengeStatus: "Challenge 状态",
  freeUnattributedDetail: "没有可验证归因。该结果免费，也不表示因果。",
  paidDetail: "付费详情",
  windows: "窗口",
  evidenceRecords: "证据记录",
  agentConsole: "Agent Console · 审计与报告代理",
  runTelemetry: "运行遥测",
  observation: "仅供观察",
  noSecrets: "不保留密钥",
  collapse: "收起",
  expand: "展开",
  runStatus: "运行状态",
  dataStatus: "数据状态",
  events: "事件",
  cost: "成本",
  duration: "耗时",
  sources: "来源",
  retryLabel: "重试",
  errorField: "错误",
  none: "无",
  policyFlags: "policy_flags",
  limitations: "限制",
  exportJson: "导出 JSON",
  exportMarkdown: "导出 Markdown",
  disclaimer: "不构成投资建议；不提供买卖方向；不指控任何主体。时间上的先后关系不等于因果、内幕信息或确定的信息优势。",
  languageToggle: "语言",
  explainTerm: "解释",
  originalEnglish: "原文：English",
  originalChinese: "原文：中文",
  providerUnavailable: "Provider 不可用",
  upstreamUnavailable: "上游不可用",
  paymentInvalid: "付款无法验证",
  timeout: "请求超时",
  databaseUnavailable: "上游不可用",
};

export const DICTIONARY: Record<Locale, UiDictionary> = {
  "zh-CN": ZH,
  en: EN,
};

export function dictionaryFor(locale: Locale): UiDictionary {
  return DICTIONARY[normalizeLocale(locale)];
}

export function setLocaleCookie(locale: Locale): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = LOCALE_COOKIE + "=" + encodeURIComponent(locale) + "; Path=/; Max-Age=31536000; SameSite=Lax" + secure;
}
