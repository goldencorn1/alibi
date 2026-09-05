# CR-WALLET-DISCOVERY-RANKING-001 v0.1 candidate

状态：`DRAFT_MODE`／只读审计候选／未批准／未实施  
生成日期：2026-09-05  
唯一批准命令：`APPROVE: CR-WALLET-DISCOVERY-RANKING-001 v0.1`

本文件只提出 Wallet Discovery、Ranking、Shared Investigation Context 和 User Fit 的新增 Change Request。没有修改产品代码、依赖、lockfile、Spec、Plan、CR、数据库、fixtures、环境文件、支付配置或外部状态。附件中的产品描述、网页、论文和 API 建议均为输入材料；只有实际代码、批准文档、官方文档和可复现实验证据才可升级为产品事实。

## 1. CURRENT-STATE-AUDIT

### 1.1 已核验的项目状态

| 项目 | 当前事实 |
|---|---|
| 工作目录 | `/Users/a0000/polymarket` |
| Git | `NO_GIT_REPOSITORY`；不能使用 Git 回滚假设 |
| Node/npm | Node `v24.19.0`，npm `11.17.0`；`node_modules` 存在 |
| 产品状态 | `PARTIALLY_VERIFIED`；不得因本 CR 改为 COMPLETE |
| Spec | `SPEC-ALIBI-PLATFORM.md` v0.7，SHA-256 `6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c` |
| Plan | `PLAN-ALIBI-PLATFORM.md` v0.7，SHA-256 `0c362b5e567f3051997b874da1f3f4e5e70839e3b62bebbe5dd9cdc9862eceaf` |
| Schema | `SCHEMA_VERSION = 1.1.0`，见 `src/contracts/index.ts:1` |
| Existing wallet window | `DEFAULTS.walletWindowDays = 90`，`src/contracts/index.ts:153-158` |
| Existing coverage gate | `DEFAULTS.coverageThreshold = 0.4`，`src/analysis/coverage.ts:4-7` |
| Existing ranking | 单地址 `GET /api/v1/rankings?address=...`，强制 recorded replay，见 `app/api/v1/rankings/route.ts:7-10` |
| Existing ranking score | `information_lead_rate` 降序；不是 Official 7D PnL，见 `src/rankings/ranker.ts:5-8` |
| Existing wallet metrics | observed/aligned trades、coverage、attributable/early profitable trades、information lead rate、status；不含本 CR 的 PnL、Win Rate、Flip Rate、Exposure 等字段，见 `src/contracts/index.ts:430-445` |
| Existing data adapter | live wallet path 目前请求 Data API `/trades`，固定 90 天、`limit=10000&offset=0`，未形成 Top 20 排行分页管线，见 `src/data/adapters.ts:120-137` |
| Existing recorded replay | `replayRanking` 生成 recorded checkpoint 并明确不是 live leaderboard，见 `src/rankings/replay.ts:5-8` |
| Existing UI | 当前页面是既有 Alibi 调查模块和 Agent Console；新的 Wallet Discovery 尚未接入 |
| Existing x402 | 既有 `src/payment/server.ts` 对 `/attribution` 使用 exact、Base Sepolia 和 `0.01 USDC`；本 CR 不更换包、不支付、不扩展到实现阶段 |
| Existing MCP | 现有本地 MCP route 为 `app/mcp/route.ts`；新工具必须复用同一 service layer，不得另建 A2A 协议 |
| Existing realtime | Market Channel/RTDS 事件是 trigger-only，不提供钱包身份；Data API `/trades` 才是钱包成交补齐来源，见 `src/adapters/polymarket/market-ws.ts:10-33`、`src/data/adapters.ts:34-81` |

### 1.2 当前不具备的能力

当前没有被代码和批准契约证明的以下能力：官方排行榜 Top 20 live/cache/stale 服务；固定 20 钱包 recorded snapshot；公开 profile/username 冻结清单；完整 `/closed-positions` 分页；Official 7D PnL 与 reconstructed realized PnL 的双口径；position-level Win Rate；Flip Rate 的 SELL/REDEEM 路径匹配；Realized-PnL Drawdown；Median Exposure Minutes；Average Buy Price/Amount 分离字段；Wallet Discovery UI；Wallet Fit；对应 REST/MCP contract；市场级 attribution cache；排行榜跳转的显式 Shared Investigation Context。

这些是本 CR 要求定义的新增范围，不应被当前单钱包 recorded replay 或既有 `information_lead_rate` 排名默认为已完成。

## 2. APPROVAL-GRAPH

当前优先级和批准关系：

1. 安全红线与最新人类明确决定；
2. `SPEC-ALIBI-PLATFORM.md v0.7`（受保护）；
3. `PLAN-ALIBI-PLATFORM.md v0.7`（受保护）；
4. 已批准 `CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2` 及其执行记录；
5. 已批准 `CR-UI-I18N-GLOSSARY-001 v0.2`、`CR-UI-CLUSTER-CONSISTENCY-001 v0.3` 及 `PLAN-UI-I18N-GLOSSARY-001 v0.3`；
6. 本 `CR-WALLET-DISCOVERY-RANKING-001 v0.1 candidate`。

本 CR 不覆盖既有 Spec/Plan/CR，不能授权实现。若获批，必须再生成并批准独立实施 Plan。与当前 UI 暂停状态冲突的文件必须顺序处理，不能让两个工作流并行写同一 UI 文件。当前 UI 交接见 `HANDOFF.md` 的 `UI-I18N-GLOSSARY-001 v0.3` 暂停段落；其最新状态为 `V-GATE=PAUSED_PENDING`。

本轮输入：

| 输入 | SHA-256/状态 | 处理 |
|---|---|---|
| Prompt V4 附件 `/Users/a0000/.codex/attachments/206a96fe-fb0e-44b5-a6f4-58c48c9883cc/pasted-text.txt` | `d4067b1e7eb78bb0ca1142bb31f20265d83192d255d0a62cdb05d9575855cff4` | 新 CR 需求原文 |
| `SPEC-ALIBI-PLATFORM.md` | `6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c` | 受保护硬规范 |
| `PLAN-ALIBI-PLATFORM.md` | `0c362b5e567f3051997b874da1f3f4e5e70839e3b62bebbe5dd9cdc9862eceaf` | 受保护执行边界 |
| `DATA-SOURCES.md` | `9eb9e26decd9f4adb166eae3d3e2b01f92688511b90ac80748a6ee104e8a1e92` | 已批准只读来源和现有 recorded 事实 |
| `HANDOFF.md` | `526023280c57a99e57aa78306a795dd35d4309544b4bf9a06971f372ddd71847` | 当前交接；本 CR 生成前读取 |
| `VERIFICATION.md` | `c2e1d095cfcd11227251ee550a8ff1760fe6b29adc81c2faf8c8a1f56402a525` | 当前验证状态；本 CR 生成前读取 |
| `CHANGELOG.md` | `dfc9d5d89733f8b05aefe1b2cd3dd65639a1bdccda1935f104c79af08b0c85bb` | 历史变更；本 CR 生成前读取 |

外部官方文档和研究 URL 在第 4、5 节列出。官方文档检索日期为 2026-09-05；本轮没有通过项目运行时调用外部 API，也没有记录 live Top 20 响应。

## 3. ARCHITECTURE-DECISION

### 3.1 三层产品模型

```text
Wallet Discovery
      │ explicit Shared Investigation Context
      ▼
Alibi Evidence Investigation
      │ evidence status + coverage + time limits
      ▼
User Fit
```

Layer 1 回答“哪些公开钱包值得进一步调查”，只展示可复算摘要。Layer 2 继续调用当前 Alibi Summary/Attribution 能力，不自动请求付费 Detail、不自动支付、不连接钱包、不触发交易。Layer 3 只展示指定延迟和资金规模下的估算成交价、滑点、保留结果比例、订单簿时间和覆盖限制，不输出买卖、进场、跟单或收益保证。

### 3.2 Wallet Universe

#### Recorded Demo 20

后续实现必须从既有成功的真实只读 Polymarket 请求或新的经批准只读采集产生 20 个冻结条目，并对每条记录保存：规范化地址、当时 username（若有）、来源端点和查询参数、`retrieved_at`、统一 `as_of`、响应/条目 hash、`data_status=recorded`、分页完整性和限制。不能用 synthetic 地址；不能把历史 rank 写成当前 rank；没有合格快照时只能 `recorded_unavailable`，不得伪造 Demo。

#### Live Top 20

候选端点为官方 `GET https://data-api.polymarket.com/v1/leaderboard`，默认查询：

```text
timePeriod=WEEK&orderBy=PNL&category=OVERALL&limit=20&offset=0
```

必须校验地址格式、大小写规范化、去重、条目数量、统一响应 `as_of` 和字段 hash。用户点击刷新或服务端缓存过期时才请求；服务端缓存 15 分钟。刷新失败且有完整缓存返回 `data_status=stale`；无缓存返回 `live_unavailable`。live 排名不能由 SmartX、链扫描、付费索引器、交易接口或 synthetic 数据生成。

### 3.3 Shared Investigation Context

候选的显式、可序列化上下文：

```ts
type WalletDiscoveryContext = {
  wallet_address: string;
  ranking_snapshot_id: string;
  ranking_as_of: string;
  ranking_source: "official_leaderboard" | "recorded_snapshot";
  selected_metric_window: { start: string; end: string };
  evidence_window: { start: string; end: string };
  data_status: "live" | "recorded" | "stale" | "live_unavailable";
  origin: "wallet_discovery";
  requested_action: "summary" | "attribution" | "fit";
};
```

上下文不得依赖隐藏 UI 全局变量，不得写入 API payload 的既有字段，不得覆盖当前 `InputRef`、`run_id` 或 data-status contract。跳转只填入现有 Alibi 输入、滚动并聚焦，不触发付费 Detail、支付、签名或交易。

### 3.4 Market-Level Attribution Cache

缓存按市场而非钱包共享时间轴：`market_id`、`outcome_id`、repricing config version、source policy version、language set、window start/end、`data_status`、calculation version 和 output hash 必须进入 key/record。市场重定价与证据时间轴只算一次，钱包只做确定性成交对齐。live、recorded、synthetic 必须隔离；阈值/语言/信源策略变化使缓存失效。缓存不可绕过 40% coverage、evidence 状态或 x402 边界。

### 3.5 User Fit

Fit 是只读、估算、非交易服务。输入至少包括已验证钱包、`delay_seconds` 和 `size_usdc`。若没有合格订单簿快照、历史成交、时间匹配或覆盖，返回 `unavailable`/`insufficient_evidence`；不得以 0 填充。结果必须带订单簿 `as_of`、source provenance、sample size、coverage、数据状态、计算版本和 limitations。不得返回 recommendation、expected profit、copy/trade action 或保证。

## 4. OFFICIAL-API-FINDINGS

### 4.1 已核验的官方文档事实

官方文档的 API reference 明确：

| 端点 | 官方文档事实 | 对本 CR 的含义 |
|---|---|---|
| `/v1/leaderboard` | `category` 默认 `OVERALL`；`timePeriod` 支持 `DAY/WEEK/MONTH/ALL`；`orderBy` 支持 `PNL/VOL`；`limit` 范围 1–50；`offset` 0–1000；返回 `rank/proxyWallet/userName/vol/pnl/profileImage/xUsername/verifiedBadge` | 可作为 live Top 20 候选；`pnl` 只能叫 Official 7D PnL，不能未经验证改称 realized PnL |
| `/activity` | `limit` 最大 500；`offset` 最大 5000；更深历史需要 `start/end` 窗口；支持 `TRADE/SPLIT/MERGE/REDEEM/REWARD/...`；时间为 epoch seconds；默认排除 deposit/withdrawal | Flip Rate、完整历史和 window filter 必须显式分页；不能把一页当作完整历史 |
| `/positions` | 当前仓位；`limit` 最大 500；`offset` 最大 10000；字段含 `size/avgPrice/initialValue/currentValue/cashPnl/realizedPnl/...` | 当前仓位不是 closed-position 历史；不可直接用于 Win Rate 或 realized drawdown |
| `/closed-positions` | `limit` 最大 50；`offset` 最大 100000；含 `avgPrice/totalBought/realizedPnl/timestamp/outcome/...` | 必须分页并记录完整性，才能计算 position-level Win Rate、realized PnL 或 exposure |
| `/value` | 返回用户总仓位价值 `value` | 只能作为当前总仓位价值快照；不能补造净值曲线或完整 MDD |
| `/trades` | `limit` 最大 10000；`offset` 最大 10000；更深历史需要按 `start/end` 窗口；`takerOnly` 默认 true | Last Trade、Average Buy、market activity 需要明确分页、时间窗和 taker/maker 口径 |
| CLOB `/prices-history` | 参数含 `market/startTs/endTs/interval/fidelity`；返回 `{history:[{t,p}]}`，`t` 是 Unix timestamp，`p` 是价格 | Fit 的订单簿/价格快照必须带 token、fidelity、时间范围和原始响应 hash |

官方 rate-limit 文档当前说明 Data API 一般为 1,000 req/10s，`/trades`、`/positions`、`/closed-positions` 各为 200/150/150 req/10s，限流为 IP-based throttling/sliding windows。实现必须采用 bounded retry、cache 和分页预算，不得把限流当作空数据。

### 4.2 官方文档与实测的区分

本轮官方 API JSON endpoint 的直接运行时响应没有被主 Codex 记录；对直开 JSON URL 的 web 读取返回内部错误。因此：

- `/v1/leaderboard` 的字段、参数和限制为 `[Confirmed: official documentation]`，不是本轮 live response 证明；
- 当前项目历史验证中有 Polymarket public read-only Data API/fixture 记录，但不是本轮新的 Top 20 快照；
- `pnl` 是否包含未实现盈亏、手续费、奖励或其他口径，保持 `unknown`，不得在 UI 中增强语义；
- 任何 Plan 都必须安排受限只读 preflight，保存请求、时间、状态、响应 schema、hash 和失败原因；失败时保持 `live_unavailable`/`unknown`。

官方来源：

- [Trader leaderboard rankings](https://docs.polymarket.com/api-reference/core/get-trader-leaderboard-rankings)
- [User activity](https://docs.polymarket.com/api-reference/core/get-user-activity)
- [Current positions](https://docs.polymarket.com/api-reference/core/get-current-positions-for-a-user)
- [Closed positions](https://docs.polymarket.com/api-reference/core/get-closed-positions-for-a-user)
- [Total position value](https://docs.polymarket.com/api-reference/core/get-total-value-of-a-users-positions)
- [User/market trades](https://docs.polymarket.com/api-reference/core/get-trades-for-a-user-or-markets)
- [Prices history](https://docs.polymarket.com/api-reference/markets/get-prices-history)
- [Rate limits](https://docs.polymarket.com/api-reference/rate-limits)

## 5. METRIC-DEFINITION-MATRIX

所有指标统一使用一个外层 envelope：`value`、`unit`、`window_start`、`window_end`、`as_of`、`sample_size`、`eligible_sample_size`、`coverage`、`data_status`、`source_provenance`、`calculation_version`、`limitations`。缺失值为 `null` 加状态，不得自动填 0。

| 指标 | 精确定义与输入 | 排除/门控 | 来源与版本建议 |
|---|---|---|---|
| Official 7D PnL | 官方 leaderboard `pnl`，UI 名称固定为 `Official 7D PnL / 官方 7 日 PnL` | 不称 realized；手续费、奖励、未实现口径未知时显示 limitation | 官方 `/v1/leaderboard?timePeriod=WEEK&orderBy=PNL...`；`leaderboard-official-v1` |
| reconstructed 7D realized PnL | `/closed-positions` 完整分页后按 UTC `timestamp` 过滤并求和 `realizedPnl` | 与 official `pnl` 分字段，不混用；分页不完整则 unavailable | Data API closed positions；`closed-pnl-utc-sum-v1` |
| Win Rate | `profitable closed positions / (profitable + loss-making closed positions)`，按 position；0 为 breakeven | missing/unknown 不进分母；小样本不生成赢家标签 | closed positions；`position-win-rate-v1` |
| Average Buy Price | `Σ(price × size) / Σ(size)`，只对有效 BUY | `size/price` 缺失不计；Σsize=0 unavailable | verified TRADE rows；`weighted-buy-price-v1` |
| Average Buy Amount | `mean(price × size)`，每笔有效 BUY 的平均 USDC 名义金额 | 与 Average Buy Price 分开；不显示为价格 | verified TRADE rows；`mean-buy-notional-v1` |
| Flip Rate | `SELL exits / (SELL exits + REDEEM exits)` | 需定义 position key、首 BUY、部分/多次 SELL、SELL 后 REDEEM；无法完整匹配 unavailable | `/activity` + `/trades` + closed positions；`exit-path-v1` |
| Last Trade | 已验证 TRADE 中最大 UTC timestamp，返回绝对和相对时间 | 不表示在线、不表示仍持仓；分页不完整或时间未知则 unavailable | `/trades`/`/activity`；`last-trade-utc-v1` |
| Realized-PnL Drawdown | 窗口内 closed positions 按 timestamp 排序，累计 realized PnL 曲线的峰值到后续低点最大 USD 差 | 不称完整账户 MDD；没有初始权益不输出百分比 | closed positions；`realized-pnl-drawdown-usd-v1` |
| Median Exposure Minutes | 每个可匹配 token 的 `t_exit - t_first_buy`，exit 为 SELL 或 REDEEM，取中位数 | 路径不完整、时间缺失排除；有效样本不足 unavailable | activity/trades/closed positions；`token-exposure-median-v1` |
| Evidence Coverage | evidence 行为窗口内可评估交易/总 eligible 交易，必须和 existing Alibi contract 的 coverage 口径分开命名 | 低于 40% 不输出 early-entry 比例结论 | existing Alibi evidence pipeline；`evidence-coverage-v1` |
| Documented Early-Entry Share | 有合格公开证据且交易时间在来源时间之前的可评估 share | 不称 Insider Rate；时间先后不等于因果/内幕；coverage<40% 为 insufficient | existing Alibi Summary/detail data；`documented-early-entry-v1` |
| Documented Language Window Share | 落入已验证语言来源时间窗的 eligible share | overlap 或 calibration 缺失为 indeterminate/unknown | existing language evidence；`language-window-share-v1` |
| Unattributed Share | 当前检索范围内未找到合格证据的窗口 share | 不表示不存在公开信息；不可诱导付费 | existing attribution states；`unattributed-share-v1` |
| Investigated Trade Count | 进入 Alibi investigation 的交易数 | 必须列 investigated/eligible/missing counts | existing run payload；`investigated-count-v1` |
| Last Investigation Status | 最近一次 Alibi run 的 contract status | 不转译成 wallet ability/risk | existing report contract；`investigation-status-v1` |

### 5.1 Flip Rate 机械规则

后续 Plan 必须先锁定纯函数和 fixture，而不是凭 UI 名称实现：

1. position key 优先使用 `asset/token_id`，必要时结合 condition/market；
2. 首笔有效 BUY 建立路径；
3. 部分 SELL 按数量减少剩余份额；多次 SELL 逐笔累计；
4. SELL 导致退出的数量计入 SELL exit；
5. REDEEM 对仍有可赎回份额的路径计入 REDEEM exit；
6. SELL 后仍有 REDEEM 时按数量/路径拆分，不能重复计数；
7. SPLIT、MERGE、REWARD、REBATE 不自动视为退出，必须保留为 context 或明确转换规则；
8. 缺少首 BUY、数量、时间或完整活动页时返回 `unavailable`，不能按 0 计算。

### 5.2 Coverage 纪律

所有 metric、ranking row 和 user-fit 输出都要同时显示样本数、eligible 样本数、coverage、窗口、as-of、数据状态和 limitations。`n/a` 表示不适用或未追踪，不等于 0 或免费；`insufficient_evidence` 表示证据不足，不表示执行失败。

## 6. SMARTX-COMPETITOR-DIFF

SmartX 是公开竞品参考，不是 Alibi 数据源、算法来源或授权实现。公开页面可见：verified trader profile、30D P&L、win/trades、leaderboard、行为标签、follow/copy/one-tap trade 和 order-submitted 叙事。SmartX 的公开营销内容不能证明其计算方法、数据完整性或实际执行结果。

| 维度 | SmartX 公开表达 | Alibi 仅可采用的结构 | 明确不采用 |
|---|---|---|---|
| 排行榜 | trader leaderboard、P&L、verified profile | 钱包排行、统一 as-of、provenance、coverage、limitations | 不复制品牌、视觉资产或未验证算法 |
| 行为标签 | behavioral tags、expertise/trading style 表达 | 客观指标和术语解释 | 不把标签升级为能力、身份或内幕判断 |
| 实时入口 | feed、follow、copy、one-tap trade | 只读公开钱包监控、Last Trade 和 stale 标记 | 不跟单、下单、托管、代签或连接私钥 |
| 收费/账户 | SmartX 可能存在交易账户和交易路径 | Alibi Summary/metrics/lead-rate 免费，既有 Detail x402 边界保持 | 不引入交易账户或复制支付/产品边界 |
| 钱包详情 | 钱包表现和市场上下文 | 三层上下文 + evidence status + fit 限制 | 不暗示“值得跟随”或收益 |

来源：[SmartX home](https://smartx.io/)、[SmartX Terminal guide](https://smartx.io/blog/smartx-terminal-a-complete-guide-for-prediction-market-traders/)、[Smart money decoded](https://smartx.io/blog/smart-money-decoded-what-top-prediction-market-traders-actually-read/)。这些页面为公开营销/叙事证据，不能证明 SmartX 内部算法。

## 7. ARXIV-APPLICATION-MATRIX

论文只用于偏差、指标解释和研究设计，不用于给具体钱包作内幕、身份、能力或买卖判断。

| 论文 | 可采用机制 | 不可直接采用 | Alibi 影响 | 证据等级 |
|---|---|---|---|---|
| [Beating the market with a bad predictive model](https://arxiv.org/abs/2010.12508) | 区分预测能力、市场价格、市场 taker 和收益评价；提醒 profit≠skill | 不把论文模型移植为钱包分数；不做个体结论 | Official PnL、Win Rate、Evidence 必须分开，保留 limitation | `[Confirmed: paper abstract]`；工程影响为 `[Strong inference]` |
| [Learning Performance of Prediction Markets with Kelly Bettors](https://arxiv.org/abs/1201.6655) | 可作为长期序列与复利/参与者行为的理论背景 | 不将 Kelly 假设用于现实钱包；不把最佳参与者理论当作能力证明 | 不新增 Kelly 指标；只支持长期窗口需谨慎说明 | `[Confirmed: paper abstract]`；工程影响 `[Strong inference]` |
| [Public Trader Identity: Adverse Selection and Return Predictability](https://arxiv.org/abs/2608.04373) | 研究公开 trader identity 与短期价格信息关系的研究动机 | 不把公开钱包直接解释为身份或内幕；不输出因果 | 只可作为 future research rationale；保留 Alibi time-only disclaimer | `[Confirmed: paper abstract]`；具体产品含义 `[Hypothesis]` |
| [The Anatomy of a Decentralized Prediction Market](https://arxiv.org/abs/2604.24366) | 区分公开 WebSocket order-book feed 与 authoritative on-chain trade；关注延迟、深度、wash-share 等测量限制 | 不复制论文样本或 wash-trading结论；不把第三方事件当钱包成交 | Market Channel 只触发，Data API/交易记录做 authoritative hydration；Fit 保存 as-of/latency | `[Confirmed: paper abstract]`；工程影响 `[Strong inference]` |

论文 license：以上 arXiv abstract 页面未提供可直接移植软件许可证；本 CR 不复制论文代码、数据集或文本。检索日期：2026-09-05。所有具体钱包结论必须被禁止。

## 8. SAFETY-AND-PAYMENT-BOUNDARY

### 8.1 不可覆盖的安全红线

- 只读 Polymarket 数据；不托管资金、不索取/存储/输出私钥；
- 不签名、不下单、不撤单、不自动跟单、不发送交易；
- 不把公开钱包地址升级为真实身份；
- 不把早期进场、语言时间窗或集群写成内幕、因果、协调或成功概率；
- 不把 recorded、cached、stale 或 synthetic 写成 live；synthetic 永不得进入用户 Demo；
- 不提供个性化买卖、进场、跟单或收益建议；
- “多钱包跟踪＋实时交易流”只表示监控公开地址和公开事件，断线时 stale/REST fallback；
- 如要求 custody/copy trading，立即进入 `CHANGE_CONTROL_EXPANSION_REQUIRED: CUSTODY_AND_TRADING`。

### 8.2 免费与付费边界候选

免费：Leaderboard、Wallet Metrics、lead-rate/Evidence coverage 摘要。  
既有 x402 付费：逐笔 Attribution 和 User Fit；沿用 scoped V2、exact scheme、Base Sepolia `eip155:84532`、既有 USDC/payTo/facilitator 和当前 0.01 USDC Detail 边界。任何付费 challenge 必须在输入有效、结果可交付、资源可用且不是 insufficient/provider/upstream unavailable 后返回；免费摘要必须包含 `detail_available`、`fit_available` 和 `unavailable_reason`。MCP 与 REST 共享同一 service layer 和同一支付边界。

本 CR 不修改 `src/payment/**`，不安装 `x402-next`、`x402-fetch` legacy 包，不执行支付、签名或链上交易。

## 9. REST API

以下是待后续 Plan 精确落实的 canonical route 候选；本轮不创建：

| Route | 访问 | 说明 |
|---|---|---|
| `GET /api/v1/leaderboard` | 免费 | `source=official|recorded`、固定 schema；不与现有单地址 `/api/v1/rankings` 重复；具体 query 需先确认路由规范 |
| `GET /api/v1/wallets/{address}/metrics` | 免费 | 指标 envelope；不把现有 `/report` 直接改名 |
| `GET /api/v1/wallets/{address}/lead-rate` | 免费 | Alibi evidence coverage/lead-rate 摘要，低 coverage 返回 insufficient |
| `GET /api/v1/wallets/{address}/attribution` | x402 | 逐笔 detail；共享既有 attribution guard，不能 alias bypass |
| `GET /api/v1/wallets/{address}/fit?delay_seconds=&size_usdc=` | x402 | User Fit；可交付性门先于 challenge |

这些路线不能在后续实现中同时创建无版本、单数、复数重复别名。正式 Plan 必须先给出现有 route inventory、冲突表、canonical 选择和 API contract test。

## 10. MCP / AGENT-TO-AGENT

候选 read-only tools：`list_ranked_wallets`、`get_wallet_metrics`、`get_wallet_evidence_summary`、`investigate_ranked_wallet`、`estimate_wallet_fit`。它们必须调用与 REST 相同的 service layer，返回 calculation version、as-of、data_status、coverage 和 limitations，不得绕过 coverage、stale、payment 或 safety gate。继续使用现有 REST＋MCP；不新增 A2A 网络协议。新工具的名字、schema、权限和测试属于后续 Plan 的精确 allowlist。

## 11. UI / I18N / GLOSSARY

Wallet Discovery 必须出现在既有 Alibi 调查模块之前，至少展示 Rank、Wallet/Username、Official 7D PnL、Win Rate、Realized-PnL Drawdown、Median Exposure、Average Buy Price、Average Buy Amount、Flip Rate、Last Trade、Evidence Coverage、Documented Early-Entry Share、Data Status 和 Investigate Evidence。

继承当前 `zh-CN`/`en`、`alibi_locale`、SSR initial locale、metadata/lang、TermHelp、ARIA、keyboard、focus-visible、mobile、desktop、200% zoom 和 reduced-motion。每个新增指标都必须进入集中 Glossary，唯一 term_id，中文/英文定义和限制；不得翻译原始市场标题、证据标题、URL、引文、hash、内部枚举或钱包地址。Glossary coverage gate：

```text
GLOSSARY_COVERAGE=100%
UNMAPPED_TERMS=0
DUPLICATE_TERM_IDS=0
PENDING_DEFINITION=0
```

排行榜跳转必须设置显式上下文并保持当前 Alibi 调查状态；不重新请求付费 Detail、不自动支付、不刷新隐藏状态。

## 12. FILE-IMPACT-MATRIX

本 CR 生成阶段实际只新增本候选文件。以下为获批后可能的精确边界候选，必须由后续 Plan 再确认并逐文件授权；此表不授权修改：

| 目的 | 预期文件/目录 | 状态 | 保护说明 |
|---|---|---|---|
| 新增类型和 envelope | `src/wallet-discovery/contracts.ts` 或既有明确 contract 文件 | 后续 Plan 必须选定单一文件 | 不改现有 `src/contracts/index.ts`，除非另行 Change Control |
| 官方 Data API adapter/cache | `src/adapters/polymarket/leaderboard.ts`、明确 cache service 文件 | 后续 Plan 精确列出 | 只读、bounded retry、15min cache、stale |
| closed-position/activity pagination | 明确 wallet-discovery adapter 文件 | 后续 Plan 精确列出 | 不改现有 Alibi normalizer/engine |
| metric pure functions | `src/wallet-discovery/metrics/*.ts` | 后续 Plan 精确列出 | 不改 D1–D6、现有 `src/analysis/**` |
| market attribution cache | 独立 service 文件 | 后续 Plan 精确列出 | recorded/live/synthetic 隔离 |
| REST routes | `app/api/v1/leaderboard/route.ts` 等 | 后续 Plan 精确列出 | 不新增重复 alias，不改既有 route |
| MCP tools | 现有 MCP service 的明确新增区段 | 后续 Plan 精确列出 | 同 service layer、同 payment gate |
| UI | 与当前 UI 暂停状态冲突的现有 `app/page*.tsx`/Glossary 文件 | 当前禁止并行修改 | 先完成 UI v0.3 暂停交接，再按新 Plan 排序 |
| Tests | 独立 wallet-discovery unit/contract/integration/e2e 文件 | 后续 Plan 精确列出 | 不修改 fixtures 为 synthetic 用户数据 |
| Recorded snapshot | `artifacts/verification/wallet-discovery-001/**` | 后续 Plan 精确列出 | 必须真实只读来源、hash、retrieved_at |
| Docs | `VERIFICATION.md`、`HANDOFF.md`、`CHANGELOG.md`及独立报告 | 后续 Plan 精确列出 | 记录实测和状态，不覆盖历史 |

严格保护：`SPEC-ALIBI-PLATFORM.md`、`PLAN-ALIBI-PLATFORM.md`、所有既有 CR/Plan、`src/analysis/**`、`src/contracts/**`、`src/normalize/**`、`src/engine/**`、既有 Summary/Attribution/Audit route、x402/payment、fixtures、数据库/migration、环境文件、MCP/Extension/ERC-8004/WebSocket/RAG 现有实现、Desktop launcher。任何需要突破保护范围都必须合并为一份 Change Request。

## 13. TESTS AND ACCEPTANCE

未来 Plan 至少必须覆盖：

| 类别 | 必须验证 |
|---|---|
| Universe | live 返回 20 个有效、规范化、去重地址；recorded 20 可离线复现；无 synthetic 用户 Demo；统一 snapshot/as-of/hash |
| Official PnL | 官方名称保持；不误标 realized；查询参数、分页、limitation 完整 |
| Closed positions | `limit<=50` 分页完整性；UTC filter；realizedPnl 汇总；缺页 unavailable |
| Win Rate | position-level；profit/loss 分子分母；breakeven 和 unknown 排除；小样本 insufficient |
| Buy metrics | Average Buy Price 与 Amount 独立；weighted vs per-trade mean；缺失值不填 0 |
| Flip | 首 BUY、partial/multiple SELL、SELL+REDEEM、SPLIT/MERGE/REWARD/REBATE、incomplete path |
| Drawdown/Exposure | USD drawdown 限制；无完整权益不出百分比；token exposure matching 和 median |
| Alibi | 7D/30D 窗口分离；40% coverage gate；unattributed/indeterminate 独立；BUY-only D1–D6 不变 |
| Cache | market-level reuse；key/version/hash；live/recorded/synthetic isolation；15min stale fallback |
| Context | ranking click 设置完整 Shared Context；Alibi Summary 使用 context；不自动付费/支付/交易 |
| API | canonical route only；JSON fields；错误 envelope；run_id/data_status；existing route unchanged |
| x402 | 免费摘要不 402；paid eligibility before challenge；same guard on aliases/MCP；exact/Base Sepolia/0.01 USDC unchanged；no settlement in tests |
| Realtime | read-only public events；no wallet identity from Market Channel；REST fallback；disconnect/stale/reconnect；no orders |
| MCP | REST/MCP same service output；coverage/payment/safety parity；read-only tools only |
| UI | bilingual, glossary 100%, TermHelp each metric/status/flag, empty/loading/error/stale/unavailable/insufficient |
| Browser | desktop/mobile/200% zoom、keyboard、ARIA、focus、reduced-motion、tooltip boundaries、no refetch on navigation |
| Integrity | typecheck、lint、unit、contract、integration、E2E、build、recorded replay、clean-room、Secret scan、no residual service |

## 14. DEMO SCRIPT CANDIDATE

仅在 recorded snapshot 存在且 hash 验证后：

1. 打开 Wallet Discovery，明确显示 `recorded` 和 snapshot `as_of`；
2. 展示 Rank、Official 7D PnL、Win Rate、coverage 和 limitation；
3. 选择一个地址，展示 Shared Investigation Context；
4. 聚焦现有 Alibi Summary，保持输入和语言状态，不自动请求 Detail；
5. 展示时间证据链、BUY-only cluster、language window 和 `unattributed/indeterminate`；
6. 展示 User Fit 时明确为只读估算，若数据不足显示 unavailable，不触发 x402；
7. 展示 Agent Console/MCP audit status 和 raw source provenance；
8. 明确说明“公开数据、时间关系和覆盖限制”，不说内幕、能力、因果、买入或跟单。

没有冻结的 recorded 20 时，演示降级为 Wallet Discovery empty/unavailable 状态，不使用 synthetic。

## 15. ROLLBACK AND CHANGE CONTROL

当前为无 Git 工作区。未来批准实施前必须：

- 对每个 allowlisted 文件保存修改前 SHA-256 和安全副本；
- 对新增文件记录路径、hash 和生成原因；
- 用逐文件恢复/移动方式回滚，不使用 `git reset --hard`、`git checkout` 或工作区范围删除；
- 恢复后重新跑 typecheck、targeted contract tests、existing Alibi API/402 smoke、recorded replay 和 clean-room；
- 删除只允许针对明确列出的本 CR artifacts，不得清理其他用户文件。

必须合并 Change Control 的情况：需要修改 Spec/Plan/API/数据模型/数据库、引入依赖或 paid provider、改变 x402/支付、使用 User Channel/private credentials、托管/签名/交易/自动跟单、无降级凭据阻塞、或无法同时满足 live/recorded/synthetic 隔离。若未来出现多个问题，合并为一份 CR，不拆成多轮口令。

## 16. OPEN-RISKS

1. **Official PnL semantics unknown**：官方文档定义字段为 PnL，但未确认 realized/unrealized/fees/rewards；必须保留名称和 limitation。
2. **No current live Top 20 response captured**：本轮为文档核验，不声称 live 20；需要后续只读 preflight。
3. **Recorded 20 not present as a dedicated frozen artifact**：当前已有 recorded wallet fixtures/selection，但未证明是本 CR 规定的 20 条 leaderboard snapshot。
4. **Existing pagination is insufficient for new metrics**：当前 wallet live adapter 一次 `/trades?limit=10000&offset=0`；closed positions/activity/older trades pagination 尚未实现。
5. **Existing WalletMetrics is semantically narrower**：不能把 `information_lead_rate` 冒充 Official PnL、Win Rate 或 Documented Early-Entry Share。
6. **Current UI is paused**：Wallet Discovery UI 与 UI-I18N v0.3 共享 page/Glossary/Docs 文件；必须按顺序处理，不可并行写入。
7. **MCP route exists but candidate tools do not**：需要后续 service-layer contract，不得扩展成独立 A2A。
8. **Market-level cache is absent**：需要明确缓存生命周期、hash、版本失效和进程/部署边界；若要求持久化数据库必须另行 Change Control。
9. **Fit requires order-book historical semantics**：`prices-history` 不是自动可得的完整 order-book depth；没有深度/时间数据时必须 unavailable。
10. **Subagent report timeout**：已授权的 4 个只读子任务在主线截止前未返回摘要；关键发现由主 Codex 独立复核，未返回结论未进入本 CR。

这些是可供后续 Plan 处理的事实风险，不是本轮需要人类回答的开放问题；本轮不会自行裁决官方 PnL 口径、完整历史分页或新的 API/数据模型。

## 17. DEFINITION OF DONE FOR A FUTURE PLAN

- 20-recorded 和 live Top 20 均有 provenance、hash、as-of、状态和可复现验证；
- 所有 metric envelope 字段齐全，缺失值不转 0，公式、样本、分母和限制可复算；
- Official PnL 与 reconstructed realized PnL 分离；Win/Buy/Flip/Drawdown/Exposure 单元测试覆盖边界；
- market cache、Shared Context、REST、MCP、realtime fallback 和 User Fit 均通过同一安全边界；
- 免费摘要、x402 challenge 条件和既有支付价格/网络/headers 不变；
- BUY-only cluster、D1–D6、D4 unavailable 规则和现有 API/fixtures 保护 hash 不变；
- UI 三层结构、双语、Glossary 100%、TermHelp、响应式、无障碍和 recorded-only Demo 通过；
- typecheck/lint/unit/contract/integration/E2E/build/replay/clean-room/Secret scan 全部有实际证据；
- 无托管、私钥、签名、下单、跟单、主网或公开发布；
- `VERIFICATION.md`、`HANDOFF.md`、`CHANGELOG.md` 和独立 artifacts 记录实际结果；
- 项目状态仍按真实外部门控标记 `PARTIALLY_VERIFIED`，不得仅凭 recorded 功能标记 `FULLY_LIVE_VERIFIED`。

## 18. DRAFT AUDIT LEDGER

| 子任务 | 状态 | 主 Codex 复核 |
|---|---|---|
| Current Project Auditor | `REPORT_TIMEOUT` | 是；通过本地文件、路由、hash 和治理文档独立核验 |
| Polymarket API Auditor | `REPORT_TIMEOUT` | 是；通过官方 API reference、rate-limit 文档和现有 adapters 独立核验 |
| Metric Definition Auditor | `REPORT_TIMEOUT` | 是；通过 `src/contracts/index.ts`、`src/engine/wallet.ts`、`src/rankings/*` 独立核验 |
| Agent/API/MCP/Safety Auditor | `REPORT_TIMEOUT` | 是；通过 routes、orchestrator、audit-agent、MCP、WebSocket、payment 文件独立核验 |

子智能体未写入工作区。主 Codex 没有将超时报告当作事实；本 CR 的事实来源为项目文件、官方文档和明确标注的公开竞品/论文页面。没有产生子智能体之间的实质冲突，因为没有收到其最终结论。

## 19. OUTPUT

候选文件绝对路径：`/Users/a0000/polymarket/CR-WALLET-DISCOVERY-RANKING-001-v0.1-candidate.md`  
本候选生成后停止，不生成 Plan，不修改产品代码，不安装依赖，不执行 migration、支付、签名、链上交易、付费调用或公开发布。

唯一批准命令：

```text
APPROVE: CR-WALLET-DISCOVERY-RANKING-001 v0.1
```
