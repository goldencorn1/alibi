# PLAN-UI-I18N-GLOSSARY-001 v0.2 candidate

状态：DRAFT / 基于 CR-UI-CLUSTER-CONSISTENCY-001 v0.3 的重生成候选
日期：2026-09-05
依据：已批准 `CR-UI-CLUSTER-CONSISTENCY-001 v0.3`

> 本文件是对既有同名 v0.2 candidate 的不可变重生成副本。既有 `PLAN-UI-I18N-GLOSSARY-001-v0.2-candidate.md` 不被覆盖或修改；本 Plan 只在其 UI-only 范围内增加 Agent Console 100% Glossary coverage gate。

## 0. 执行状态与版本关系

- `PLAN-UI-I18N-GLOSSARY-001 v0.1` 已被当前 Change Control 阻塞，不再可执行。
- 已批准 `CR-UI-CLUSTER-CONSISTENCY-001 v0.3` 是本 Plan 对 D1、D4 和 Agent Console Glossary 的最高变更依据。
- 本 Plan 不修改 `SPEC-ALIBI-PLATFORM.md v0.7`、`PLAN-ALIBI-PLATFORM.md v0.7`、Cluster CR/Plan、UI CR 或任何既有批准文档。
- Cluster 继续使用 BUY-only：BUY YES/NO 是 candidate entry，SELL 仅作 context，不进入 candidate、D1–D6、D5、herding 或 formal gate。
- 不实施 SELL economic exposure，不修改 D1–D6，不贯通新的 D4 历史字段。
- D4 数据未贯通时只显示 `unavailable`/`insufficient_evidence`；不修改 API、Trade contract、normalize、engine、report mapping 或数据库。
- 当前为 DRAFT_MODE；本轮只生成 Plan，不修改产品代码、依赖、Spec、API、算法、fixtures、数据库、环境文件或支付配置，不运行测试、migration、支付、签名、链上交易或外部付费调用。

## 1. v0.1 → v0.2 Plan Diff

### 删除旧 Workstream A 的算法修改

相对于 v0.1，本 Plan 不包含：

- 修改 `src/analysis/cluster-language.ts`；
- 修改 D1 eligibility；
- 将 SELL 纳入 candidate、D1、D5、herding 或 formal gate；
- SELL NO/YES economic exposure 归一化；
- 修改 normalize、engine、contract 或 API；
- 贯通新的 D4 历史字段；
- 重写 Cluster 算法测试以支持 SELL。

### Workstream A 改为只读一致性门

- 核验 BUY-only 实际实现和现有 SELL-excluded regression；
- 核验 Glossary 的 same_side_ratio 与 BUY-only 决定一致；
- 核验 D4 数值缺失、coverage 不足或 provenance 不可验证时 UI 显示 unavailable/insufficient；
- 核验浏览器不补算 D4、不伪造 coverage 或 unknown count；
- A-GATE 只读通过后，才允许接入 D1/D4 对应 TermHelp。

### 新增 Agent Console coverage 范围

- 从当前代码和运行 artifact 生成 Agent/Worker、指标、状态和 policy flag inventory；
- 为每个实际显示项建立唯一 `term_id`、中英文名称、双语解释和限制说明；
- Agent Console 中每个 Agent 标题、Worker 标题、指标 label、技术状态、policy_flags label 和每个 flag value 均有独立 TermHelp；
- 以机器门阻断：

```text
GLOSSARY_COVERAGE=100%
UNMAPPED_TERMS=0
DUPLICATE_TERM_IDS=0
PENDING_DEFINITION=0
```

## 2. 批准来源与优先级

冲突裁决顺序：

1. `SPEC-ALIBI-PLATFORM.md v0.7`；
2. 已批准 `PLAN-ALIBI-PLATFORM.md v0.7`；
3. 已批准 `CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2` 与对应 Plan；
4. 已批准 `CR-UI-I18N-GLOSSARY-001 v0.2`；
5. 已批准 `CR-UI-CLUSTER-CONSISTENCY-001 v0.3`，作为本次 UI/Glossary/Agent Console 冲突的最高变更依据；
6. 本 Plan；
7. 实际代码、运行 artifact、测试和浏览器证据，用于核验实际行为，不得反向修改批准规则。

本 Plan 继续继承 UI CR v0.2 的双语、cookie、metadata、Audit Markdown、原始证据和无障碍要求；CR v0.3 仅覆盖旧的四向 economic exposure、D4 数据贯通要求，并新增 Agent Console 全覆盖要求。

## 3. 已知运行基线与实际 inventory

### 3.1 实际代码来源

执行前只读核验以下 symbol/路径：

- `app/page-client.tsx`：`PLATFORM_AGENT_IDS.map`、`visibleAudit.workers.map`、Agent Console metrics/policy flags 渲染；
- `src/contracts/index.ts`：`LOGICAL_AGENT_IDS`、`PLATFORM_AGENT_IDS`、`PolicyFlag`、Audit/Worker status unions；
- `src/engine/analyze.ts`：`input`、`market-data`、`repricing`、`evidence`、`attribution`、`wallet-analysis`、`policy-verification` 的实际 Worker 生命周期；
- `src/agents/orchestrator.ts`：平台 Agent 报告和 `report`/`payment` Worker；
- `src/observability/audit-agent.ts`：9 Worker 报告、event_count、duration、source_count、coverage、retry、cost、error_code、policy_flags；
- `src/reports/markdown.ts`：Audit Worker 表格和原始内部 ID 输出；
- `artifacts/verification/mac-runtime/audit-export.json`：实际运行样本和现有 flag 证据。

### 3.2 Agent/Worker inventory

实际平台 Agent 共 4 个：

| 内部 ID | UI term_id | 显示分类 |
|---|---|---|
| `evidence` | `agent_evidence` | Platform Agent |
| `attribution` | `agent_attribution` | Platform Agent |
| `quality-risk` | `agent_quality_risk` | Platform Agent |
| `audit-report` | `agent_audit_report` | Platform Agent |

实际逻辑 Worker 共 9 个：

| 内部 ID | UI term_id | 代码/运行依据 |
|---|---|---|
| `input` | `worker_input` | `analyze()` 输入解析 Worker |
| `market-data` | `worker_market_data` | `analyze()` 市场/交易/价格读取与规范化 |
| `repricing` | `worker_repricing` | `analyze()` 确定性重定价窗口检测 |
| `evidence` | `worker_evidence` | `analyze()` 公开信源验证 |
| `attribution` | `worker_attribution` | `analyze()` 时间对齐和有限归因状态 |
| `wallet-analysis` | `worker_wallet_analysis` | `analyze()` 钱包指标或 skip 状态 |
| `policy-verification` | `worker_policy_verification` | `analyze()` 输出政策汇总 |
| `report` | `worker_report` | orchestrator/report route |
| `payment` | `worker_payment` | attribution/summary route 的支付边界记录 |

`evidence` 和 `attribution` 在两个显示分类中出现，必须用分类明确的 term_id，内部 ID 不得改变。

未在当前实际 UI/Worker contract 或运行 artifact 观察到的 `orchestrator`、`source-discovery`、`language-evidence`、`cluster-analysis` 不加入当前 inventory。未来若显示，coverage gate 必须先失败，直到有唯一 term。

### 3.3 Agent Console metrics inventory

| 原始字段/label | UI term_id | 固定解释边界 |
|---|---|---|
| Run/Worker `status` | `metric_status` | 运行状态；`insufficient` 不等于 `failed` |
| `data_status` | `metric_data_status` | 数据状态，不是真实性保证 |
| `event_count` / Events | `metric_events` | 审计事件数，不是市场事件数 |
| `duration_ms` / duration | `metric_latency` | 当前 Worker 本地处理时间 |
| `source_count` / sources | `metric_sources` | 必须依据具体 Worker 代码说明计数对象 |
| `coverage` | `metric_coverage` | 已知/有效/可评估数据比例；`n/a` 不等于 0 |
| `retry_count` / retry | `metric_retries` | 本次运行中的重试次数 |
| `cost_usd` / Cost | `metric_cost` | 本次追踪的外部 API/模型成本；`n/a` 不等于免费 |
| `error_code` / error | `metric_errors` | 当前 Worker 记录的错误状态 |
| `policy_flags` | `metric_policy_flags` | 机器可读限制/状态/安全标记 |
| `run_id` | `metric_run_id` | 当前审计运行标识 |
| `limitations` | `metric_limitations` | 当前运行限制，不是投资评级 |

`confidence` 目前未作为 Agent Console Worker 字段单独显示；它在其他分析结果中出现时仍需使用既有 Glossary。若实施时把 confidence 加入 Console，必须先将其加入 inventory 和 coverage artifact；不得静默显示无解释的新增项。

### 3.4 状态和值 inventory

覆盖以下实际 contract/渲染可见值：

- Worker/Run status：`pending`、`running`、`ok`、`blocked`、`failed`、`insufficient`、`skipped`、`completed`、`partial`；
- Data status：`recorded`、`live`、`synthetic`、`cached`；
- fallback/value：`n/a`、`none`；
- 页面其他状态如 `unavailable`、`payment_required`、`provider_unavailable`、`upstream_unavailable`、`unattributed`、`indeterminate`、`empty`、`loading`、`success`、`error` 继续使用既有状态 Glossary，并在其可见入口后提供 TermHelp。

`insufficient` 的定义是证据或覆盖不足，不是 Worker 执行失败；`n/a` 是不适用或无法计算，不是 0；`none` 是本次无值或无错误记录，不保证上游完整。

### 3.5 Policy flag inventory

以当前 `PolicyFlag` union 和实际运行结果为准，必须逐项覆盖：

`coverage_below_gate`、`unattributed`、`payment_required`、`credentials_missing`、`not_requested`、`no_verified_evidence`、`recorded_replay`、`synthetic_test`、`audit_partial`、`rag_degraded`、`database_unavailable`、`provider_unavailable`、`stale_data`、`not_enabled`、`live_unverified`。

当前运行 artifact 已观察到 `recorded_replay`、`no_verified_evidence`、`unattributed`、`credentials_missing`、`not_requested`、`payment_required`；其余为实际 contract-admitted 值，必须预先有 term，避免未来运行时出现无解释 flag。

用户示例 `insufficient_coverage`、`language_calibration_pending` 当前不在 `PolicyFlag` union，不能伪造为实际 flag。若未来 contract 或 UI 增加它们，coverage gate 必须要求新增唯一 term。

## 4. Workstream A：BUY-only / D4 只读一致性门

### A0：基线与保护检查

输入：已批准来源、当前五个初步文件、代码和 coverage artifact。

输出：执行前 hash 清单、inventory、保护清单；不得输出 Secret。

DoD：受保护 hash 与下表一致；工作区没有本 Plan 之外的产品写入；A0 完成后才可进入 A1。

### A1：BUY-only 核验

只读检查 `src/analysis/cluster-language.ts` 和既有 Cluster tests：

- BUY YES → YES entry；BUY NO → NO entry；
- SELL 仅作 context；不进入 candidate、member count、D1–D6、D5、herding 或 formal gate；
- unknown side/outcome 不进入已知方向分母；
- same_side_ratio 是 eligible BUY entries 中最高 YES/NO outcome share；
- 180 分钟窗口、P99、coverage、as-of cutoff、no-lookahead、herding veto、既有阈值和 alert gate 不变。

不得修改该路径或相关测试；只运行/审阅既有证据。

### A2：D4 核验

- 内部字段仅作兼容映射 `first_trade_ratio`；UI 名称为 `Thin-History Ratio`；
- 只有 payload 同时提供 trusted value、coverage 和 provenance 才显示数值；
- unknown/incomplete history 不进入分子或分母，不把 unknown 当 0；
- 缺失/不足时显示 unavailable 或 insufficient_evidence，并解释原因；
- 浏览器不得从交易数组、fixture 默认值、常量或 session state 补算。

### A-GATE

A-GATE 必须全部通过：

1. BUY-only 静态核验通过；
2. SELL-excluded 回归证据通过；
3. same_side_ratio 双语 Glossary 不含 economic exposure 残留；
4. D4 不修改 API/数据管线且安全降级；
5. protected hash 不变；
6. A-GATE artifact 写入批准 verification 目录。

A-GATE 未通过时不得接入 D1/D4 TermHelp；但可继续进行不涉及 D1/D4 的 locale 基础工作。

## 5. Workstream B：UI 国际化、Glossary 与 Agent Console

### B0：类型安全 dictionary / Glossary

- 继承 `zh-CN`、`en`、默认中文、缺失 key 回退英文并记录的既有要求；
- 增加 Agent/Worker、metrics、状态值和 policy flag 的唯一 term_id；
- `input` 使用 CR v0.3 固定中英文定义；
- `market-data`、`repricing`、`evidence`、`attribution`、`quality-risk`、`audit-report` 和其余实际 Worker 按第 3 节含义定义；
- 每个 term 有中文名、英文名、双语解释、必要限制说明和代码/运行依据；
- 不覆盖既有同义 term，不创建组件本地第二份解释；
- `pending_definition=0` 后才可进入 B-GATE。

### B1：SSR locale / metadata

- `alibi_locale` 只接受 `zh-CN`/`en`，默认 `zh-CN`；
- `SameSite=Lax; Path=/; Max-Age=31536000`，HTTPS 增加 `Secure`；
- cookie 不保存钱包、报告、run_id、付款或敏感数据；
- SSR 输出 `<html lang>`、title、description；品牌 `Alibi` 不翻译；
- 切换只更新 React state、cookie 和 lang，不刷新、不重新请求、不清除当前分析。

### B2：TermHelp

每个实际 Agent/Worker 标题、指标 label、技术状态、policy_flags label 和 flag value 后都有独立真实 button：

- hover/focus transient；
- click/touch pinned；
- pinned 不因普通 pointer/focus leave 关闭；
- Escape、再次点击、outside click 关闭；
- 同时最多一个 pinned term；locale 切换保持同一 term_id；
- Tab、Enter、Space、Escape、清晰 focus ring；
- mobile、200% zoom、reduced-motion、viewport 四边界安全；
- 不产生 fetch、POST、支付、签名或重新分析。

### B3：Agent Console 接线

- 保留 GUI/CLI/APP 三面板；
- 保留 raw internal ID、API field、enum、flag value；只翻译说明文字；
- Agent/Worker 卡片标题和每个指标/flag 逐项接入 TermHelp；
- `events`、`sources`、`coverage`、`cost`、`n/a`、`none` 的解释基于第 3 节实际来源；
- `input` 不得解释为归因或交易质量判断；
- Console 只展示当前 API/audit payload；不得引入 synthetic Demo 数据。

### B4：Audit Markdown

- 仅本地化现有 Audit Markdown；
- 使用当前已获取 Audit JSON 的共享纯 renderer；
- JSON/API contract、raw agent_id、status、data_status、policy flag、run_id、URL、hash 和原始引文保持原样；
- 不新增 locale query、API 路由或服务端字段；
- Markdown 中每个 Agent/Worker、指标和 flag 的说明与 UI 使用同一 Glossary。

## 6. 精确文件 allowlist

### 6.1 生产文件（唯一允许修改）

- `app/layout.tsx`
- `app/page.tsx`
- `app/page-client.tsx`
- `app/globals.css`
- `src/ui/i18n.ts`
- `src/ui/glossary.ts`
- `src/ui/term-help.tsx`
- `src/reports/markdown.ts`

### 6.2 测试与文档（唯一允许修改或创建）

- `tests/unit/i18n.test.ts`
- `tests/unit/glossary.test.ts`
- `tests/unit/markdown.test.ts`
- `tests/unit/term-help.test.tsx`
- `tests/e2e/app.spec.ts`
- `tests/e2e/i18n-glossary.spec.ts`
- `VERIFICATION.md`
- `HANDOFF.md`
- `CHANGELOG.md`

### 6.3 Verification artifacts（唯一允许写入路径）

- `artifacts/verification/ui-i18n-glossary-001/**`

必须更新：

- `artifacts/verification/ui-i18n-glossary-001/glossary-coverage.json`

不得修改或创建 Desktop launcher；Desktop launcher 只允许作为已有启动后的页面验证入口读取/手动检查。

## 7. 严格禁止范围

禁止修改：

- `src/analysis/**`、`src/contracts/**`、`src/normalize/**`、`src/engine/**`；
- `app/api/**`、Summary/Attribution/Audit 服务端 route；
- x402/payment、payment-identifier、支付配置、facilitator、payTo、价格或网络；
- package.json、package-lock.json、依赖、fixtures、database/migration、environment files；
- MCP、Chrome Extension、ERC-8004、WebSocket、RAG、Solidity；
- v0.7 Spec、Cluster CR/Plan、UI CR、既有批准 Plan 和 Desktop launcher。

## 8. 执行依赖与并行顺序

| 阶段 | 任务 | 依赖 | 可并行 |
|---|---|---|---|
| P0 | baseline hash、scope、Secret 名称检查、实际 inventory | 无 | 否 |
| A0 | BUY-only/D4 只读一致性门 | P0 | 与 B0/B1 可并行，但结果先于 D1/D4 TermHelp |
| B0 | dictionary、Glossary schema、39 条既有 term 审计 | P0 | 可与 A0 并行 |
| B1 | SSR locale、cookie、metadata/lang | P0 | 可与 A0/B0 并行 |
| B2 | TermHelp 状态机和 CSS | B0、B1 | 可与 B4 并行 |
| B3 | 页面/Agent Console 逐项接线、coverage instrumentation | A-GATE、B0、B2 | 否 |
| B4 | Audit Markdown renderer 接入 | B0 | 可与 B2 并行 |
| T0 | unit/contract/integration tests | B0、B4；D1/D4 tests 需 A-GATE | 部分可并行 |
| T1 | E2E、a11y、截图、Desktop launcher 页面验证 | B3、B4 | 否 |
| V0 | typecheck、lint、Webpack build、完整测试、Secret scan | B3、T0、T1 | 否 |
| V1 | clean-room、protected hash、文档和最终 coverage gate | V0 | 否 |

主 Codex 在每个阶段整合结果、裁决冲突并确认下一阶段只使用 allowlist。普通 UI/lint/hydration/a11y 问题自动修复；不改变 A-GATE 规则。

## 9. 初步文件处置与 hash

执行前必须重新计算并安全备份以下五个初步未接线文件：

| 文件 | 当前 SHA-256 | v0.3 处置 |
|---|---|---|
| `src/ui/i18n.ts` | `28b4403e2fdf0086ff277a49f5e427e9ac86fb500dfbc176bb4cf9016d20b00a` | 保留并扩展 dictionary；无 SELL 残留 |
| `src/ui/glossary.ts` | `0069fb61e79e7e366cc31ade50d533bda132f14f11853e795be5816dc66b22a4` | 保留现有 BUY-only/D4 wording；增加完整 Agent/Worker/metric/status/flag terms |
| `src/ui/term-help.tsx` | `e4192f4457c5d289968d34d337d09dbb6c2ed80826d6714c6fd0f1e319ccf963` | 保留并接入逐项覆盖；不改业务逻辑 |
| `src/reports/markdown.ts` | `5fd05c37d4e7b1ab7749bc309ba7246ec0120195485061b36a5f2cecc332a7b2` | 当前 hash 与既有 baseline 一致；仅在需要共享 Glossary 说明时按 allowlist 精确修改 |
| `app/page-client.tsx` | `b61a252e5d462ab8b874c5877f16198c1843b74ca7a8013bc8f93cf487f44fa2` | 保留 BUY-only/D4 safe display；改为逐项 Console TermHelp 和 coverage gate 接线 |

其他生产文件的实施前 hash 同样必须在 P0 记录；任何 protected 文件异常变化立即停止。

安全备份：项目无可用 Git 仓库，执行开始时将 allowlist 中实际修改文件逐一复制到唯一时间戳的 `/private/tmp/alibi-ui-i18n-glossary-v0.2-backup-*`，记录 hash；不得使用 `git reset`、`git checkout` 或 workspace-wide delete。

## 10. Glossary coverage gate 实现与验收

coverage collector 必须以实际可见 DOM/渲染清单和集中式 Glossary 为输入，输出：

```json
{
  "visible_terms": [],
  "mapped_terms": [],
  "unmapped_terms": [],
  "duplicate_term_ids": [],
  "pending_definition": 0,
  "coverage_percentage": 100
}
```

判定规则：

- `visible_terms`：当前 Agent Console 实际可见的 Agent/Worker、指标、状态和 flag；
- `mapped_terms`：唯一 term_id 存在、双语文本非空、且该可见项有独立 TermHelp；
- `unmapped_terms`：任何无 Glossary 或无 TermHelp 的可见项；
- `duplicate_term_ids`：多个不同可见项错误共享不应共享的 term_id，或 Glossary term_id 重复；
- `pending_definition`：Glossary 中 `display=pending_definition` 的数量；
- `coverage_percentage = mapped_terms / visible_terms * 100`，无可见 Console 项时不伪造 100%。

任何未映射项必须使测试失败，不能 warning-only，不能由未知 ID fallback 到 `data_status` 掩盖。D1/D4 和 Agent Console coverage 两个门均通过后才允许 B-GATE。

## 11. 测试矩阵

### Unit / contract / integration

- dictionary key parity、缺失 key fallback、非法 locale 回退中文；
- Glossary term_id 唯一、双语解释非空、`pending_definition=0`；
- Agent/Worker inventory 100% 覆盖；指标 100% 覆盖；状态/flag 100% 覆盖；
- `input` 固定定义、events/sources/coverage/cost/n/a/none/insufficient 解释纪律；
- same_side_ratio BUY-only wording 与实际实现一致；SELL-excluded regression 继续通过；
- D4 value/coverage/provenance 存在才显示数值，缺失/不足为 unavailable/insufficient；unknown 不进入分子/分母；不浏览器补算；
- Audit Markdown 双语 renderer 只翻译说明文本，保留 raw IDs、status、data_status、URL、hash、原始标题/引文和 JSON contract；
- TermHelp provider 单实例、唯一 pinned、transient/pinned 状态、locale 切换保持 term_id。

### E2E / API invariants

- 中文默认、英文切换、Cookie 持久化、SSR metadata/title/description/html lang；
- 切换语言不刷新、不发 Summary/Attribution/Audit 请求、不清除当前状态；
- Agent/Worker 每个标题均有问号；每个指标 label 均有问号；每个状态/flag value 均有问号；
- hover/focus/click/touch/Enter/Space/Escape/outside click 全流程；
- 打开 TermHelp 前后 fetch/POST/payment/analyze request count 不变；
- mobile、200% zoom、reduced-motion、popover 四边界不遮挡且可键盘访问；
- API 路径、JSON 字段、run_id、recorded/synthetic、x402 V2 402/header/价格/网络/asset/payTo/payment-identifier 不变量；不支付；
- recorded Demo 不显示 synthetic ticker、CLI 结果或虚构指标；
- 既有 `/summary`、`/attribution`、`/audit` 和 `/api/v1/*` 行为不变，不新增 `/api/*` adapter；
- Desktop launcher 仅做已有启动后的页面/health 验证，不修改 launcher 文件，不执行支付或 live attribution。

### Visual / accessibility screenshot matrix

| 场景 | 必须验收 |
|---|---|
| 中文 desktop | Console 展开、Agent/Worker/metric/flag 问号、无截断 |
| English desktop | 同上，Alibi 不翻译 |
| 中文 mobile | popover 不溢出、不遮挡关键操作 |
| English mobile | 同上 |
| 中文 200% zoom | 所有问号和指标可见、可键盘访问 |
| English 200% zoom | 同上 |
| Keyboard | Tab/Enter/Space/Escape、focus ring、single pinned |
| reduced-motion | 无强制动画、状态切换稳定 |
| Popover bounds | 左/右/上/下边界和视口底部安全定位 |

所有截图与 coverage artifact 写入 `artifacts/verification/ui-i18n-glossary-001/**`。

## 12. API、x402、fixtures 和安全不变量

- 不新增 API 路由、query、字段或 adapter；
- JSON/API contract 继续英文；内部 enum、raw ID、policy flag、run_id 不回写翻译；
- HTTP 402、`PAYMENT-REQUIRED`、x402 V2、exact scheme、Base Sepolia `eip155:84532`、0.01 USDC、asset、payTo、resource 和 facilitator 配置不变；
- TermHelp 和 locale 切换不得触发 payment request；不接受或显示私钥；
- recorded fixture 只读；synthetic 仅作隔离测试，禁止进入用户 Demo；
- Secret scan 只报告文件名/结果，不输出值；
- 不执行真实支付、签名、链上交易、主网、migration、付费 API 或 live attribution。

## 13. 子智能体分工与主 Codex 责任

获批后可最多使用 4 个只读子智能体，且不得继续分派下级任务：

| 子任务 | 只读范围 | 输出 |
|---|---|---|
| Glossary/coverage auditor | `src/ui/glossary.ts`、i18n、coverage artifact、实际 term inventory | term 唯一性、双语完整性、unmapped/duplicate/pending 证据 |
| Console/UI auditor | `app/page-client.tsx`、layout/page、renderer | 实际 Agent/Worker/metrics/flag 可见项和接线缺口 |
| A11y/interaction auditor | TermHelp、CSS、E2E 结果/截图 | keyboard、popover、mobile、200% zoom、reduced-motion 证据 |
| Regression/security auditor | protected paths、tests、fixtures、API/x402 edges | BUY-only/D4/API/synthetic/Secret/hash 不变量 |

子智能体不得写文件、安装依赖、运行 migration、支付、签名或外部付费调用。主 Codex 独立核验关键引用，负责唯一写入、冲突裁决、整合和最终验证。结论冲突时以批准 CR/实际代码/可复现实验证据裁决，不以多数票裁决。

## 14. Clean-room 与验证流程

批准后按以下顺序：

1. P0 重新计算 protected hash、allowlist hash、coverage baseline 和 Secret scan；
2. 保存逐文件 hash/安全备份；
3. 运行 A-GATE 只读核验；
4. 在 allowlist 内完成 B0–B4；
5. 运行 targeted unit/contract/integration；
6. 运行完整测试、typecheck、lint、Webpack build；
7. 启动本地 recorded 服务并执行 Summary/Audit/legacy routes smoke；
8. 只读验证 x402 402 challenge，不付款；
9. Playwright desktop/mobile/200%/keyboard/reduced-motion/TermHelp；
10. 通过已有 Desktop launcher 做页面/health smoke，不修改 launcher；
11. Secret scan、source/protected hash/lockfile integrity；
12. clean-room 临时目录中使用现有 lockfile 验证，不引入依赖、不改变产品 lockfile；
13. 生成最终 `glossary-coverage.json`，四项 gate 必须全通过；
14. 更新 `VERIFICATION.md`、`HANDOFF.md`、`CHANGELOG.md`，记录实际修改文件、测试数量、截图、hash、外部未验证项和最终状态。

## 15. 回滚方案

- 项目无可用 Git 仓库；使用 P0 逐文件 SHA-256 和 `/private/tmp/alibi-ui-i18n-glossary-v0.2-backup-*` 安全备份；
- 只恢复本次 allowlist 中实际修改的文件；不删除或覆盖其他路径；
- 恢复后重跑 typecheck、lint、targeted tests、recorded replay、API/x402 smoke 和 clean-room hash；
- 保留审计 artifact，但将 coverage 标记为 rollback state；
- 不使用 `git reset --hard`、`git checkout`、递归删除或工作区级覆盖。

## 16. 失败与 Change Control

普通 UI、CSS、翻译 key、hydration、键盘、popover、截图、测试和 lint 问题，只要在第 6 节 allowlist 内，主 Codex 自动诊断修复并继续。

仅在以下情况暂停：

- 已批准 BUY-only/D4 规则不足以确定 UI 行为；
- 实际 payload/contract 与 D4 既定语义冲突；
- 必须修改 API、数据模型、算法、依赖、架构、支付、数据库或禁止路径；
- 出现 Secret、权限、不可恢复操作或安全阻塞。

若出现多个越界问题，合并成一份 Change Request 和唯一批准口令；不得拆分审批，不得用 fallback、fixture、临时配置或翻译掩盖冲突。

## 17. Definition of Done

1. `PLAN-UI-I18N-GLOSSARY-001 v0.1` 不再执行，且 v0.2 明确继承 v0.3 CR。
2. A-GATE 证明 BUY-only、SELL exclusion、same_side_ratio 和 D4 safe display 未改变。
3. 全部现有 UI 双语、SSR cookie、metadata、`<html lang>`、Audit Markdown 和原始证据保护通过。
4. 实际 4 个平台 Agent、9 个逻辑 Worker、所有 Console metrics、实际/contract-admitted 状态和 policy flags 均有唯一 term_id 与独立 TermHelp。
5. `GLOSSARY_COVERAGE=100%`、`UNMAPPED_TERMS=0`、`DUPLICATE_TERM_IDS=0`、`PENDING_DEFINITION=0`。
6. TermHelp 全交互、keyboard、mobile、200% zoom、reduced-motion、popover bounds 和无新请求测试通过。
7. API、x402、fixtures、recorded/synthetic、BUY-only、D1–D6、D4 data pipeline、MCP/Extension/ERC-8004/WebSocket/RAG 和 protected hash 不变。
8. Desktop launcher 页面验证完成但 launcher 文件未修改。
9. 完整测试、build、recorded replay、Secret scan、clean-room、截图和 coverage artifact 有实际证据。
10. `VERIFICATION.md`、`HANDOFF.md`、`CHANGELOG.md` 完整记录；本地 Demo 只有在所有本地门通过后才可标记 `RUNNABLE_DEMO_COMPLETE`，不得标记 `FULLY_LIVE_VERIFIED`。

## 18. 无人值守执行边界

Plan 获批后主 Codex 可连续执行 P0–V1，不需要逐批人工确认。允许自主完成 allowlist 内代码、CSS、Glossary、TermHelp、测试、截图、文档和 clean-room 工作；子智能体始终只读。

无人值守期间不得：安装/升级依赖、修改 package/lockfile、修改 Spec/CR/Plan、修改 API/算法/数据模型、运行 migration、执行支付/签名/链上交易、访问主网、调用付费服务、发布公共端点或修改 Desktop launcher。

唤醒条件只有：越过 allowlist、需要新增依赖/服务/架构/API/算法/支付/数据库、发现安全/权限/不可恢复操作、或批准规则与实际 contract 产生实质冲突。多个唤醒问题合并为一份 Change Request。

## 19. 本轮自检与候选 hash

- 已读取并核验既有 v0.2 Plan、已批准 v0.3 CR、当前 5 个初步文件和 coverage artifact；
- 未运行测试、构建、migration、支付、签名、链上交易或外部付费调用；
- 未修改既有同名 v0.2 Plan、Spec、CR、代码或依赖；
- 当前 coverage artifact 是实施前基线：`coverage_percentage=0`、`unmapped_terms=55`、`duplicate_term_ids=0`、`pending_definition=0`；
- 本候选文件 SHA-256 将在创建后单独计算并报告。

## 20. 唯一批准命令

APPROVE: PLAN-UI-I18N-GLOSSARY-001 v0.2
