# Alibi Complete Runnable Demo Spec

版本：v0.2  
状态：APPROVED VIA `AGENT-OBS-BUNDLE-001 v0.2`  
基线：Alibi PRD v1.0 + Complete Runnable Demo Execution Protocol v18.0 + CHANGE-AGENT-OBS-001  
研究日期：2026-09-04（Asia/Shanghai）  
预算上限：USD 10

## 1. Goals：规范优先级与目标

本 Spec 受以下优先级约束：安全红线 > 人类最新明确决定 > 本 Spec > 执行 Plan > PRD > 工程推断。

Alibi 是面向 Polymarket 的 Trust Agent：在只读前提下，解析市场或钱包公开输入，规范化价格和交易时间线，检测显著重定价，使用带时间元数据的公开证据进行保守归因，并展示覆盖率、限制和可验证报告。

本 Spec 的产品目标是完成可安装、可启动、可测试、可演示、可回放的完整 Demo，不是静态页面或仅有单元测试的骨架。

## 2. Non-Goals 与 Security Constraints（安全红线）

明确不做：

- 自动交易、下单、取消订单、复制交易或买卖方向；
- 连接用户钱包、签名、托管资金、收集或输出私钥；
- 主网资金操作；
- 推断钱包持有人身份、指控主体或判断内幕交易；
- 个性化投资建议；
- 精确 PnL 重算、秒级订单簿回放、钱包聚类；
- Chrome Web Store 上架；
- 新增正式新闻 API 供应商；
- 未经 Change Control 的新页面、外部服务、依赖、数据模型或架构层。

所有结论必须限定为：该钱包在已观察样本中的收益和时间特征。页面和 API 必须包含：

> 不构成投资建议；不提供买卖方向；不指控任何主体。时间上的先后关系不等于因果、内幕交易或确定的信息优势。

## 3. User Flows

### 3.1 市场分析

1. 用户粘贴 Polymarket market URL。
2. 系统解析 URL、读取 Gamma market metadata 和 CLOB price history。
3. 系统规范化价格点，按默认阈值检测重定价窗口。
4. 系统将每个窗口与精选公开证据时间线对齐。
5. 用户先看到免费 Summary；点击完整归因后进入支付 required 状态。
6. 支付成功后展示 Detail；无有效来源的窗口必须显示 `unattributed`。

### 3.2 钱包分析

1. 用户输入 Profile URL 或 `0x` 地址。
2. 系统读取公开 Data API trades，保留交易 timestamp、side、asset/outcome、price、size、market 和 transaction hash（若有）。
3. 系统将交易与市场重定价窗口时间对齐，计算符合定义的估算指标。
4. 覆盖率低于 40% 时只显示 `insufficient_evidence`，不显示信息先手率或能力判断。

### 3.3 Agent 调用

Agent 调用与 Web 用户共享相同的 JSON contract：`/summary` 免费，`/attribution` 需 x402。Agent 必须能处理 HTTP 402、在 Base Sepolia 完成测试支付后重试并获取 Detail；服务端不接收 Agent 私钥。

### 3.4 离线回放

外部服务不可用时，用户可明确选择或系统明确显示 `recorded` 回放。回放来自此前成功联网流程的脱敏响应；`synthetic` 只允许用于单元测试和故障测试，不得表述为真实调查。

## 4. Functional Requirements

### FR-01 输入解析

支持：

- Polymarket market URL；
- Polymarket Profile URL；
- `0x` 钱包地址。

非法 URL、错误链地址、空输入和未支持路径返回结构化 `invalid_input`，不得发起无意义上游请求。

### FR-02 只读数据接入

批准的数据源边界：

- Gamma API：市场/事件元数据和 token 映射；
- CLOB API：价格和价格历史；
- Data API：钱包公开交易记录；
- 精选公开证据集或受控公开网页：事件证据。

所有外部请求必须有超时、有限重试、来源 URL、检索时间和原始响应状态。不得使用交易、签名、bridge 或主网资金接口。

### FR-03 数据状态

每份 fixture、响应和报告必须带 `data_status`：

- `live`：当前联网读取；
- `recorded`：此前成功联网响应的脱敏回放；
- `synthetic`：仅测试或故障注入数据；
- `cached`：带原始来源和时间的本地缓存。

状态必须贯穿 Summary、Detail、API、UI 和测试报告。不能把 recorded、synthetic 或 cached 写成 live。

### FR-04 重定价检测

默认参数固定为：

- 观察窗口：60 分钟；
- 绝对价格变化阈值：`>= 0.08`；
- 钱包分析窗口：最近 90 天；
- 钱包覆盖率门槛：`0.40`。

对同一 token 的按时间排序价格点，寻找时间差不超过 60 分钟且绝对变化达到阈值的候选窗口；输出窗口起止时间、起止价格、绝对变化、方向、采样粒度和数据完整性。重叠候选必须稳定去重，保留最大变化并记录合并关系。

阈值在本 Spec 中不得校准或改动。若未来需要校准，必须先在 Plan 中批准方法、样本和对照，并通过 Change Log 记录旧值、新值、原因和测试影响。

### FR-05 Attribution Rules（证据归因）

LLM 只允许用于候选证据与重定价窗口的相关性判断；重定价检测、时间比较、覆盖率和先手率必须使用确定性规则。

每个证据至少包含：URL、标题、`published_at`、`retrieved_at`、来源等级、许可证/使用限制、`data_status`、与价格窗口的时间关系。

规则：

1. URL 必须来自检索结果或精选证据集，LLM 不得生成或猜测 URL。
2. `published_at` 缺失或无法解析时，不得作为支持性证据。
3. 来源直接支持的字段标记 `[Confirmed]`。
4. 多项证据支持但不是直接事实的判断标记 `[Strong inference]`。
5. 待验证判断标记 `[Hypothesis]`。
6. 没有足够来源支持时标记 `[Unattributed]`，不得补写合理解释。
7. 证据发布时间晚于价格已变动窗口时，只能标记为“价格先动、随后出现公开证据”，归类为资金驱动/时间顺序不支持信息先行；不得声称资金是唯一原因。
8. 任何归因都必须显示置信度和限制；置信度不是因果概率。

### FR-06 钱包指标

只分析最近 90 天内、具有必要 timestamp 和市场映射的公开交易。

简化收益方向使用 `size × price_change`，页面必须写明“收益数据为估算，非精确结算结果”。不实现仓位结算、赎回和精确 PnL。

先手率定义：

```text
先手率 = 进场早于对应重定价事件的盈利交易数
       ÷ 可归因的盈利交易总数
```

只有同时满足以下条件的交易才进入分子或分母：

- 交易方向与重定价后价格方向一致；
- 可确定交易时间、市场、价格和对应窗口；
- 对应窗口归因状态不是 `unattributed`；
- 简化方向收益为正。

覆盖率定义为：可完整时间对齐且满足必要字段的候选交易数 / 观察到的候选交易数。覆盖率 `< 0.40` 时状态为 `insufficient_evidence`，禁止输出先手率、信息优势或判断优势结论。

### FR-07 Summary 与 Detail

免费 Summary 至少包含：

- 输入类型和脱敏标识；
- 数据状态、分析窗口、数据覆盖率；
- 市场重定价次数或钱包活跃市场摘要；
- 最近窗口的保守成因摘要；
- `unattributed` 数量；
- 方法限制和免责声明；
- Detail 需要 0.01 USDC 支付的说明。

付费 Detail 至少包含：

- 完整重定价时间线；
- 每个窗口的价格变化、证据 URL、发布时间、检索时间、来源等级、状态和置信度；
- 钱包交易与事件的逐条时间对齐；
- 先手率（仅在覆盖率达标时）；
- 排除项、未能归因项、持仓周期偏差和数据限制。

### FR-08 API 与错误

建议接口契约：

- `POST /summary`：免费；请求 `{ "input": "<market-url|profile-url|0x-address>", "mode": "live|recorded" }`。
- `POST /attribution`：同一输入；无有效付款返回 HTTP 402；验证通过返回 Detail。
- `GET /health`：只返回本地服务和 fixture 状态，不调用付费 API。

统一错误 envelope：

```json
{
  "error": {
    "code": "insufficient_evidence",
    "message": "Data is insufficient for a capability conclusion.",
    "retryable": false,
    "data_status": "live",
    "retrieved_at": "2026-09-04T00:00:00Z"
  }
}
```

必备错误状态：`invalid_input`、`upstream_unavailable`、`rate_limited`、`partial_data`、`insufficient_evidence`、`unattributed`、`payment_required`、`payment_invalid`。

### FR-09 单页 Web UI

不新增页面；实现一个单页流程，至少包含：

- 首页输入框、Analyze 按钮和 3 个预设 Demo（1 个市场、2 个钱包）；
- loading；
- error；
- insufficient data；
- unattributed；
- payment required；
- success。

每个状态都必须由 API 响应或本地 fixture 驱动，并可自动化测试映射，不得只用静态文案假装完成。

## 5. Data Contracts

以下字段是跨数据源的最小稳定契约；额外 raw 字段可以保留，但不能替代必需字段。

```text
InputRef {
  kind: "market" | "profile" | "wallet",
  raw: string,
  normalized_id: string,
  source_url: string | null
}

PricePoint {
  market_id: string,
  token_id: string,
  timestamp: string,
  price: number,
  source: string,
  data_status: DataStatus
}

Trade {
  wallet: string,
  market_id: string,
  token_id: string | null,
  timestamp: string,
  side: "BUY" | "SELL" | "UNKNOWN",
  outcome: string | null,
  price: number | null,
  size: number | null,
  transaction_hash: string | null,
  maker_taker: "MAKER" | "TAKER" | "UNKNOWN",
  source_type: "DIRECT" | "NEG_RISK" | "SPLIT" | "MERGE" | "TRANSFER" | "REDEEM" | "UNKNOWN",
  data_status: DataStatus
}

Evidence {
  id: string,
  url: string,
  title: string,
  published_at: string | null,
  retrieved_at: string,
  source_level: string,
  license_or_restriction: string,
  data_status: DataStatus,
  time_relation: "before" | "during" | "after" | "unknown"
}

RepricingWindow {
  id: string,
  market_id: string,
  token_id: string,
  start_at: string,
  end_at: string,
  start_price: number,
  end_price: number,
  absolute_change: number,
  direction: "UP" | "DOWN",
  threshold: number,
  observation_window_minutes: 60,
  attribution_status: "information_consistent" | "capital_consistent" | "unattributed" | "insufficient_evidence",
  evidence_ids: string[],
  confidence: number | null
}

WalletMetrics {
  wallet: string,
  analysis_start: string,
  analysis_end: string,
  observed_trades: number,
  aligned_trades: number,
  coverage_rate: number,
  attributable_profitable_trades: number,
  early_profitable_trades: number,
  information_lead_rate: number | null,
  status: "information_pattern" | "judgment_pattern" | "insufficient_evidence"
}
```

`DataStatus = live | recorded | synthetic | cached`。

## 6. Payment Contract

支付只保护 Detail，不保护 Summary、health 或输入解析。

- HTTP：未付款或付款无效时真实返回 `402 Payment Required`。
- 方案：x402 `exact`。
- 网络：Base Sepolia，CAIP-2 `eip155:84532`。
- 价格：`0.01 USDC`，最终原子单位和 token contract 由批准的实现配置核验。
- `payTo`：公开收款地址，仅通过安全环境变量注入。
- facilitator：通过环境变量配置；具体供应商和部署参数在 Plan 阶段核验，不在本 Spec 擅自新增正式服务。
- Web 用户和买方 Agent 使用完全相同的 402 challenge/verify/retry contract。
- 服务端不接收、记录、托管或输出买方私钥；买方签名只发生在用户/Agent 本地。
- 失败包括错误网络、金额不足、过期 challenge、重复结算和 facilitator 不可用，并返回 `payment_invalid` 或保留 402。

官方 x402 文档确认 Base Sepolia 的 CAIP-2 标识为 `eip155:84532`，测试 facilitator 可支持 Base Sepolia；真实验证仍必须在联网阶段完成并产生脱敏记录。[x402 seller quickstart](https://docs.x402.org/getting-started/quickstart-for-sellers) · [network migration](https://docs.x402.org/guides/migration-v1-to-v2)

## 7. Architecture Boundary

PRD 固定的技术方向：Next.js + TypeScript + Tailwind；Anthropic API 仅用于事件归因；无数据库，使用文件/内存缓存；部署目标为 Vercel。实现时必须保持以下逻辑边界：

```text
Input Parser
  → Read-only Adapters (Gamma / CLOB / Data / evidence)
  → Normalizer + Data Status
  → Deterministic Repricing Engine
  → Evidence Validator + Attribution Boundary (LLM only here)
  → Wallet Alignment + Coverage Gate
  → Summary / Detail API
  → Web UI + x402 protected Detail
```

只要上游失败，adapter 必须返回可区分的 error/status，不得静默使用 synthetic 数据冒充 live。recorded 回放必须由 manifest 指明来源、采集时间、脱敏状态和 schema 版本。

## 8. UI States / State Mapping

| UI 状态 | 触发条件 | 必须显示 |
|---|---|---|
| Loading | 请求开始 | 输入已解析、当前数据模式、可取消/等待提示 |
| Error | invalid/upstream/rate limit/unknown error | 错误 code、是否可重试、数据状态、限制 |
| Insufficient data | 覆盖率 `< 0.40` 或关键字段缺失 | “数据不足以判断”，不显示能力结论 |
| Unattributed | 无合格来源支持窗口 | `[Unattributed]`、排除统计、缺失原因 |
| Payment required | Detail 未付款 | HTTP 402 对应说明、0.01 USDC、Base Sepolia、免责声明 |
| Success | Summary/Detail 合法返回 | 报告、证据链、覆盖率、来源状态、限制和免责声明 |

## 9. Acceptance Criteria

只有全部通过才能标记 `COMPLETE`；否则只能是 `BLOCKED`、`FAILED` 或 `PARTIALLY VERIFIED`。

1. 单条明确命令可安装并启动。
2. 支持市场 URL、Profile URL 或钱包地址。
3. 正常模式使用真实 Polymarket 数据。
4. 上游不可用时明确切换 recorded 离线模式。
5. 生成规范化价格与交易时间线。
6. 按默认阈值检测重定价窗口。
7. 至少三个真实市场生成带 URL 和时间戳的证据时间线。
8. 至少一个真实且明确标记的 `unattributed` 案例。
9. 至少两个符合样本要求的钱包完成时间对齐与先手率分析。
10. 覆盖率低于 40% 时禁止输出能力结论。
11. 免费 Summary 与付费 Detail 的内容边界可验证。
12. Detail 未付款真实返回 HTTP 402。
13. Web 用户通过 Base Sepolia 测试支付后解锁 Detail。
14. 买方 Agent 通过 Base Sepolia 测试支付后解锁 Detail。
15. 服务端不托管、不记录、不输出用户私钥。
16. UI 包含 loading、error、insufficient data、unattributed、payment required、success。
17. 自动化测试覆盖输入解析、规范化、重定价、归因约束、覆盖率、限制状态、402 和解锁流程。
18. UI 状态映射通过测试，不新增未批准页面。
19. 联网模式至少成功完成一次真实测试网 x402 验证。
20. 成功联网验证后生成脱敏 recorded 回放。
21. 完整流程可在断网/外部服务不可用时重复演示。
22. README、架构、Spec、Plan、Verification、Change Log、研究矩阵和 90 秒脚本齐全。
23. 包含“不构成投资建议”“不提供买卖方向”“不指控主体”和证据限制声明。
24. 全新环境按文档复现成功。

## 10. Open Questions

这些问题不阻止本 Spec 生成，但在 Plan/执行前必须验证或触发 Change Control：

1. Polymarket 公开价格历史实际粒度、分页和速率限制是否满足 60 分钟窗口。
2. Data API 对指定演示钱包是否提供足够 timestamp、market 映射和 90 天样本。
3. 三个真实市场和两个钱包的最终选择及其证据可用性。
4. 精选公开证据集的来源许可、发布时间稳定性和检索方式。
5. x402 facilitator 的批准部署配置、`payTo` 地址、Base Sepolia 测试 USDC 和 gas。
6. Anthropic API 凭据与单次归因成本是否能在 USD 10 上限内完成真实验证。
7. Vercel/本地运行时对 x402 middleware、fixture replay 和跨域请求的兼容性。

如果第 1 或第 2 项失败，必须按 PRD 风险路径缩减到可验证入口，并在 Change Log 标为 `PARTIALLY VERIFIED`；不得编造数据补齐验收。

## 11. Go / No-Go

### GO 条件

- Gamma 能解析市场元数据并得到 token 映射；
- CLOB 能提供不超过 1 小时粒度的历史价格；
- Data API 能提供带 timestamp 的钱包交易；
- 选定市场和钱包满足样本、覆盖率和 evidence contract；
- 可以用精选公开证据集完成至少一个真实 `unattributed` 案例；
- x402 Base Sepolia 资源、买方 Agent 测试凭据和预算满足；
- 全部安全红线和自动化测试通过。

### NO-GO / 条件性降级

- 钱包交易没有可信 timestamp：关闭钱包先手率入口，仅保留市场归因，并标记未完成完整 Demo。
- 价格历史无法达到窗口要求：停止价格归因主流程，提交阻塞报告。
- 证据 URL/发布时间无法验证：全部进入 `unattributed`，不得将报告标为完整归因。
- x402 或测试凭据缺失：可完成无支付本地工作，但最终不得标记 `COMPLETE`。
- 任何需要主网资金、私钥、交易或新增正式供应商的要求：立即触发 Change Control 并停止该分支。

## 12. v0.2 Agent Observation Addendum

### 12.1 目标与架构边界

在现有单页 Demo 中增加 Agent Console 和确定性的 Audit & Report Agent。Audit & Report Agent 是同一 Investigation Orchestrator 进程内的观察模块，不是独立运行时 Agent，不引入多 LLM Agent framework、第二个 Orchestrator、队列、数据库、外部服务、WebSocket 或新页面。

现有 Investigation Orchestrator 仍是唯一执行入口。以下 9 个逻辑 Worker 只表示职责和可审计事件源：`input`、`market-data`、`repricing`、`evidence`、`attribution`、`wallet-analysis`、`policy-verification`、`report`、`payment`。

### 12.2 Worker 与 LLM 边界

- `input`、`market-data`、`repricing`、`evidence`、`wallet-analysis`、`policy-verification`、`report` 和 `payment` 必须确定性实现。
- 只有现有 Attribution Provider 可以调用 Anthropic；Audit & Report Agent 永不调用 LLM。
- Audit & Report Agent 只监听、校验、持久化和汇总事件，不修改 Summary、Detail、Evidence、Attribution、WalletMetrics、PaymentRequirements 或任何业务结果。
- LLM 不得创建输入证据不存在的事实；无足够证据仍输出 `unattributed`；coverage `<0.40` 仍输出 `insufficient_evidence` 并隐藏能力/先手率结论。

### 12.3 Event Contract

每个 Investigation Orchestrator run 必须生成 schema version `1.0.0` 的事件。事件字段和约束如下：

| 字段 | 约束 |
|---|---|
| `run_id` | 单次运行唯一的 opaque UUID；不包含 secret 或原始输入 |
| `sequence` | 从 1 开始的单调整数；同一 run 严格递增 |
| `agent_id` | 9 个固定逻辑 Worker enum；观察模块内部可用 `audit-report` |
| `event_type` | `started`、`completed`、`skipped`、`failed` |
| `status` | `pending`、`running`、`ok`、`blocked`、`failed`、`insufficient` |
| `started_at` / `completed_at` | ISO-8601 UTC；失败事件允许无 completed time |
| `duration_ms` | 非负整数或 `null` |
| `data_status` | 只能是 `live`、`recorded`、`synthetic`、`cached`，并由 Policy Verifier 校验 |
| `input_digest` | 规范化输入的 SHA-256 hex；不保存原始输入 |
| `output_artifact` | 工作区相对路径或稳定 artifact id；禁止绝对路径和 secret |
| `source_count` | 非负整数或 `null` |
| `coverage` | `[0,1]`、`null` 或不适用 |
| `retry_count` | 非负整数，与现有 retry wrapper 一致 |
| `cost_usd` | 来自现有预算 ledger；未知为 `null`，不得虚构 |
| `error_code` | 现有结构化 error enum 或 `null` |
| `policy_flags` | 稳定政策 flag 数组，例如 `coverage_below_gate`、`unattributed`、`payment_required` |

无效事件不得进入汇总。事件、报告和 UI 均不得读取、记录或展示 API Key、私钥、完整请求头、Authorization、Cookie、PAYMENT-SIGNATURE、Anthropic prompt 或原始 Anthropic response。

### 12.4 Artifact、API 与 UI

只使用工作区 append-only artifacts：

```text
artifacts/agent-runs/<run_id>/events.jsonl
artifacts/agent-runs/<run_id>/report.json
artifacts/agent-runs/<run_id>/report.md
```

事件 JSONL 不覆盖、不回退 sequence；JSON/Markdown 是可由事件重放生成的派生报告。导出必须包含 `schema_version`、`run_id`、`generated_at`、`data_status`、限制和免责声明。

现有 `POST /summary` 与 `POST /attribution` 的 `meta` 可增加向后兼容的可选 `run_id`，不改变 `input`/`mode`、免费 Summary 或 x402 gate。新增只读 API：`GET /audit?run_id=<run_id>&format=json|markdown`；不存在 run 返回结构化 `not_found`，不触发外部请求。

Agent Console 必须在现有 `/` 单页中实现：运行中每 1–2 秒轮询 `/audit`，完成、失败或 blocked 后停止；显示 Worker status、duration、data_status、source_count、coverage、retry、cost 和 policy flags；提供 JSON/Markdown 导出；不创建新页面，不使用 WebSocket，不展示完整 challenge 或签名。

### 12.5 Recorded 与缺失资源行为

无 `ANTHROPIC_API_KEY`、无真实 x402 凭据时，仍必须能够完成 recorded Summary、Worker event stream、coverage/unattributed gate、Agent Console、JSON/Markdown report 和 payment-required 边界。Attribution 必须标记 `blocked`/`unattributed`，Payment 必须标记 `payment_required`。synthetic success 只允许用于 contract、fault、integration、E2E 和 UI state tests，不能写成 live 或 recorded。

真实 Anthropic attribution、真实 Base Sepolia verify/settle、Web/Agent unlock、receipt hash 和 paid Detail success 仍是外部待验证项；缺少这些资源时最终状态不得为 `COMPLETE`。

### 12.6 v0.2 DoD 增量

| ID | 验收项 |
|---|---|
| OBS-01 | 单一 Orchestrator 产生 9 个逻辑 Worker 的可校验事件 |
| OBS-02 | Audit & Report Agent 只读事件、无 LLM、业务结果深比较不变 |
| OBS-03 | JSONL append-only，JSON/Markdown 可重放生成 |
| OBS-04 | `/audit` JSON/Markdown API 与可选 `run_id` metadata 向后兼容 |
| OBS-05 | 单页 Agent Console 支持轮询、完成停止和六类限制状态 |
| OBS-06 | 三个 recorded preset 能演示 Console、Summary、coverage/unattributed 和 402 gate |
| OBS-07 | 脱敏、错误、schema、API、E2E、visual、offline、build 和 clean-room verification 通过 |
| OBS-08 | 无 Anthropic/x402 凭据时仍可完成 recorded Console/Report demo，且不误标 live/COMPLETE |

### 12.7 v0.2 审批状态

本 Spec v0.2 由 `AGENT-OBS-BUNDLE-001 v0.2` 原子审批包激活。候选内容或绑定 SHA-256 发生任何变化，必须生成新版本并重新审批。
