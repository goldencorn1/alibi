# CHANGE-AGENT-OBS-001

状态：`ACTIVE — APPROVED VIA AGENT-OBS-BUNDLE-001 v0.2`  
激活时间：2026-09-04T09:49:08+08:00（Asia/Shanghai）  
生成日期：2026-09-04（Asia/Shanghai）  
基线：Alibi Complete Demo v0.1，当前实现状态 `PARTIALLY VERIFIED`  
本文件性质：已批准 Change Control 与实施记录；产品实现按绑定的 Spec/Plan v0.2 推进。

## 1. 变更目标

在现有 Alibi 单页 Complete Demo 中增加可交互的 Agent Console，以及一个确定性的 Audit & Report Agent，用于监听、收集和汇总单一 Investigation Orchestrator 内各逻辑 Worker 的执行事件与数据报告。

“Agent”在本变更中是逻辑职责和报告单元，不是独立运行时 Agent，不引入多 LLM Agent framework、任务编排服务、外部服务或第二个 Orchestrator。

## 2. 现状审计基线

完整 UI 审计证据位于：

- `output/playwright/change-agent-obs-001/ui-audit.md`
- `output/playwright/change-agent-obs-001/ui-audit.json`
- `output/playwright/change-agent-obs-001/*.png`

审计在 `http://127.0.0.1:3000`、`ALIBI_DATA_MODE=recorded` 下完成，且未修改产品代码、Spec 或 Plan。

### 2.1 当前路由与流程结论

| 路由 | 方法 | 当前职责 | 审计结果 |
|---|---|---|---|
| `/` | GET | 单页输入、模式选择、三个 preset、Summary/Detail 状态渲染 | PASS |
| `/summary` | POST | 解析输入，运行确定性分析，返回免费 Summary | PASS |
| `/attribution` | POST | x402 payment gate；未配置时返回 402，否则进入受保护 Detail | PASS（402 边界） |
| `/health` | GET | 本地服务健康检查 | PASS |

### 2.2 三组 recorded preset

| Preset | data_status | UI 状态 | 观察 |
|---|---|---|---|
| Market timeline | `recorded` | `unattributed` | 3 markets、98 windows、98 个窗口未归因 |
| Wallet A | `recorded` | `insufficient_evidence` | coverage 1.88%，低于 40% gate |
| Wallet B | `recorded` | `insufficient_evidence` | coverage 0.01%，低于 40% gate；页面按一位小数显示为 0.0% |

### 2.3 六类 UI 状态

| 状态 | 审计证据 | 数据类型 | 结论 |
|---|---|---|---|
| loading | `state-loading.png` | 明确标记的 synthetic route-intercept | PASS，真实 loading 分支可见 |
| error | `state-error.png` | 明确标记的 synthetic HTTP 503 fixture | PASS，错误码和 retryable 可见 |
| success | `state-success.png` | 明确标记的 synthetic API contract fixture | PASS，不能视为 live/recorded paid result |
| insufficient_evidence | `preset-wallet-a-summary.png` | actual recorded preset | PASS，coverage gate 阻止结论 |
| unattributed | `preset-market-summary.png` | actual recorded preset | PASS，保守显示 Unattributed |
| payment_required | `state-payment-required.png` | actual recorded Summary + local 402 boundary | PASS；截图已脱敏，不保留完整 challenge |

### 2.4 端到端流程边界

当前用户可以从输入或 preset 开始完成：

1. 选择 `recorded replay`；
2. 点击 Analyze；
3. 等待 Summary；
4. 查看 Market 的 `unattributed` 或 Wallet 的 `insufficient_evidence`；
5. 点击 Request Detail；
6. 看到 x402 payment-required challenge。

真实付费 Detail 未完成，因为批准的 Base Sepolia payment address、RPC 和 buyer signer 仍缺失。Paid Detail 的 success UI 仅在 synthetic contract/E2E fixture 中验证，不能表述为真实支付、live attribution 或 recorded 归因。

## 3. 建议架构与职责边界

### 3.1 单 Orchestrator 保持不变

现有 Investigation Orchestrator 仍是唯一执行入口。它顺序调用确定性 Worker，并在每个 Worker 的开始、完成、跳过或失败边界发出不可变事件：

```text
Input
  -> input
  -> market-data
  -> repricing
  -> evidence
  -> attribution (唯一允许调用 Anthropic 的业务 Worker)
  -> wallet-analysis
  -> policy-verification
  -> report
  -> payment
  -> Audit & Report Agent (listen/aggregate only)
```

Audit & Report Agent：

- 只监听事件并写入 append-only JSONL；
- 只汇总计数、耗时、data status、coverage、retry、cost 和 policy flags；
- 不修改 Summary、Detail、归因状态、钱包指标、支付要求或任何业务结果；
- 不调用 LLM，不产生新的事实，不选择证据，不改变 coverage gate；
- 不读取或保存 API Key、私钥、完整请求头、PAYMENT-SIGNATURE 或 Anthropic prompt/原始响应。

### 3.2 逻辑 Worker 映射

| agent_id | 现有逻辑模块 | 允许的职责 | 禁止的职责 |
|---|---|---|---|
| `input` | `src/input/parser.ts` | 解析 URL/profile/address、输入摘要 | 保存原始敏感输入之外的秘密 |
| `market-data` | `src/data/adapters.ts`、`src/data/http.ts` | 只读 Gamma/CLOB/Data、retry、source status | orders、cancel、交易认证或写入 Polymarket |
| `repricing` | `src/engine/repricing.ts` | 确定性窗口检测 | 修改阈值或推断因果 |
| `evidence` | `src/data/evidence.ts` | 校验 URL、时间戳、来源限制 | 创建输入中不存在的来源事实 |
| `attribution` | `src/providers/anthropic.ts`、`src/engine/attribution.ts` | 仅在允许条件下做保守归因 | 绕过证据、coverage 或 live 凭据门控 |
| `wallet-analysis` | `src/engine/wallet.ts` | 对齐交易和窗口、计算 coverage | 推断真实身份或能力 |
| `policy-verification` | contracts/config/policy modules | 校验 schema、时间、URL、data status、限制 | 放宽阈值或覆盖警告 |
| `report` | `src/report/build.ts` | 组装 Summary/Detail/审计汇总 | 改写业务事实 |
| `payment` | `src/payment/server.ts`、`src/payment/policy.ts` | 402、x402 terms 和支付状态 | 保存完整签名或代签 |

Audit & Report Agent 不占用上述 `agent_id` 名称；建议内部标识为 `audit-report`，但它是同一进程中的确定性观察模块。

## 4. 事件合同

建议新建 `src/observability/events.ts`，沿用现有 schema version `1.0.0` 和结构化 error contract。

### 4.1 字段规则

| 字段 | 类型/规则 | 脱敏要求 |
|---|---|---|
| `run_id` | opaque UUID 或等价随机标识；单次 Orchestrator 运行唯一 | 不包含 key、私钥、原始输入或支付内容 |
| `sequence` | 从 1 开始的单调整数 | 事件排序依据 |
| `agent_id` | 上述固定 enum + `audit-report` 不对外作为 Worker | 不允许任意模型名称 |
| `event_type` | `started`、`completed`、`skipped`、`failed` | 不记录 prompt/response |
| `status` | `pending`、`running`、`ok`、`blocked`、`failed`、`insufficient` | 业务状态和观察状态分开 |
| `started_at` / `completed_at` | ISO-8601 UTC；失败可只有开始时间 | 不记录本地 secret 环境 |
| `duration_ms` | 非负整数或 `null` | 只保留耗时 |
| `data_status` | `live`、`recorded`、`synthetic`、`cached` | 必须由 Policy Verifier 校验 |
| `input_digest` | 输入规范化后的 SHA-256 hex | 不保存原始输入；digest 不能反解输入 |
| `output_artifact` | 工作区相对 artifact 路径或稳定 artifact id | 禁止绝对用户路径、secret 和完整请求内容 |
| `source_count` | 非负整数或 `null` | 只记录数量，不复制来源正文 |
| `coverage` | `[0,1]`、`null` 或不适用 | 不绕过 40% gate |
| `retry_count` | 非负整数 | 与 HTTP/Anthropic wrapper 的实际计数一致 |
| `cost_usd` | 非负数，来自既有预算 ledger；未知为 `null` | 不记录 secret 或 prompt |
| `error_code` | 现有 error enum 或 `null` | 不写异常原文中的 header/token |
| `policy_flags` | 稳定 enum 数组 | 只写 `coverage_below_gate`、`unattributed`、`payment_required` 等政策标识 |

事件必须在写入前经过运行时校验；无效事件不得进入汇总报告。事件报告中不得出现完整请求头、支付签名、API key、私钥、原始 Anthropic 输入或原始 Anthropic 输出。

## 5. 数据保留与 artifacts

建议仅使用工作区 JSONL/JSON，不新增数据库：

```text
artifacts/agent-runs/<run_id>/events.jsonl
artifacts/agent-runs/<run_id>/report.json
artifacts/agent-runs/<run_id>/report.md
```

规则：

- `events.jsonl` append-only；同一 `run_id` 不覆盖既有事件，sequence 不能回退；
- `report.json` 和 `report.md` 是由事件重放生成的派生汇总，可重新生成；
- 仅保存 digest、计数、时间、状态、相对 artifact id 和 policy flags；不保存原始 secret；
- 现有 recorded fixture 的原始数据规则保持不变，不把 observability 事件当作数据来源；
- 本地 demo 默认保留当前 run artifacts 以便复现；部署保留策略建议为 30 天，清理只能针对明确的 run 目录执行；
- 导出报告必须带 `schema_version`、`run_id`、`generated_at`、`data_status` 和限制说明；
- JSON/Markdown 导出不得包含完整 PAYMENT-REQUIRED、PAYMENT-SIGNATURE、Authorization、Cookie 或任何密钥值。

## 6. API 变更建议

不改变现有请求的 `input`/`mode` 必填语义，不改变 `/summary` 免费性质和 `/attribution` 的 x402 gate。

### 6.1 现有 API 的兼容性扩展

- `POST /summary` 成功响应的 `meta` 增加可选 `run_id`；原有客户端忽略该字段即可。
- `POST /attribution` 成功响应的 `meta` 增加可选 `run_id`；402 响应只返回 challenge 存在性和现有 payment contract，不把完整签名写入 audit event。
- 两个接口内部使用同一个 `run_id` 贯穿所有逻辑 Worker。

### 6.2 新增审计读取接口（无新页面）

建议新建 `app/audit/route.ts`：

```text
GET /audit?run_id=<run_id>&format=json
GET /audit?run_id=<run_id>&format=markdown
```

行为：

- 默认 `format=json`；`format=markdown` 返回 `text/markdown`；
- 只读对应 append-only artifacts；不存在 run 返回结构化 `not_found`；
- 不触发新的 Polymarket、Anthropic 或 x402 调用；
- 返回/导出前再次执行 Policy Verifier 和 redaction check；
- 不新增 WebSocket、SSE、数据库或外部服务。

## 7. Agent Console UI 草图

仍在现有 `app/page.tsx` 单页中，Summary/Detail 下面增加一个可折叠的 Agent Console：

```text
┌─────────────────────────────────────────────────────────────┐
│ Agent Console                         Run: short-id   ● done │
│ recorded · 9 workers · 0.00 USD · [JSON] [Markdown]         │
├─────────────────────────────────────────────────────────────┤
│ ✓ input              12ms   recorded   sources 1            │
│ ✓ market-data       480ms   recorded   sources 3   retry 0  │
│ ✓ repricing          31ms   recorded   windows 98           │
│ ! evidence            4ms   recorded   0 verified sources   │
│ ! attribution         —     blocked    credentials_missing  │
│ ! wallet-analysis    18ms   recorded   coverage 1.88%       │
│ ✓ policy-verification 2ms   recorded   flags 2              │
│ ✓ report              3ms   recorded                        │
│ ! payment             1ms   recorded   payment_required     │
└─────────────────────────────────────────────────────────────┘
```

交互：

1. Analyze 后 Console 展开或显示进度摘要；
2. 运行中每 1–2 秒轮询 `/audit?run_id=...`，完成/失败/blocked 后停止轮询；
3. 每个 Worker 显示状态、duration、data status、source count、coverage、retry、cost 和 policy flags；
4. Attribution 缺少 key 时显示 `blocked / credentials_missing`，不伪装成 live；
5. Wallet coverage 低于 40% 时显示 `insufficient_evidence` 和 flag，不显示先手率；
6. Payment required 显示金额、网络和政策状态，不展示完整 challenge 或签名；
7. JSON/Markdown 按钮下载当前审计汇总；下载不触发重新分析；
8. Console 不创建路由页面，移动端可纵向滚动，当前页面的 Summary/Detail 行为保持不变。

## 8. 对现有 Spec 条款的影响

### 无变化的硬约束

- 单一 Investigation Orchestrator 保持不变；
- Input Parser、Polymarket adapters、repricing、wallet、policy、report 和 payment 仍为确定性实现；
- 只有 Attribution Provider 可以调用 Anthropic；Audit & Report Agent 不调用 LLM；
- 无证据仍必须是 `Unattributed`，coverage gate 不得放宽；
- `live`、`recorded`、`synthetic`、`cached` 必须严格显示；
- 只读 Polymarket，禁止订单、撤单、交易认证、bridge、relayer 和写操作；
- 不新增多 Agent 框架、外部服务、数据库、WebSocket 或页面；
- 不读取、记录或展示 API Key、私钥、完整请求头或支付签名；
- Anthropic live attribution 和真实 x402 acceptance 仍是 `COMPLETE` 的必要外部验收项。

### 新增的可审计性条款（需要本 Change Request 批准）

- 每次 Orchestrator 运行产生可校验的 Worker event stream；
- Audit & Report Agent 可由事件重放生成 JSON/Markdown 报告；
- Agent Console 只展示观察数据和既有业务结果，不得成为业务决策源；
- 新的 `run_id` 和 observability fields 为向后兼容的可选 response metadata。

潜在冲突判断：如果将“Agent”严格解释为独立架构层，则与单 Orchestrator 约束冲突；本提案明确将它实现为同进程确定性观察模块。若批准者不接受该语义，应将运行时名称改为 `Audit & Report Module`，不得引入第二个 Orchestrator。

## 9. 对现有 Plan 任务的影响

现有 T02–T17 不重写、不回溯；在批准后以 Change Addendum 形式追加以下任务：

| Change task | 内容 | 依赖 |
|---|---|---|
| C-OBS-01 | event schema、runtime validator、redaction policy | 现有 contracts/config |
| C-OBS-02 | 在单 Orchestrator 各逻辑 Worker 边界发出 started/completed/skipped/failed 事件 | C-OBS-01 |
| C-OBS-03 | Audit & Report Agent、append-only JSONL ledger、replay aggregator | C-OBS-01、C-OBS-02 |
| C-OBS-04 | `/audit` JSON/Markdown read-only API 与 run_id response metadata | C-OBS-03 |
| C-OBS-05 | 单页 Agent Console、轮询、折叠、状态/限制渲染、导出按钮 | C-OBS-04 |
| C-OBS-06 | contract/unit/integration/API/E2E/visual/clean-room verification | C-OBS-01–05 |
| C-OBS-07 | README、ARCHITECTURE、VERIFICATION、CHANGELOG、90 秒演示脚本更新 | C-OBS-06 |

Change tasks 不增加依赖，不改变批准预算上限，不引入新供应商，也不把缺失资源变成暂停整个项目的理由。

## 10. 测试方案

### Contract / unit

- 校验所有 event 字段、enum、时间顺序、sequence 单调性、coverage 范围和 schema version；
- 注入 synthetic key、private key、Authorization、Cookie、PAYMENT-SIGNATURE、完整 challenge 和 prompt，确认 redactor 不写出；
- 验证 Audit & Report Agent 只读事件，聚合前后业务 Summary/Detail 深比较完全一致；
- 验证重复 sequence、错误 digest、伪造 data_status、负 duration 和未知 agent_id 被拒绝。

### Integration / API

- recorded run 生成 9 个 Worker 的事件流并稳定重放；
- Anthropic 缺失时 attribution 事件为 blocked/unattributed，且不会调用替代 provider；
- coverage < 40% 时报告 flag 和 `insufficient_evidence`；
- x402 未配置时保留 402 行为，Audit event 只记录 `payment_required` 和 policy fields；
- `/audit` JSON/Markdown 导出结果可互相校验，不触发外部请求；
- 输入 digest、artifact path 和 report 不泄露原始 secret。

### Playwright / visual

- 记录 Console idle、running、completed、blocked、error、insufficient、unattributed、payment_required 状态；
- 验证三个 recorded preset 的 Console data status 和 coverage；
- 验证 JSON/Markdown 下载按钮和轮询停止；
- 验证移动端布局、长输入不横向溢出、长 report 不展示 secret；
- 保留截图和可验证 DOM evidence；synthetic success 只能写成 synthetic。

### Verification / clean-room

- `npm run verify`、E2E、recorded replay、API smoke、security scan 和 clean-room 必须通过；
- clean-room 只能复制批准范围内的源代码、fixtures 和 artifacts，不带 `.env` secret；
- live Anthropic/x402 不具备资源时，验证报告必须为 `PARTIALLY VERIFIED`，不得伪造 PASS。

## 11. Definition of Done

本 Change Request 获批并实施后，必须同时满足：

- [ ] 仍只有一个 Investigation Orchestrator；
- [ ] 9 个逻辑 Worker 事件均可验证、排序并重放；
- [ ] Audit & Report Agent 不调用 LLM、不修改业务结果；
- [ ] JSONL 是 append-only，JSON/Markdown 报告可重建；
- [ ] Agent Console 在现有单页中可交互，不产生新页面或新依赖；
- [ ] Console 使用轮询而非 WebSocket，完成后停止；
- [ ] 三组 recorded preset 可完整演示 Summary、coverage/unattributed 和 payment gate；
- [ ] 无 Anthropic key、无真实 x402 时仍可完成 recorded Console/Report demo，所有状态正确标注；
- [ ] 不保存 API Key、私钥、完整请求头或支付签名；
- [ ] 所有导出和 UI 文案带 data status、限制和免责声明；
- [ ] 既有测试、E2E、build、offline 和 clean-room verification 通过；
- [ ] 文档和 90 秒演示脚本更新；
- [ ] 最终状态仍仅可为 `PARTIALLY VERIFIED`，直到真实外部验收完成。

## 12. 无真实资源时的可行性

可以完成 recorded Demo 的以下部分：

- 运行单一 Orchestrator；
- 生成 `recorded` market/wallet 事件；
- 运行确定性 repricing、wallet coverage、policy 和 report；
- 显示 Attribution `blocked`/`unattributed`；
- 显示 payment `required`；
- 导出 JSON/Markdown 审计报告；
- 用 synthetic fixture 覆盖 contract、fault 和 UI success 状态。

不能在无真实资源时声称完成：

- live Anthropic attribution、真实 evidence correlation 或其费用/响应验证；
- Base Sepolia x402 verify/settle、Web/Agent unlock 和 receipt hash；
- 真实付费 Detail success；
- coverage 不足时的钱包能力或先手率结论。

## 13. 最终验收仍需等待的资源

1. `ANTHROPIC_API_KEY`：用于 live Attribution Provider；补齐后必须重新验证 timeout、retry、budget、evidence allowlist 和真实归因边界。
2. `ALIBI_PAYMENT_ADDRESS`：用于生成可结算的 exact x402 terms。
3. `BASE_SEPOLIA_RPC_URL`：用于链 ID、余额和 receipt 独立核验。
4. `BUYER_AGENT_PRIVATE_KEY`：仅由本地测试 signer 使用，禁止粘贴到聊天或 artifact。
5. `X402_NETWORK` / `X402_FACILITATOR_URL`：必须符合批准的 Base Sepolia allowlist；缺失时不得伪造 settlement PASS。
6. 若要产生可归因的 live evidence，还需在批准范围内配置并验证 evidence source；否则仍保持 `Unattributed`。

## 14. 回滚方案

- 提供 `AGENT_CONSOLE_ENABLED=off` 的受控开关；关闭后不显示 Console、不轮询 `/audit`，现有 `/summary`、`/attribution`、`/health` 行为保持不变；
- 停止写入新 observability events 不删除既有 run artifacts；
- 如需完全回滚，移除 C-OBS-01–08 新增文件和 `/audit` 路由，恢复可选 `run_id` metadata 前的 response contract；
- 不运行数据库迁移、不变更 recorded fixtures、不改动批准的 Spec/Plan；
- 回滚后重新执行现有 `npm run verify`、E2E、offline 和 clean-room verification。

## 15. 原子审批包绑定

本 Change Request 现在只作为一次性原子审批包的一部分生效。候选 Spec/Plan 采用绑定当前基线的完整可审查差异：

| 项目 | 基线 SHA-256 | 候选 artifact / SHA-256 |
|---|---|---|
| `SPEC-COMPLETE-DEMO.md` | `559343EE5ED265267F20457768BA533BD2B2E268110B42310516A0A68DBAB29B` | `output/change-control/AGENT-OBS-BUNDLE-001/SPEC-COMPLETE-DEMO.md.v0.2-candidate.diff.md` / `A2F283035B57A62E1E38259BD2D939B279FF9E331CE77EC8373B7D3F285A8338` |
| `PLAN-COMPLETE-DEMO.md` | `C3FA2EC5F9330416904405D93E577355CBE37F449C2EB7B282F6D7D18CBF3DE4` | `output/change-control/AGENT-OBS-BUNDLE-001/PLAN-COMPLETE-DEMO.md.v0.2-candidate.diff.md` / `ADE20E05AAA838AD4E238A0881F2FD05361DE3D14BF1BF96A5CB5D1BF19AD3EB` |

当前 Change Request 文件 SHA-256 由验收包生成时重新计算；候选内容、基线或任一 SHA-256 变化，旧批准自动失效。

在收到批准前，不创建 `src/observability/*`、`app/audit/route.ts`、Agent Console 产品 UI 或任何新的业务 API 实现，不写入现有 Spec/Plan。

唯一有效批准命令：

```text
APPROVE: AGENT-OBS-BUNDLE-001 v0.2
```

自然语言“继续”“可以”“确认”不构成批准。收到精确命令后，按原子顺序记录并激活 Change、写入 v0.2 Spec、写入 v0.2 Plan、重算 SHA-256、核验 Change→Spec→Plan→DoD 追踪关系；任一步失败即停止且不修改产品代码。

## 16. 原子写入、验证与失败回滚方案

批准后的执行器必须按以下顺序运行；本方案是逻辑原子提交，目标 Spec/Plan 的任何基线 hash 不匹配都必须在写入前停止：

1. **冻结并核验输入**：读取 bundle manifest，核验 Change Request、候选 Spec diff、候选 Plan diff 的 SHA-256；重新核验两个目标文件仍等于 manifest 中的 base SHA-256。任一不匹配，停止且不写目标文件、不写产品代码。
2. **暂存候选内容**：严格按两个 candidate diff 在临时 staging 目录物化 `SPEC-COMPLETE-DEMO.md.v0.2` 和 `PLAN-COMPLETE-DEMO.md.v0.2`；以 UTF-8 写入临时文件并 flush 到磁盘。临时文件 hash、版本头、审批命令和 Change→Spec→Plan→DoD 关系必须先通过。
3. **制作可恢复备份**：在变更目录保存两个目标文件的原始字节备份及其 base hash；备份不包含 secret，且只用于本次文档回滚。
4. **双文件提交**：使用同一执行批次将两个已验证 staging 文件原子替换目标 Spec/Plan。两个文件不是跨文件系统事务，因此第一文件成功、第二文件失败时，执行器必须立即用备份恢复第一文件；此期间禁止进入产品代码实现。
5. **提交后验证**：重新计算两个目标文件 SHA-256，核验版本为 v0.2、状态为 approved、候选条款一致、Plan 任务不超出 Spec、OBS-01–08 均有任务和 DoD 证据。验证失败视为整体失败，立即走回滚。
6. **失败回滚**：用原始字节备份恢复所有已替换目标文件，再计算 hash，必须恢复到两个 base SHA-256。删除本次 staging 和未提交临时文件；保留失败原因、步骤、hash 和时间的无 secret 失败 artifact。回滚失败时停止并报告人工恢复需求，仍不得修改产品代码。
7. **实现门**：只有步骤 1–6 全部成功，才记录 Change active 并开始 C-OBS-01–08；产品代码实现、依赖变更和新 API 均在此门之后，不能与文档写入交错。

该流程不修改原有 Spec/Plan 的任何内容，除非获得上述精确原子批准；候选内容或 SHA-256 变化必须生成新的 bundle id/version 并重新输出审批包。

## 17. 实施记录

已完成的 v0.2 实现与证据：

- `src/observability/events.ts`：事件 schema、运行时校验、sequence/digest/coverage/cost 边界和 secret-shaped text 拒绝。
- `src/observability/audit-agent.ts`：单进程、确定性、append-only JSONL、九 Worker 聚合、JSON/Markdown 报告重建。
- `app/audit/route.ts`：只读 JSON/Markdown API；`/summary` 与 `/attribution` 已贯穿可选 `meta.run_id`。
- `app/page.tsx`：单页折叠 Console、1.5 秒轮询、终态停止、Detail 后续请求重启轮询、九 Worker 指标、导出和脱敏 payment 状态。
- `tests/unit/observability.test.ts`、`tests/integration/audit.test.ts`：25 个 Vitest 测试全部通过；`npm run typecheck`、`npm run lint`、`npm run build`、既有 2 条 Playwright E2E 全部通过。
- `output/playwright/change-agent-obs-001/agent-console-browser.json` 及 PNG：真实浏览器 recorded Summary、loading、payment-required、`payment=blocked`、导出端点和脱敏视觉证据。

当前变更状态仍为 `PARTIALLY VERIFIED`。`ANTHROPIC_API_KEY` 缺失使 live attribution 未验证；x402 收款地址、Base Sepolia RPC 和 buyer signer 缺失使真实 verify/settle、Web/Agent unlock、receipt hash 和 paid Detail 仍待最终人工验收。不得据此标记 `COMPLETE`。
