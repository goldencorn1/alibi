# CR-UI-CLUSTER-CONSISTENCY-001 v0.3 candidate

状态：DRAFT / Agent Console Glossary coverage extension
日期：2026-09-05

## 0. 版本与控制关系

- `CR-UI-CLUSTER-CONSISTENCY-001 v0.1 candidate` 保留为历史候选，不覆盖、不修改。
- `CR-UI-CLUSTER-CONSISTENCY-001 v0.2 candidate` 保留为历史候选，不覆盖、不修改。
- 本文件是 v0.2 之后的连续 candidate，仅合并 `FULL-AGENT-CONSOLE-GLOSSARY-COVERAGE` 要求。
- v0.2 的 BUY-only 决定、D4 unavailable/insufficient 显示规则和 UI-only 边界继续有效；本文件不重新打开这些决定。
- 本轮只进行实际代码/运行结果的只读审计并生成 CR candidate；不修改代码、依赖、Spec、Plan、API、算法、fixtures、数据库、支付配置或现有候选。
- 本文件获批后必须重新生成 `PLAN-UI-I18N-GLOSSARY-001 v0.3 candidate`；新 Plan 获批前不得继续代码实施。

## 1. v0.2 → v0.3 精确 Diff

### 新增

1. 将 Agent Console 的 Agent/Worker 名称、运行指标、实际状态值和实际 policy flag 纳入 100% Glossary/TermHelp 覆盖门。
2. 增加 `input` 的固定中英文定义，并要求所有实际显示的 Agent/Worker 名称拥有唯一 `term_id`。
3. 增加按实际代码和运行结果生成的 inventory；未观察到的名称不得臆加到产品 UI。
4. 增加 `visible_terms`、`mapped_terms`、`unmapped_terms`、`duplicate_term_ids`、`coverage_percentage` 机器可验证门。
5. 增加候选基线 artifact：`artifacts/verification/ui-i18n-glossary-001/glossary-coverage.json`。当前基线明确为 `FAIL_PREIMPLEMENTATION_BASELINE`，因为现有 Console 尚未逐项接入 TermHelp。
6. 增加 Agent Console 的桌面、移动端、200% zoom、键盘、reduced-motion、语言切换和无新请求测试要求。

### 明确不变

- v0.2 的 BUY-only：BUY YES/NO 进入 candidate，SELL 仅作 context，不进入 candidate、D1–D6、herding 或 formal gate。
- D4：内部 `first_trade_ratio` 不变；只有可信 payload 提供 value、coverage 和 provenance 时显示数值，否则 unavailable/insufficient_evidence；浏览器不补算。
- Agent 工作流、Worker 内部 ID、事件、来源、覆盖率、成本、错误和 policy flag 计算不变。
- API JSON、API 路由、内部枚举、x402 V2、支付边界、fixtures 和所有外部平台入口不变。

## 2. 只读审计证据

| 证据 | 实际发现 |
|---|---|
| `app/page-client.tsx` 的 `PLATFORM_AGENT_IDS.map` | UI 实际显示 `evidence`、`attribution`、`quality-risk`、`audit-report` 四个平台 Agent ID，当前以原始字符串显示，无逐项 TermHelp。 |
| `app/page-client.tsx` 的 `visibleAudit.workers.map` | UI 实际显示 Worker `agent_id`、`status`、`data_status`、`event_count`、`duration_ms`、`source_count`、`coverage`、`retry_count`、`cost_usd`、`error_code`、`policy_flags`。 |
| `src/contracts/index.ts:20-32` | 当前逻辑 Worker contract 为 `input`、`market-data`、`repricing`、`evidence`、`attribution`、`wallet-analysis`、`policy-verification`、`report`、`payment`。 |
| `src/contracts/index.ts:55` | 平台 Agent contract 为 `evidence`、`attribution`、`quality-risk`、`audit-report`。 |
| `src/contracts/index.ts:35-52` | 实际允许的 Worker/Run status 和 `PolicyFlag` 集合已固定；候选不得修改该 union。 |
| `src/engine/analyze.ts:24-130` | `input`、`market-data`、`repricing`、`evidence`、`attribution`、`wallet-analysis`、`policy-verification` 的启动、完成或跳过及其指标来源均由现有代码产生。 |
| `src/agents/orchestrator.ts:11-42` | 只有当前平台报告组装层实际使用 `evidence`、`attribution`、`quality-risk`、`audit-report`；没有观察到 `orchestrator` 作为可见 Worker 卡片。 |
| `src/observability/audit-agent.ts:108-121` | 审计报告按 9 个 `LOGICAL_AGENT_IDS` 生成 Worker 报告；events 是审计事件数，不是市场事件数。 |
| `artifacts/verification/mac-runtime/audit-export.json` | 实际运行样本包含 9 个 Worker；观察到 `recorded_replay`、`no_verified_evidence`、`unattributed`、`credentials_missing`、`not_requested`、`payment_required` 等 flag。该 artifact 的 schema 版本较旧，仅作运行证据，不改变当前 contract。 |
| `src/ui/glossary.ts` | 当前 Glossary 有 39 个条目，尚无 Agent/Worker 专属 term、运行指标专属 term 或 policy flag 专属 term；当前 `TermHelp` 未覆盖 Agent Console 的每个可见项。 |

## 3. 实际 inventory

### 3.1 Agent/Worker 名称

实际平台 Agent：

| 内部 ID | 建议唯一 term_id | 当前可见位置 |
|---|---|---|
| `evidence` | `agent_evidence` | platform agent grid；同时作为 Worker ID |
| `attribution` | `agent_attribution` | platform agent grid；同时作为 Worker ID |
| `quality-risk` | `agent_quality_risk` | platform agent grid |
| `audit-report` | `agent_audit_report` | platform agent grid |

实际逻辑 Worker：

| 内部 ID | 建议唯一 term_id | 代码证据 |
|---|---|---|
| `input` | `worker_input` | `analyze()` startWorker |
| `market-data` | `worker_market_data` | `analyze()` startWorker |
| `repricing` | `worker_repricing` | `analyze()` startWorker |
| `evidence` | `worker_evidence` | `analyze()` startWorker |
| `attribution` | `worker_attribution` | `analyze()` startWorker |
| `wallet-analysis` | `worker_wallet_analysis` | `analyze()` start/skipWorker |
| `policy-verification` | `worker_policy_verification` | `analyze()` startWorker |
| `report` | `worker_report` | orchestrator/report route |
| `payment` | `worker_payment` | attribution/summary route |

`evidence` 和 `attribution` 在平台 Agent 与逻辑 Worker 两个显示类别中出现；为避免同一解释被错误复用，建议使用类别明确的唯一 `term_id`，内部 ID 原样保留在 payload 与 DOM 文本中。

未在当前实际代码或运行 artifact 中观察到、因此不得自动加入当前 UI inventory 的名称：`orchestrator`、`source-discovery`、`language-evidence`、`cluster-analysis`。若未来 UI 显示其中任何名称，coverage gate 必须先失败，直到为其增加唯一 term。

### 3.2 运行指标

当前 Agent Console 实际显示：

| 原始字段/文案 | 建议 term_id | 解释纪律 |
|---|---|---|
| `status` / Run status | `metric_status` | 当前 Agent/Worker 运行状态；`insufficient` 不等于失败。 |
| `data_status` / Data status | `metric_data_status` | 数据状态，不是真实性保证。 |
| `event_count` / Events | `metric_events` | 审计事件数量，不是市场事件数量。 |
| `duration_ms` / duration | `metric_latency` | 当前 Worker 本地处理时间，不是来源发布延迟或市场反应时间。 |
| `source_count` / sources | `metric_sources` | 必须按该 Worker 实际代码确认计数对象，不统一臆测。 |
| `coverage` | `metric_coverage` | 已知、有效或可评估数据比例；`n/a` 不等于 0%。 |
| `retry_count` / retry | `metric_retries` | 本次运行的重试次数，不是历史累计次数。 |
| `cost_usd` / Cost | `metric_cost` | 本次被追踪的外部 API/模型成本；`n/a` 不等于免费。 |
| `error_code` / error | `metric_errors` | 当前 Worker 记录的错误状态；无错误不保证上游完整。 |
| `policy_flags` | `metric_policy_flags` | 机器可读限制/状态/安全标记，不是法律或投资判断。 |
| `run_id` | `metric_run_id` | 当前审计运行标识；不解释为钱包或交易标识。 |
| `limitations` | `metric_limitations` | 当前运行的限制说明，不是错误或投资评级。 |

`confidence` 在主分析结果中可能出现，但当前 Agent Console Worker 卡片未单独显示 confidence 字段；它不得被假设为 Console 可见项。若后续把它显示到 Console，必须先纳入 coverage inventory 和 TermHelp。

### 3.3 实际状态与值

需覆盖的状态/值 term：

- Run/Worker status：`pending`、`running`、`ok`、`blocked`、`failed`、`insufficient`、`skipped`、`completed`、`partial`。
- Data status：`recorded`、`live`、`synthetic`、`cached`。
- Fallback/value：`n/a`、`none`；`n/a` 表示不适用或无法计算，不是 0，`none` 表示本次没有记录该值，不是错误证明。
- 若某状态在页面其他区域出现，例如 `unavailable`，必须使用现有状态 Glossary，并同时保证 Agent Console 入口不会把它解释为失败或 0。

`insufficient` 的中英文解释必须表达“证据/覆盖不足，不能完成结论”，不得写成任务失败；`failed` 才表示当前 Worker 执行失败。

### 3.4 Policy flags

根据 `PolicyFlag` contract、实际运行 artifact 和现有代码，需为以下实际可显示值建立独立 term：

`coverage_below_gate`、`unattributed`、`payment_required`、`credentials_missing`、`not_requested`、`no_verified_evidence`、`recorded_replay`、`synthetic_test`、`audit_partial`、`rag_degraded`、`database_unavailable`、`provider_unavailable`、`stale_data`、`not_enabled`、`live_unverified`。

建议 term_id 统一为 `policy_<flag>`，例如 `policy_recorded_replay`。每个 flag 的解释必须说明它是运行限制、数据状态或安全标记，不是法律判断、投资评级、用户错误或对任何主体的指控。

用户示例 `insufficient_coverage`、`language_calibration_pending` 当前不在 `PolicyFlag` union，也未在 Agent Console 运行 artifact 中观察到；本候选不把它们伪造为当前实际 flag。若未来被加入 contract 或 UI，coverage gate 必须要求新增独立 term。

## 4. 首批 Glossary 扩展定义

### 4.1 `input`

中文：

“输入处理 Worker。负责接收并规范化市场 URL、Profile URL、钱包地址或其他已支持输入，检查格式和支持范围。它不负责归因，也不判断交易质量。”

English:

“Input-processing worker. It receives and normalizes supported market URLs, profile URLs, wallet addresses, or other supported inputs and validates their format and scope. It does not perform attribution or judge trade quality.”

### 4.2 其他 Agent/Worker 定义边界

| term_id 类别 | 必须表达的双语含义 |
|---|---|
| `worker_market_data` | 读取并规范化 Polymarket 市场、交易和价格数据；来源数量必须依实际代码说明其计数对象。 |
| `worker_repricing` | 按确定性阈值检测价格变化窗口；不预测未来价格，不证明新闻导致价格变化。 |
| `worker_evidence` | 检索并验证公开信源 URL、语言和时间戳；insufficient 表示合格证据不足，不表示不存在公开信息。 |
| `worker_attribution` | 对交易、公开信源和重定价窗口进行时间对齐，输出有限状态或弃权；不判断内幕、身份或主观意图。 |
| `worker_quality_risk` / `agent_quality_risk` | 检查覆盖、时间戳不确定性、证据限制和输出政策；不是钱包风险评分或投资建议。 |
| `worker_report` / `agent_audit_report` | 记录运行事件、状态、限制和可导出的审计报告；不改变分析结果。 |
| `worker_wallet_analysis` | 计算现有钱包分析指标并遵守 coverage gate；不推断身份、能力或投资结果。 |
| `worker_policy_verification` | 汇总既定输出政策和限制状态；不作法律或投资判断。 |
| `worker_payment` | 记录现有支付边界/跳过状态；不表示已付款或已结算。 |
| `agent_evidence` / `agent_attribution` | 平台报告层对应的实际 Agent 结果；不得把 Agent 名称解释为独立人格、内幕角色或能力认证。 |

中英文定义必须保持相同证据强度，不得增强为因果、身份、内幕、买卖或投资结论。

### 4.3 指标、状态与 flag 定义纪律

- `events`：审计事件数量。
- `latency`/耗时：Worker 本地处理时间。
- `sources`/来源：依代码确定计数对象。
- `coverage`/覆盖率：已知/有效/可评估数据比例。
- `retries`/重试：本次运行中的重试次数。
- `cost`/成本：本次被追踪调用成本；`n/a` 不显示为免费。
- `errors`/错误：当前 Worker 记录的错误状态；无错误不保证上游完整。
- `policy_flags`：机器可读限制、数据状态或安全标记。
- `recorded_replay`：使用已记录回放；不得解释为 live。
- `no_verified_evidence`：当前范围没有足够合格可验证证据；不等于没有公开信息。
- `unattributed`：当前范围未找到合格归因；不等于没有公开信息。
- `credentials_missing`：所需凭据缺失，相关能力未验证；不暗示用户错误。
- `payment_required`：资源需要现有 x402 challenge；不表示付款成功。
- `provider_unavailable`：分析 provider 无法提供结果；不表示主体有风险。
- `not_requested`：本次运行未请求该 Worker/能力；不表示失败。
- `coverage_below_gate`：覆盖低于既定门槛；不表示数据为零。
- `insufficient`：证据或覆盖不足；不等于 `failed`。
- `n/a`：不适用或无法计算；不等于 0。
- `none`：本次无该值或错误记录；不保证上游完整。

## 5. 100% 覆盖门

后续实现必须由实际 DOM/渲染 inventory 与集中式 Glossary 共同生成：

```text
unmapped_terms = 0
duplicate_term_ids = 0
pending_definition = 0
coverage_percentage = 100%
```

任何未映射词、未知 term、空中英文解释或重复 term_id 都必须使测试失败，不得只记录 warning，不得由 `TermLabel` 的未知值 fallback 掩盖。

`mapped_terms` 的含义是“该可见项有唯一 Glossary term_id 且其可见入口后有独立 TermHelp”，不只是“字符串出现在 Glossary”。同一页面同时显示 Agent/Worker、指标 label、状态值和 flag 值时，每一项都必须可独立聚焦和打开解释。

当前审计 artifact `artifacts/verification/ui-i18n-glossary-001/glossary-coverage.json` 的 `coverage_percentage=0` 是实现前基线，不是通过结果；进入后续实施验收前必须生成新的实际 DOM coverage artifact 并达到 100%。

## 6. TermHelp UI 规则

- Agent 卡片标题、Worker 卡片标题、每个指标 label、status/data-status、`policy_flags` label 和每个 flag value 均有自己的真实 `button` 问号入口。
- 不得用整张卡片一个总问号替代逐项入口。
- hover/focus 为 transient；click/touch 为 pinned；普通 pointer leave/focus leave 不关闭 pinned；Escape、再次点击或 outside click 关闭；同一时间只能 pinned 一个 term_id；切换语言保持同一 term_id。
- 每个按钮具有当前 locale 的 `aria-label`、可见焦点、Tab/Enter/Space/Escape 支持和正确 tooltip/popover 语义。
- mobile、200% zoom、边界位置和 reduced-motion 下不得遮挡数据、按钮或视口。
- 打开/关闭解释不得产生 fetch、POST、支付、签名或重新分析。
- 原始内部 ID、API 字段、状态枚举和 policy flag value 继续原样显示；只本地化说明性文本。

## 7. 精确 UI-only 文件边界

本候选不扩大 v0.2 的边界。获批后新 Plan 仅允许修改以下明确文件或路径：

- `app/layout.tsx`
- `app/page.tsx`
- `app/page-client.tsx`
- `app/globals.css`
- `src/ui/i18n.ts`
- `src/ui/glossary.ts`
- `src/ui/term-help.tsx`
- `src/reports/markdown.ts`
- `tests/unit/i18n.test.ts`
- `tests/unit/glossary.test.ts`
- `tests/unit/markdown.test.ts`
- `tests/unit/term-help.test.tsx`
- `tests/e2e/app.spec.ts`
- `tests/e2e/i18n-glossary.spec.ts`
- `VERIFICATION.md`
- `HANDOFF.md`
- `CHANGELOG.md`
- `artifacts/verification/ui-i18n-glossary-001/**`

明确禁止修改：`src/analysis/**`、`src/contracts/**`、`src/normalize/**`、`src/engine/**`、`app/api/**`、服务端 Summary/Attribution/Audit route、x402/payment、fixtures、package.json、package-lock.json、数据库/migration、环境文件、MCP、Chrome Extension、ERC-8004、WebSocket、RAG、Solidity、v0.7 Spec、既有 CR 和既有 Plan。

## 8. 测试与截图矩阵

后续 Plan 必须包括：

| 测试 | 必须断言 |
|---|---|
| Glossary coverage unit | 每个实际 Agent/Worker、指标、状态、flag 有唯一 term；无空解释、未知 term、重复 ID；四项 coverage gate 全通过。 |
| Agent/Worker TermHelp | 遍历 4 个平台 Agent 与 9 个逻辑 Worker，标题后均可打开中英文解释。 |
| Metric TermHelp | status、data status、events、latency、sources、coverage、retries、cost、errors、policy flags、run ID、limitations 均有独立入口。 |
| State/flag TermHelp | 每个 contract-admitted/实际显示状态和 PolicyFlag 均有独立双语解释；insufficient 不等于 failed；n/a 不等于 0。 |
| Interaction | hover/focus/click/touch/Enter/Space/Escape/outside click/pinned one-at-a-time；切换语言保持 term_id。 |
| Request invariant | 打开解释前后 fetch、POST、支付、分析请求计数不变。 |
| Existing UI/API | 运行 BUY-only、D4 unavailable、recorded、synthetic isolation、legacy API、x402 headers/402 和 JSON contract 回归。 |
| Visual/a11y | desktop、mobile、200% zoom、键盘、reduced-motion、popover 视口边界。 |

截图至少覆盖中文/英文 desktop、中文/英文 mobile、中文/英文 200% zoom、Agent Console 展开、每类 flag、TermHelp 键盘态和边界位置。全部写入 `artifacts/verification/ui-i18n-glossary-001/`。

## 9. 保护的不变量

- 不修改 Agent workflow 或 Worker 内部 ID。
- 不修改事件、来源、覆盖率、成本、错误或 policy flag 的计算。
- 不修改 API JSON、路由、内部枚举、状态机、evidence hash、原始 URL 或原始证据文本。
- 不修改 BUY-only、D1–D6、D4 数据管线、fixtures、recorded/synthetic 隔离。
- 不修改 x402 V2、价格、网络、asset、payTo、facilitator、payment-identifier 或支付流程。
- 不新增依赖、数据库字段、API、服务或配置。
- 不输出内幕、身份、因果、买卖或投资建议。

## 10. 风险、回滚与 Change Control

主要风险是新增 Glossary term_id 与显示类别不一致、flag 集合随 contract 扩展而漏映射、在 `n/a`/`none` 上产生错误数值含义，以及逐项 popover 在窄屏遮挡指标。通过机器 coverage gate、DOM 遍历、API 请求计数、截图和键盘验收阻断这些风险。

回滚仅恢复后续 Plan allowlist 内实际修改文件，使用实施前逐文件 SHA-256 与安全备份；本项目没有可用 Git 仓库，不使用 `git reset`、`git checkout` 或工作区级删除。artifact 仅作为审计证据保留，不恢复或修改受保护产品文件。

若必须修改任何禁止路径、API、contract、依赖、数据库、支付、算法或 Worker 计算，停止并生成一份合并 Change Request；不得通过扩大 allowlist、临时 fixture 或 fallback 绕过。

## 11. Definition of Done

1. 实际 Agent/Worker inventory 与当前代码、运行 artifact 一致；未观察到的名称未被臆加。
2. 所有实际显示 Agent/Worker、指标、状态和 policy flag 均有唯一 term_id、双语解释和独立 TermHelp。
3. `unmapped_terms=0`、`duplicate_term_ids=0`、`pending_definition=0`、`coverage_percentage=100%`。
4. `input` 使用本 CR 的固定双语定义；所有解释不增强证据强度。
5. BUY-only、D4 unavailable、API/x402、recorded/synthetic 隔离保持不变。
6. TermHelp 交互、locale 切换、键盘、mobile、200% zoom、reduced-motion、popover 边界和无新请求测试通过。
7. protected file hash、依赖、fixtures、数据库、环境和支付边界未变化。
8. VERIFICATION、HANDOFF、CHANGELOG 和 coverage artifact 记录实际文件、测试、截图、hash、限制和最终状态。

## 12. 人工待决项与暂停条件

本候选不请求新的产品选择；`input` 定义、BUY-only 和 D4 规则均已确定。唯一需要的人工动作是批准本 CR 后再生成 v0.3 Plan。

只有以下情况才暂停并走合并 Change Control：批准规则无法在第 7 节文件边界内实现；实际 contract 新增无法本地化的 Agent/Worker/flag；或必须修改 API、数据模型、依赖、架构、支付、数据库或算法。普通 Glossary、UI、a11y、测试和截图问题不得扩大范围。

## 13. 候选完整性

- v0.2 文件 SHA-256：由生成后只读校验记录；v0.2 不被覆盖。
- v0.3 candidate SHA-256：生成后单独计算并报告。
- `glossary-coverage.json` 为本次只读审计基线，当前 gate 结果为 FAIL_PREIMPLEMENTATION_BASELINE，未声称实施完成。
- 本轮无代码、依赖、Spec、Plan、API、算法、fixtures、数据库、支付或环境文件写入。

## 14. 唯一批准命令

APPROVE: CR-UI-CLUSTER-CONSISTENCY-001 v0.3
