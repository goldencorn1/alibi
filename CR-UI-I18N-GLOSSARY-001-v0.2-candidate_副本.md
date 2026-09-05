# CR-UI-I18N-GLOSSARY-001 v0.2 candidate

状态：DRAFT_MODE／候选，未批准，未实施。

本文件是 CR-UI-I18N-GLOSSARY-001 v0.1 candidate 的修订候选。v0.1 保留为历史候选，不覆盖、不改写。本轮只进行只读审计与变更设计；不修改代码、依赖、Spec、Plan、API、算法、fixtures、数据库或支付配置。

## 1. 变更摘要

本版本将 v0.1 中已经识别但尚未关闭的术语、导出、持久化和验收决定落实为候选规范，并补充当前实现冲突的明确记录。目标是让后续实施只处理 UI 国际化、术语集中维护、无障碍帮助入口和现有 Audit Markdown 的客户端本地化，不改变业务逻辑、证据算法、API JSON contract 或 x402 边界。

本候选不批准以下两项实现冲突：

1. 当前 D1 代码只筛选 BUY 并按 YES／NO outcome 统计，尚未证明实现了批准规则要求的 BUY／SELL＋YES／NO 经济方向归一化。
2. 当前 D4 代码以 prior_trade_count <= 2 计算稀薄历史比例，而现有 CR 文本仍使用内部字段名 first_trade_ratio。UI 名称和解释按本候选修正，但字段与实现的最终对齐仍必须在实现 Change Control 中解决。

这两项不是本候选的待决问题，也不允许通过词汇表掩盖；它们是进入实现 Plan 前必须保留的 IMPLEMENTATION_CONTRACT_CONFLICT 阻塞记录。

## 2. v0.1 → v0.2 精确 Diff

| 区域 | v0.1 candidate | v0.2 candidate | 变更性质 |
|---|---|---|---|
| 版本状态 | 历史候选，包含待决 D3、D4、导出和 locale 方案 | v0.1 保留；v0.2 为新的候选，不自动批准 | 状态明确化 |
| D3 term_id／字段 | median_account_age／待定；易被理解为账户年龄 | median_profile_age_days；内部字段保持 median_profile_age_days | 精确定义 |
| D3 中文显示名 | 待定或账户年龄表述 | 中位资料年龄 | 人工决定已关闭 |
| D3 英文显示名 | 待定或 account age 表述 | Median Profile Age | 人工决定已关闭 |
| D3 语义 | profile 年龄与账户／钱包年龄边界未完全锁定 | 依据 public profile 的 createdAt；unknown 不进入中位数；显示 coverage 与 unknown count；不得称账户、钱包或链上地址年龄 | 证据边界收紧 |
| D4 term_id／字段 | first_trade_ratio 被当成首次交易比例，定义待定 | 内部字段可继续为 first_trade_ratio；UI term 显示 Thin-History Ratio | contract 名称与 UI 语义分离 |
| D4 中文显示名 | 首次交易比例或待定 | 交易历史稀薄度 | 人工决定已关闭 |
| D4 英文显示名 | First-trade Ratio 或待定 | Thin-History Ratio | 人工决定已关闭 |
| D4 语义 | 可能被解读为首次交易占比 | 截至 as-of cutoff，历史成交笔数 <= 2 的 eligible 成员比例；unknown history 不进入分子或分母；显示 coverage | 证据边界收紧 |
| D6 label | 市场熟悉度比例／Market-familiarity Ratio | 市场陌生度比例／Market Novelty Ratio；内部 API 字段仍为 market_familiarity_ratio | 纠正反向语义 |
| D6 解释 | 可能写成越高越熟悉 | eligible 成员中此前未在该市场交易者的比例；不得写成越高越熟悉 | 解释修正 |
| D1 same-side | 主导 BUY 方向比例 | eligible 已知经济方向中占比最高方向的比例；依据 BUY／SELL＋YES／NO 归一化规则 | 解释修正 |
| D1 实现状态 | 未明确实现差异 | 明确记录当前 cluster-language.ts 仅筛选 BUY、按 YES／NO 统计的实现缺陷；不以 Glossary 掩盖 | 阻塞显式化 |
| Language Window 重复项 | Glossary 中存在重复的 documented_language_window | 只保留一个唯一 term_id | 去重 |
| pending_definition | 表中存在待定词条或待决项 | v0.2 registry 的 pending_definition 数量必须为 0；类型可保留为防御性类型，但不得有待定实例 | 进入 Plan 的门槛明确化 |
| Markdown 范围 | 保留了服务端 locale query／Summary、Detail 导出的可能性 | 仅本地化现有 Audit Markdown；客户端使用已获取 Audit JSON 的共享纯 renderer；不新增 Summary／Attribution Markdown 路由或按钮 | 范围收窄并定案 |
| Markdown API | 可能考虑 /audit 或 /api/v1 的 locale query | 不加 locale query；现有服务端英文 Markdown 行为保持兼容 | API 不变量 |
| locale 持久化 | cookie／localStorage／现有状态机制待选 | 固定采用 alibi_locale cookie＋SSR initial locale；只允许 zh-CN／en，默认 zh-CN | 人工决定已关闭 |
| locale cookie | 规则未完全固定 | SameSite=Lax; Path=/; Max-Age=31536000；HTTPS 增加 Secure；只存 locale | 安全边界明确 |
| 切换行为 | 可能重新加载或重新请求 | 立即更新 React state 与 html lang；不刷新、不重新调查、不重新请求；保留同一 term_id 的打开状态 | 交互不变量 |
| metadata | 未纳入完整验收 | title、description、html lang 必须随 locale 正确输出；品牌名 Alibi 不翻译；SEO route/API 不变 | 验收补充 |
| TermHelp | 基本 hover/focus 设计 | 明确 transient／pinned 状态机：click/touch 固定，pointer/focus leave 不关闭固定项，Escape／再次点击／外部点击关闭，始终最多一个固定术语 | 状态机定案 |
| 覆盖审计 | 依赖人工发现重复解释 | 所有实际显示的专业指标、证据状态和支付状态必须映射唯一 term_id；禁止组件第二份解释；pending_definition=0 才能进入 Plan | 审计门槛补充 |
| 阻塞项 | 可能表现为需要人类回答 | 不保留人类问题；只列事实型实现冲突，并说明不得在本 CR 中修改算法 | Change Control 边界明确 |

## 3. 审计基线与事实证据

### 3.1 审计范围

只读核验了当前项目中的页面、组件、状态契约、Audit Markdown renderer、路由和 cluster-language 实现。关键基线文件如下：

| 路径 | 观察到的内容 |
|---|---|
| /Users/a0000/polymarket/app/page.tsx | 单页 use client UI；Summary、Detail、Evidence、Agent Console 集中在一个页面；存在大量硬编码中英文字符串；当前 main 使用 lang="en"，同时包含中文文案；Audit JSON／Markdown 导出入口均在 Agent Console。 |
| /Users/a0000/polymarket/app/layout.tsx | 静态 html lang="zh-CN"；静态 title Alibi — Timestamp Trust Agent；静态 description Read-only Polymarket repricing and wallet evidence timeline. |
| /Users/a0000/polymarket/app/globals.css | 已有 :focus-visible 和 reduced-motion 处理；尚未见集中式 Tooltip／Popover 状态样式。 |
| /Users/a0000/polymarket/src/observability/audit-agent.ts:137-161 | renderAuditMarkdown(report) 只接受 AuditReport，固定输出英文标题、字段名、表头和 Limitations；服务器内部将其写入现有 audit artifact。 |
| /Users/a0000/polymarket/app/audit/route.ts:7-24 | /audit?run_id=...&format=json|markdown；Markdown 由当前英文 renderer 生成。 |
| /Users/a0000/polymarket/app/api/v1/agents/runs/[runId]/route.ts:6-10 | v1 agent run 的 Markdown 分支同样调用现有英文 renderer。 |
| /Users/a0000/polymarket/src/ui/state.ts | 已有 idle、loading、error、insufficient、unattributed、payment_required、indeterminate、success 等 UI 状态映射。 |
| /Users/a0000/polymarket/src/contracts/index.ts | API JSON 字段名、data_status、错误枚举及 Summary／Detail contract；本候选不修改。 |
| /Users/a0000/polymarket/src/analysis/cluster-language.ts:125-170 | D1—D6 实际计算；D3 使用 profile_created_at，D4 使用 prior_trade_count，D6 使用 prior_market_trade_count。 |
| /Users/a0000/polymarket/tests/e2e/accessibility.spec.ts | 已有 200% zoom、键盘和 reduced-motion 的基础验收；未覆盖双语、TermHelp 固定打开状态和 metadata。 |
| /Users/a0000/polymarket/tests/e2e/cluster-language.spec.ts | 已有 desktop/mobile/200% 的 cluster-language 视觉基础验收；仍需增加中英文与边界位置覆盖。 |
| /Users/a0000/polymarket/tests/e2e/app.spec.ts | 已有 recorded、payment-required、error、empty、synthetic blocking 等基础 UI 测试；payment 场景使用浏览器 mock，不代表真实支付。 |

### 3.2 当前 UI 字符串问题

当前页面存在以下国际化和术语风险：

- STATE_LABELS、ERROR_LABELS 和按钮文案为英文硬编码，业务限制和 disclaimer 又混有中文。
- app/page.tsx:458 的 main lang="en" 与 app/layout.tsx:11 的 html lang="zh-CN" 不一致；语言切换尚未存在。
- app/page.tsx:468 的 Session Request Count 已是从会话状态计算的计数，后续必须继续保持从 0 开始的真实本地会话计数，不得恢复历史硬编码基数。
- app/page.tsx:499-506、517-519、524-565 中存在 Summary、Detail、x402、Agent Console、状态和限制的重复硬编码文案。
- 当前 Audit Markdown 的服务器 renderer 与页面下载链接绑定；若直接增加 query locale，会改变既有 API 行为，因此本候选采用客户端纯 renderer，服务端英文 renderer 不变。

### 3.3 当前算法与术语证据

- D3 当前由 profile_created_at 计算 profile age，并在 cluster-language.ts:149 明确写出不是 wallet/account age；这支持“资料”而不是账户、钱包或地址年龄的用词。当前 result 已有 coverage、known_count、member_count，unknown count 可由 member_count - known_count 派生，不需要新增 API 字段。
- D4 当前由 prior_trade_count 计算 thinRatio，并在 cluster-language.ts:154 明确 incomplete history 是 unknown、不是 zero；这支持 Thin-History Ratio 定义，但与现有 CR 中 first_trade_ratio 的命名／规则映射必须显式处理。
- D6 当前变量名 familiarityRatio 保留了历史兼容命名，但 cluster-language.ts:170 已说明其实际含义是“此前没有交易该市场”，不表示越高越熟悉；UI 必须使用 Market Novelty Ratio。
- D1 当前 cluster-language.ts:127-133 只统计 YES／NO 并将 reason 写为 Same-side BUY ratio.；该实现没有出现批准规则所需的 SELL 经济方向归一化。v0.2 只修订 UI 术语定义并记录缺陷，不改变算法。

## 4. 目标、范围与不变量

### 4.1 目标

1. 支持 zh-CN 与 en 的页面、状态、Audit Markdown 和术语解释。
2. 建立类型安全、集中维护、term_id 唯一的 Glossary。
3. 让所有实际显示的专业指标、证据状态和支付状态都可通过真实 button 的 TermHelp 获取当前语言解释。
4. 通过 locale cookie 与 SSR initial locale 避免明显语言闪烁，并在切换时只改变显示层状态。
5. 让 Audit Markdown 在客户端依据当前已获取的 Audit JSON 输出本地化标题、标签、说明和免责声明，同时原始证据完全保持不变。

### 4.2 明确不做

- 不修改已批准 SPEC-ALIBI-PLATFORM.md v0.7、既有 Plan、CR 或任何平台架构约束。
- 不修改 API 路由、API JSON 字段、枚举、状态机取值、run_id、evidence hash、原始 URL、原始标题或原始引文。
- 不新增 Summary／Attribution Markdown 路由或按钮；本 CR 仅覆盖现有 Audit Markdown。
- 不给 /audit 或 /api/v1 增加 locale query；不改变服务端现有英文 Markdown 行为。
- 不修改 x402 V2、价格、网络、facilitator、payment-identifier、payTo 或支付流程。
- 不修改 D1—D6 算法、语言时间窗规则、fixtures、数据库、环境文件或依赖。
- 不恢复 landing/pitch 中的虚构调用次数、ticker、实时指标或 synthetic Demo。
- 不把 Documented Language Window 解释为钱包持有人会某种语言、拥有特殊信源或具有内幕信息。
- 不输出身份、内幕、因果、买卖、进场或投资成功概率结论。

### 4.3 受保护不变量

| 不变量 | 验收要求 |
|---|---|
| API | URL、method、JSON 字段、错误 code、data_status、默认行为完全兼容。 |
| Evidence | 原始 title、publisher、quote、URL、timestamp、hash 和 language label 不翻译、不改写。 |
| Data status | recorded、live、synthetic、cached 等内部值不翻译；显示标签可双语化。synthetic 不进入用户 Demo。 |
| Payment | x402 V2 challenge、HTTP 402、headers、scheme、network、asset、amount、payTo、resource 和幂等行为不变。 |
| Analysis | 六维集群、herding veto、语言时间窗和 uncertainty 算法不变；术语不能增强证据强度。 |
| Session count | 只显示从 0 开始、由当前本地会话实际请求计算的 Session Request Count；不得出现 CALL_COUNT_BASE=1223 或其他历史基数。 |
| Locale storage | cookie 只含合法 locale，不含钱包、报告、run_id、付款或任何敏感数据。 |

## 5. 中英文覆盖矩阵

下表定义实施时必须覆盖的可见区域。通用 UI 文案使用 dictionary key；专业指标、证据状态和支付状态必须同时拥有唯一 Glossary term_id。

| UI 区域 | zh-CN | en | 数据／契约规则 |
|---|---|---|---|
| 品牌 | Alibi | Alibi | 品牌名不翻译。 |
| 页面标题 | 中文本地化标题 | 英文本地化标题 | locale-aware metadata；不改 SEO route。 |
| 导航、面板 | 中文 | English | 只改变显示。 |
| 输入、按钮、提示 | 中文 | English | 请求路径和请求体不变。 |
| loading | 明确说明正在读取并计算 | Same meaning in English | 不能暗示已完成或已验证 live。 |
| empty | 明确无数据／无结果 | Same meaning in English | 不填入 synthetic 结果。 |
| success | 成功且显示 data status | Same meaning in English | 成功不等于 attribution 成立。 |
| error | 错误及可重试性 | Same meaning in English | 不暴露内部堆栈。 |
| provider_unavailable | Provider 不可用 | Provider unavailable | 保留 enum；显示降级限制。 |
| upstream_unavailable | 上游不可用 | Upstream unavailable | 不把失败标为 live。 |
| payment_required | 需要付款 | Payment required | HTTP 402 与 x402 说明保持准确。 |
| insufficient_evidence | 证据不足 | Insufficient evidence | 不输出确定性先手结论。 |
| unattributed | 未归因 | Unattributed | 仅指当前检索范围未找到合格证据。 |
| indeterminate | 不确定 | Indeterminate | 时间区间重叠或校准不足时使用。 |
| unsupported_language | 不支持的语言 | Unsupported language | 原文仍保留并显示原始语言。 |
| cluster_without_verified_source | 无已验证信源的集群 | Cluster without verified source | 不称内幕集群或操纵。 |
| documented_language_window | 已记录语言时间窗 | Documented language window | 只表达来源时间区间关系，不推断语言能力。 |
| Summary | 摘要 | Summary | 现有 API JSON 不变。 |
| Attribution | 归因详情 | Attribution detail | 付费边界与现有路由不变。 |
| 时间证据链 | 时间证据链 | Time Evidence Chain | 原始时间戳和时区不变。 |
| 六维指标 | 六维集群指标 | Six-dimension cluster metrics | 每个指标挂唯一 TermHelp。 |
| Agent Console | Agent Console／代理控制台 | Agent Console | run_id、status、data_status 为原值。 |
| JSON export | 导出 JSON | Export JSON | JSON 内容和字段继续英文 contract。 |
| Audit Markdown | 导出审计 Markdown | Export Audit Markdown | 客户端 renderer 使用点击时 locale；原始证据不翻译。 |
| 限制和免责声明 | 中文 | English | 证据强度完全等价，不提供建议。 |

## 6. Locale dictionary 设计

### 6.1 类型与键规则

候选实现应建立一个集中 dictionary，建议形态如下；这是设计约束，不是本轮代码变更：

    export type Locale = "zh-CN" | "en";

    export interface UiDictionary {
      brand: string;
      navigation: Record<string, string>;
      actions: Record<string, string>;
      states: Record<string, string>;
      errors: Record<string, string>;
      fields: Record<string, string>;
      disclaimers: Record<string, string>;
      markdown: Record<string, string>;
    }

    export const DICTIONARY = {
      "zh-CN": { /* complete key set */ },
      en: { /* exactly the same key set */ },
    } satisfies Record<Locale, UiDictionary>;

实施验收必须通过编译期和运行期两层检查：

- 两个 locale 的 key 集合完全相同；
- 翻译键缺失时回退到英文并记录缺失键，不显示空白；
- 非法 locale 清除 cookie 并回退 zh-CN；
- dictionary 不接收 API payload、钱包地址、报告内容或支付 payload；
- 原始证据内容不经过 dictionary。

### 6.2 状态和原始值显示规则

内部枚举继续以英文原值传递。UI 只在边界处调用 tState(value) 或对应 glossary label：

- recorded 显示为 已记录／Recorded，并与报告一起显示；
- live 显示为 实时／Live，只在实际 live contract 允许时显示；
- synthetic 显示为 合成／Synthetic，且不会进入用户 Demo；
- provider_unavailable、upstream_unavailable、payment_required 等保留原状态值用于 test id、ARIA 和 API 处理，不能把中文文案写回 payload；
- 原始来源语言使用 原文：English／Original: 中文 等当前语言 UI label 加原始语言值；外部标题和引文保留原文。

## 7. Glossary schema 与首批术语表

### 7.1 Schema

候选实现的 Glossary 必须集中、类型安全、term_id 唯一。建议定义如下：

    export type TermId =
      | "summary"
      | "attribution"
      | "time_evidence_chain"
      | "repricing_window"
      | "language_window"
      | "documented_language_window"
      | "unattributed"
      | "insufficient_evidence"
      | "indeterminate"
      | "data_status"
      | "live"
      | "recorded"
      | "synthetic"
      | "cluster"
      | "same_side_ratio"
      | "time_concentration"
      | "median_profile_age_days"
      | "first_trade_ratio"
      | "entry_price_dispersion"
      | "market_novelty_ratio"
      | "herding_pattern"
      | "confidence"
      | "timestamp_uncertainty"
      | "x402"
      | "payment_required"
      | "base_sepolia"
      | "mcp"
      | "erc8004"
      | "provider_unavailable"
      | "upstream_unavailable"
      | "unsupported_language"
      | "cluster_without_verified_source";

    export interface GlossaryEntry {
      term_id: TermId;
      label: { "zh-CN": string; en: string };
      definition: { "zh-CN": string; en: string };
      limitation?: { "zh-CN": string; en: string };
      formula_or_state?: { "zh-CN": string; en: string };
      display: "approved" | "pending_definition";
    }

    export const GLOSSARY = {
      /* exactly one entry per TermId */
    } satisfies Record<TermId, GlossaryEntry>;

pending_definition 作为类型保留，只用于防止未来未经审查的词条被误显示；本 v0.2 批准候选 registry 中不得存在任何 display: "pending_definition" 实例。实施前自动检查必须输出 pending_definition=0，否则不得进入实施 Plan。

### 7.2 首批唯一术语表

下表是 v0.2 的完整首批 registry。term_id 必须唯一；documented_language_window 在本表中只出现一次。

| term_id | 中文名称 | English name | 中文解释与限制 | English definition and limitation |
|---|---|---|---|---|
| summary | 摘要 | Summary | 免费的汇总视图；不等于归因或投资建议。 | Free aggregate view; it is not attribution or investment advice. |
| attribution | 归因详情 | Attribution | 将窗口与合格来源进行可审计匹配；未找到合格证据时为未归因。 | Auditable matching of windows to qualified sources; no qualified match is reported as unattributed. |
| time_evidence_chain | 时间证据链 | Time Evidence Chain | 展示成交、市场变化和来源时间的关系；时间先后不证明因果。 | Shows the relation between trades, market changes, and source times; ordering does not prove causality. |
| repricing_window | 重定价窗口 | Repricing Window | 按已实现规则计算的市场变化时间区间，不是交易建议。 | A market-change interval calculated by the implemented rules; not a trading recommendation. |
| language_window | 语言时间窗 | Language Window | 语言来源时间证据的区间模型；不表示任何人的语言能力或内幕来源。 | An interval model for language-source timing evidence; it does not indicate anyone’s language ability or privileged access. |
| documented_language_window | 已记录语言时间窗 | Documented Language Window | 成交时间落在已验证的本地语言来源与英文来源时间区间之间；只描述文档时间关系，不推断钱包持有人会某种语言。 | Trade time falls between verified local-language and English-source time intervals; it describes documented timing only and does not infer that a wallet holder speaks a language. |
| unattributed | 未归因 | Unattributed | 当前检索范围内未找到合格证据；不表示不存在公开信息。 | No qualified evidence was found within the current retrieval scope; it does not mean that no public information exists. |
| insufficient_evidence | 证据不足 | Insufficient Evidence | 覆盖率或证据质量不足以支持该判断；不补齐、不猜测。 | Coverage or evidence quality is insufficient for the judgment; no completion or guess is made. |
| indeterminate | 不确定 | Indeterminate | 时间区间重叠、校准不足或证据无法区分时使用；不输出方向性结论。 | Used when intervals overlap, calibration is insufficient, or evidence cannot distinguish an order; no directional conclusion is made. |
| data_status | 数据状态 | Data Status | 描述数据来自 recorded、live、synthetic 或其他 contract 状态；不是可信度保证。 | Identifies the data state such as recorded, live, or synthetic; it is not a guarantee of truth. |
| live | 实时 | Live | 当前实时上游读取结果；只有实际 live contract 成立时显示。 | Result read from live upstream sources; shown only when the live contract is actually satisfied. |
| recorded | 已记录 | Recorded | 来自已保存、可复现的数据或 fixture；必须明确标记，不冒充 live。 | From saved, reproducible data or fixtures; must be clearly labeled and never presented as live. |
| synthetic | 合成 | Synthetic | 测试或演示生成的数据；禁止进入用户 Demo 或产品结论。 | Test or demonstration-generated data; prohibited from user demos and product conclusions. |
| cluster | 集群 | Cluster | 满足既定成员和维度规则的交易集合；不表示内幕、操纵或共同控制。 | A trade-member set satisfying the defined dimension rules; it does not indicate insider activity, manipulation, or common control. |
| same_side_ratio | 同向比例 | Same-side Ratio | eligible 且经济方向已知的成员中，占比最高经济方向的比例。方向必须按 BUY／SELL 与 YES／NO 规则归一化；不得写成“主导 BUY 方向比例”。 | Share of the highest-frequency economic direction among eligible members with a known economic direction. Direction must follow the BUY/SELL plus YES/NO normalization rule; do not call it a dominant BUY ratio. |
| time_concentration | 时间集中度 | Time Concentration | 按既定时间离散度规则衡量交易是否集中；不是协同或因果证据。 | Measures temporal concentration under the defined dispersion rule; it is not evidence of coordination or causality. |
| median_profile_age_days | 中位资料年龄 | Median Profile Age | 根据 public profile 的 createdAt 到代表性成交时间计算的 profile age 中位数。unknown 成员不进入中位数；必须同时显示 coverage 与 unknown count。不得称账户年龄、钱包年龄或链上地址年龄。 | Median profile age measured from public profile createdAt to the representative trade time. Unknown members are excluded from the median; coverage and unknown count must be shown. Never call it account age, wallet age, or on-chain address age. |
| first_trade_ratio | 交易历史稀薄度 | Thin-History Ratio | 兼容内部字段名 first_trade_ratio；定义为截至 as-of cutoff，历史成交笔数小于等于 2 的 eligible 成员比例。unknown history 不进入分子或分母；必须显示 coverage；不得称首次交易比例。 | Compatibility field name first_trade_ratio; defined as the eligible-member share with at most two historical trades as of the cutoff. Unknown history is excluded from numerator and denominator; coverage must be shown. Do not call it a first-trade ratio. |
| entry_price_dispersion | 入场价格离散度 | Entry-price Dispersion | 按既定价格变换与离散规则衡量代表性入场价格差异；不是收益预测。 | Measures representative entry-price differences under the defined transform and dispersion rule; not a return forecast. |
| market_novelty_ratio | 市场陌生度比例 | Market Novelty Ratio | eligible 成员中此前没有在该市场交易的比例；内部 API 字段保持 market_familiarity_ratio。不得反向解释为越高越熟悉。 | Share of eligible members with no prior trade in the market; internal API field remains market_familiarity_ratio. Do not reverse this into “higher means more familiar.” |
| herding_pattern | 跟随模式 | Herding Pattern | 满足既定跟随特征规则的结果，并作为 herding veto 门；不用于指控抄袭、操纵或共同控制。 | Result of the defined following-pattern rule and a herding veto gate; not an accusation of copying, manipulation, or common control. |
| confidence | 置信度 | Confidence | 当前数据覆盖和证据质量等级；不表示投资成功概率或因果概率。 | Grade of current data coverage and evidence quality; not the probability of investment success or causality. |
| timestamp_uncertainty | 时间戳不确定性 | Timestamp Uncertainty | 至少 30 个校准样本的绝对误差 P95；样本不足或无法校准时为 unknown，不使用中位数作为安全边界。 | P95 absolute error from at least 30 calibration samples; unknown when samples are insufficient or uncalibrated. The median is not used as a safety bound. |
| x402 | x402 支付协议 | x402 | HTTP 402 保护资源的支付协议边界；本 UI 不接收或显示私钥。 | Payment protocol boundary for HTTP 402 protected resources; this UI never accepts or displays private keys. |
| payment_required | 需要付款 | Payment Required | 资源需要满足现有 x402 V2 challenge；不表示付款成功，也不执行支付。 | Resource requires the existing x402 V2 challenge; it does not mean payment succeeded and performs no payment here. |
| base_sepolia | Base Sepolia | Base Sepolia | 现有测试网标识 eip155:84532；仅用于显示 contract 要求。 | Existing test-network identifier eip155:84532; shown only as the contract requirement. |
| mcp | MCP | MCP | 工具和审计入口的协议名；不改变工具权限或结果。 | Protocol name for tool and audit entry points; it does not change tool permissions or results. |
| erc8004 | ERC-8004 | ERC-8004 | 现有身份／代理边界的协议名；不表示任何身份、信誉或能力已经得到额外证明。 | Protocol name for the existing identity/agent boundary; it does not add proof of identity, reputation, or capability. |
| provider_unavailable | Provider 不可用 | Provider Unavailable | 分析 provider 无法提供结果；保持 unavailable，不降级为 live 或 synthetic。 | The analysis provider cannot provide a result; retain unavailable and do not downgrade it to live or synthetic. |
| upstream_unavailable | 上游不可用 | Upstream Unavailable | 外部读取源不可用或未返回合格数据；不生成虚假 recorded 响应。 | An external read source is unavailable or returned no qualified data; do not fabricate a recorded response. |
| unsupported_language | 不支持的语言 | Unsupported Language | 当前来源语言不在已验证支持范围；保留原文和语言标签。 | Source language is outside the verified support set; preserve the original text and language label. |
| cluster_without_verified_source | 无已验证信源的集群 | Cluster Without Verified Source | 集群规则成立但当前没有合格公开来源；不称内幕集群、协同操纵或信息优势。 | Cluster rules pass but no qualified public source is currently found; do not call it an insider cluster, coordinated manipulation, or an information advantage. |

### 7.3 term_id 映射例外

为保持 API contract，内部字段和 UI term_id 不要求全部同名，但映射必须集中声明且唯一：

| UI term_id | 内部 API／实现字段 | 显示规则 |
|---|---|---|
| median_profile_age_days | median_profile_age_days 或当前 result 的 profile-age 结果 | 固定显示“中位资料年龄／Median Profile Age”。 |
| first_trade_ratio | first_trade_ratio（兼容名）；当前算法输入为 prior_trade_count | 固定显示“交易历史稀薄度／Thin-History Ratio”。 |
| market_novelty_ratio | market_familiarity_ratio（兼容名） | 固定显示“市场陌生度比例／Market Novelty Ratio”。 |

不得再建立 median_account_age 的可见 Glossary 条目，也不得在组件中以旧名作为别名显示。

## 8. D1、D3、D4、D6 实现冲突与安全边界

### 8.1 D1：same_side_ratio

v0.2 的术语定义只能写成“eligible 已知经济方向中占比最高方向的比例”。其中：

- BUY／SELL 与 YES／NO 必须按照当前批准规则归一化到经济方向；
- 不能把 BUY 本身当作“同向”，也不能只比较 outcome；
- tie、unknown 和不完整数据仍按现有 contract 状态处理；
- UI 不得把该指标写成主导 BUY 比例、内幕一致性或操纵证据。

实际代码 src/analysis/cluster-language.ts:116-133 当前在 entry 过滤阶段要求 trade.side !== "BUY" 时丢弃，并在 dimension 计算阶段直接统计 YES／NO。这与上述批准语义不一致，属于 IMPLEMENTATION_CONTRACT_CONFLICT_D1。本候选不改该代码；实施 Plan 必须把算法修复另列 Change Control，或在批准的实现边界中明确由主 Codex 先完成规则对齐后再验证 Glossary。

### 8.2 D3：median_profile_age_days

当前 cluster-language.ts:142-149 使用 profile_created_at 对应的 public profile createdAt 计算天数，排除 unknown／不完整 profile，并通过 coverage、known_count、member_count 表达。实施 UI 时：

- unknown count 派生为 member_count - known_count，不新增 API 字段；
- 中位数只从 known rows 计算；
- label 和 tooltip 都不能出现 account、wallet、address age；
- coverage、known count、unknown count 必须一起可见或通过可访问详情可见；
- 不改变 D3 gate、阈值或 result 字段。

### 8.3 D4：first_trade_ratio／Thin-History Ratio

当前 cluster-language.ts:151-154 计算 prior_trade_count <= 2 的比例，并排除 history_complete === false 或 null 的成员。它符合 thin-history 的语义，但：

- 现有 CR 文本保留 first_trade_ratio 作为内部字段名；
- 该字段名如果在实际 Summary／Detail JSON 中出现，UI 必须只通过 term_id=first_trade_ratio 显示 Thin-History Ratio；
- 若实现输出仍是另一个字段或含义无法与该 contract 证明一致，必须在实现 Change Control 中解决；
- UI 不得通过更换 label 掩盖字段值或算法差异；
- unknown history 不计入分子或分母，coverage 必须显示。

此项记录为 IMPLEMENTATION_CONTRACT_CONFLICT_D4，不是本 CR 的语言待决项。

### 8.4 D6：market_novelty_ratio

当前 cluster-language.ts:167-170 用 prior_market_trade_count === 0 计算比例，并保留 compatibility name。UI 只能显示“市场陌生度比例／Market Novelty Ratio”，解释为此前没有在该市场交易的比例，不得写“市场熟悉度”或“越高越熟悉”。

## 9. TermHelp 交互设计

### 9.1 状态机

TermHelp 是真实 button，其状态机必须区分临时打开和固定打开：

| 状态 | 进入 | 离开 | 行为 |
|---|---|---|---|
| closed | 初始、Escape、再次点击、外部点击 | hover/focus 或 click/touch | 不渲染可见解释框，按钮仍可 Tab 聚焦。 |
| transient_open(term_id, hover) | pointer enter | pointer leave、外部点击、Escape 或转为 pinned | 仅临时显示；pointer leave 可关闭。 |
| transient_open(term_id, focus) | focus | focus leave、外部点击、Escape 或转为 pinned | 键盘聚焦时可见；focus leave 可关闭。 |
| pinned_open(term_id, click/touch) | click、Enter、Space、touch | Escape、再次点击同一按钮、外部点击、切换到另一 term | pointer leave 和 focus leave 不自动关闭；同一时间只能有一个 pinned 术语。 |

语言切换时保留当前 term_id：如果该 term 当前 pinned，仍 pinned 但内容换成新语言；如果是 transient，保持 transient 触发来源并刷新文本。切换语言不能重新调查、重新请求或清除结果状态。

### 9.2 无障碍要求

- 使用真实 button，不能以 span 或仅 hover 替代；
- aria-label 使用当前 locale，例如“解释：中位资料年龄”／“Explain: Median Profile Age”；
- 解释框使用可关联的 aria-describedby；如果未来包含交互控件，升级为合适的 popover/dialog 语义，不使用只读 tooltip 冒充对话框；
- 支持 Tab、Enter、Space、Escape；
- 可见 focus ring 必须符合现有 CSS 体系；
- 解释框不遮挡关键按钮，不越出视口，并在移动端、200% zoom 下重新定位；
- reduced-motion 下禁用非必要动画；
- 同一时间最多一个 pinned 解释框；
- 点击外部由 document-level pointer handler 关闭，但不能误关闭按钮自身的 click；
- hover 不是唯一入口。

## 10. 持久化、SSR 与 hydration

### 10.1 固定方案

采用 locale cookie＋SSR initial locale：

- cookie 名：alibi_locale；
- 合法值只允许 zh-CN 或 en；
- 缺失、非法或损坏值回退 zh-CN，非法值可清除；
- SameSite=Lax; Path=/; Max-Age=31536000；
- HTTPS 环境增加 Secure；
- cookie 只保存 locale，不保存钱包、报告、run_id、付款 payload、API response 或任何敏感数据；
- 页面可以因为读取 cookie 而成为动态渲染；
- html lang 必须与 SSR locale 一致，客户端切换也必须同步；
- 页面主要内容可保持局部 lang 标记，但不得再与当前 locale 冲突。

### 10.2 当前架构适配

当前 app/page.tsx 是 client component、app/layout.tsx 是静态 server layout。实施时可采用最小侵入拆分：server wrapper 读取 locale 并把 initial locale 传入 client shell；layout 负责同一 cookie 的 html lang 和 locale-aware metadata。若 Next.js 当前版本要求不同的动态 API，必须遵循仓库 AGENTS.md 指向的本地 Next.js guide；不新增依赖。

实施必须避免：

- 首屏先显示错误语言再闪换；
- client hydration 使用不同的初始 locale；
- client locale change 触发 postJson、run refresh 或清空当前 Summary／Detail／Audit 状态；
- 把 cookie 值直接当作任意字符串渲染。

## 11. Markdown 双语导出方案

### 11.1 范围

只本地化当前已有的 Agent Console Audit Markdown 导出。Summary 和 Attribution Detail 不增加 Markdown 路由、按钮或 query；若未来需要完整 Summary／Detail Markdown，必须另走 Change Control。

### 11.2 共享纯 renderer

建议新增 client-safe 的纯函数：

    renderAuditMarkdown(report: AuditReport, locale: Locale): string

要求：

- renderer 只接受已获取的 Audit JSON 和 locale；
- 不读取 cookie、不发请求、不调用支付、不访问数据库、不依赖 server-only module；
- UI 在用户点击导出时以当前 locale 调用 renderer，并通过 Blob 下载；
- 服务端 src/observability/audit-agent.ts:137-161 的英文 renderer 保持兼容；
- /audit 与 /api/v1/agents/runs/[runId] 不新增 locale query；
- 现有 JSON 导出继续使用英文字段、英文 contract 和原始枚举。

### 11.3 可翻译与不可翻译内容

可翻译：

- 报告标题；
- 字段 label、表头、Limitations 标题；
- UI 生成的说明和免责声明；
- status／data_status 的显示 label（不改实际值）。

不可翻译或不可改写：

- run_id、worker／agent id、event count、数字、价格、coverage、duration、cost；
- data_status、status、error code、policy flag 的实际 contract 值；
- 原始 evidence title、publisher、quote、URL、timestamp、timezone、hash；
- 外部来源原始语言文本及原始引用；
- 任何没有证据的补充结论。

### 11.4 Markdown 验收

同一 Audit JSON 分别用 zh-CN 和 en renderer 输出：

- 两份文件的原始证据、URL、hash、run_id、数字和枚举值完全一致；
- 标题、字段 label、说明和免责声明在相应语言；
- 切换页面语言后不重新请求 Audit JSON；
- 服务端 /audit?format=markdown 仍返回原有英文行为；
- 不存在 Summary／Attribution 新 Markdown 按钮或路由。

## 12. 术语覆盖审计

### 12.1 审计目标

所有实际显示的以下类别都必须映射到唯一 term_id：

- 专业指标：D1—D6、时间证据、语言时间窗、confidence、timestamp uncertainty；
- 证据状态：recorded、live、synthetic、unattributed、insufficient evidence、indeterminate、cluster without verified source、provider／upstream unavailable、unsupported language；
- 支付状态：x402、Payment Required、Base Sepolia；
- 平台入口术语：Summary、Attribution、Agent Console、MCP、ERC-8004；
- 实际出现在 Audit Markdown 或用户可见 limitation 中的专业术语。

### 12.2 审计方法

实施前和实施后都执行：

1. 从 app/page.tsx、拆分后的 UI 文件、现有 Evidence 组件和 Audit export 入口生成可见字符串 inventory；
2. 对每个指标／状态查出唯一 term_id；
3. 静态搜索重复解释片段，禁止组件自行定义同一术语的第二份 definition；
4. 检查 Glossary key 数量与 registry 数量一致；
5. 检查 documented_language_window 只出现一次；
6. 检查 pending_definition 实例数为 0；
7. 对无法正式定义的新增术语直接阻止进入 Plan，不在 UI 中临时生成解释。

### 12.3 当前审计结果

当前项目尚未有集中 Glossary 和 locale dictionary，因此 v0.1／现有 UI 中的解释重复和中英文混杂是真实缺口。v0.2 已为要求的首批术语给出定义；完成实施后必须以自动化测试证明覆盖率和唯一性，而不是凭视觉抽查宣称完成。

## 13. 文件变更矩阵

以下是获批并进入后续实施时的候选文件边界，不是本轮实际修改。未列文件不得因本 CR 自行修改。

| 文件 | 目的 | 是否修改 API／contract | 是否需要测试 | 备注 |
|---|---|---:|---:|---|
| app/layout.tsx | 读取 locale cookie；输出 SSR html lang；locale-aware title／description | 否 | 是 | 品牌 Alibi 不翻译；可能启用动态渲染。 |
| app/page.tsx | 保留页面结构并接入 dictionary、TermHelp、当前 locale；必要时变为 server wrapper | 否 | 是 | 不改请求路径、payload、状态机或分析逻辑。 |
| app/page-client.tsx | 若采用 server wrapper，承载现有 client state 和 UI | 否 | 是 | 仅在拆分是当前 Next.js 最小安全方案时新增。 |
| app/globals.css | TermHelp／popover、focus、200% zoom、responsive、reduced-motion 样式 | 否 | 是 | 不引入 CSS／JS 依赖。 |
| src/ui/i18n.ts | Locale、dictionary、fallback、locale normalization | 否 | 是 | 不存储 payload 或敏感数据。 |
| src/ui/glossary.ts | 类型安全唯一 Glossary registry、coverage helpers | 否 | 是 | D1/D4 冲突只记录，不修改算法。 |
| src/ui/term-help.tsx | TermHelp 状态机和 ARIA 行为 | 否 | 是 | 真实 button；最多一个 pinned term。 |
| src/reports/markdown.ts | client-safe Audit Markdown pure renderer | 否 | 是 | 不改变 server English renderer；仅 Audit。 |
| app/audit/route.ts | 不修改 | 否 | 回归测试 | 不增加 locale query。 |
| app/api/v1/agents/runs/[runId]/route.ts | 不修改 | 否 | 回归测试 | 保持现有英文 Markdown API。 |
| src/observability/audit-agent.ts | 不修改 | 否 | 回归测试 | 保持服务器端英文 artifact 和兼容性。 |
| src/contracts/** | 禁止修改 | 必须保持不变 | contract regression | 不新增双语字段。 |
| src/analysis/cluster-language.ts | 禁止在本 CR 修改 | 必须保持不变 | algorithm regression | D1/D4 冲突另走 Change Control。 |
| tests/unit/ui-i18n.test.ts | dictionary、Glossary、locale normalize、pending count | 否 | 新增 | 纯本地测试。 |
| tests/unit/audit-markdown.test.ts | renderer 原始字段保持和双语 label | 否 | 新增 | 不调用付费服务。 |
| tests/integration/api-contract.test.ts | API 路径／JSON／402 回归 | 否 | 新增或扩展 | 只读，不支付。 |
| tests/e2e/i18n.spec.ts | locale 切换、cookie、SSR、metadata、无重新请求 | 否 | 新增 | recorded fixture 或受控 mock，不能把 synthetic 当 Demo。 |
| tests/e2e/term-help.spec.ts | hover/focus/click/touch/Escape/outside/ARIA | 否 | 新增 | desktop、mobile、200% zoom。 |
| tests/e2e/accessibility.spec.ts | 双语、focus、reduced-motion、200% 回归 | 否 | 扩展 | 保留现有测试。 |
| tests/e2e/cluster-language.spec.ts | D3/D4/D6 标签和限制文案 | 否 | 扩展 | 不验证未解决算法冲突为已修复。 |

获批后预计修改的最小集合是：app/layout.tsx、app/page.tsx 或其必要 client split、app/globals.css、src/ui/i18n.ts、src/ui/glossary.ts、src/ui/term-help.tsx、src/reports/markdown.ts 及对应测试。实际新增／修改文件必须在实施开始前与本矩阵逐项对照；若需要改变 API、算法、依赖或其他文件，必须暂停并走合并 Change Request。

## 14. 不变量与禁止覆盖文件

以下内容在本候选及后续 UI 实施中均受保护：

- /Users/a0000/polymarket/SPEC-ALIBI-PLATFORM.md v0.7；
- /Users/a0000/polymarket/PLAN-ALIBI-PLATFORM.md v0.7；
- 已批准或历史 CR／Plan；
- /Users/a0000/polymarket/src/contracts/**；
- /Users/a0000/polymarket/src/analysis/**；
- /Users/a0000/polymarket/src/api/**；
- x402 V2 scoped package、支付配置和 payment-identifier 逻辑；
- recorded fixtures、数据库 schema、migration、环境文件；
- MCP、Chrome Extension、ERC-8004、WebSocket、RAG 和多 Agent 既有入口；
- package.json、package-lock.json 及任何依赖配置；
- 原始证据字段和外部来源内容。

## 15. 测试矩阵

### 15.1 Unit

| 测试 | 明确断言 |
|---|---|
| locale-normalization | 只接受 zh-CN／en；缺失／非法值回退 zh-CN；不保留敏感数据。 |
| dictionary-completeness | 两种 locale key 集合一致；缺失键 fallback 英文并记录；不输出空白。 |
| glossary-unique-term-ids | 每个 term_id 唯一；documented_language_window 恰有一条；registry 无重复 alias。 |
| glossary-pending-definition | pending_definition === 0；D3、D4、D6、D1 解释精确匹配 v0.2。 |
| glossary-safety-wording | D3 不出现 account／wallet／address age；D4 不出现 first-trade label；D6 不出现“越高越熟悉”；D1 不出现 dominant BUY wording。 |
| markdown-renderer | zh/en 只翻译 renderer-owned labels；raw title、quote、URL、hash、run_id、数字和 enum 完全保留。 |
| term-help-state | transient leave 关闭；pinned leave 不关闭；Escape、再次点击、外部点击关闭；最多一个 pinned；locale switch 保留 term_id。 |

### 15.2 Integration

| 测试 | 明确断言 |
|---|---|
| API compatibility | /summary、/attribution、/audit 与 v1 外部 API 的 URL、method、JSON contract 不变。 |
| 402 compatibility | HTTP 402、PAYMENT-REQUIRED、x402 requirement、data_status 和 payment boundary 不变；不发送支付。 |
| server Markdown compatibility | /audit?format=markdown 和 v1 agent route 仍返回原有英文 server output；无 locale query。 |
| locale switch no requery | 在已有 Summary／Detail／Audit 状态下切换 locale，fetch／POST 计数不增加，run_id 和数据不变。 |
| recorded safety | recorded label 可见；synthetic response 不进入用户可见 Demo；unavailable 不被改写为 live。 |
| metadata | SSR title、description、html lang 随 cookie 正确输出；Alibi 不翻译；SEO route/API 不变。 |

### 15.3 E2E 与视觉

| 场景 | 覆盖 |
|---|---|
| 双语桌面 | 中文／英文首页、Summary、Attribution、Evidence、Agent Console、x402、限制和导出入口。 |
| 双语移动端 | 中文／英文 viewport；TermHelp 不越界；按钮可触摸；原始证据可横向或安全换行。 |
| 200% zoom | 中文／英文；无关键内容遮挡；焦点顺序和按钮仍可操作。 |
| 键盘 | Tab、Enter、Space、Escape；不依赖 hover；固定解释框可关闭。 |
| reduced-motion | 无非必要动效；状态和语言切换仍可见。 |
| popover 边界 | 视口顶部、底部、左右边界和窄屏；自动定位不遮挡关键操作。 |
| 状态全覆盖 | loading、empty、success、error、recorded、live、synthetic（仅受控测试）、provider_unavailable、upstream_unavailable、payment_required、insufficient_evidence、unattributed、indeterminate、unsupported_language、cluster_without_verified_source、documented_language_window。 |
| export | JSON 仍是英文 contract；Audit Markdown 使用点击时 locale；原始证据不翻译；不出现新增 Summary／Attribution Markdown 按钮。 |

### 15.4 依赖与安全回归

- 不安装依赖，不改变 package 或 lockfile；执行 npm ls／lockfile hash 检查证明不变。
- 执行 Secret scan；不得出现 cookie 中的敏感字段、私钥、支付 payload 或新增外部凭据。
- 执行 clean-room：在只含 approved files、现有依赖和 recorded fixture 的干净副本中构建并运行双语页面；不得依赖未声明文件或联网服务。

## 16. 双语截图验收矩阵

| 编号 | 画面 | 关键检查 |
|---|---|---|
| S1 | 中文 desktop | 首屏、Summary、六维指标、语言时间窗、限制；html lang=zh-CN。 |
| S2 | English desktop | Same content in English; html lang=en; Alibi unchanged. |
| S3 | 中文 mobile | 导航／按钮／TermHelp／证据原文不溢出。 |
| S4 | English mobile | Same responsive and accessibility checks. |
| S5 | 中文 200% zoom | 无裁切、无遮挡、focus visible、popover 可关闭。 |
| S6 | English 200% zoom | Same. |
| S7 | Keyboard | TermHelp focus、Enter/Space pin、Escape close、outside click close。 |
| S8 | reduced-motion | 无不必要过渡；状态切换和 popover 定位正常。 |
| S9 | Popover top/bottom | 视口顶部／底部边界自动定位。 |
| S10 | Popover left/right | 窄屏和左右边界不越界、不遮挡 payment／retry 按钮。 |
| S11 | Audit Markdown | 中文／英文文件头、字段 label、说明、免责声明变化；原始证据一致。 |

截图只能来自 recorded Demo 或专门标注为测试的受控 mock。不得用 synthetic ticker、synthetic CLI 结果或虚构指标制作用户演示截图。

## 17. 风险、回滚与 Change Control

### 17.1 风险

| 风险 | 影响 | 控制 |
|---|---|---|
| SSR cookie 使页面动态化 | 缓存策略或 hydration 行为变化 | 只读取白名单 locale；测试 SSR／CSR 一致；不缓存敏感数据。 |
| UI 拆分扩大 diff | 无意改变请求或状态生命周期 | 先锁定请求函数、状态和 fixture 快照；只替换显示层。 |
| Glossary 漂移 | 证据强度被语言增强 | 单一 registry、唯一 term_id、定义测试和人工 review。 |
| D1 经济方向冲突 | UI 可能展示算法未兑现的名称 | 在 implementation Change Control 解决；本 CR 不宣称已修复。 |
| D4 字段命名冲突 | API 字段名与用户理解错位 | 保留内部兼容字段，UI 固定 Thin-History Ratio；实施前验证实际 payload。 |
| 原文被翻译 | 破坏证据可复现性 | Markdown raw-field snapshot 和 hash 对比。 |
| 200%／移动端 popover 溢出 | 关键内容不可访问 | 视觉矩阵、边界测试、ARIA 和键盘验收。 |

### 17.2 回滚

当前项目此前审计显示不是 Git 仓库，因此回滚不能依赖 git reset --hard 或 git checkout --。获批实施前必须：

1. 对矩阵内每个将修改或新增的文件保存修改前 SHA-256；
2. 将修改前文件安全备份到 /private/tmp/alibi-ui-i18n-rollback-<timestamp>/，不放入项目根目录；
3. 记录新增文件清单和原文件是否存在；
4. 回滚时只恢复矩阵内文件，并删除本次新增的 UI 文件；
5. 重新核验 Spec、Plan、package、lockfile、contracts、fixtures 和数据库未改变；
6. 运行 locale、API、build、clean-room 回归后再报告回滚完成。

不得使用破坏性 Git 命令，不得删除项目根目录的无关用户修改。

### 17.3 Change Control 触发条件

必须合并为一份新的 Change Request，不得混入本 CR 的 UI 实施：

- 需要修改 D1—D6 或语言时间窗算法；
- 需要修改 API 字段／route／枚举或增加双语 JSON 字段；
- 需要增加 Summary／Attribution Markdown 路由或按钮；
- 需要新增依赖、支付服务、数据模型、数据库、环境凭据或网络权限；
- D1/D4 implementation contract 冲突无法在现有批准边界内解决；
- 需要恢复 synthetic、实时 ticker、虚构指标或把 recorded 标为 live。

## 18. Definition of Done

只有同时满足以下条件，后续实施才可报告完成：

1. zh-CN／en dictionary 类型安全且 key 集合一致；
2. 首次访问默认 zh-CN；locale cookie 只允许两个值，格式和 Secure 规则正确；
3. SSR title、description、html lang 与 locale 一致，品牌 Alibi 不翻译；
4. locale 切换不刷新、不重新调查、不重新请求、不清除 Summary／Detail／Audit 状态；
5. 所有实际显示的专业指标、证据状态和支付状态映射到唯一 term_id；
6. documented_language_window 只出现一次；Glossary pending_definition=0；
7. D3 使用“中位资料年龄／Median Profile Age”，依据 public profile createdAt，unknown 不进入中位数，并显示 coverage 和 unknown count；
8. D4 使用“交易历史稀薄度／Thin-History Ratio”，保留内部兼容字段名，unknown history 不进入分子／分母，并显示 coverage；
9. D6 使用“市场陌生度比例／Market Novelty Ratio”，解释为无先前该市场交易，不作反向熟悉度表述；
10. D1 的 glossary 使用经济方向最高占比定义，且实现冲突被明确报告，未被词汇表掩盖；
11. TermHelp 支持 hover/focus transient、click/touch pinned、Escape／再次点击／外部点击关闭、唯一 pinned、语言切换保留 term_id；
12. TermHelp 满足真实 button、ARIA、键盘、移动端、200% zoom、reduced-motion 和 viewport 边界要求；
13. 仅现有 Audit Markdown 支持客户端双语 renderer；服务端英文 Markdown、JSON contract、路由和默认行为不变；
14. 原始标题、引文、URL、hash、时间戳、语言和枚举值未被翻译或修改；
15. synthetic 未进入用户 Demo，recorded 显示 recorded 标签；
16. 不改变 API、algorithm、x402 V2、依赖、fixtures、数据库、Spec 或 Plan；
17. Unit、integration、E2E、accessibility、视觉截图、reduced-motion、200% zoom、Secret scan 和 clean-room 验证全部有证据；
18. 发生 D1/D4 或其他架构冲突时没有越权修改，而是按 Change Control 记录；
19. 所有实际修改文件、前后 hash、测试命令、截图路径、未验证项和最终状态已写入交接文档；
20. 未将项目状态从 PARTIALLY_VERIFIED 擅自改为 COMPLETE 或 FULLY_LIVE_VERIFIED。

## 19. 已关闭的全部待决项

本 v0.2 不保留需要人类回答的待决问题。以下决定均视为已关闭并写入候选规范：

1. D3 显示名称、字段、createdAt 来源、unknown 排除、coverage／unknown count 和禁止的 account/wallet/address 术语。
2. D4 显示名称、内部兼容字段、<=2 定义、unknown 排除和 coverage。
3. 只本地化现有 Audit Markdown；不增加 Summary／Attribution Markdown 路由或按钮。
4. 使用共享纯 renderer；UI 使用已有 Audit JSON；不加 locale query；服务器英文 Markdown 保持兼容。
5. 使用 alibi_locale cookie＋SSR initial locale；合法值、默认值、SameSite、Path、Max-Age、Secure 和敏感数据边界固定。
6. Glossary 删除重复 documented_language_window，term_id 唯一。
7. D6 改为“市场陌生度比例／Market Novelty Ratio”，内部字段不变，禁止反向熟悉度解释。
8. D1 采用经济方向最高占比定义；当前实现不一致必须作为缺陷记录，不能用 Glossary 掩盖。
9. TermHelp transient／pinned 状态机、Escape、再次点击、外部点击、唯一 pinned 和 locale switch 行为固定。
10. 术语覆盖审计、唯一映射和 pending_definition=0 是进入 Plan 的硬门槛。
11. 浏览器 title、description、html lang 进入验收；Alibi 不翻译；SEO route/API 不变。

## 20. 仍存在的真实阻塞项

以下不是待人类选择的事项，而是当前代码与批准语义之间的事实冲突。v0.2 不能自行修改算法，因此在进入实现 Plan 前必须由后续 Change Control 或明确的实现边界处理：

### BLOCKER-1：IMPLEMENTATION_CONTRACT_CONFLICT_D1

证据：/Users/a0000/polymarket/src/analysis/cluster-language.ts:116-133。当前 entry 筛选拒绝非 BUY，随后只统计 YES／NO；当前 reason 也是 Same-side BUY ratio.。v0.2 要求的术语定义是 BUY／SELL＋YES／NO 经济方向归一化后，eligible 已知方向中最高方向的比例。当前实现不能被验证为符合该规则。禁止在 Glossary、UI 或测试标题中宣称冲突已解决。

### BLOCKER-2：IMPLEMENTATION_CONTRACT_CONFLICT_D4

证据：/Users/a0000/polymarket/src/analysis/cluster-language.ts:151-154 当前计算 prior_trade_count <= 2 的 thin-history ratio，而批准 CR 文本保留 first_trade_ratio 作为内部字段名。UI 语义应按本候选固定为 Thin-History Ratio，但实际 API 字段的最终映射和算法 contract 仍需要实施阶段核验；如不一致，不得仅改 label 使其看似一致。

除上述两项外，本 v0.2 没有需要人类补充回答的阻塞。它们也不授权本轮修改代码、Spec、Plan、依赖、API 或算法。

## 21. 后续实施 Plan 的候选范围（不是 Plan）

本节只定义未来 Plan 的候选分层，不生成或批准 Plan：

| 层级 | 内容 | 前置条件 |
|---|---|---|
| P0 | 复核 D1／D4 implementation conflict；锁定实际 result 字段、覆盖率和现有 tests；生成变更前 hash | 不修改算法；必要时先走合并 Change Control |
| P1 | 建立 locale normalization、dictionary、Glossary 和 coverage audit | pending_definition=0；term_id 唯一 |
| P2 | 接入 cookie SSR、html lang、metadata 和无闪烁切换 | P1；遵循当前 Next.js guide |
| P3 | 接入 TermHelp、ARIA、popover 状态和 responsive/reduced-motion 样式 | P1；不改变数据请求生命周期 |
| P4 | 接入现有 Audit JSON 的 client pure Markdown renderer | P1；服务端英文 renderer 回归测试通过 |
| P5 | 双语页面、状态、D3/D4/D6、Agent Console、x402 和限制文案集成 | P1—P4；recorded 安全检查通过 |
| P6 | Unit、integration、E2E、视觉、clean-room、Secret scan 和回滚演练 | P0—P5；无新增依赖或越权文件 |

如果 P0 发现必须修改 Spec、API、算法、依赖、数据模型、支付或外部服务，必须停止并创建一份合并 Change Request；不得把扩展内容塞入 UI 国际化实现。

## 22. 审计结论

v0.2 已把所有用户明确的人类决定关闭，并将 v0.1 的术语歧义、重复条目、Markdown 范围、locale 方案、TermHelp 状态机和 metadata 验收改成可执行候选约束。该候选仍不是实施授权：D1 经济方向实现与 D4 字段／实现映射冲突必须保留，且任何超出 UI 文件矩阵的修改都需要 Change Control。

本轮未修改任何项目文件、依赖、Spec、Plan、API、算法、fixtures、数据库或支付配置；未生成 Plan；未实施代码。

候选文件 SHA-256：在文件最终写入后计算，并在本任务最终报告中给出。该摘要不嵌入文件正文，以避免自引用哈希无法稳定定义。

唯一批准命令：

APPROVE: CR-UI-I18N-GLOSSARY-001 v0.2
