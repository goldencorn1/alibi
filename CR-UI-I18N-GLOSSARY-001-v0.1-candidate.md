# CR-UI-I18N-GLOSSARY-001 v0.1 candidate

状态：`DRAFT_MODE`，候选 Change Request，等待独立批准  
生成日期：2026-09-04  
本轮性质：只读审计与设计，不修改代码、依赖、fixtures、Spec、Plan、API、数据库、环境或支付边界。

## 1. 目标与批准边界

本 CR 只提议为现有 Web UI 增加 `zh-CN` 与 `en` 两种界面语言、集中式专业术语解释和当前审计 Markdown 导出的双语渲染能力。

以下行为明确不在本 CR 中改变：

- API 路由、API JSON 字段、错误 envelope、内部枚举、状态机取值、`run_id`、`data_status`、evidence hash、原始 URL、原始证据标题和原始引文；
- Summary、Attribution、Audit、MCP、Chrome Extension、ERC-8004、WebSocket、集群算法、语言时间窗算法和 recorded fixtures；
- x402 V2 的 402 语义、`PAYMENT-REQUIRED` header、scheme、network、asset、amount、payTo、facilitator 和幂等边界；
- 任何用户 Demo 中的 synthetic 排除、recorded 标签、无因果/身份/内幕/买卖建议的安全红线。

## 2. 只读基线与证据

### 2.1 受保护基线

| 文件 | 当前 SHA-256 |
|---|---|
| `SPEC-ALIBI-PLATFORM.md` | `6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c` |
| `PLAN-ALIBI-PLATFORM.md` | `0c362b5e567f3051997b874da1f3f4e5e70839e3b62bebbe5dd9cdc9862eceaf` |
| `CR-CLUSTER-LANGUAGE-EVIDENCE-001-v0.2-candidate.md` | `0ca8f95afc69c91d4eda5fadca8dafae03a68676f5f4de2837b4754431404fa2` |
| `PLAN-CLUSTER-LANGUAGE-EVIDENCE-001.md` | `2e50c181ebdd6e6302f0abfd029943ebb277d1a535172bb1ffed18cbb5bdbfdf` |
| `package.json` | `9b44171d4053e1f1986e095ccab519c84fc86bfdac7455c471b8e82ec992d9b0` |
| `package-lock.json` | `ab2f2883e03dc5563d4175d217748509a9eead740f56446961ba3239032d17b8` |

当前目录不是 Git repository；批准后需用修改前文件 SHA-256 与安全备份作为回滚基线。

### 2.2 当前页面和导出实现

| 文件与行号 | 当前实现 | 审计结论 |
|---|---|---|
| `app/page.tsx:12-29` | `STATE_LABELS`、`ERROR_LABELS` 只有英文 | 状态词未集中化；`database_unavailable` 还被显示为 `Upstream unavailable` |
| `app/page.tsx:31` | `WEEKDAYS` 固定为中文 | 日期格式无法随 locale 改变 |
| `app/page.tsx:43-68` | Recorded evidence feed 固定英文 | 不支持 locale；动态状态直接输出内部 enum |
| `app/page.tsx:83-143` | Cluster/language 面板固定英文、原始 enum 和限制文案 | 需要 glossary；必须保留客观证据强度 |
| `app/page.tsx:161-317` | GUI/CLI/APP 三面板、tab keyboard navigation 固定英文，标题含中文 | 无语言切换器；ARIA label 也固定英文 |
| `app/page.tsx:319-456` | 状态、请求、审计轮询逻辑与 UI 文案混在同一 client component | 语言切换必须不触发 `postJson`、不清空 `run_id` 或审计状态 |
| `app/page.tsx:457-574` | Summary、Detail、x402、Agent Console、免责声明均有硬编码文案 | 覆盖范围大；不能遗漏 `role=alert/status` 文案 |
| `app/layout.tsx:11` | `<html lang="zh-CN">` 静态 | 当前页面 `<main lang="en">`，与 layout 和中文段落不一致 |
| `app/globals.css:27,62-69` | 已有 `:focus-visible` 和 reduced-motion 规则 | 可复用；需增加 popover、视口边界和 200% zoom 规则 |
| `src/observability/audit-agent.ts:137-160` | `renderAuditMarkdown` 的标题、字段标签、Limitations 固定英文；disclaimer 使用现有中文值 | 需要 locale 参数或纯 renderer；原始字段不能翻译 |
| `app/audit/route.ts:9-24` | `/audit?format=json|markdown`，Markdown 直接调用固定 renderer | 保持路径和 JSON 不变；locale 只能作为 Markdown 导出选项 |
| `app/api/v1/agents/runs/[runId]/route.ts:9` | v1 run export 同样直接调用 renderer | 需要与 legacy 导出保持同样的 locale 处理，或明确只在 UI 端生成 |
| `tests/e2e/*.spec.ts` | 现有 locator、断言和 screenshots 主要使用英文；synthetic 只在测试 mock 中出现 | 需要新增双语/持久化/TermHelp 测试；synthetic mock 不得成为用户 Demo 数据 |

当前没有独立 Summary 或 Attribution 页面；它们是 `app/page.tsx` 中的 Summary card、Detail card 和 x402 state。当前唯一 Markdown 下载入口是 Agent Console 的 Audit JSON/Markdown。

### 2.3 当前可见字符串清单

以下是按界面区域归并的实际人类可见字符串，不是 API 字段翻译表：

| 区域 | 当前示例字符串 | 目标字典分组 | 术语入口 |
|---|---|---|---|
| 顶部状态 | `Recorded evidence feed`、`Session request count`、日期/星期 | `header`、`format` | `Recorded`、`Data Status` |
| 品牌/说明 | `PREDICTION MARKET TRUST AGENT`、`Every wallet has a story. Alibi checks the timestamps.`、中文只读说明 | `brand`、`disclaimer` | `Time Evidence Chain` |
| 三面板 | `同一个事件 · 三个出口`、`Analysis output panels`、`GUI · Recorded report`、`CLI · Recorded API payload`、`APP · Actual legacy API query` | `panels` | `Recorded`、`Summary` |
| 输入操作 | `MARKET / PROFILE / 0x ADDRESS`、`Paste a Polymarket market URL...`、`Analyze`、`Data mode`、`recorded replay`、`live read-only` | `controls` | `Live`、`Recorded` |
| 空/加载 | `Recorded panel empty`、`No recorded data`、`No recorded analysis loaded...`、`Reading ... data and calculating evidence windows…`、`No results` | `states.empty/loading` | `Empty`、`Loading` |
| Summary | `Free Summary`、`Markets`、`Unattributed`、`Coverage`、`repricing windows`、中文 coverage gate 文案 | `summary`、`fields` | `Summary`、`Unattributed`、`Insufficient Evidence`、`Repricing Window` |
| Evidence | `Evidence-only analysis`、`Cluster and language evidence`、`No cluster alert`、`Language window`、`Pairing`、`source_state`、`cutoff`、`precision`、`uncertainty` | `evidence`、`fields` | `Cluster`、`Documented Language Window`、`Timestamp Uncertainty`、`Confidence` |
| Detail/x402 | `Request Detail`、`Free (unattributed)`、`Payment required`、`Detail is protected by x402 V2`、`Retry Detail`、`Challenge status` | `detail`、`payment` | `Attribution`、`Payment Required`、`x402`、`Base Sepolia` |
| Error | `Provider unavailable`、`Upstream unavailable`、`Payment could not be verified`、`Request timed out`、`Retry request`、`data_status`、`retryable` | `errors`、`fields` | `Provider Unavailable`、`Upstream Unavailable`、`Data Status` |
| Agent Console | `Agent Console · Audit & Report Agent`、`Run telemetry`、`observation only · no secrets retained`、`Run status`、`Data status`、`Events`、`Cost`、`Limitations`、`Export JSON`、`Export Markdown` | `console`、`export` | `MCP`、`ERC-8004`、`Data Status` |
| 安全说明 | `No verified attribution...`、`does not imply causality`、现有中文免责声明 | `disclaimer` | `Confidence`、`Attribution` |

## 3. 双语覆盖矩阵

| Surface | `zh-CN` | `en` | 动态值和 raw evidence | 不变量 |
|---|---|---|---|---|
| Header/brand/date | 完整 | 完整 | 日期按 locale 格式化；run count 仍从 0 开始的 session count | 不新增硬编码调用次数 |
| GUI/CLI/APP tabs | 完整 | 完整 | panel id `gui/cli/app` 不变 | tab role、键盘导航不变 |
| Input/mode/actions | 完整 | 完整 | 用户输入原样发送 | 不重新请求、不清调查状态 |
| Loading/empty/error | 完整 | 完整 | `error.code` 和 `data_status` 原样保留 | 不添加 API enum |
| Summary | 完整 | 完整 | market title/question 原文；数字、run_id 原样 | Summary 免费边界不变 |
| Attribution/Detail | 完整 | 完整 | evidence URL/title/excerpt、payment values 原样 | x402 V2 不变 |
| Time evidence | 完整 | 完整 | timestamps、precision、uncertainty 数值原样 | 不增强结论 |
| Cluster D1–D6/herding | 完整 | 完整 | `D1`–`D6`、阈值、数值、state 原样 | 不将 observation 译成内幕/协同 |
| Language window | 完整 | 完整 | original language/title/publisher/url 原样 | `indeterminate` 不变为确定先后 |
| Agent Console | 完整 | 完整 | agent id、worker id、status enum 原样或按字段标签渲染 | 不隐藏限制/成本 |
| x402 Payment Required | 完整 | 完整 | scheme/network/asset/amount/resource 原样 | 不要求付款，不修改 challenge |
| JSON export/API | UI 提示可双语 | UI 提示可双语 | JSON key/value、enum、URL、hash 不翻译 | API JSON contract 完全不变 |
| Markdown export | 当前 locale 的中文标签 | 当前 locale 的英文标签 | raw evidence 和原始引文不翻译 | 同一报告内容，不改变事实 |

`unsupported_language`、`provider_unavailable`、`upstream_unavailable`、`cluster_without_verified_source`、`documented_language_window` 是显示映射键或既有 contract 值；不得为了显示它们新增或修改 API enum。

## 4. Locale dictionary 设计

### 4.1 类型安全结构

推荐新增一个无副作用的共享模块，形状如下；这是设计，不是本轮代码：

```ts
type Locale = "zh-CN" | "en";
type LocalizedText = Record<Locale, string>;

interface LocaleDictionary {
  ui: Record<UiMessageId, string>;
  states: Record<DisplayStateId, string>;
  errors: Record<DisplayErrorId, string>;
  fields: Record<DisplayFieldId, string>;
  format: Record<FormatMessageId, string>;
}

const DICTIONARY = {
  "zh-CN": { /* every key required */ },
  en: { /* every key required */ },
} satisfies Record<Locale, LocaleDictionary>;
```

要求：

- `Locale` 只能是 `zh-CN | en`；`normalizeLocale` 对缺失、空值、损坏值和未知值统一回退 `zh-CN`；
- message id、state id、error id 和 field id 使用 literal union，禁止在组件中直接写同一概念的第二份解释；
- 翻译键缺失时运行时回退英文并记录缺失 key；生产页面不得显示空白；测试必须把缺失 key 视为失败；
- dictionary 只包含 UI 标签、说明和安全文案，不承载 API payload，不保存输入、报告、wallet、run_id 或任何 secret；
- 原始外部内容作为 `raw` 值单独传递，不进入翻译函数；
- `format` 负责数字、日期、星期和 locale 文字方向，不改变 contract 数值。

### 4.2 语言切换行为

页面头部新增 `中文 / EN` 两个真实 button 或 segmented control：

- 首次访问、偏好缺失或偏好损坏：`zh-CN`；
- 切换只更新 React locale state、`document.documentElement.lang` 和 locale cookie，不触发 `postJson`、audit polling restart、页面刷新或清除当前结果；
- 语言切换时已打开的 `TermHelp` 保留同一 `term_id`，只切换解释语言；
- JSON/API 仍使用现有英文 key 和 enum；
- 只保存 locale 偏好，不能把钱包地址、响应、报告或 payment payload 写入 cookie/localStorage。

## 5. Glossary schema 与首批术语表

### 5.1 Schema

推荐：

```ts
interface GlossaryEntry {
  term_id: string;
  label: Record<Locale, string>;
  definition: Record<Locale, string>;
  limitation?: Record<Locale, string>;
  formula_or_state?: Record<Locale, string>;
  display: "approved" | "pending_definition";
}
```

`GLOSSARY` 必须使用 `satisfies Record<TermId, GlossaryEntry>`，由 `term_id` 派生 `TermId`。`pending_definition` 条目不渲染问号；不得临时生成解释。

### 5.2 首批条目

下表是批准后应集中维护的最小集合。中英文解释必须具有完全相同的证据强度；“限制”是术语的一部分，不是可省略的脚注。

| `term_id` | 中文 / English label | 双语定义与限制要求 | 来源/状态 |
|---|---|---|---|
| `summary` | 概览 / Summary | 对当前输入的压缩只读报告；不等于完整归因或投资判断。 / A compact read-only report for the input; not a full attribution or investment judgment. | `SummaryReport`，approved |
| `attribution` | 归因 / Attribution | 将重定价窗口与合格公开证据关联；没有合格证据时为 `unattributed`。 / Links repricing windows to qualified public evidence; without it the result is `unattributed`. | engine/contract，approved |
| `time_evidence_chain` | 时间证据链 / Time Evidence Chain | 按时间排列交易、价格和来源观察；表示时间关系，不证明因果。 / Orders trade, price and source observations; shows temporal relation, not causality. | CR/implementation，approved |
| `repricing_window` | 重定价窗口 / Repricing Window | 在现有分析窗口内检测到的价格变化区间；不是预测窗口。 / A detected price-change interval under the existing analysis window; not a forecast window. | `RepricingWindow`，approved |
| `language_window` | 语言时间窗 / Language Window | 本地语言和英文来源的时间关系及钱包交易的时间位置。 / The relation between local-language and English sources and the temporal placement of wallet entries. | CR/contract，approved |
| `documented_language_window` | 已记录语言时间窗 / Documented Language Window | 钱包交易落在已验证公共来源的语言时间区间中；不说明持有人会该语言、拥有特殊信源或存在因果。 / A wallet entry falls within a verified public-source language interval; it does not establish language ability, privileged access, or causality. | CR，approved |
| `unattributed` | 未归因 / Unattributed | 当前检索范围内没有合格证据支持该窗口；不表示公开信息不存在。 / No qualified evidence supports the window within the current search scope; it does not mean public information does not exist. | contract，approved |
| `insufficient_evidence` | 证据不足 / Insufficient Evidence | 数据覆盖或证据质量不足以支持更强结论。 / Coverage or evidence quality is insufficient for a stronger conclusion. | contract，approved |
| `indeterminate` | 无法确定 / Indeterminate | 可接受时间区间重叠或校准不足，不能安全确定顺序。 / Accepted time intervals overlap or calibration is insufficient, so order cannot be safely determined. | contract，approved |
| `data_status` | 数据状态 / Data Status | 标识数据来源模式，例如 `live`、`recorded` 或 `synthetic`；不改变原始 enum。 / Identifies the data provenance mode, such as `live`, `recorded`, or `synthetic`; the enum is unchanged. | contract，approved |
| `live` | 实时 / Live | 请求使用实时读取路径；不保证来源正确、完整或可持续。 / The request uses the live read path; it does not guarantee source correctness, completeness, or continuity. | `DataStatus`，approved |
| `recorded` | 记录回放 / Recorded | 使用已保存、带元数据的回放；不是当前实时调查。 / Uses a saved replay with metadata; it is not a current live investigation. | `DataStatus`，approved |
| `synthetic` | 合成 / Synthetic | 测试生成数据；不得进入用户 Demo、正式证据或 live 结果。 / Test-generated data; it must not enter the user Demo, formal evidence, or live results. | `DataStatus`，approved |
| `cluster` | 集群 / Cluster | 按确定性交易和地址规则形成的观察分组；不证明身份、共同控制或协调。 / An observation group formed by deterministic trade and address rules; it does not establish identity, common control, or coordination. | cluster engine，approved |
| `same_side_ratio` | 同向比例 / Same-side Ratio | D1：已知方向中主导 BUY 方向所占比例，当前门槛为 `>=0.85`。 / D1: the dominant BUY-side share among known directions; current gate is `>=0.85`. | D1，approved |
| `time_concentration` | 时间集中度 / Time Concentration | D2：代表性时间戳的 R7 IQR/集中度计算；时间聚集不表示协调或因果。 / D2: R7-IQR/concentration calculation over representative timestamps; temporal concentration does not imply coordination or causality. | D2，approved |
| `median_account_age` | 中位账户年龄 / Median Account Age | 当前正式实现没有这个安全定义；D3 实际是 `median_profile_age_days`，并明确不是 wallet/account age。不得显示该标签。 / The approved implementation has no safe definition for this label; D3 is `median_profile_age_days` and explicitly not wallet/account age. Do not display this label. | `pending_definition`；人类决定必需 |
| `first_trade_ratio` | 首次交易比例 / First-trade Ratio | CR v0.2 使用该名称，但当前代码 D4 计算的是历史交易数 `<=2` 的 thin-history ratio；在冲突解决前不得显示或翻译成首次交易。 / CR v0.2 uses this name, but current D4 computes the thin-history ratio for prior trades `<=2`; do not display or translate it as first-trade ratio until resolved. | `pending_definition`；Change Control 必需 |
| `entry_price_dispersion` | 入场价格离散度 / Entry-price Dispersion | D5：主导 outcome 价格经 clipped logit 后的 population standard deviation，当前通过门槛为 `<=0.50`。 / D5: population standard deviation of clipped logits of dominant-outcome entry prices; current pass threshold is `<=0.50`. | D5，approved |
| `market_familiarity_ratio` | 市场熟悉度比例 / Market-familiarity Ratio | D6 的兼容名称；实际表示此前没有交易该市场的成员比例，不表示更熟悉。 / A compatibility name for D6; it actually means the share with no prior trade in the market, not greater familiarity. | D6，approved with mandatory limitation |
| `herding_pattern` | 跟随模式 / Herding Pattern | 当既定时间、价格 distinctness、Spearman rho 和 g 规则满足时标记；不能用于指控抄袭、操纵或共同控制。 / Marked when the defined time/price distinctness, Spearman rho, and g rules are met; it cannot accuse copying, manipulation, or common control. | herding veto，approved |
| `confidence` | 置信度 / Confidence | 当前数据覆盖和证据质量的等级/数值；不是投资成功概率。 / A level/value tied to current coverage and evidence quality; not a probability of investment success. | contract/attribution，approved |
| `timestamp_uncertainty` | 时间戳不确定性 / Timestamp Uncertainty | 至少 30 个独立样本时使用绝对误差 P95；样本不足时为 unknown/indeterminate。 / Uses absolute-error P95 with at least 30 independent samples; with fewer samples it is unknown/indeterminate. | calibration，approved |
| `x402` | x402 支付协议 / x402 | 用 HTTP 402 表示受保护资源需要按既有 contract 付款；不会改变证据结果。 / Uses HTTP 402 to indicate that a protected resource requires payment under the existing contract; it does not change evidence results. | payment，approved |
| `payment_required` | 需要付款 / Payment Required | Detail 资源尚未释放的 402 状态；不是已付款、已验证或已产生归因。 / A 402 state where Detail has not been released; it is not proof of payment, verification, or attribution. | contract/UI，approved |
| `base_sepolia` | Base Sepolia 测试网 / Base Sepolia | 当前 x402 使用的测试网络；不等于主网，也不代表交易已经提交。 / The test network used by current x402; it is not mainnet and does not mean a transaction was submitted. | payment，approved |
| `mcp` | 模型上下文协议 / MCP | 当前平台的工具连接表面；不代表外部发布或第三方背书。 / The platform's tool-connection surface; it does not imply public release or third-party endorsement. | platform，approved |
| `erc8004` | ERC-8004 身份指针 / ERC-8004 | 身份/服务指针；不是能力验证、信誉背书或事实结论。 / An identity/service pointer; not capability validation, reputation endorsement, or a factual conclusion. | platform，approved |
| `provider_unavailable` | 提供方不可用 / Provider Unavailable | 指定提供方不能提供结果；保持 unavailable/unknown，不伪造 recorded。 / The selected provider cannot provide a result; retain unavailable/unknown and do not fabricate recorded data. | error/display，approved |
| `upstream_unavailable` | 上游不可用 / Upstream Unavailable | 依赖的外部读取路径不可用或失败；不能自动转成 not_found。 / A dependent external read path is unavailable or failed; it must not be converted to not_found. | error/display，approved |
| `unsupported_language` | 不支持的语言 / Unsupported Language | 当前 connector 或规范不支持该语言；保留原文和语言标签，不自动冒充翻译。 / The current connector or specification does not support the language; preserve the original and its language label without pretending to translate it. | display-only，no API enum change |
| `cluster_without_verified_source` | 无已验证信源的集群 / Cluster Without Verified Source | 满足确定性集群条件但当前没有合格公开来源；不表示内幕集群或操纵。 / Meets deterministic cluster conditions but has no qualified public source in scope; it does not mean an insider cluster or manipulation. | cluster contract，approved |
| `documented_language_window` | 已记录语言时间窗 / Documented Language Window | 只表达已验证来源时间区间与交易时间位置；不表达语言能力或信息优势。 / Expresses only the relation between verified source intervals and trade placement; not language ability or information advantage. | language contract，approved |

对于 `loading`、`empty`、`success`、`error`、`recorded`、`live`、`synthetic`、`insufficient_evidence`、`unattributed` 和 `indeterminate`，除了 dictionary label 外必须有完整状态说明。`loading/empty/success/error` 是 UI display state，不得写入 API response。

## 6. `TermHelp` 问号组件设计

### 6.1 组件接口

建议使用一个共享组件，避免组件内重复定义：

```ts
<TermHelp termId="documented_language_window" openTermId={openTermId} onOpenChange={setOpenTermId} />
```

组件行为：

- 输出真实 `<button type="button">?</button>`，带当前语言的 `aria-label`，例如 `解释：已记录语言时间窗` / `Explain: Documented Language Window`；
- `aria-expanded`、`aria-controls` 与唯一 popover id 同步；
- 没有 glossary 条目或条目为 `pending_definition` 时不渲染问号；
- glossary 只产生一份解释，Summary、Detail、Cluster、Language、Console 共用同一 `term_id`；
- 一个页面 root 只维护一个 `openTermId`，同一时间最多一个解释框。

### 6.2 交互和无障碍

- desktop hover 可打开；focus、Enter、Space 和 click 都可打开/保持；
- Escape、再次点击、点击外部或 focus 离开关闭；
- 解释内容使用 `role="tooltip"`（纯说明，无交互控件）；如将来包含交互内容，必须改为非模态 `role="dialog"` 并补齐 focus 管理；
- mobile 不依赖 hover，点击/触摸打开，再次点击、外部点击或 Escape 关闭；
- popover 使用可计算的 top/bottom/left/right placement，最大宽度为视口可用宽度；小屏幕使用近全宽弹层，不能遮挡 Analyze、Request Detail、语言切换器或 payment challenge；
- `:focus-visible` 保留现有清晰 outline；200% zoom 下文字仍可读且不依赖颜色；
- `prefers-reduced-motion: reduce` 下关闭位移动画和过渡，只保留即时显示；
- 打开/关闭不触发网络请求、不改变 report、run_id、payment state 或数据模式。

## 7. 持久化与 hydration 方案

### 推荐：仅保存 cookie，不使用 localStorage

当前 `app/page.tsx` 是整个页面的 client component，而 `<html>` 位于 server `app/layout.tsx`。若只在 `useEffect` 中读 localStorage，会出现刷新时先显示中文再跳成英文的明显语言闪烁；若直接在 render 读取 localStorage，会引发 hydration mismatch。

唯一推荐方案是：

1. 新增无敏感数据的 locale helper，读取并规范化 `alibi_locale=zh-CN|en`；
2. `app/layout.tsx` 在 server 端读取该 cookie，将 `<html lang>` 设置为规范化 locale；非法 cookie 视为缺失并回退 `zh-CN`；
3. 将当前 client body 提取为受控 client component（或由 server `app/page.tsx` 传入 `initialLocale`），使首次 SSR 和 hydration 使用同一个 locale；
4. 切换时只写 `alibi_locale`：`Path=/; SameSite=Lax; Max-Age=31536000`，同步 React state 和 `document.documentElement.lang`；
5. 无 cookie、cookie 解析失败、浏览器禁用 cookie 时，当前会话仍用 `zh-CN`，不写入其它数据；
6. 不使用 `HttpOnly`，因为切换器需要写入偏好；cookie 内绝不写 wallet、run_id、报告、API response、payment payload 或 secret；
7. 如果实施前证实不能改变 `app/layout.tsx`，降级方案是 client-only locale + 首屏隐藏至初始化完成，但该方案只作为风险接受后的备选，不是推荐项。

该方案会使页面读取 locale cookie，可能令页面动态渲染；这是 UI 语言偏好行为，不改变任何 API、分析或支付逻辑。

## 8. Markdown 双语导出方案

### 8.1 当前事实

现有 `/audit?format=markdown` 和 `/api/v1/agents/runs/[runId]?format=markdown` 使用 `renderAuditMarkdown(report)`，当前标题、字段标签、表头和 `## Limitations` 固定英文；worker id、status、data_status、policy flags、run_id、数字和免责声明值来自现有报告。

### 8.2 推荐实现

- 提取一个纯的 `renderMarkdown(report, locale)` renderer；或将现有 renderer 扩展为显式 `locale` 参数，默认 `en` 以保持直接 API 调用兼容；
- UI 的 `Export Markdown` 入口在点击时传入当前 locale；优先让现有 `/audit` Markdown route 接受可选的 `locale=zh-CN|en` query，不改变 path、JSON response 或默认行为；
- 若产品决定禁止任何新的 query 行为，则由 UI 使用同一个纯 renderer 创建 Blob 下载，服务端 `/audit` 路径保持完全不变；这应在 Plan 批准前二选一；
- `zh-CN` 导出使用中文标题、字段标签、表头、说明和免责声明；`en` 导出使用英文；不是一份报告同时混排两种界面语言；
- `run_id`、worker id、status/data_status enum、policy flags、时间、数值、URL、hash、外部 publisher/title/excerpt/original quote 原样保留；
- 外部语言标签按 locale 翻译，例如 `原文语言：English` / `Original language: 中文`，但不翻译原始标题或引文；
- Markdown 中的用户输入、原始 URL 和 evidence 内容必须经过 Markdown 安全转义，避免表格分隔符或换行破坏结构；转义不是翻译，也不改变底层 evidence 内容；
- JSON export 继续使用现有英文 contract；不新增 `label_zh`、`label_en` 或其它双语字段。

当前没有 Summary/Attribution 独立 Markdown 下载路由。若人工要求将完整 Summary/Detail 也导出为 Markdown，需要在 Plan 前明确是否新增纯 renderer 和 UI button；不得借此新增 API route 或改变 x402。

## 9. 文件变更矩阵

下表是获批后候选范围，不是本轮实际修改。未确认项保持“条件性”，不写成确定变更。

| 文件 | 预期目的 | 是否修改 API contract | 是否需要测试 | 状态 |
|---|---|---:|---:|---|
| `app/page.tsx` | 接入 locale state/switcher、dictionary、TermHelp、双语状态/页面文案；保持请求和状态逻辑 | 否 | 是 | 预计修改 |
| `app/page-client.tsx` 或同等 client shell | 若采用 SSR cookie 无闪烁方案，承载现有 client body | 否 | 是 | 条件性新增，需 Plan 固定名称 |
| `app/layout.tsx` | 读取 locale cookie，设置 `<html lang>`；不改变 metadata 业务内容 | 否 | 是 | 预计修改 |
| `app/globals.css` | popover placement、focus、200% zoom、mobile、reduced-motion | 否 | 是 | 预计修改 |
| `src/ui/i18n.ts` | Locale union、dictionary、fallback、格式化和 cookie helper | 否 | 是 | 预计新增 |
| `src/ui/glossary.ts` | 类型安全 glossary 与 pending-definition 条目 | 否 | 是 | 预计新增 |
| `src/ui/term-help.tsx` | 共享 `TermHelp` 组件和单开状态接口 | 否 | 是 | 预计新增 |
| `src/reports/markdown.ts` | 纯 locale-aware Markdown renderer；保留 raw fields | 否 | 是 | 推荐新增 |
| `src/observability/audit-agent.ts` | 若 renderer 从现有函数抽取，保留默认英文兼容调用 | 否 | 是 | 条件性修改 |
| `app/audit/route.ts` | 仅在采用 server export 方案时读取可选 locale query | 否；path/JSON 不变 | 是 | 二选一条件性修改 |
| `app/api/v1/agents/runs/[runId]/route.ts` | 与 legacy Markdown 导出保持 locale parity | 否；path/JSON 不变 | 是 | 二选一条件性修改 |
| `tests/unit/i18n.test.ts` | locale normalization、dictionary completeness、cookie safety | 否 | 是 | 预计新增 |
| `tests/unit/glossary.test.ts` | term_id 完整性、pending 条目不渲染、双语限制对齐 | 否 | 是 | 预计新增 |
| `tests/unit/markdown.test.ts` | 两种 locale、raw title/url/excerpt/hash 保真、Markdown escape | 否 | 是 | 预计新增 |
| `tests/e2e/i18n-glossary.spec.ts` | 切换、刷新、状态、TermHelp、下载和 no-refetch | 否 | 是 | 预计新增 |
| `tests/e2e/accessibility.spec.ts` | 键盘、popover、200% zoom、mobile、reduced-motion | 否 | 是 | 预计修改或扩展 |
| `package.json` / `package-lock.json` | 不修改；不新增依赖 | 否 | 现有依赖检查 | 禁止覆盖 |
| `src/contracts/index.ts` | 不修改 API 字段、enum、状态机 | 否 | contract regression | 禁止覆盖 |
| `src/analysis/cluster-language.ts` | 不修改 D1–D6、herding、language window 算法 | 否 | protected regression | 禁止覆盖 |
| `fixtures/recorded/**` | 不修改 recorded 数据 | 否 | fixture hash | 禁止覆盖 |

## 10. 受保护不变量与禁止范围

- API JSON 的英文 key、数字、enum、错误 code、`data_status`、`run_id`、URLs 和 hashes 不翻译；
- 原始市场问题、新闻标题、publisher、引文、URL 和外部页面内容不改写；
- “原文：English / Original: 中文”只添加界面标签，不生成未经批准的译文；
- `recorded` 始终明确显示；`synthetic` 继续阻断用户可见结果；
- `Documented Language Window` 只表示来源时间区间与交易时间位置；`Cluster Without Verified Source` 只表示确定性观察状态；二者不可合并为语言能力、内幕或因果结论；
- `Confidence` 不可翻译为成功率或投资概率；`Herding Pattern` 不可翻译为抄袭/操纵/共同控制；
- x402 仍为 HTTP 402、`exact`、Base Sepolia、`0.01 USDC` 和现有 payment boundary；语言切换不得生成、保存或发送 payment payload；
- 不修改 `SPEC-ALIBI-PLATFORM.md`、`PLAN-ALIBI-PLATFORM.md`、已批准 CR/Plan、`package.json`、lockfile、环境文件、数据库、migration、MCP/Extension/EERC-8004/WebSocket 入口或 product analysis。

## 11. 测试矩阵

### 单元测试

| 测试 | 明确断言 |
|---|---|
| Locale normalization | `zh-CN`、`en` 可用；缺失/损坏/未知回退 `zh-CN`；非法 cookie 被清除或忽略 |
| Dictionary completeness | 两个 locale 拥有同一组 key；不存在空字符串；缺失 key 测试失败 |
| Glossary completeness | 所有 approved term_id 存在；pending definition 不产生 TermHelp；双语限制语义对齐 |
| Glossary safety | `documented_language_window`、`unattributed`、`cluster_without_verified_source`、`herding_pattern`、`confidence` 的中英文都明确非因果/非身份/非买卖建议边界 |
| Markdown locale renderer | 标题、字段标签、说明和免责声明按 locale 改变；raw title、publisher、excerpt、URL、hash、enum、数字完全保真 |
| Markdown escaping | 表格符、换行和特殊字符只做结构转义，不改变 raw value |

### 集成测试

| 测试 | 明确断言 |
|---|---|
| API regression | locale 功能不会增加或删除 API JSON 字段，不改变 response status、error code、data_status 或 run_id |
| Audit export compatibility | 无 locale 参数时维持现有英文 Markdown；合法 locale 只影响 Markdown 人类可见标签 |
| Payment boundary | 切换 locale 前后 402、`PAYMENT-REQUIRED`、scheme/network/asset/amount/resource 不变；不发生支付调用 |
| Raw evidence preservation | 两种 Markdown 都保留原始语言、原始标题、publisher、URL、引文和 hash |
| No refetch | 切换语言期间 fetch 计数为 0，现有 Summary/Detail/Audit state、run_id 和 payment state 不变 |

### E2E 与无障碍

- 首次访问为中文；切换到英文后即时更新，刷新后仍为英文；非法 locale cookie 回到中文；
- loading、empty、success、error、recorded、live、synthetic-blocked、provider_unavailable、upstream_unavailable、payment_required、insufficient、unattributed、indeterminate、unsupported_language、cluster_without_verified_source、documented_language_window 均有双语可访问文案；
- TermHelp：Tab、Enter、Space、Escape、外部点击、再次点击、hover、focus、mobile touch，且同一时间只有一个打开；
- 键盘焦点不丢失；popover 有正确 `aria-label`、`aria-expanded`、`aria-controls`、tooltip/popover role；
- GUI/CLI/APP tabs 现有 Arrow/Home/End 行为不变；语言切换不触发调查；
- desktop、mobile、200% zoom 下 popover 不遮挡主要操作、不横向溢出、不超出视口；
- `prefers-reduced-motion: reduce` 下无必需动画；
- API JSON export 仍是现有英文 contract；Markdown 下载语言与点击时 locale 一致；
- 运行现有完整测试、typecheck、lint、build、recorded replay、402 smoke 和 clean-room verification；不执行支付或 migration。

## 12. 双语截图验收矩阵

截图必须使用真实 recorded/empty/insufficient 状态，不使用 synthetic 用户 Demo。

| 场景 | 数据状态 | 视口/操作 | 重点验收 |
|---|---|---|---|
| 中文 desktop | recorded + insufficient/unattributed | 1440px | header、Summary、Evidence、Console、免责声明完整中文 |
| 英文 desktop | recorded + insufficient/unattributed | 1440px | 所有 UI 标签英文，raw evidence 不被翻译 |
| 中文 mobile | recorded empty | 390px | switcher、tabs、输入、状态、TermHelp 不遮挡 |
| 英文 mobile | recorded empty | 390px | 同上，英文长词可换行 |
| 中文 200% zoom | recorded | 1280px CSS zoom 2 | 无横向溢出、焦点可见、popover 可读 |
| 英文 200% zoom | recorded | 1280px CSS zoom 2 | 同上 |
| 键盘操作 | 任意 recorded 状态 | 仅键盘 | 语言切换、tabs、Analyze、Request Detail、TermHelp、Export 可达 |
| reduced-motion | loading/recorded | `prefers-reduced-motion: reduce` | 动画/过渡即时或关闭，状态仍可读 |
| popover 边界 | glossary term | 顶部、底部、左右边缘和 mobile | 自动 placement，不超出视口、不遮挡关键按钮 |

每张截图需记录 locale、viewport、zoom、data_status、状态和 SHA-256；失败时记录原因，不以空白截图代替验收。

## 13. 风险与回滚

| 风险 | 预防 | 回滚 |
|---|---|---|
| hydration mismatch/语言闪烁 | cookie server read + initialLocale；禁止 render 期读取 localStorage | 恢复 `app/page.tsx`、`app/layout.tsx` 原始 hash，保留现有英文/中文混合页面 |
| 翻译改变证据强度 | glossary 审核表、双语 safety tests、pending term 不渲染 | 删除 i18n/glossary/TermHelp 变更，API/算法不动 |
| raw evidence 被误翻译 | raw/value 与 dictionary 分离；Markdown golden tests | 恢复 renderer，保留原始报告 artifacts |
| popover 遮挡/键盘陷阱 | viewport placement、Escape/outside、E2E 200%/mobile | 回退 TermHelp CSS/组件，不改变主页面数据逻辑 |
| locale cookie 被误用保存敏感数据 | cookie schema 只接受两值；安全扫描和 browser storage 断言 | 删除 locale cookie，清理只属于本功能的代码 |
| `Median Account Age` / `First-trade Ratio` 定义冲突 | 标记 pending，Plan 前获取人类决定 | 不渲染问号，不改变算法字段 |
| Markdown query 被视为 API 变更 | 默认行为保持；必要时改用 client-only Blob renderer | 保留现有 `/audit` 与 v1 route，不增加 query 解析 |

当前没有 Git repository。批准后执行前应把预计修改文件的原始 hash 写入 `/private/tmp/alibi-ui-i18n-rollback-<timestamp>/manifest.json`，对每个修改文件保存安全副本；回滚使用逐文件安全恢复或 `apply_patch`，不得使用破坏性 `git reset --hard`、`git checkout --` 或删除工作区。

## 14. Definition of Done

1. `zh-CN` 与 `en` 覆盖所有列出的页面、按钮、状态、错误、Summary/Detail、Evidence、Console、x402、限制和免责声明；
2. 首次访问/非法偏好为中文，合法偏好刷新可恢复，`<html lang>` 与当前语言同步，无 hydration mismatch 和明显闪烁；
3. 切换语言不刷新、不重新调查、不发送请求、不清除状态，只保存 locale 偏好；
4. 所有实际显示的专业术语通过集中 Glossary 和共享 TermHelp 解释；pending 定义术语不显示问号；
5. TermHelp 支持真实 button、ARIA、hover/focus/click、Tab/Enter/Space/Escape、outside click、mobile、200% zoom、reduced-motion 和视口边界；
6. 中英文 glossary 对 `Unattributed`、`Insufficient Evidence`、`Indeterminate`、`Documented Language Window`、`Cluster Without Verified Source`、`Herding Pattern`、`Confidence` 保持同等证据限制；
7. Markdown export 根据点击时 locale 输出本地化标签和说明，原始证据内容、URL、hash、enum、数字和 JSON contract 不变；
8. 不修改 API 路由/字段/enum、x402、算法、fixtures、Spec、Plan、依赖、数据库或环境文件；
9. 单元、集成、E2E、无障碍、截图、typecheck、lint、build、recorded replay、402 smoke、clean-room 和 secret scan 全部有证据；
10. 项目状态仍按既有规则报告，不因 UI 国际化把 `PARTIALLY_VERIFIED` 改成 `COMPLETE` 或 `FULLY_LIVE_VERIFIED`。

## 15. 实施 Plan 的候选范围

批准后，独立 Plan 可按以下层次细化；本节不是 Plan，不授权执行：

1. **P0 基线与 contract freeze**：复核 protected hashes、现有字符串、API JSON golden、x402 challenge、fixtures 和工作区；冻结 `Median Account Age`/`First-trade Ratio` 决策门。
2. **P1 Locale infrastructure**：实现 `Locale`、dictionary completeness、cookie normalization、SSR initial locale 和 `<html lang>` 同步。
3. **P2 Glossary/TermHelp**：实现 glossary schema、approved/pending 条目、单开 popover、ARIA、keyboard/mobile/zoom/reduced-motion 行为。
4. **P3 UI integration**：替换 page 文案、日期/数字格式和状态展示；保持请求、polling、run_id、payment 和 panel navigation 不变。
5. **P4 Markdown**：选择 server optional-locale query 或 client pure renderer；完成 raw evidence preservation 和 JSON compatibility。
6. **P5 Verification**：unit/integration/E2E/accessibility/screenshot/secret/clean-room 全套验证，失败时只生成诊断或 Change Control，不自行扩展产品范围。

## 16. 需要人类决定的事项与阻塞项

1. 是否接受 `Median Account Age` 只显示为“Median Profile Age / 中位资料年龄”，并确认不再使用“账户年龄”；
2. CR v0.2 的 `First-trade Ratio` 与当前 D4 `prior_trade_count <= 2` thin-history ratio 存在定义冲突。该冲突必须在实施前由 Change Control 裁决；本 CR 不修改算法；
3. Summary/Attribution 是否需要新增完整 Markdown 下载内容，还是只本地化现有 Audit Markdown 导出；
4. Markdown locale 是否允许作为 `/audit` Markdown-only optional query。若不允许，必须选择 client-side pure renderer；
5. 是否接受读取 locale cookie 使页面使用动态 server render；这是满足无明显闪烁和 `<html lang>` 同步的推荐方案。

在上述决策未完成前，不得把 pending glossary 条目写入产品 UI，也不得生成实施 Plan 中的确定文件变更。

## 17. 唯一批准命令

`APPROVE: CR-UI-I18N-GLOSSARY-001 v0.1`

