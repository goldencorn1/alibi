# PLAN-WALLET-DISCOVERY-RANKING-001 v0.1 candidate

状态：`PLAN_CANDIDATE`／未批准／未实施
生成日期：2026-09-05
唯一批准命令：`APPROVE: PLAN-WALLET-DISCOVERY-RANKING-001 v0.1`

本文件是 `CR-WALLET-DISCOVERY-RANKING-001 v0.2`（已于 2026-09-05 批准）的实施计划候选。本轮只生成本文件与 `DECISION-LOG.md` 记录，没有修改产品代码、依赖、lockfile、数据库、Spec、CR、`APPROVAL-LOG.md`、fixtures、环境文件或支付配置，没有联网探测，没有写入 verification artifacts。

## 0. 上游约束与本 Plan 的选定路径

本 Plan 已内建人类下达的七项高优先级修正，并以其覆盖 CR 与生成提示词中的冲突表述。

| 编号 | 约束 | 本 Plan 的处理 |
|---|---|---|
| O1 | C1 不得保留未选择的三选项 | §2.1 已将「恢复 UI v0.3 并完成验证」定为唯一选定执行路径；另两案仅记录为未采用备选。批准本 Plan 即同时批准该路径，不再增加独立审批门 |
| O2 | C2 不得由 Plan 修改已批准 CR 的 API contract | §2.2 采用兼容方案：对外 API 字段保留 `account_age_days`，展示层统一为 `Profile Age / 资料档案年龄` |
| O3 | C3 对外字段严格为 `median_profile_age_days`、`market_novelty_ratio` | §2.3；`market_familiarity_ratio` 仅内部兼容，不重新暴露，不解释为「越高越熟悉」 |
| O4 | 台账不得以 L0 推定或创造历史批准 | §2.4 标记 `APPROVAL_EVIDENCE_UNVERIFIED`；不阻塞 Phase 1/2，作为 Phase 3 前置核验项 |
| O5 | 本轮写入 allowlist 仅两个文件 | §2.5；`APPROVAL-LOG.md` 本轮不修改，候选修正只在本 Plan 与 `DECISION-LOG.md` 报告 |
| O6 | 回滚方案必须适配实际 Git 状态 | §11 双分支回滚方案，附本次实测 Git 状态 |
| O7 | live preflight 属执行阶段 Phase 1 | §5 Phase 1；本 Plan 生成阶段未联网、未写 artifacts |

### 2.1 O1：UI v0.3 处置 — 选定路径（唯一）

**选定执行路径：恢复 `PLAN-UI-I18N-GLOSSARY-001 v0.3` 并完成验证至 V-GATE 通过。**

选定理由：已有 28 个 Vitest 文件 / 82 项测试 / 15/15 Playwright 的成果不应作废；两套半成品 UI 叠加会使 Glossary 覆盖率门无法归因到具体变更。

当前 v0.3 检查点事实（引自 `HANDOFF.md`「UI-I18N-GLOSSARY-001 v0.3 — paused handoff — 2026-09-05T02:48:12-07:00」，原样引用，不重算替换）：

- 已批准执行命令：`EXECUTE: PLAN-UI-I18N-GLOSSARY-001 v0.3`
- Plan SHA-256：`ce88cf933f6939a614fb697a1cb66c07f1741fafc1e0d2495599d59b51bfe4f1`
- 状态门：`A-GATE=STATIC_PASS_NOT_FINAL_VERIFIED`；`B-GATE=IMPLEMENTED_NOT_E2E_VERIFIED`；`V-GATE=PAUSED_PENDING`；`RUNNABLE_DEMO_COMPLETE=NOT_MARKED`；`FULLY_LIVE_VERIFIED=NOT_MARKED`
- 可恢复快照：`/private/tmp/alibi-ui-i18n-glossary-v0.3-paused-20260905-025200`
- HANDOFF 说明该处的 "Before SHA-256" 是记录基线值，不是当前可用的变更前清单

未验证改动所在文件及其记录 hash：

- `app/page-client.tsx` — `f5489103bcbcdb70c02a68c2986ea1cecd8834ecee87193bfae43f7118328e95`
- `app/globals.css` — `27cccc84e7c50ce63e1b7bff1b11a206ef71efc2291f11a729d38a0b72d0ba74`
- `src/ui/glossary.ts` — `521bc87301ab9bd625ac6bbf283296726f90bdd9c6bec52e04beac3a5733a1ce`
- `src/ui/term-help.tsx` — `0d839bb5d4a73b6f31d0c4ae44294928f26e9784340a3f586dfc530dcd0a6578`
- `src/reports/markdown.ts` — `6c94e7d685f67930b1bdad5e84a013f80ce250d0e29de00e3028d6eb81dd1160`
- `artifacts/verification/ui-i18n-glossary-001/glossary-coverage.json` — `ad31d69d6c7f3d3806ab0d6d4e47b30ca14f2020794da0efa424236d9d0d6791`

硬门规则：

1. 不得回滚、不得覆盖、不得静默继承 v0.3 的未验证改动。
2. Phase 1 与 Phase 2 可以先执行，且不得写入上述五个源文件中的任何一个。
3. Phase 3 启动的前置条件是 v0.3 恢复执行并达到 `V-GATE=PASS`；该达成事实必须写入 `VERIFICATION.md`，含实际命令、测试数量、时间与 artifact 路径。
4. 若 v0.3 恢复过程中发现无法通过 V-GATE，属 L2，合并为单个 `WAKE-UP-DECISION-PACKET` 输出，不得改为「显式关闭」自行绕过。
5. 未采用备选（仅记录，不执行）：备选 A「显式关闭 v0.3 并保留改动」；备选 B「显式关闭 v0.3 并按文件从快照回退」。

### 2.2 O2：`account_age_days` 兼容方案（不改 CR 的 API contract）

- 对外 API 字段名保留 CR §5.1 的 `account_age_days`，本 Plan 不改名、不新增别名字段。
- UI、Markdown 报告与 Glossary 的展示名统一为 `Profile Age / 资料档案年龄`。
- `limitations` 必须固定包含：「基于 Polymarket public profile 的 createdAt，不代表钱包、链上地址或账户的真实年龄。」
- 禁止在任何界面、报告、导出或术语解释中出现「账户年龄」「钱包年龄」「地址年龄」及其英文对应表述。
- 缺失 `createdAt` 时为 `unavailable`，不填 0。
- 若未来要把对外字段改为 `profile_age_days`，必须另走 CR，本 Plan 无权修改。

### 2.3 O3：Cluster 对外字段

- 对外：`median_profile_age_days`、`market_novelty_ratio`（对齐 CR §5.4 与 `src/ui/glossary.ts:7,8,67,70`）。
- `market_familiarity_ratio` 仅按已批准 CR 的内部兼容规则保留，不重新暴露为对外字段，不得解释为「越高越熟悉」。
- 交接文档与历史提示词中的 `median_account_age_days` 属过期写法，本 Plan 不引入、不复活。
- 本 Plan 不修改 BUY-only Cluster 的算法、阈值、窗口或 veto 规则。

### 2.4 O4：审批证据状态

标记：`APPROVAL_EVIDENCE_UNVERIFIED`，适用对象为 `PLAN-UI-I18N-GLOSSARY-001 v0.2` 与 `v0.3` 两条批准记录。

实测依据：这两条批准的文字记录只出现在 `HANDOFF.md:295`、`HANDOFF.md:313`、`CHANGELOG.md:76`、`VERIFICATION.md:366`，均为执行方自述文档；没有捕获到带挂钟时间的独立批准记录。

规则：

1. 「代码已经实现」不得当作「Plan 已获批准」。
2. 不得以 L0 推定或创造历史批准，不得回填看似精确的时间戳。
3. 该标记不阻塞本 Plan 的生成，也不阻塞 Phase 1 与 Phase 2。
4. 该标记是 Phase 3 的前置核验项：Phase 3 启动前必须由人确认这两条批准是否成立；确认结果写入 `VERIFICATION.md` 与 `DECISION-LOG.md`。
5. 已知台账瑕疵（候选修正，本轮不执行）：`APPROVAL-LOG.md` 现有的 UI v0.2/v0.3 两行标为 `APPROVED` 与 `EXECUTION AUTHORIZED / PAUSED`，按本条应改为附带 `APPROVAL_EVIDENCE_UNVERIFIED` 标记。该修正留待后续获批执行阶段处理。

### 2.5 O5：本轮写入 allowlist

允许写入，且仅限：

- `PLAN-WALLET-DISCOVERY-RANKING-001-v0.1-candidate.md`
- `DECISION-LOG.md`

本轮禁止写入：产品代码、依赖、lockfile、数据库、Spec、CR、`APPROVAL-LOG.md`、`VERIFICATION.md`、`HANDOFF.md`、`CHANGELOG.md`、fixtures、环境文件、支付配置、任何 `artifacts/` 路径。

## 1. Plan 元数据

| 项目 | 值 |
|---|---|
| Plan ID | `PLAN-WALLET-DISCOVERY-RANKING-001` |
| 版本 | v0.1 candidate |
| 状态 | 未批准／未实施 |
| 上游 CR | `CR-WALLET-DISCOVERY-RANKING-001 v0.2`，已批准 |
| CR 文件 | `/Users/a0000/polymarket/CR-WALLET-DISCOVERY-RANKING-001-v0.2-candidate.md` |
| CR SHA-256 | 执行阶段 Phase 0 首个任务须实测并写入 `VERIFICATION.md`；本 Plan 不预填未实测的哈希值 |
| v0.7 Spec 受保护哈希 | `6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c` |
| v0.7 Plan 受保护哈希 | `0c362b5e567f3051997b874da1f3f4e5e70839e3b62bebbe5dd9cdc9862eceaf` |
| 项目整体状态 | `PARTIALLY_VERIFIED`，本 Plan 不得提升 |
| 工作区 Git 状态（2026-09-05 实测） | 非 Git 仓库，`.git` 不存在 |

说明：CR 文件自身的 SHA-256 未在本轮计算，因为计算并写入哈希清单属于执行阶段的基线动作；本 Plan 不以未实测值充当证据。

## 2. 上游约束落地

见 §0 的 §2.1 至 §2.5。

## 3. 范围

### 3.1 在范围内

CR v0.2 §5 的 A–E 五组输出契约；§7 的六条 canonical route；§4.2 的 recorded 20 与 live Top 20 wallet universe；§4.3 Shared Investigation Context；§4.4 市场级归因缓存键；§4.5 User Fit；§6 分页与 as-of 纪律；§8 免费/付费边界；§9 MCP 工具；§10 trigger-only realtime；§11 Discovery UI 与 Glossary；§13 文件矩阵内的实现。

### 3.2 明确不在范围内（触发即 L2）

新增数据库或 schema；新增直接依赖；Goldsky 或任何新 provider；修改 x402 package、scheme、network、payTo、facilitator 或 0.01 USDC 价格；修改 BUY-only Cluster 算法/阈值/窗口/veto；修改既有 `/summary`、`/attribution`、`/audit` 行为；修改 v0.7 Spec/Plan；把对外字段 `account_age_days` 改名；主网、托管、签名、下单、撤单、自动跟单；私有 User Channel；无版本 route 族。

## 4. 任务分解与等级

等级定义沿用项目既有约定：L0/L1 为批准范围内自主执行并记入 `DECISION-LOG.md`；L2 必须暂停并合并为单个 `WAKE-UP-DECISION-PACKET`。

### Phase 0 — 基线与冻结（L0）

| # | 任务 | 等级 |
|---|---|---|
| 0.1 | 记录执行起点的 Git 状态；按 §11 选择对应回滚模式 | L0 |
| 0.2 | 对 §10 allowlist 内所有既有文件逐一记录变更前 SHA-256、权限、大小，并保存带时间戳的安全副本；新文件记录「不存在」状态 | L0 |
| 0.3 | 实测并记录 CR v0.2 文件自身 SHA-256，核对 v0.7 Spec/Plan 受保护哈希未变 | L0 |
| 0.4 | 核对 `DECISION-LOG.md` 与 `APPROVAL-LOG.md` 的缺漏与矛盾，将候选修正登记入 `DECISION-LOG.md`（不改 `APPROVAL-LOG.md`，除非该修正已获批执行） | L0 |

### Phase 1 — 只读 live preflight（L0，见 §5）

| # | 任务 | 等级 |
|---|---|---|
| 1.1 | Data API `/v1/leaderboard` 只读探针与产物落盘 | L0 |
| 1.2 | Data API `/activity` 只读探针与分页边界实测 | L0 |
| 1.3 | Data API `/closed-positions` 只读探针与分页终止实测 | L0 |
| 1.4 | CLOB `/prices-history` 只读探针与响应结构实测 | L0 |
| 1.5 | 汇总 preflight 报告，逐端点给出 `data_status` 与是否可支撑 live 指标 | L0 |
| 1.6 | 若任一端点需要凭据、触发限流封禁或返回交易类能力，停止该项并按 L2 上报 | L2 |

### Phase 2 — 后端、契约、排名、API、MCP、测试（L0/L1）

| # | 任务 | 等级 |
|---|---|---|
| 2.1 | `src/contracts/index.ts` 扩展 A–E 契约、policy、provenance、cache key、billing 字段；保持 schema `1.1.0` 不破坏 | L1 |
| 2.2 | `src/data/adapters.ts` 实现官方只读完整分页 adapter，替换当前 90 天单页 `/trades` 路径 | L1 |
| 2.3 | `src/wallet-discovery/` 新增只读 discovery service、A 组 metrics、B 组 lead_rate、C 组 fit、E 组 screen、市场级缓存键实现 | L1 |
| 2.4 | `src/rankings/ranker.ts` 明确区分 Official PnL 排名与 Outcome 排名两种口径，不覆盖既有单钱包 recorded replay | L1 |
| 2.5 | `src/rankings/replay.ts` 扩展冻结 recorded 20 replay；冻结包不存在时输出 empty/unavailable，绝不合成 | L1 |
| 2.6 | `src/adapters/polymarket/market-ws.ts` 保持 trigger-only 与 REST 回查、stale fallback | L1 |
| 2.7 | 六条 route 实现（§6），复用既有 error envelope、`run_id`、`data_status`、payment guard 与幂等 | L1 |
| 2.8 | MCP 工具注册（§8），共享 REST service layer 与同一 guard | L1 |
| 2.9 | 单元、契约、集成测试新增（§9） | L1 |
| 2.10 | 任何需要新增直接依赖、数据库或修改 API contract 的情形 | L2 |

### Phase 3 — Discovery UI（L1，前置条件见下）

Phase 3 启动的两个前置条件，缺一不可：

1. `PLAN-UI-I18N-GLOSSARY-001 v0.3` 已恢复并达到 `V-GATE=PASS`，事实写入 `VERIFICATION.md`；
2. §2.4 的 `APPROVAL_EVIDENCE_UNVERIFIED` 已由人确认处置，结果写入 `VERIFICATION.md` 与 `DECISION-LOG.md`。

| # | 任务 | 等级 |
|---|---|---|
| 3.1 | `app/page.tsx`、`app/page-client.tsx`、`app/globals.css` 接入 Wallet Discovery 列表与 Shared Investigation Context | L1 |
| 3.2 | `src/ui/i18n.ts`、`src/ui/glossary.ts`、`src/ui/term-help.tsx` 新增术语，含 `Profile Age / 资料档案年龄` | L1 |
| 3.3 | UI 状态覆盖：empty、loading、error、stale、provider unavailable、insufficient、unattributed | L1 |
| 3.4 | E2E、visual、a11y 测试新增（§9） | L1 |
| 3.5 | 在前置条件未达成前写入 §2.1 五个文件中的任何一个 | 禁止 |

### Phase 4 — 验证与交付（L0）

| # | 任务 | 等级 |
|---|---|---|
| 4.1 | 全量 `npm run verify`（typecheck、lint、test、build） | L0 |
| 4.2 | Playwright E2E、recorded replay、secret scan、clean-room 安装/测试/构建 | L0 |
| 4.3 | `VERIFICATION.md`、`HANDOFF.md`、`CHANGELOG.md`、`DECISION-LOG.md` 写入真实结果与 artifact 路径 | L0 |
| 4.4 | 清理本次运行启动的进程、端口与临时目录 | L0 |
| 4.5 | 按 §12 判定状态门；不得提前标记 | L0 |

## 5. Phase 1 只读 live preflight 细则

本 Plan 生成阶段未联网、未探测、未写入任何 verification artifact。以下动作只能在 Plan 获批后的执行阶段 Phase 1 进行。

CR v0.2 §18.2 已自认本轮没有 live JSON 探针产物。官方文档不能替代实测证据。

### 5.1 覆盖端点

- Data API `/v1/leaderboard`
- Data API `/activity`
- Data API `/closed-positions`
- CLOB `/prices-history`

### 5.2 产物要求

落盘目录：`artifacts/verification/wallet-discovery-001/`

每个端点必须记录：请求 URL 与全部查询参数、HTTP 状态码、响应样例、`retrieved_at`、分页参数实测边界、响应字段清单与 nullability 观察、限流观察。

### 5.3 分页上限实测

实测并记录以下文档值是否与实际一致；不一致时以实测值为准并标注差异：

| 端点 | 文档 limit | 文档 offset |
|---|---|---|
| `/activity` | `<=500` | `<=5000` |
| `/positions` | `<=500` | `<=10000` |
| `/closed-positions` | `<=50` | `<=100000` |
| `/trades` | `<=10000` | `<=10000` |
| `/v1/leaderboard` | `1–50` | `0–1000` |

### 5.4 安全与降级

1. 只读、免费额度内、低频；不得触碰下单、撤单、余额授权、交易认证接口或私有 User Channel。
2. 探针失败记为 `data_status=upstream_unavailable` 或 `provider_unavailable`；不得以文档推定值填充，不得以 0 填充缺失。
3. 未取得 live 产物的端点，其相关指标在 DoD 中不得标为 `live_verified`。
4. 不得因为 recorded Demo 可运行就把这些端点写成 live complete。

## 6. API contract

沿用 CR v0.2 §7。本 Plan 不新增、不改名、不修改任何路由语义。

| 类别 | Route | 内容 | 计费 |
|---|---|---|---|
| Free | `GET /api/v1/wallets/{address}/metrics` | A 组 | 免费 |
| Free | `GET /api/v1/wallets/{address}/lead-rate` | B 的 `lead_rate`、coverage、sample、verdict distribution、availability | 免费 |
| x402 | `POST /api/v1/assess` | A+B+C | x402 |
| x402 | `POST /api/v1/screen` | 最多 20 地址的 A+B+policy comparison | x402 |
| x402 | `POST /api/v1/market-screen` | E、参与钱包 A+B、Cluster 摘要、coverage/limitation | x402 |
| 条件付费 | `GET /api/v1/evidence/{id}` | evidence detail；不存在、invalid、unattributed 不先触发 402 | 仅合格付费结果 |

### 6.1 指标信封（所有指标强制）

`value`、`unit`、`window_start`、`window_end`、`as_of`、`sample_size`、`eligible_sample_size`、`coverage`、`data_status`、`source_provenance`、`calculation_version`、`limitations`。

未知值为 `null` 或显式 unavailable，绝不填 0。

### 6.2 错误与状态

沿用既有 error envelope 风格，返回 `run_id`、`data_status` 与 `limitations`；不泄露堆栈与 secret。`screen` 默认最多 20 地址，写入型 body 需限制大小。

### 6.3 关键字段口径（不得漂移）

- `official_leaderboard_pnl_7d` 保留官方字段名，不自动称 realized，不重解释 rewards/fees。
- `realized_pnl_7d` 由完整 `/closed-positions` 分页求和；费用口径未核验则写入 limitation；rebate 不并入。
- `coverage < 0.40` 时 `lead_rate=null`、status `insufficient_evidence`。
- `verdict_distribution` 仅四值：`before_verified_source`、`between_local_and_english`、`after_verified_english`、`unattributed`。
- `observed_driver_signal` 仅五值，非因果表述。
- `max_liquidity_fraction` 默认 0.05，上限 0.10。
- `information_asymmetry_score` 展示为 `Early-Entry Wallet Share / 早期进场钱包占比`。
- `bot_share_estimate=null`，status `unavailable`。
- `account_age_days` 展示为 `Profile Age / 资料档案年龄`，见 §2.2。
- 不输出 MDD 或 `max_drawdown`；以 `median_exposure_minutes` 替代。

## 7. 计费边界

1. A 组与 `lead_rate + coverage + sample` 免费。
2. 单钱包结果落到 `unattributed`、`insufficient_evidence`、`provider_unavailable`、`upstream_unavailable`、`invalid_input` 时免费。
3. 批量请求先做免费 eligibility preflight，计算 `billable_result_count`。
4. `billable_result_count = 0` 时返回免费结果且不发 402。
5. `billable_result_count > 0` 时只返回一次明确的 x402 challenge；unattributed 项不增加计价数量。
6. 付费重试使用稳定 request/report ID 与既有 `PAYMENT-IDENTIFIER` 幂等机制，读取同一冻结结果，不重算、不重复结算。
7. 继续使用 `@x402/core`、`@x402/evm`、`@x402/next`、`@x402/fetch`，exact scheme，Base Sepolia `eip155:84532`，现有 USDC、payTo、facilitator 与 0.01 USDC 价格。禁止 `x402-next`、legacy `x402-fetch`、`--legacy-peer-deps`。
8. MCP 与 REST 共享同一 guard；任何 alias、tool 或批量路径不得绕过。

## 8. MCP 工具

候选工具：`list_ranked_wallets`、`get_wallet_metrics`、`get_wallet_lead_rate`、`assess_wallet`、`screen_wallets`、`screen_market`、`get_evidence`、`estimate_wallet_fit`。

所有工具共享 REST service layer、contract、coverage、`data_status`、payment 与 safety guard。MCP 不绕过 x402、不绕过 coverage、不绕过 data status、不调用交易接口、不返回未验证因果结论。不新增独立协议、数据库或 Agent SDK。

## 9. 缓存键

`market_id + outcome_id + repricing_config_version + source_policy_version + language_set + window_start + window_end + data_status`

`live`、`recorded`、`synthetic` 严格隔离；synthetic 永不进入用户 Demo。live Top 20 服务端缓存 15 分钟，必须带 `retrieved_at`、`as_of`、request parameters、source status 与 hash；过期或 provider 失败标 stale/unavailable 并回退明确的 recorded 路径，不把缓存写成 live fresh。

Shared Investigation Context 只在内存/当前页面传递，每次 run 冻结；不得写入 `alibi_locale` cookie。

durable database cache 超出本 Plan 边界，属 L2。

## 10. 文件影响矩阵

本矩阵是 CR v0.2 §13 的子集。越界即视为 L2。

### 10.1 新增文件

| 文件 | 目的 |
|---|---|
| `src/wallet-discovery/` 下的只读服务模块 | discovery service、A–E metrics、fit、screen、cache key |
| `app/api/v1/wallets/[address]/metrics/route.ts` | 免费 A route |
| `app/api/v1/wallets/[address]/lead-rate/route.ts` | 免费 B route |
| `app/api/v1/assess/route.ts` | x402 A+B+C |
| `app/api/v1/screen/route.ts` | x402 批量 |
| `app/api/v1/market-screen/route.ts` | x402 E |
| `app/api/v1/evidence/[id]/route.ts` | evidence detail |
| `artifacts/verification/wallet-discovery-001/**` | preflight 产物、snapshot、coverage、screenshots、clean-room 记录 |
| `DECISION-LOG.md` | L0/L1 决策记录（当前不存在，需创建） |
| `tests/**` 新增用例文件 | 见 §13 |

### 10.2 修改文件

| 文件 | 动作 | Phase |
|---|---|---|
| `src/contracts/index.ts` | 扩展，不破坏 schema `1.1.0` | 2 |
| `src/data/adapters.ts` | 扩展完整分页只读 adapter | 2 |
| `src/adapters/polymarket/market-ws.ts` | 适配 trigger-only 与 stale fallback | 2 |
| `src/rankings/ranker.ts` | 区分两种排名口径 | 2 |
| `src/rankings/replay.ts` | 扩展 recorded 20 replay | 2 |
| `app/mcp/route.ts` 与 MCP service 注册文件 | 受限扩展，REST/MCP parity | 2 |
| `app/page.tsx` | Discovery UI 接入 | 3 |
| `app/page-client.tsx` | Discovery UI、Shared Context | 3，受 §2.1 硬门约束 |
| `app/globals.css` | Discovery UI 样式 | 3，受 §2.1 硬门约束 |
| `src/ui/i18n.ts` | 新增文案 | 3 |
| `src/ui/glossary.ts` | 新增术语 | 3，受 §2.1 硬门约束 |
| `src/ui/term-help.tsx` | 新增术语提示 | 3，受 §2.1 硬门约束 |
| `VERIFICATION.md`、`HANDOFF.md`、`CHANGELOG.md` | 记录真实结果 | 4 |

注：`src/reports/markdown.ts` 也在 v0.3 未验证改动清单内。本 Plan 默认不修改该文件；若 Discovery 导出确需改动，视为进入 §2.1 硬门管辖，同样必须等待 v0.3 V-GATE 通过。

### 10.3 明确禁止修改

`SPEC-ALIBI-PLATFORM.md`、`PLAN-ALIBI-PLATFORM.md`、v0.7 Spec/Plan、既有 CR/Plan 候选、`APPROVAL-LOG.md`（除已获批修正外）、x402 package 与 terms、数据库 schema 与 migrations、环境文件、既有 fixtures、私钥与 User Channel 相关实现、下单/撤单/授权/交易 route、MCP/Extension/ERC-8004/WebSocket/RAG 的既有安全实现。

## 11. 回滚方案（适配实际 Git 状态）

### 11.1 本次实测状态

2026-09-05 实测：`/Users/a0000/polymarket` **不是 Git 仓库**，`.git` 不存在。因此默认适用 §11.3 的逐文件备份模式。

### 11.2 若执行前已完成 GitHub bootstrap

前置：存在干净的 baseline commit，工作树无未提交改动。

1. 从 baseline commit 建 feature branch，所有改动只在该 branch 上进行。
2. 回滚采用显式单文件恢复（指定 commit 与路径），不做工作树级重置。
3. 禁止 `git reset --hard`、`git clean -f`、`git checkout .`、`git branch -D`、force push。
4. 禁止大范围删除与覆盖用户文件。
5. 若 bootstrap 时工作树已含 v0.3 未验证改动，必须先按 §2.1 处置 v0.3，不得把未验证改动混入 baseline commit 而使其看起来已验证。

### 11.3 若仍非 Git 仓库

1. Phase 0 对每个 allowlist 文件保存带时间戳的备份副本，并记录 SHA-256、权限、大小。
2. 回滚只做逐文件安全恢复或移动，不做目录级删除。
3. 禁止 `git reset --hard`、`git checkout`、工作区范围删除与 broad cleanup。
4. 新文件回滚时移动到带时间戳的隔离目录，不直接删除。

### 11.4 两种模式共同要求

回滚后重新运行：typecheck、targeted contract 测试、既有 API 与 402 smoke、recorded replay、secret scan、clean-room 检查，并把回滚事实与命令写入 `VERIFICATION.md` 与 `DECISION-LOG.md`。

## 12. 测试计划

### 12.1 不回归基线

现有基线：28 个 Vitest 文件 / 82 项测试 / 15/15 Playwright（源自 `HANDOFF.md` 的 UI-I18N-GLOSSARY-001 v0.2 执行记录）。Phase 4 的实测数量必须不低于此基线，且不得通过修改生产契约来迎合测试。

### 12.2 新增用例清单

契约与计算：A–E 每字段的 nullability/unit/window/as_of/sample/eligible/coverage/data_status/provenance/version/limitation；official PnL 与 reconstructed realized PnL 分离；完整分页与重复/缺页检测；UTC 过滤与 as-of/no-lookahead；win rate 的 wins/losses/breakeven/unknown；average buy price 份额加权；flip 的 partial/multiple SELL、REDEEM、SPLIT/MERGE、不可闭合路径；exposure token matching；无历史盘口时 fit unavailable；`max_liquidity_fraction` 默认 0.05 与上限 0.10。

Cluster 回归：BUY-only、SELL context-only、D1–D6、P99、180 分钟窗口、coverage、herding veto、formal gate 全部保持通过。

API 与计费：免费 route 的 200/400/404/503；unattributed/insufficient/provider unavailable 不收费；批量 preflight 的 `billable_result_count=0` 免费路径；混合批量单次 challenge；稳定 request/report ID；`PAYMENT-IDENTIFIER` replay 与 fingerprint mismatch；402 headers 与 exact/Base Sepolia/USDC/0.01/payTo/resource invariant。测试不签名、不 verify、不 settle、不连主网。

REST/MCP parity：同一 guard、alias guard、`run_id`/`data_status` 一致、invalid evidence 不先 402。

Realtime 与缓存：trigger-only 事件、identity 完整性、REST 回查、去重、断线/stale/重连、缓存键与 live/recorded/synthetic 隔离。

安全扫描：secret scan、响应堆栈扫描、私钥 redaction、无下单/撤单/授权端点。

UI 与 Demo（Phase 3）：Discovery 的 empty/loading/error/stale/provider unavailable/insufficient/unattributed；点击钱包只建立 Shared Context 且不触发付费、不自动付款、不连接钱包、不下单；`zh-CN`/`en` 与 metadata/lang；`GLOSSARY_COVERAGE=100%`、`UNMAPPED_TERMS=0`、`DUPLICATE_TERM_IDS=0`、`PENDING_DEFINITION=0`；TermHelp 的键盘/指针/触摸/Escape/外部点击；mobile/desktop/200% zoom/reduced motion；API JSON 保持英文契约；原始证据不翻译；`Profile Age` 文案不出现账户/钱包/地址年龄表述。

工具链：typecheck、lint、unit、contract、integration、E2E、visual、a11y、build、recorded replay、live read-only preflight、secret scan、source/lockfile integrity、隔离 clean-room 安装/测试/构建、进程与端口清理。每项记录真实命令、数量、时间与 artifact 路径。

### 12.3 Glossary 门检查方式

Phase 3 必须产出 `artifacts/verification/wallet-discovery-001/glossary-coverage.json`，逐术语列出 term id、中英文标签、定义、来源字段，并断言四项计数门。`account_age_days` 对应术语的检查项额外包含：展示名等于 `Profile Age / 资料档案年龄`，且定义与 limitations 中不含账户/钱包/地址年龄表述。

## 13. 状态门与 DoD

### `RUNNABLE_DEMO_COMPLETE`

同时满足：A–E 有可运行的 local/recorded 路径；UI/REST/MCP/x402 challenge/status contract 完整；用户 Demo 不含 synthetic；recorded snapshot 有 hash/as-of/provenance；clean-room 通过；限制与免责声明可见；§12.1 基线不回归。

### `FULLY_LIVE_VERIFIED`

额外需要：live Polymarket、live evidence sources、live attribution provider、x402 settlement、live database、live WebSocket、公共 MCP/Extension、ERC-8004 能力，且所有必需端点均有真实证据。本 Plan 阶段不允许提前标记。

### `PARTIALLY_VERIFIED`

任何 live、payment settlement、database、公开发布、credential 或外部资源未验证时保持此状态。不得用 recorded 通过替代 full-live。

### A-GATE / B-GATE / V-GATE

- A-GATE：静态门。typecheck、lint、契约测试、secret scan 全绿方可 `PASS`；仅静态通过时记 `STATIC_PASS_NOT_FINAL_VERIFIED`。
- B-GATE：实现门。Phase 2 全部实现完成且单元/契约/集成测试通过方可 `PASS`；未跑 E2E 时记 `IMPLEMENTED_NOT_E2E_VERIFIED`。
- V-GATE：验证门。E2E、visual、a11y、recorded replay、clean-room、Glossary 四项计数门全部通过，且 §12.1 基线不回归方可 `PASS`。

## 14. 预算

外部支出硬上限 USD 10，USD 9 软停。

本 Plan 预估外部支出：**USD 0.00**。Phase 1 的四个端点均为 Polymarket 官方公开只读免费接口，低频调用；本 Plan 不引入付费 provider，不做真实 x402 结算，不发链上交易。

若执行中出现任何非零外部支出预期，先按 L2 暂停上报。

## 15. 安全红线（不得默认覆盖）

Polymarket 只读；不托管用户资金；不接收、保存或输出用户私钥；不代签；不下单；不撤单；不自动跟单；不提供买卖或进场建议；不保证收益；不推断钱包真实身份；不作内幕指控；不把时间先后关系写成因果；不把 early entry 写成非公开信息证明；不伪造来源、时间戳、付款或测试；recorded、cached、synthetic 不得标成 live；synthetic 数据不得进入用户 Demo；聚合新闻只能用于发现，不能直接成为最终证据。

若后续要求托管或交易，停止并输出：`CHANGE_CONTROL_EXPANSION_REQUIRED: CUSTODY_AND_TRADING`

## 16. 环境提示

Next.js 16 的 API 与约定可能与训练数据不同；涉及框架 API 前先读 `node_modules/next/dist/docs/`。

Turbopack 在本宿主沙箱会 `listen EPERM`，属环境问题不属源码问题。dev 验证使用 `--webpack`：

```text
PATH="/Users/a0000/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Applications/ChatGPT.app/Contents/Resources/cua_node/bin:$PATH" ./node_modules/.bin/next dev --webpack --hostname 127.0.0.1
```

## 17. 风险与未决项（继承 CR §18）

| # | CR 风险 | 本 Plan 处置 |
|---|---|---|
| 1 | Official leaderboard `pnl` 口径未确认 | Phase 1 实测记录；保留官方字段名并附 limitation；仍未完全解决 |
| 2 | 无 live JSON 探针产物 | Phase 1 强制落盘产物，见 §5 |
| 3 | recorded 20 冻结 snapshot 未证明存在 | Phase 2 任务 2.5；不存在时 UI 显示 empty/unavailable，绝不合成；仍未解决 |
| 4 | 当前 90 天单页 `/trades` 不足 | Phase 2 任务 2.2 实现完整分页 |
| 5 | Flip Rate 路径匹配语义可能不足 | 不完整时输出 unavailable；仍未完全解决 |
| 6 | 历史 order-book depth 可能不存在 | fit/slippage 保持 unavailable，不用当前盘口替代 |
| 7 | live evidence provider、settlement、数据库、公共 MCP/Extension 未验证 | 不标 `FULLY_LIVE_VERIFIED`；仍未解决 |
| 8 | UI 暂停 checkpoint 与更早完成描述冲突 | §2.1 硬门 + §2.4 审批证据核验 |
| 9 | 新 MCP tools/缓存/route 触及既有架构 | 需新协议、数据库或依赖时立即 L2 |
| 10 | SmartX/论文材料只作背景 | 不作为 Alibi 证据或产品结论 |

新增风险 11：`APPROVAL-LOG.md` 现有 UI v0.2/v0.3 两行的状态标记强于实际证据，候选修正见 §2.4 第 5 点，本轮不执行。

## 18. Change Control 触发条件

出现以下任一情形必须暂停，并把全部待决问题合并为**单个** `WAKE-UP-DECISION-PACKET`，不拆成多轮批准：

改 v0.7 Spec/Plan；改现有 API contract、字段、枚举、算法或阈值；改免费/付费边界；新增直接依赖；数据库、schema 或 migration；引入 Goldsky 或新 provider；新增 route 族；使用私有 credential 或 User Channel；托管、签名、主网、交易或自动跟单；超预算；不可恢复操作；安全阻塞；无法满足核心 DoD；已批准规范之间不可调和冲突；UI v0.3 无法通过 V-GATE。

## 19. 输出

本文件绝对路径：`/Users/a0000/polymarket/PLAN-WALLET-DISCOVERY-RANKING-001-v0.1-candidate.md`

本轮仅写入本文件与 `DECISION-LOG.md`；没有修改产品代码、依赖、lockfile、数据库、Spec、CR、`APPROVAL-LOG.md`、支付配置或外部状态；没有联网探测；没有写入 verification artifacts。

Plan 生成后停止，不开始实施。

唯一批准命令：

```text
APPROVE: PLAN-WALLET-DISCOVERY-RANKING-001 v0.1
```
