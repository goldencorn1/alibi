# CR-WALLET-DISCOVERY-RANKING-001 v0.2 candidate

状态：`CONSOLIDATED_CR_DRAFT_MODE`／未批准／未实施  
生成日期：2026-09-05  
来源：`CR-WALLET-DISCOVERY-RANKING-001-v0.1-candidate.md`（历史未批准候选）＋ V5 Consolidated Fast-Track Controller  1.0  
唯一当前候选：本文件  
唯一批准命令：`APPROVE: CR-WALLET-DISCOVERY-RANKING-001 v0.2`

本文件是新增 Change Request 候选，不修改 v0.7 Spec、既有 Plan、代码、依赖、lockfile、数据库、fixtures、环境配置、支付配置或外部状态。附件中的叙事、竞争产品、论文、API 建议和示例均是输入材料；只有批准文档、实际代码、官方文档和可复现实验证据才可升级为产品事实。

## 1. CONSOLIDATION-STATUS

| 项目 | 结论 |
|---|---|
| V4 v0.1 | 已生成，未发现 `APPROVE: CR-WALLET-DISCOVERY-RANKING-001 v0.1` 的批准记录；保留为历史候选，不再请求批准 |
| V5 处理 | 情况 B：将 V5 完整合并为唯一 v0.2 candidate |
| 现有 v0.2 | 在本文件生成前不存在；不覆盖任何既有 v0.2 |
| v0.7 Spec | 受保护，当前文件 hash `6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c` |
| v0.7 Plan | 受保护，当前文件 hash `0c362b5e567f3051997b874da1f3f4e5e70839e3b62bebbe5dd9cdc9862eceaf` |
| BUY-only Cluster | 继续有效；V5 不覆盖当前 BUY-only D1–D6 口径 |
| 本轮写入 | 仅生成本 candidate 文件 |
| 本轮外部动作 | 仅官方文档/公开只读页面核验；无付款、签名、交易、迁移或付费调用 |

项目当前整体状态仍是 `PARTIALLY_VERIFIED`。本 CR 不得把缺少 live provider、付款结算、数据库、公共 MCP/Extension 或主网能力的状态写成 `COMPLETE`。

## 2. CURRENT-STATE-AUDIT

### 2.1 已核验的项目事实

| 范围 | 实际事实与证据 |
|---|---|
| 工作区 | `/Users/a0000/polymarket`；不是 Git 仓库，不能假设 Git 回滚 |
| Runtime | Node `v24.19.0`、npm `11.17.0`；`node_modules` 存在 |
| Contract | `src/contracts/index.ts:1` 为 schema `1.1.0`；已有 `DataStatus`、run metadata、Audit、交易、来源和 Cluster contract |
| 既有 Wallet API | `app/api/v1/rankings/route.ts:7-10` 只有单地址 recorded replay；返回 `ranking-replay`、rows、run_id 和 `data_status=recorded` |
| 既有 Ranking | `src/rankings/ranker.ts:5-8` 按合格 `information_lead_rate` 排序；不是 Official 7D PnL 排行 |
| 既有 Live wallet adapter | `src/data/adapters.ts:128-138` 使用 Data API `/trades?user=...`，当前是 90 天、单次 `limit=10000&offset=0`，不是本 CR 所需的完整 A–E 管线 |
| 既有 recorded replay | `src/rankings/replay.ts:5-8` 明确为 recorded checkpoint，不是 live leaderboard |
| Cluster | `src/analysis/cluster-language.ts:84-126` 只接受同市场、`BUY`、`taker_only=true` 的候选与 P99 基线；`SELL` 仅可作为上下文，不进入 D1–D6 或 formal gate |
| Cluster 阈值 | 当前代码包含 180 分钟窗口、P99 最小基线 200、地址门槛、四项维度、herding veto 和 source/coverage gate；本 CR 不修改它们 |
| Platform Agents | `src/contracts/index.ts:54-55` 的四个实际平台 Agent：`evidence`、`attribution`、`quality-risk`、`audit-report` |
| Logical Workers | `src/contracts/index.ts:20-31` 的九个实际 Worker：`input`、`market-data`、`repricing`、`evidence`、`attribution`、`wallet-analysis`、`policy-verification`、`report`、`payment` |
| UI | `app/page-client.tsx` 已有双语、Agent Console、Cluster、recorded/live 选择、Audit JSON/Markdown 导出和共享输入；Wallet Discovery UI 尚未接入 |
| Glossary | `src/ui/glossary.ts` 已有集中式 Glossary 与 worker-specific source/coverage/cost term；新增 Discovery 术语必须复用同一机制并保持 100% gate |
| Payment | `src/payment/server.ts:27-98`、`src/payment/policy.ts:4-10` 和 `src/payment/idempotency.ts:56-87` 已保护现有 x402；当前是 exact、Base Sepolia、0.01 USDC、`/attribution` resource 和 PAYMENT-IDENTIFIER 幂等边界 |
| Realtime | `src/adapters/polymarket/market-ws.ts:10-33` 明确 Market Channel/RTDS 只触发，不带钱包身份；`src/data/adapters.ts:39-81` 以 Data API `/trades` 回查/补齐 |
| MCP | `app/mcp/route.ts:4-8` 复用现有 MCP handler；新工具必须共享 REST service layer 和 contracts |

### 2.2 当前不具备且本 CR 新增定义的能力

以下项目不是现有能力，不能由既有单钱包 replay 默认为已完成：live 官方 Top 20、冻结的 20 个真实 recorded 钱包样本、完整 PnL/closed-position/activity 分页、position-level win rate、Flip Rate 路径匹配、Median Exposure、Wallet Fit、Market Screen、A–E contracts、市场级归因缓存、Discovery UI、Shared Investigation Context、批量 x402 eligibility、对应 REST/MCP 工具和 live stale/fallback 服务。

### 2.3 与当前治理图的关系

当前 `HANDOFF.md` 与 `CHANGELOG.md` 包含多个历史执行阶段，UI v0.3 暂停记录优先于更早的 UI 完成描述；本 CR 不修订这些历史文档。若后续 Plan 需要改变已批准文档、API、算法、数据模型或支付边界，必须另行合并 Change Control。

## 3. INPUT-SOURCE-MATRIX

### 3.1 Polymarket 官方只读接口

| 来源 | 作用 | 官方状态 | 当前证据 | 约束/未决验证 |
|---|---|---|---|---|
| Gamma `https://gamma-api.polymarket.com` | market/event metadata、slug、conditionId、token IDs、createdAt | `live_verified`（有限只读探针） | 2026-09-05 返回 `/markets?limit=1` JSON；实际包含 `id/question/conditionId/slug/createdAt/clobTokenIds/outcomes/outcomePrices` 等字段 | public profile 的最终路径和字段仍须以官方 profile 文档及实测为准，不得因 Gamma 候选描述硬编码 |
| Data API `/v1/leaderboard` | live Top 20 官方排名 | `documented`；本轮 live response `unverified` | 官方文档给出 `timePeriod=DAY/WEEK/MONTH/ALL`、`orderBy=PNL/VOL`、`limit 1–50`、`offset 0–1000` 和排名字段 | 后续 preflight 记录真实 status、schema、排序、as-of；`pnl` 不自动称为 realized PnL |
| Data API `/activity` | 交易、退出、充值、奖励等完整 activity | `documented`；live response `unverified` | 官方文档给出 `limit<=500`、`offset<=5000`、`start/end` epoch seconds、ASC/DESC 稳定分页、`excludeDepositsWithdrawals=false` 才读取充值/提现 | 需完整分页、UTC 过滤、nullability 和实际枚举记录；历史深度需按时间窗口分页 |
| Data API `/positions` | current position 快照 | `documented`；live response `unverified` | 官方文档给出 `limit<=500`、`offset<=10000`、sort 字段和 archived 选项 | 仅当前快照；不能冒充历史净值或完整退出路径 |
| Data API `/closed-positions` | realized PnL、win/loss、退出匹配 | `documented`；live response `unverified` | 官方文档给出 `limit<=50`、`offset<=100000`、`sortBy=REALIZEDPNL/TITLE/PRICE/AVGPRICE/TIMESTAMP` | 必须证明分页终止；缺页则相关指标 `unavailable`，不得填 0 |
| Data API `/value` | 当前 portfolio value | `documented`；live response `unverified` | 官方文档将其定义为当前用户仓位总价值能力 | 只代表 current snapshot，不是历史净值 |
| Data API `/trades` | 钱包成交补齐、市场交易 | `documented`；live response `unverified` | 官方文档给出 `limit<=10000`、`offset<=10000`、`start/end`、market/event/user 过滤 | 不能沿用当前单页 adapter 作为完整历史；限流和分页必须记录 |
| CLOB `/prices-history` | token 价格序列、重定价 | `documented`；live response `unverified` | 官方文档定义 `market` asset id、`startTs/endTs`、interval/fidelity，响应为 `history[{t,p}]` | 历史 order-book depth 不是价格序列；不能用当前订单簿冒充历史深度 |
| CLOB `/book` 或官方当前订单簿端点 | 只读深度模拟 | `documented`；live response `unverified` | 官方文档导航列出 GET order book | 只在时间戳与深度足够时计算 fit/slippage，否则 unavailable |
| Market Channel/RTDS | 公共市场变化触发 | `documented`／实现 `trigger_only` | 现有 `market-ws.ts` 明确不携带钱包身份 | 事件若无 trade identity、market/token、side、price、size、timestamp，只能作 discovery signal；最终事实必须 REST 回查 |
| User Channel | 私有用户流 | `rejected_for_scope` | 需要交易凭据，违反当前只读安全边界 | 不实现、不连接、不读取私有 channel |

官方来源： [leaderboard](https://docs.polymarket.com/api-reference/core/get-trader-leaderboard-rankings)、[activity](https://docs.polymarket.com/api-reference/core/get-user-activity)、[positions](https://docs.polymarket.com/api-reference/core/get-current-positions-for-a-user)、[closed positions](https://docs.polymarket.com/api-reference/core/get-closed-positions-for-a-user)、[value](https://docs.polymarket.com/api-reference/core/get-total-value-of-a-users-positions)、[trades](https://docs.polymarket.com/api-reference/core/get-trades-for-a-user-or-markets)、[prices history](https://docs.polymarket.com/api-reference/markets/get-prices-history)、[rate limits](https://docs.polymarket.com/api-reference/rate-limits)。

### 3.2 Evidence source tiers

| Tier | 候选 | CR 处理 |
|---|---|---|
| Tier 0 primary | SEC EDGAR、Federal Register、CourtListener、DATA.GOV.HK、HKMA | 未来逐源记录最终端点、timestamp、timezone、precision、覆盖、UA、速率和条款；未实测不写 `live_verified` |
| Tier 1 vertical | cryptocurrency.cv、Alpha Vantage `NEWS_SENTIMENT`、Guardian Open Platform | 明确 key、免费额度和历史范围；不能将缺 key 的 provider 当成 live |
| Tier 2 discovery | GDELT DOC 2.0、Brave News Search | 只产生候选 URL；聚合器时间只能记录 `seen`＋uncertainty，不得直接进入 evidence |
| Promotion | 原始页面 | 获取原始 published_at、发布者、语言、文章身份、retrieved_at、timestamp uncertainty 和 source hash；准入失败保持 candidate/rejected |

Goldsky 或其他子图只作 Plan B；需另行验证 schema、延迟、区块时间、重组、条款、许可证和 key，未经 CR/Plan 批准不得接入。

## 4. ARCHITECTURE-DECISION

### 4.1 三层产品模型

1. Wallet Discovery：只读地筛选和排序值得调查的钱包；不产生买卖或跟单建议。
2. Alibi Attribution：将交易、公开证据和重定价窗口进行时间对齐；保持现有 BUY-only Cluster 和 evidence-only Language Window。
3. User Fit：用调用方延迟和资金规模做机械条件比对；不是交易建议，不连接钱包，不下单。

Wallet Discovery 放在现有 Alibi 模块之前。点击钱包只建立 Shared Investigation Context、填入现有 Alibi 输入并聚焦已有模块；不自动请求付费详情、不自动付款、不连接钱包、不下单。

### 4.2 Wallet Universe

**Recorded 20**：使用冻结的 20 个真实公开只读钱包样本；必须有 snapshot、as_of、来源、内容 hash 和可离线复现路径。若冻结包不存在，UI 显示 `recorded` empty/unavailable，不生成 synthetic 20。

**Live Top 20**：用户触发刷新，读取官方 `/v1/leaderboard`；服务端缓存 15 分钟。缓存必须带 retrieved_at、as_of、request parameters、source status、hash 和 `data_status=live`。过期或 provider 失败标为 stale/unavailable 并回退明确的 recorded 路径，不把缓存写成 live fresh。

**地址与身份**：只显示公开 profile address、官方用户名/verified badge（若官方返回）；不得由地址推断真实身份、语言、能力、资金来源或意图。

### 4.3 Shared Investigation Context

Context 至少包含：`wallet`、`market`、`condition_id`、`token_id`、`window`、`mode`、`as_of`、`source_provenance`、`run_id`。Context 只在本地内存/当前页面传递，不能将钱包、报告、付款或 run_id 写入 locale cookie。Context must be frozen per run so paid retry reads the same result and does not silently recompute.

### 4.4 Market-level Attribution Cache

同一市场的 source/repricing 时间轴只算一次；钱包层只做交易时间对齐。缓存键至少为：

`market_id + outcome_id + repricing_config_version + source_policy_version + language_set + window_start + window_end + data_status`。

缓存必须严格隔离 `live`、`recorded`、`synthetic`；synthetic 永不进入用户 Demo。若需要 durable database cache，超出本 CR 的无数据库边界，必须进入合并 Change Control。

### 4.5 User Fit

调用方输入：`my_delay_seconds`、`my_size_usd`、`min_retained_return`、可选 `max_liquidity_fraction`；兼容 preset `realtime=0`、`minute=60`、`hourly=3600`。默认深度比例为 0.05，调用方可提高但不得超过 0.10。

若缺少与历史时刻对应的 order-book depth，`effective_entry_price`、`slippage_bps`、`retained_return_ratio` 和 `max_deployable_usd` 应保持 unavailable/insufficient，不使用当前盘口冒充历史盘口。

## 5. OUTPUT-CONTRACT-MATRIX

所有指标 envelope 统一包含：`value`、`unit`、`window_start`、`window_end`、`as_of`、`sample_size`、`eligible_sample_size`、`coverage`、`data_status`、`source_provenance`、`calculation_version`、`limitations`。未知值为 `null` 或显式 unavailable，不填 0。

### 5.1 A 组 Outcome Metrics（免费）

| 字段 | 精确定义/边界 |
|---|---|
| `official_leaderboard_pnl_7d` | `/v1/leaderboard?timePeriod=WEEK&orderBy=PNL` 的官方字段；保留官方名称，不自动称 realized，不把 rewards/fees 重新解释 |
| `realized_pnl_7d` | 完整 `/closed-positions` 分页后，`realizedPnl` 在 UTC 7 天窗口内求和；费用口径未核验则 limitation；rebate 不并入 |
| `win_rate` | `count(realizedPnl>0) / count(realizedPnl!=0)`，并返回 wins/losses/breakeven/unknown/denominator/coverage；单位是 closed positions，不是交易 |
| `avg_buy_price` | 有效 `TRADE+BUY` 的 `Σ(price*size)/Σ(size)`；是份额加权平均价格，不是金额平均 |
| `flip_rate` | position/token 匹配后，SELL 退出数 /（SELL 或 REDEEM 退出的有效完整退出数）；partial/multiple SELL、SELL+REDEEM、SPLIT/MERGE 和无法闭合路径须有明确状态 |
| `median_exposure_minutes` | 每个完整匹配 token 的 `t_exit - t_first_buy` 中位数，exit 为 SELL 或 REDEEM；替代 MDD，不输出 MDD |
| `last_trade_at` | 最新已验证 `TRADE` timestamp；返回 UTC、相对时间、来源和 data status；不表示仍在线或仍持仓 |
| `account_age_days` | 由已验证 public profile `createdAt` 计算；缺失为 unavailable |
| `first_deposit_at` | 完整 activity 中最早可观察 DEPOSIT；UI 必须称 `First Observed Deposit/首次观测到的充值`，不声称首次链上入金/账户创建 |
| `total_trades` | 完整分页后的 `TRADE` 数量，带 as-of 和 coverage |
| `active_markets` | 完整 activity 中去重 `conditionId`，明确窗口 |
| `category_mix` | activity conditionId 与 Gamma metadata 映射；失败计入 `unknown_category` |
| `portfolio_value` | `/value` 当前快照，不是历史净值 |
| `rebate_income` | 独立统计 `REWARD`、`MAKER_REBATE`、`TAKER_REBATE`；除非新 CR 批准，不并入 realized PnL |

### 5.2 B 组 Attribution Metrics

`lead_rate` 保留兼容字段名，公式为早于对应 `repricing_timestamp` 的有效盈利交易数 / 可归因有效盈利交易数，返回 numerator、denominator、coverage、sample、calculation version、limitation。coverage `<0.40` 时 `lead_rate=null`、status=`insufficient_evidence`。

`coverage = 可归因有效盈利交易数 / 符合调查条件的盈利交易总数`；机器字段为 `attributed_count`、`eligible_count`，可显示 `127/184`。

`verdict_distribution` 仅允许：`before_verified_source`、`between_local_and_english`、`after_verified_english`、`unattributed`。禁止 `insider`、`knew_first`、`speaks_chinese`、`better_judgment`、`copyable`、`guaranteed`。

`language_lead_rate` 只以同时有本地/英文已核验发布时间、可比较精度和有效成交时间的样本为分母，并单独返回 dual-language coverage。`median_lead_minutes` 必须声明参考时刻类型。`source_langs_checked` 只写实际检索语言；`indexes_checked` 区分 checked、unavailable、timeout、unauthorized、skipped。

`discriminability` 必须精确写出 as-of、outcome、token、price 字段、时间点和 0.40 边界；未确认时为 `unknown`。

每条 evidence 必须包含：`evidence_id`、交易/重定价时间、交易价格/规模/方向、source URL、published_at、tier、timestamp type/uncertainty、language、`is_translated`、lead_minutes、verdict、confidence、`observed_driver_signal`、admission status、source hash、retrieved_at。`unattributed` 时 source URL/published_at 必须为 null；聚合器未升格不得 admission。

`observed_driver_signal` 只允许 `public_source_temporally_aligned`、`trade_preceded_verified_source`、`market_move_without_verified_source`、`mixed_observation`、`insufficient_evidence`，不得使用因果字段。

### 5.3 C 组 Fit Metrics（x402）

`effective_entry_price` 使用明确历史时点（或明确标注 current order book）对 `my_size_usd` 做只读深度模拟。`slippage_bps` 必须返回 reference price、effective price、spread、depth timestamp。`retained_return_ratio` 必须声明基准入场、模拟入场、退出/结算、费用、价差、深度冲击和缺失值规则；无法重建为 unavailable。`meets_policy` 只是机械比较，`failed_criteria[]` 列出未满足阈值，不是建议。

### 5.4 D 组 Cluster Metrics

复用已批准 BUY-only Cluster：同市场、180 分钟滚动窗口、BUY-only、单笔金额达到该市场 7 日 P99、候选地址至少 3。SELL 只能作为 context，永远不进入候选、cluster member count、D1–D6、herding 或 formal gate。

复用：`same_side_ratio`、`time_concentration`、`median_profile_age_days`、`first_trade_ratio`、`entry_price_dispersion`、`market_novelty_ratio`、`herding_pattern`、`cluster_size`、`cluster_span_minutes`。继续使用 as-of、no-lookahead、P99、coverage、logit 边界、低样本 herding 规则、四维/六维阈值和 veto；本 CR 不修改算法。

### 5.5 E 组 Market Screen

`information_asymmetry_score` 仅作为兼容字段，UI 叫 `Early-Entry Wallet Share/早期进场钱包占比`。`pre_source_volume_ratio` 必须带 source、tier、timestamp uncertainty 和 volume denominator coverage。`repricing_events[]` 复用市场缓存。没有已批准可验证识别方法时 `bot_share_estimate=null`、status=`unavailable`，不能把高频或 flip rate 叫机器人。`discriminability` 与 B 组共享 contract。

## 6. CALCULATION, PAGINATION AND AS-OF DISCIPLINE

1. 所有页面和指标先冻结 `as_of`，服务器端以 UTC 过滤；活动乱序时稳定按 UTC timestamp、交易 identity 排序。
2. `/activity` 读取 DEPOSIT/WITHDRAWAL 时必须显式 `excludeDepositsWithdrawals=false`；不把默认排除误报为无充值。
3. 每个 paginated source 记录每页 URL 参数、页数、行数、终止条件、重复/缺口检查和最终 coverage；任何不完整历史都输出 unavailable/insufficient。
4. `closed-positions` 按官方 `limit<=50`，`trades` 按 `limit<=10000`，`positions` 按 `limit<=500`，并遵守 offset cap；深历史在 `start/end` 窗口内分段。
5. 不把 `leaderboard.pnl` 改名为 realized；不把 `/value` 当历史净值；不把 `prices-history` 当历史 depth。
6. 缺失、null、unknown、stale 和 provider unavailable 均保留语义；不使用默认值伪造 coverage、sample、cost 或来源。

## 7. REST API

实现前必须再次对照现有 `/api/v1` 规范。以下为本 CR 的 canonical route 候选：

| 类别 | Route | 语义 | 计费 |
|---|---|---|---|
| Free | `GET /api/v1/wallets/{address}/metrics` | A 组 | 免费 |
| Free | `GET /api/v1/wallets/{address}/lead-rate` | B 的 lead_rate、coverage、sample、verdict distribution 和 availability | 免费 |
| x402 | `POST /api/v1/assess` | A+B+C | x402 |
| x402 | `POST /api/v1/screen` | 最多 20 地址的 A+B+policy comparison | x402 |
| x402 | `POST /api/v1/market-screen` | E、参与钱包 A+B、Cluster 摘要、coverage/limitation | x402 |
| x402/conditional | `GET /api/v1/evidence/{id}` | 指定 evidence detail；不存在、invalid、unattributed 不先触发 402 | 仅合格付费结果 |

产品简称 `/wallet/{addr}/metrics`、`/wallet/{addr}/lead-rate`、`/assess`、`/screen`、`/market-screen`、`/evidence/{id}` 不得在没有新 CR 明确批准时另建一组无版本 route。现有 `/summary`、`/attribution`、`/audit` 和 `/api/v1/*` 的既有行为保持不变。

每个写入型 JSON body 需限制大小，`screen` 默认最多 20 个地址；输入 invalid/missing 时返回现有错误 envelope 风格、`run_id`、`data_status` 和 limitations，不泄露堆栈/secret。

## 8. X402 AND BILLING BOUNDARY

### 8.1 既有边界不变

继续使用当前 `@x402/core`、`@x402/evm`、`@x402/next`、`@x402/fetch`、exact scheme、Base Sepolia `eip155:84532`、现有 USDC、payTo 和 facilitator。禁止安装 `x402-next`、legacy package、主网资源或交易认证流程。

### 8.2 免费 eligibility 与付费结果

Outcome A、`lead_rate + coverage + sample` 免费。完整 Attribution、Assess、Screen、Market Screen、Evidence Detail 使用现有 x402 保护。若最终只有 `unattributed`、`insufficient_evidence`、`provider_unavailable`、`upstream_unavailable` 或 `invalid_input`，不收费。

批量请求先免费 preflight，计算 `billable_result_count`：为 0 时返回免费结果且不 402；大于 0 时只返回一次明确 challenge，unattributed 项不增加计价数量。支付重试使用稳定 request/report ID 和现有 `PAYMENT-IDENTIFIER` 幂等机制，付费后读取同一冻结结果，不重新运行。

本 CR 不改变现有 0.01 USDC 详情价格、payment headers、resource、payTo、network、facilitator 或 402 语义。MCP 与 REST 必须共享同一 guard，任何 alias、tool 或批量路径不得绕过。

## 9. MCP / AGENT-TO-AGENT

候选工具名：`list_ranked_wallets`、`get_wallet_metrics`、`get_wallet_lead_rate`、`assess_wallet`、`screen_wallets`、`screen_market`、`get_evidence`、`estimate_wallet_fit`。

所有工具共享 REST service layer、contract、coverage、data_status、payment 和 safety guard。MCP 不绕过 x402、不绕过 coverage、不调用交易接口、不返回因果/内幕/身份结论。Agent-to-Agent 继续 REST＋MCP，不新增独立协议、数据库或 Agent SDK。

## 10. REALTIME READ-ONLY PIPELINE

1. Market Channel/RTDS 仅触发市场回查；事件必须有可验证的 trade identity、market/token、side、price、size、timestamp 才能进入候选事实。
2. 缺任一字段时只记录 discovery signal，不能直接当最终成交事实或钱包行为。
3. 最终成交必须回查 Data API/CLOB REST；按 transaction hash/identity 去重，按 UTC 稳定排序。
4. 断线或延迟时标记 stale 并回退 REST；不使用私有 User Channel。
5. `calculateMarketPrice()` 若仅是 SDK helper，必须与 HTTP endpoint 区分；不得把 helper 名称写成已验证 API。

## 11. UI / I18N / GLOSSARY

Wallet Discovery 位于现有 Alibi 之前；最少展示 Rank、Wallet、Official 7D PnL、Realized PnL 7D、Win Rate、Average Buy Price、Flip Rate、Median Exposure、Last Trade、Account Age、Active Markets、Evidence Coverage、Lead Rate、Language Lead Rate、Data Status 和 Investigate Evidence。不得展示 MDD。

UI 使用 `zh-CN`/`en`、默认中文、`alibi_locale` cookie＋SSR initial locale、双语 metadata/lang、集中式类型安全 Glossary 和 TermHelp。所有新增字段、状态、policy flag、provider status、coverage、as-of、unknown、stale、recorded/live/unavailable 和安全限制都必须有唯一术语；`GLOSSARY_COVERAGE=100%`、`UNMAPPED_TERMS=0`、`DUPLICATE_TERM_IDS=0`、`PENDING_DEFINITION=0`。

外部证据标题、市场原问题、发布机构、引文、URL、hash 和内部枚举保持原文；不得自动声称翻译。`recorded` 明显可见；synthetic 不进用户 Demo；无数据明确 empty/unavailable。

## 12. SAFETY-CORRECTIONS

- 不把 early entry 写成非公开信息、能力、因果或优势证明。
- 不输出买入、卖出、进场、跟单、复制交易、收益保证、内幕或协同操纵结论。
- 不由地址推断身份、语言、资金能力、共同控制或主观意图。
- Cluster 的 `same_side_ratio` 保持 BUY-only；SELL 是 context only。
- `documented_language_window` 只表示交易与已验证本地/英文来源时间区间关系；与 Cluster Without Verified Source 独立。
- aggregator 只能 discovery；`seendate`/first-seen 不能成为 verified published_at。
- `insufficient` 表示证据/coverage 不足，不是执行失败；`unavailable` 不等于 0 或不存在。
- 不收集/保存 private key，不托管资金，不代签，不下单，不撤单，不自动跟单；若需求涉及托管或交易，输出 `CHANGE_CONTROL_EXPANSION_REQUIRED: CUSTODY_AND_TRADING`。

## 13. FILE-IMPACT-MATRIX

本表是后续 Plan 的边界候选；本轮没有任何实际修改。新增文件名必须按表内路径执行，不得把目录通配符当作授权。

| 文件 | 目的 | 预计动作 | API/支付/算法影响 |
|---|---|---|---|
| `src/contracts/index.ts` | A–E、policy、provenance、cache、billing contract | 扩展 | 不得破坏 schema 1.1.0；若需 breaking 字段或 DB model，触发 Change Control |
| `src/data/adapters.ts` | 官方只读 Data/Gamma/CLOB 分页 adapter | 扩展/拆分 adapter | 只读；不可加交易或凭据路径 |
| `src/adapters/polymarket/market-ws.ts` | trigger-only 与 REST backfill | 适配 | 保持不携带钱包身份、stale fallback |
| `src/rankings/ranker.ts` | 官方/Outcome ranking 组合 | 修订 | 不覆盖既有单钱包 recorded replay；需明确两种排名口径 |
| `src/rankings/replay.ts` | 冻结 recorded 20 replay | 扩展 | 仍明确 `recorded`，不得生成 synthetic |
| `src/wallet-discovery/` | 仅限 discovery service、metrics、fit、screen 和 cache key 的新模块 | 新增受限文件 | 仅本 CR 规定的只读服务；不引入数据库/新依赖 |
| `app/api/v1/wallets/[address]/metrics/route.ts` | 免费 A route | 新增 | 共享现有 error/data-status contract |
| `app/api/v1/wallets/[address]/lead-rate/route.ts` | 免费 B route | 新增 | coverage gate 不变 |
| `app/api/v1/assess/route.ts`、`screen/route.ts`、`market-screen/route.ts` | x402 protected C/E routes | 新增 | 必须复用现有 payment guard/idempotency |
| `app/api/v1/evidence/[id]/route.ts` | evidence detail | 新增 | invalid/unattributed 不先收费 |
| `app/page.tsx`、`app/page-client.tsx`、`app/globals.css` | Wallet Discovery UI、context、双语/无障碍 | 扩展 | 不改变现有 Summary/Attribution/Audit 调用 |
| `src/ui/i18n.ts`、`src/ui/glossary.ts`、`src/ui/term-help.tsx` | 新字段和状态 Glossary | 扩展 | 100% coverage gate |
| `app/mcp/route.ts`、MCP service 注册文件（精确路径须由批准 Plan 指定） | REST/MCP parity | 受限扩展 | 不绕过 x402；若需新协议则阻塞 |
| `tests/**`（以下测试文件名须在 Plan 中逐一列出） | unit/contract/integration/E2E/visual/a11y | 新增/修订 | 不修改生产 contract 以迎合测试 |
| `VERIFICATION.md`、`HANDOFF.md`、`CHANGELOG.md`、`DECISION-LOG.md` | 实际证据和治理记录 | 更新 | 只记录真实结果与 hash |
| `artifacts/verification/wallet-discovery-001/**` | snapshot、replay、coverage、screenshots、clean-room | 新增 | 不放 secrets；synthetic 与用户 Demo 隔离 |

明确禁止修改或覆盖：`SPEC-ALIBI-PLATFORM.md`、`PLAN-ALIBI-PLATFORM.md`、v0.7/既有 CR/Plan、x402 package/terms、数据库 schema/migrations、environment files、fixtures（除非未来 Plan 明确指向新增冻结 recorded 20 artifact）、private wallet/User Channel、下单/撤单/授权/交易 route、MCP/Extension/ERC-8004/WebSocket/RAG 的既有安全实现。

## 14. TESTS AND ACCEPTANCE

### 14.1 Contract and calculation

- A–E 每个字段的 nullability、unit、window、as_of、sample、eligible、coverage、data_status、provenance、version、limitation。
- Leaderboard PnL 与 reconstructed realized PnL 分离；完整 pagination、重复/缺页、UTC filter、as-of/no-lookahead。
- Win rate 的 wins/losses/breakeven/unknown；Average Buy Price 加权；Flip 的 partial/multiple SELL、REDEEM、SPLIT/MERGE 和 incomplete path。
- Exposure token matching、没有完整盘口时 fit unavailable；`max_liquidity_fraction` 0.05 默认且 <=0.10。
- 既有 BUY-only D1–D6、SELL-excluded、P99、180 分钟、coverage、herding veto 和 formal gate 回归。

### 14.2 API/x402/billing

- canonical free routes 200/400/404/503；unattributed/insufficient/provider unavailable 不收费。
- paid preflight、billable count=0/free、mixed batch single challenge、stable request/report ID、PAYMENT-IDENTIFIER replay/fingerprint mismatch。
- 402 HTTP semantics、headers、exact、Base Sepolia、USDC、0.01 USDC、payTo/resource 与现有 v2 invariant；测试不签名、不 verify/settle、不连接主网。
- REST/MCP parity、alias guard、run_id/data_status、invalid evidence 不先 402。

### 14.3 Realtime/cache/safety

- trigger-only event、identity completeness、REST reconciliation、dedup、disconnect/stale/reconnect、cache key and live/recorded/synthetic isolation。
- synthetic fixture 只能在隔离测试；用户 Demo 只显示 recorded 或真实 live 且状态准确。
- Secret scan、response stack trace scan、private-key redaction、no order/cancel/auth endpoint。

### 14.4 UI/demo

- Discovery empty/loading/error/stale/provider unavailable/insufficient/unattributed；点击 Shared Context 不触发付费。
- `zh-CN`/`en`、metadata/lang、Glossary 100%、TermHelp keyboard/pointer/touch/Escape/outside、mobile/desktop/200% zoom/reduced motion。
- API JSON 仍英文 contract；原始证据不翻译；Audit/Markdown/JSON 导出状态正确。
- 完整 recorded 20 演示脚本；缺冻结包时必须是清晰 unavailable/empty，不得合成。

### 14.5 工具链与 clean-room

typecheck、lint、unit、contract、integration、E2E、visual、a11y、build、recorded replay、live read-only preflight、secret scan、source/lockfile integrity、isolated clean-room install/test/build、进程/端口清理。每项必须记录真实命令、数量、时间和 artifact 路径。

## 15. DEMO-DOD AND STATUS GATES

### `RUNNABLE_DEMO_COMPLETE`

必须同时满足：A–E 有可运行的 local/recorded path；UI/REST/MCP/x402 challenge/status contract 完整；不使用 synthetic 用户 Demo；recorded snapshot 有 hash/as-of/provenance；clean-room 通过；普通限制和免责声明可见。

### `FULLY_LIVE_VERIFIED`

额外需要 live Polymarket、live evidence sources、live attribution provider、x402 settlement、live database、live WebSocket、公共 MCP/Extension、ERC-8004 能力和所有必需端点均有真实证据。本 CR/Plan 阶段不允许提前标记。

### `PARTIALLY_VERIFIED`

任何 live、payment settlement、database、公开发布、credential 或外部资源未验证时保持此状态；不得用 recorded 通过替代 full-live。

## 16. DEMO SCRIPT CANDIDATE

### 90 秒

1. 打开 Wallet Discovery，先指出 `recorded` 或 `live`、snapshot/as_of 和限制。
2. 展示 Rank、Official 7D PnL、Win Rate、coverage、Data Status；说明官方 PnL 不是自动重构 realized。
3. 选择一个钱包，建立 Shared Context 并滚动到现有 Alibi；不自动请求付费详情。
4. 展示时间证据、BUY-only Cluster、独立 Language Window、`unattributed/indeterminate` 和免责声明。
5. 说明这是公开数据和时间关系的只读分析，不是内幕、因果、身份或买卖建议。

### 3–5 分钟

在 90 秒脚本基础上，展开 A–E 指标的 sample/coverage/as-of/provenance；展示 payout/fit 在没有历史 depth 时的 unavailable；展示 Agent Console/MCP audit status；演示一次免费 route 和 x402 challenge 的红线（不付款）；展示 stale/provider unavailable 和 recorded fallback；导出 JSON/Markdown；最后展示 cluster 的 SELL context-only、language evidence 独立和所有限制。

没有冻结 recorded 20 时，只演示 empty/unavailable 页面；绝不使用 synthetic 钱包、ticker、指标或虚构调用次数。

## 17. ROLLBACK AND CHANGE CONTROL

无 Git 工作区。获批 Plan 开始前，对所有 allowlisted 文件逐一保存修改前 SHA-256、权限、大小和安全副本；新文件记录“不存在”状态及生成原因。回滚只能逐文件安全恢复/移动，不使用 `git reset --hard`、`git checkout`、工作区范围删除或 broad cleanup。回滚后重新跑 typecheck、targeted contracts、现有 API/402 smoke、recorded replay、secret scan 和 clean-room。

必须暂停并生成一份合并 Change Request 的情况：要改 v0.7 Spec/Plan、改现有 API contract/字段/枚举/算法/阈值、改免费/付费边界、加直接依赖、数据库/schema/migration、引入 Goldsky/新 provider、新 API route 族、使用 private credential/User Channel、托管/签名/主网/交易、超预算、不可恢复操作、安全阻塞或无法满足核心 DoD。多个 L2 问题合并成一份 `WAKE-UP-DECISION-PACKET`，不拆成多轮批准。

## 18. OPEN-RISKS

1. Official leaderboard `pnl` 的 realized/unrealized/fee/reward 口径仍需实测和官方语义确认；保持官方字段名并带 limitation。
2. 本轮没有把 Data API/CLOB 的 live JSON 探针记录为项目 artifact；后续 preflight 必须真实记录，不得用文档替代 live proof。
3. 专用 recorded 20 冻结 snapshot、profile/username 清单和 hash 尚未在当前代码中证明存在。
4. 当前 adapter 的 90 天单页 `/trades` 不足以支撑 A–E 完整历史；分页窗口和缺页策略必须先实现并测试。
5. Flip Rate 的 position/token 完整匹配、REDEEM/SPLIT/MERGE 语义可能不足；不完整时 unavailable。
6. 历史 order-book depth 可能不存在；fit/slippage 不得用当前盘口替代。
7. live evidence provider、语言校准样本、real recorded bilingual cluster、Anthropic/live attribution、Base Sepolia settlement、数据库和公共 MCP/Extension 仍未验证。
8. UI 当前暂停 checkpoint 与较早的完成描述并存；恢复前必须以最新 hash/handoff 为准，不能把历史 PASS 当成当前代码证据。
9. 新 MCP tools、缓存和 route 会触及既有架构；若需要新增独立协议、数据库或依赖，立即转 L2 Change Control。
10. SmartX/论文材料只能用于叙事和研究背景，不是 Alibi 证据或产品结论。

## 19. DEFINITION OF DONE FOR A FUTURE PLAN

- 20 个 recorded 钱包和 live Top 20 都有 snapshot/as-of/provenance/hash/status；live/recorded/synthetic 严格隔离。
- A–E 所有指标可复算，公式、单位、分子分母、coverage、as-of、null 和 limitation 明确。
- Official PnL 与 realized PnL 分离；Win/Buy/Flip/Exposure/fit 边界完整。
- 既有 BUY-only Cluster、D1–D6、Language Window、API、x402 terms、fixtures 和安全红线不变。
- Market cache、Shared Context、REST/MCP parity、trigger-only realtime 和 stale fallback 通过测试。
- UI 双语、Glossary 100%、TermHelp、empty/loading/error/stale/unavailable、desktop/mobile/200%/keyboard/ARIA/reduced-motion 通过。
- 免费/付费/批量 billing 与 `PAYMENT-IDENTIFIER` 幂等通过；无真实结算动作。
- typecheck/lint/unit/contract/integration/E2E/build/replay/secret/clean-room 有真实证据；服务、端口、临时进程清理。
- `VERIFICATION.md`、`HANDOFF.md`、`CHANGELOG.md`、`DECISION-LOG.md` 和 verification artifacts 记录实际结果，不能伪造。
- 仅所有本地 recorded DoD 通过时才可标 `RUNNABLE_DEMO_COMPLETE`；没有所有 live/paid/chain/public 证据时不得标 `FULLY_LIVE_VERIFIED`。

## 20. DRAFT AUDIT LEDGER

| 审查来源 | 状态 | 主 Codex 复核 |
|---|---|---|
| V4 当前项目审计 | `REUSED_AND_RECHECKED` | 是；复核 routes、contracts、adapters、UI、payment、MCP、WebSocket 和 hashes |
| V4 Polymarket API 研究 | `REUSED_AND_OFFICIAL_DOCS_RECHECKED` | 是；复核官方 endpoint docs 和 rate limits；未把未捕获 live response 写成 verified |
| V4 Metric 定义研究 | `REUSED_AND_RECHECKED` | 是；复核 A–E definitions 与当前 Cluster/Wallet contracts |
| V4 Agent/API/MCP/Safety 研究 | `REUSED_AND_RECHECKED` | 是；复核只读边界、MCP、payment、realtime 和 safety |
| V5 consolidation audit | `COMPLETE` | 是；逐条合并 V5 A–E、pagination、cache、billing、UI、MCP、safety 和 DoD |
| 子智能体 | `NOT_DISPATCHED_IN_THIS_CONSOLIDATION` | 本轮未重复拆分独立扫描；V4 已有研究被主 Codex 重新核验 |

没有子智能体结论冲突。V4 候选中关于“v0.1 未批准”的判断与当前 `APPROVAL-LOG.md` 一致；UI 历史文档冲突只影响整体治理状态，不被本 CR 静默修复。

## 21. OUTPUT

候选文件绝对路径：`/Users/a0000/polymarket/CR-WALLET-DISCOVERY-RANKING-001-v0.2-candidate.md`  
本轮仅新增本文件；没有修改产品代码、依赖、lockfile、Spec、Plan、数据库、fixtures、环境文件、支付配置或外部状态。  
候选生成后停止，不生成 Plan。

唯一批准命令：

```text
APPROVE: CR-WALLET-DISCOVERY-RANKING-001 v0.2
```
