# CHANGE-BUNDLE-ALIBI-UI-IO-CONSOLIDATED-001 v0.1（candidate）

状态：`CANDIDATE / UNAPPROVED`
生成时间：2026-09-05（America/Los_Angeles）
分支：`feature/wallet-discovery`
基线 HEAD：`81bfa49c0ec5cf9b723fd7a3a50984e680b04876`
本文件类型：**单一合并变更包**。获得一次批准后执行阶段连续运行，不再设置 CR、Plan、Phase 2、UI 等独立审批门。
唯一批准命令：`APPROVE: BUNDLE-ALIBI-UI-IO-CONSOLIDATED-001 v0.1 AND EXECUTE`

本轮未修改任何产品代码、依赖、lockfile、migration、治理日志。本文件是新增的候选文档。

---

## §0 权威输入顺序与本轮裁决

### 0.1 权威级别（8 级，冲突时上级优先）

| 级别 | 输入 | 管辖范围 |
|---|---|---|
| 1 | 用户直接裁决（本轮 10 条裁决摘要） | 一切 |
| 2 | 已批准 v0.7 Spec | 产品边界，本 Bundle 不修改 |
| 3 | 《Alibi 输入输出全清单》（202 行，SHA-256 `cd3e763a…20f828`） | 数据源、字段、端点、计费 |
| 4 | `alibi-trust-agent.zip`（202494 字节，SHA-256 `8f5913b3…9916397`） | 页面结构、组件、交互 |
| 5 | `alibi-landing-20260904.html`（SHA-256 `5c482099…05823b`） | 补充视觉与文案 |
| 6 | `alibi-pitch.html`（SHA-256 `b6126546…9a2876`） | 仅叙事，无视觉与产品否决权 |
| 7 | 现有代码实现 | 冲突时按 §2 逐条裁决 |
| 8 | 历史 CR/Plan 文档 | 只读保留，不得删改 |

### 0.2 ZIP 权威更正（记录在案）

此前报告结论「错误 ZIP 已退出权威输入序列」以及 `DECISION-LOG.md` 中 `ATTACHMENT_MISSING` 一节的前提，**已被用户裁决推翻**。ZIP 是组长交付的正式 UI 实现参考包，与三份独立附件必须同时使用。原文一字不删，由执行阶段追加 supersede 注记（见 §11）。

### 0.3 ZIP 复核（18 项，已实测，不重复扫描）

- 路径 `…/uploads/alibi-trust-agent.zip`；权限 `-r--------`；202494 字节；SHA-256 `8f5913b330c90c3c354cea2f710d70842d9b3063da7143fa6c1449a8e9916397`
- 中央目录 162 条；解压后单一顶层目录 `web-ui-review`；**98 个文件 + 64 个目录条目 = 162**；解压总字节 **684239**（与 `DECISION-LOG.md:103` 逐字节一致）
- 结论：`HISTORICAL_SIZE_RECORD_MISMATCH` **RESOLVED**（实测，非推测）。历史行记录的是解压总字节与含目录的条目数，不是 ZIP 文件大小。无损坏、无矛盾。
- 清单哈希 `/tmp/zv002-inventory.txt`（98 行）SHA-256 `3efb8d4ee66aedb6e5b5d6b9f787c08ba6299eb8978276a77118a172ef6bfdc9`
- lockfile：`package-lock.json` 存在（375863 字节，lockfileVersion 3，714 packages）；`pnpm-lock.yaml`/`yarn.lock`/`bun.lockb`/`npm-shrinkwrap.json` 均不存在
- 缺失目录（ZIP 为不完整抽取）：`mcp/`、`scripts/`、`db/`、`contracts/`、`vitest.config.*`、`playwright.config.ts`、`hardhat.config.ts`、`eslint.config.mjs`；**零测试文件**；24 个 script 中 9 个无法运行
- Secret scan：**PASS**。零 `0x[0-9a-fA-F]{64}`；仅 3 个 64-hex，均由 `src/observability/events.ts:27-29 createInputDigest` 生成的 SHA-256 摘要；零 PEM/AKIA/ghp_/xox/JWT/助记词；`.env.example` 10 键全部空值

### 0.4 ZIP↔基线差异（决定性结论）

**55 IDENTICAL / 29 DIFFERS / 14 ONLY_IN_ZIP / 83 ONLY_IN_PROJECT。ZIP 是约 2026-09-03/09-04 的更早快照，不是升级版；整树覆盖会导致编译失败并丢失约 22 MB 真实录制数据。**

ZIP 相对基线的净删除（不得回灌）：

- `src/contracts/index.ts`：−180 行 / −6384 字节，删除 22 个导出类型（`ClusterAlert`、`ClusterDimensionResult`、`LanguageSource`、`LanguageWindow`、`SourceCoverage`、`SourceObservation`、`TimestampCalibration`、`ClusterAlertState`、`ClusterDimensionState`、`ClusterSourceState`、`EvidenceQuality`、`LanguageCode`、`LanguageGap`、`ObservationRole`、`ProviderPriority`、`ProviderState`、`ReleaseOrder`、`SourceTier`、`TimestampPrecision`、`TimestampType`、`WalletLanguageRelation`），零新增；`src/analysis/cluster-language.ts` 与 `src/adapters/evidence/*` 依赖这些类型
- 缺失全部 5 个 i18n/UI 文件：`app/page-client.tsx`(24618B)、`src/ui/i18n.ts`(13426B)、`src/ui/glossary.ts`(38887B)、`src/ui/term-help.tsx`(5422B)、`src/reports/markdown.ts`(3298B)，合计 85651 字节；其 `app/page.tsx`/`app/layout.tsx`/`app/globals.css` 同步删除引用与 `.term-help-*` 样式，构成一致的 i18n 回退
- 缺失 `src/analysis/cluster-language.ts`(21300B)、`src/payment/idempotency.ts`(3688B)、9 个 `src/adapters/evidence/*`(41528B)、`src/analysis/{decimal,source-calibration,statistics,time-window}.ts`
- 删除 `withPaymentIdempotency` 与两个 attribution route 的 free-unattributed 短路；`paymentRequiredResponse(url, dataStatus="recorded")` 退化为 `(url)` 且 `data_status` 硬编码 `"live"`；删除 `isFreeUnattributedResult()`/`freeUnattributedDetailResponse()`
- fixtures 退化：基线 6.89MB/6.46MB/9.34MB 真实抓取（`captured_at` 2026-09-03T21:43:21.6xx/7xx/8xxZ，真实 market id `0x6231bdc2…`/`0xefa17dee…`/`0xa3b36b2d…`）vs ZIP 约 10KB 占位（`market_id: "mkt-fed-sep-2026"`）
- `package.json` 唯一差异是 `"dev": "next dev --hostname 127.0.0.1"` → `"next dev"`，ZIP 丢失回环绑定，**保留基线版本**

ZIP 唯一纯增益：`next.config.ts` 的 `allowedDevOrigins: ["127.0.0.1", "localhost"]`。

ONLY_IN_ZIP 中仅 4 个是功能代码：`app/smart-money/page.tsx`、`app/components/QueryDesk.tsx`、`app/leaderboard/route.ts`、`app/wallet-metrics/route.ts`。

`.impeccable/critique/2026-09-04T10-15-18Z__app-page-tsx.md` 泄漏第三方生成路径且其 `target_fingerprint sha256:6f7f7a65…` 与 ZIP 自身 `app/page.tsx`(`16aa73927b99…`) 不匹配 → 该 critique 针对更早版本，**不作为依据**。

---

## §1 Spec Delta（D1–D10 编码为硬规范）

本节新增硬规范，不修改已批准 v0.7 Spec 文本。

### D1 · `/trades` 授权范围（7 日）

- `/trades` 仅授权用于能证明完整覆盖的 7 日指标：`total_trades`、`avg_buy_price`、`last_trade_at`、`active_markets`、`category_mix` 的交易侧输入
- 覆盖不足时：`value = null`，`metric_status = unavailable`，`reason_code ∈ {incomplete_window, pagination_cap}`
- 禁止：外推、静默缩短窗口、把部分窗口标记为完整、用 0 填充
- **禁止使用 `/trades.side` 推导退出行为**
- 每次计算必须记录 12 个强制日志字段（窗口起止、请求 URL、limit/offset、页数、首末 timestamp、HTTP 状态、响应哈希、`retrieved_at`、`as_of` 来源、覆盖判定、`reason_code`）

### D2 · 90 日指标

当前 90 日历史**不可证明完整**（实测 `/trades` 仅达约 20.72 天）→ 一律 `metric_status = unavailable`。UI 文案：中文 `数据覆盖不足`／英文 `Insufficient history`。不得复活 90 日取数假设。

### D3 · `/closed-positions`

必须**全量分页枚举后**再按 `timestamp` 过滤，不得依赖服务端时间过滤。实测该端点返回 `warning: 299 - "Deprecated: use /v1/closed-positions"`（证据 `artifacts/verification/wallet-discovery-001/cp-*.headers.txt:11`）→ 执行阶段须实测 `/v1/closed-positions` 后再定端点，测量而非假定。

### D4/D5 · 退出类指标

缺少完整 SELL/REDEEM 时：`flip_rate` → `metric_status = unavailable`，`reason_code = exit_events_unavailable`；`median_exposure_minutes` 同理返回 null。实测 10000 行 `/trades` 全为 `side=BUY` → 当前必须返回 null，**不得填 0**。MDD 不输出。

### D6 · Profile Age

必须实测 `Gamma /public-profile`（加入 preflight）。对外字段 `median_profile_age_days`，UI 中文 `资料档案年龄`／英文 `Profile Age`。**禁止复活 `median_account_age_days`**。兼容字段 `account_age_days` 必须携带固定限制说明：`Derived from Polymarket public-profile createdAt. It is not wallet age, address age, or on-chain account age.`。端点未实测通过 → `reason_code = profile_endpoint_unverified`。

### D7 · sentinel

`outcomeIndex = 999` 是 unknown sentinel。**禁止映射为 0 / YES / NO / false / 任何默认值**。必须走 `metric_status = insufficient_evidence` 或显式 unknown 分支。

### D8 · 三字段状态分离

- `data_status ∈ {live, recorded, cached, synthetic}` — 仅表示数据来源模式
- `metric_status ∈ {complete, partial, unavailable, insufficient_evidence}` — 表示可计算性
- `reason_code`（8 值）：`incomplete_window`、`pagination_cap`、`exit_events_unavailable`、`profile_endpoint_unverified`、`provider_unavailable`、`coverage_below_gate`、`sentinel_unknown`、`timestamp_uncertain`
- 每个指标返回 ≥17 字段信封

### D9 · 缓存与快照一致性

记录 `Date`/`Last-Modified`/`Age`/缓存状态/`retrieved_at`/URL/HTTP 状态/limit/offset/响应哈希。检测页面重叠、缺口、重复、时间倒置、CDN 陈旧、头部漂移。**`as_of` 不得用本地请求时间冒充**，必须来自 `date`/`last-modified`/`age` 推导或响应自带 `as_of`。限流状态标记 `UNKNOWN` —「未观察到 429」不等于「没有限流」。

仪器化教训（写入但不传播错误结论）：CONNECT 代理下每个 `.headers.txt` 首行都是 `HTTP/1.1 200 Connection established`，**源站状态是最后一个状态行**；`ssl_verify_result=0` 才是真实基础设施的判别器；合成 DNS 使所有主机名落入 `198.18.0.0/15`，HTTP 200 本身不构成到达真实源站的证据。

### D10 · 剩余输入 preflight

12 行 preflight 表在执行阶段逐项实测，每行标注 `verified` / `planned` / `credential-required` / `availability-unknown` / `fallback`。Goldsky 子图仅在 `provider_unavailable` 时作为 Plan B。SecureClient 禁用。news.gov.hk 只存标题/URL/语言/发布时间/`retrieved_at`/摘要。CourtListener 鉴权条件必须实测。Market Stream 仅公共频道 `topic = market`、`event = last_trade_price`；无私有 User Channel、无下单/签名/连接钱包。

---

## §2 冲突处置（Task A 的 24 项 CONFLICT）

覆盖矩阵状态统计：`APPROVED_AND_VERIFIED` 6 · `IMPLEMENTED_NOT_VERIFIED` 21 · `PARTIALLY_COVERED` 17 · `PLANNED_NOT_IMPLEMENTED` 21 · `MISSING` 45 · `CONFLICT` 24 · `NOT_APPLICABLE` 1。

### 2.1 判定「改代码」（清单要求实质正确）

| 编号 | 冲突 | 位置 | 处置 |
|---|---|---|---|
| C13 | `source_timestamp_uncertainty_minutes` vs `timestamp_uncertainty_seconds`，**60× 单位错误** | `src/contracts/index.ts:343` | 统一为 `_minutes`；新增单位断言测试。**最易造成静默错误的一条，优先级最高** |
| C15 | `repricing_delta_logodds` vs `absolute_change = Math.abs(price_j − price_i)`，尾部压缩约 5× | `src/engine/repricing.ts:27`（阈值 0.08） | 改用 clipped logit（`cluster-language.ts` D5 已有实现），阈值随之重标定 |
| C12 | `assertAllowedPayment` 在 `expectedResource !== "/attribution"` 时 **抛错**，主动拒绝清单的多端点计费模型 | `src/payment/policy.ts:10` | 改为按 §4 计费表放行；同时修复该函数为**零调用者的死代码** |
| C9 | 聚类成员门 `>= 5` vs 清单 `≥ 3` | 聚类引擎 | 改为 `≥ 3` |
| C10 | 未文档化的额外门 `evaluable >= 5` + `coverageHealthy` | 聚类引擎 | 或写入规范，或移除；不得保留未文档化门 |
| C6 | `coverage_rate: number` 非空，零样本与真实零塌缩 | contracts | 改为 nullable + `metric_status` |
| C22 | 允许 `publishedAt <= endAt + 24h` 未来容差 | `src/engine/attribution.ts:26` | 收紧；未来时间戳走 `timestamp_uncertain` |
| C20 | `walletWindowDays: 90` 是 `ReportMeta` 的**字面量类型**，而 `/trades` 只达约 20.72 天 | `src/contracts/index.ts:496` | 放宽为可变窗口 + `metric_status`，按 D2 返回 unavailable |
| C21 | 全量 BUY 下 `flip_rate` | 引擎 | 返回 null + `exit_events_unavailable`，不得填 0 |
| C4/C26 | GDELT 已知约 15 分钟误差编码为 `null`，而 HK RSS 声称 0 秒不确定度（两个方向相反的标定错误） | 证据适配层 | GDELT 写入 15；HK RSS 按实测标定，不得写 0 |
| C27 | GDELT `item.language` 读取后硬编码为 `"other"` | `aggregator-discovery.ts:37` | 保留真实语言值 |
| C24 | `mcp/tools/catalog.ts` 8 个工具全硬编码 `data_status: "recorded"`，且缺 assess/screen/market-screen | MCP | 按真实模式返回；补齐工具 |

### 2.2 判定「改清单」（代码更严谨）

| 编号 | 冲突 | 裁决 |
|---|---|---|
| C16 | 因果 `driver: information_driven/capital_driven` vs `AttributionStatus = information_consistent \| capital_consistent \| unattributed \| insufficient_evidence` | **采用代码**。与 `src/contracts/index.ts:150-151` 的 DISCLAIMER 一致，不把时间先后写成因果 |
| C17 | 四段判定重命名为 `pre_verified_public_source_entry` / `within_documented_language_window` / `post_english_publication_entry` / `indeterminate` | **采用代码**；`unattributed` 归属另一枚举（`AttributionStatus`），两个枚举不得混用 |
| C7 | `median_account_age_days` vs `median_profile_age_days` | **采用 `median_profile_age_days`**（D6）。Group A 对外兼容字段 `account_age_days` 保留，两者共存（`PLAN-…v0.2:102` 禁止复活旧名，`:192` 禁止改名对外字段） |
| C8 | `market_familiarity_ratio`（内部，注释 "Compatibility name retained"）vs `market_novelty_ratio`（展示） | **采用 `market_novelty_ratio`** 作为对外名。清单原名与其自身定义自相矛盾 |
| C14 | RTDS 降级为 `trigger_only: true`，永不作为交易行 | **采用代码**；当前无真实 WebSocket 连接，标注 `planned` |
| C1/C23 | SEC EDGAR 降级为 `P1`/`coverage_observation` 且 `published_at` 恒 null；Federal Register 的 Public Inspection 时间路由至 `first_seen_at` | **采用代码**的保守处理；同时在执行阶段实测 EDGAR 是否可升格 |
| C19 | `/closed-positions` 弃用警告 | 按 D3 实测 `/v1/closed-positions` 后定稿 |
| — | `date_only` 时间戳档次、阻断 `"unknown"` 的门 | **采用代码** |

### 2.3 完全缺失（执行阶段补齐或明确标 planned）

- 端点零实现：`/public-profile`、订单簿、`calculateMarketPrice()`/`estimateMarketPrice()`（两个名字均零命中）、`/activity`、`/positions`、`/closed-positions`、`/value`。现状代码只用 Gamma `/markets`、CLOB `/prices-history`、Data API `/trades`
- A 组 13 字段、C 组 6 字段、E 组 6 字段 = **25 个字段零代码**
- 第 1 层信源（cryptocurrency.cv、Alpha Vantage NEWS_SENTIMENT、Guardian）与 Brave News 全部 MISSING
- 第 3 层证据升格 MISSING → 聚合类 URL 永久停留在 `published_at: null`
- `indexes_checked` MISSING → 削弱 `source_state === "not_found"` 告警的前置条件
- D 组是唯一接近完整且有测试覆盖的组

---

## §3 UI Migration Matrix

允许状态仅：`reuse`、`adapt`、`visual-reference-only`、`reject-backend-conflict`、`reject-fake-data`、`pending-decision`。

| ZIP 文件/组件 | 目标文件 | 状态 | contract 来源 | 风险 | 测试 |
|---|---|---|---|---|---|
| `next.config.ts`（`allowedDevOrigins`） | `next.config.ts` | `reuse` | ZIP（唯一纯增益） | 低 | `npm run build` 通过 |
| `app/components/QueryDesk.tsx` | `app/components/QueryDesk.tsx` + 接入 `src/ui/i18n.ts` | `adapt` | ZIP 交互 + 清单 §三 端点 | 中：与 `app/page-client.tsx` 职责重叠须先定边界 | 7 个 `UiState` 状态快照 + 键盘可达性 + `aria-live` |
| `src/ui/state.ts`（15 行，7 值 UiState 由真实 HTTP 状态 + `error.code` 驱动） | 同名 | `reuse` | ZIP | 低 | 单元测试覆盖 7 值映射 |
| `app/smart-money/page.tsx` | `app/smart-money/page.tsx` | `adapt` | ZIP 版式 + D 组契约 | **高**：含 `SYNTHETIC_TOTAL = 778`、`mulberry32` 伪随机 PnL/Vol、10 个假昵称 | 合成数据禁入 Demo 断言；PnL/Vol 必须与其他指标同样退化为 `—` |
| `app/leaderboard/route.ts` | 待定 | `pending-decision` | 需 §4 计费与预算契约 | **高**：无鉴权公共代理，绕过 budget 与 `data_status`；`:41-42 Number(record.pnl ?? 0)` 把缺失上游值静默转 0 | 需鉴权 + 限流 + nullable 类型后再评 |
| `app/wallet-metrics/route.ts` | 待定 | `pending-decision` | 同上 | **高**：同上；`:67,69,72,74,77` 即使 live 模式也硬编码 5 个字段为 null | 同上；null 必须携带 `metric_status`+`reason_code` |
| `app/globals.css` | 现有 `globals.css` | `visual-reference-only` | ZIP 视觉 + Landing 补充 | 中：ZIP 版删除 `.term-help-*` 样式 | 视觉回归 + reduced-motion |
| `app/page.tsx` | 现有 `app/page.tsx` | `visual-reference-only` | 版式参考 | **高**：含 P0 编造数据（见 §5） | 不迁移逻辑，仅取版式 |
| `app/layout.tsx` | 现有 | `visual-reference-only` | — | 中：`:11` 硬编码 `<html lang="zh-CN">` 且无切换，而 UI 中英混排 | i18n 语言属性随语言切换 |
| `src/contracts/index.ts` | 现有 | `reject-backend-conflict` | 基线 | **致命**：删 22 个导出类型，直接编译失败 | — |
| `app/api/v1/attribution/route.ts`（及第二个 attribution route） | 现有 | `reject-backend-conflict` | 基线 + §4 | **致命**：删 `withPaymentIdempotency` 与 free-unattributed 短路 | — |
| `src/payment/server.ts` | 现有 | `reject-backend-conflict` | 基线 + §4 | 高：`data_status` 硬编码 `"live"`；`:16-18` 零地址 fallback 进入 402 challenge | — |
| `src/api/platform.ts` | 现有 | `reject-backend-conflict` | 基线 | 高：删 `isFreeUnattributedResult()`/`freeUnattributedDetailResponse()` | — |
| `package.json` / `package-lock.json` | 现有 | `reject-backend-conflict` | 基线 | 高：ZIP 丢失 `--hostname 127.0.0.1`；禁止复制 lockfile | — |
| `fixtures/**`（约 10KB 占位，`market_id: "mkt-fed-sep-2026"`） | 现有 recorded fixtures | `reject-fake-data` | 基线真实抓取 | **致命**：覆盖将丢失约 22 MB 真实数据 | — |
| `fixtures/synthetic/demo.json`（`prices[].source = "polymarket-data-api (recorded)"` 却位于 `fixture_status: "synthetic"` 文件内） | — | `reject-fake-data` | D8 | 高：误标 bug，recorded/synthetic 混淆 | 执行阶段加 fixture 标签一致性测试 |
| 其余 27 个 DIFFERS 文件 | 现有 | `visual-reference-only` | 基线 | 中 | — |
| 55 个 IDENTICAL 文件 | 现有 | 无操作 | — | 无 | — |
| `.impeccable/critique/*` | — | `reject-backend-conflict` | — | 中：泄漏第三方路径，指纹不匹配 | — |

### 3.1 视觉 token 锁定

ZIP `app/globals.css` 的 `:root`（L3-11）与 Landing 的 `:root`（L1291-1299）为**同一 7 token 集**，采纳为唯一视觉基准：

```
--ink: #17211b   --muted: #65746b   --paper: #f5f1e8   --card: #fffdf8
--line: #d8d0c0  --accent: #cf4b32  --green: #2d6a4f
```

- `--green: #2d6a4f` 作为补充色采纳
- 第 8 个事实品牌色 `#b98a2e`（`app/page.tsx:12-16 WIRE_DOT_CLS`）→ 收编为 `--warn: #b98a2e`，不再散落
- `QueryDesk.tsx` 的 15 个深色主题裸 hex（`#18221f`、`#0d1512`、`#b8d8c2`、`#b8c4be`、`#354940`、`#24332e`、`#202d29`、`#547264`、`#719783`、`#d8eee0`、`#f0cf92`、`#5c5138`、`#2d2922`、`#f0d7a5`、`#f7f3ea`）→ 收编为 `--console-*` 命名 token 集
- CSS 内非 token 裸色 `rgba(23,33,27,0.05)`、`#fffaf0`、`#ebe5d8`、`rgba(229,189,101,0.33)` 保留于渐变/高亮定义处，不提升为 token
- ZIP 无 `@theme` 块 → 7 个变量是普通自定义属性而非 Tailwind token，导致大量任意 hex class。执行阶段新增 `@theme` 映射，**不新增视觉依赖**
- CSS 内**无任何宽度断点**，响应式完全依赖 Tailwind `sm:`/`md:`；保持该结构
- 保留 3 个 `prefers-reduced-motion: reduce` 块（L54、L59、L78-81）与 4 个 keyframes（`wire-in`、`wire-out`、`wire-breathe`、`tg-pop`）
- 保留 `.shadow-hard`(`10px 10px 0`)、`.shadow-hard-sm`(`5px 5px 0`)、`.stamp`(`rotate(-2deg)`, `letter-spacing: 0.18em`)、`:focus-visible`(`2px solid var(--accent)`, `offset 2px`)
- **Pitch 的调色板（`--paper:#EFEFEC`、`--ink:#191C1E`、`--flag:#A3182F`、`--trace:#2E5E5A`、阴影 `2px 3px 0`）不得采纳**

### 3.2 UI 强制修正 1–10

1. 删除 `app/page.tsx:20 CALL_COUNT_BASE = 1223`；调用计数改为真实计数器或从 0 起的 Session Request Count；`QueryDesk.tsx:41-42` 的计数递增必须移到 fetch **成功之后**（当前在 `:52` fetch 之前，失败也计数）
2. 删除 `TERMINAL_LINES`（`:25-30`）静态 402→200 剧本；CLI 区绑定真实本地 API 契约；真实 x402 结算前不得显示成功
3. 删除 `:152-156` 假结果 JSON（`verdict: "unattributed"`、`window: "+8.0pp"`、`coverage: 0.31`——0.31 低于自身 40% 门，自相矛盾）
4. 删除 `:6-10 WIRE_ITEMS` 三条编造 wire（含 `6/6 维度命中 · 跨度 187 分钟`、`路透社 14:31 发稿，交易在其后 2 分钟`）与 `:130 价格移动 8 个点`
5. Telegram 区必须标注**通知预览**；不得呈现为已发送
6. 钱包地址、coverage、verdict 若为视觉样例必须显式标注；时间显示当前时间或响应 `as_of`，禁用固定 2026-09-04
7. 补齐键盘可达性：当前项目**零 `role=`、零 `onKeyDown`/`onKeyUp`/`tabIndex`**；`app/smart-money/page.tsx:246` 的 `<tr onClick>` 键盘不可达，导致内嵌 `QueryDesk`(`:293`) 整体无法键盘到达
8. 补 `aria-live`/`role="status"` 到 loading/error/success 区域（当前 15 个 `aria-*`，零 live region）
9. `AnomalyWire` 每 4200ms 自动轮播（`app/page.tsx:41`）无暂停控件，违反 WCAG 2.2.2 → 加暂停/停止
10. 修正两处文案：`app/smart-money/page.tsx:212`「谁值得追踪」（推荐倾向，与同页「不提供买卖方向」冲突）、`app/page.tsx:223`「这个钱包的收益，你能不能复制」

违禁文案扫描结果（保留）：8 个目标串中 6 个**零命中**（`他是先知道`、`先知道`、`决定跟不跟`、`决定怎么跟`、`值不值得跟单`、`跟单`）；`内幕` 3 命中均在否认语境（`app/page.tsx:228`、`app/smart-money/page.tsx:326`、`src/contracts/index.ts:150`，均为「不构成投资建议；不提供买卖方向；不指控任何主体。时间上的先后关系不等于因果、内幕交易或确定的信息优势。」）；`insider` 1 命中在 `src/providers/anthropic.ts:48` 的禁止性 system prompt 内。均**合规保留**。

### 3.3 ZIP 中应保留的优点

`QueryDesk.tsx` + `src/ui/state.ts` 用真实 HTTP 状态与 `error.code` 驱动全部 7 个 `UiState`；`:67` 仅把支付挑战记为 `"received (redacted)"`；支付输入 `type="password" autoComplete="off"`，文案「Alibi 不接收私钥。」；`:164` 强制「覆盖率低于 40% 时不输出先手率结论」。前端只打 5 个端点（`POST /summary`、`POST /attribution`、`GET /audit`、`GET /leaderboard`、`GET /wallet-metrics`），**无浏览器直连 Polymarket**。13–14 个 `data-testid` 全部保留复用。

---

## §4 API 与计费

六端点 + MCP 工具，统一 ≥17 字段指标信封（含 `data_status`、`metric_status`、`reason_code`、`as_of`、`retrieved_at`、`source_url`、`http_status`、`limit`、`offset`、`response_hash`、`coverage_rate`、`window_start`、`window_end`、`page_count`、`first_timestamp`、`last_timestamp`、`rate_limit_state`）。

免费边界（硬规则）：

- `unattributed` **必须 HTTP 200 且免费，无任何预扣费**
- 仅当 `billable_result_count > 0` 才返回**单次** 402
- 支付重试读取同一冻结结果，**不重算、不重复计费**（依赖基线 `src/payment/idempotency.ts`，ZIP 版已删除，不得回灌）

x402 V2 scoped 唯一路径：`@x402/core` `@x402/evm` `@x402/next` `@x402/fetch`（`^2.24.0`），exact scheme，Base Sepolia `eip155:84532`，0.01 USDC = 10000 atomic，`PAYMENT-IDENTIFIER` 幂等。禁止 `x402-next`、legacy `x402-fetch`、`--legacy-peer-deps`。

当前实测缺陷（执行阶段必修）：

- `app/api/v1/attribution/route.ts:21-22` 在 `executePlatformAnalysis` **之前**就计费，`unattributed`/`insufficient_evidence` 被收费；43 次 grep 未发现任何退款路径
- `src/payment/server.ts:16-18` 零地址 fallback 会被广播进 402 challenge
- `src/payment/policy.ts:4 assertAllowedPayment` 零调用者（死代码）
- `src/payment/server.ts:80` `withX402(handler, ATTRIBUTION_ROUTE_CONFIG, createX402Server(), undefined, undefined, true)` 第 6 个位置参数 `true` 语义**未确定** → 执行阶段查证后记录，不猜测

安全红线（不变）：Polymarket 只读；不托管资金；不接收/保存/输出私钥；不代签、不下单、不撤单、不自动跟单；不提供买卖建议；不推断真实身份；不作内幕指控；不把时间先后写成因果；不伪造来源/时间戳/付款/测试；recorded/cached/synthetic 不得标 live；synthetic 不得进入用户 Demo；聚合新闻仅用于发现。若要求增加托管或自动交易 → `CHANGE_CONTROL_EXPANSION_REQUIRED: CUSTODY_AND_TRADING`。

---

## §5 动态真实性规则（执行阶段逐条验收）

固定 2026-09-04 时间、「已被调用 1,223 次」、某市场 alert、路透社时间、Telegram「已发送」、静态 402→200、钱包/coverage/verdict —— 全部按 §3.2 处理为真实数据或显式视觉样例。recorded / synthetic / live 三态必须显式区分且不可互相冒充。

---

## §6 输入输出覆盖矩阵（摘要）

| 组 | 字段数 | 当前代码状态 | Bundle 目标 |
|---|---|---|---|
| A 组 Outcome（免费，13 字段） | 13 | 零代码 | 实现；`win_rate` 分母是仓位不是交易；`avg_buy_price` 份额加权；`flip_rate` 数活动类型不算时长且当前 unavailable；`rebate_income` 单列不并入 PnL；MDD 不输出，用 `median_exposure_minutes` 替代 |
| B 组 Attribution（10 字段 + `evidence[]` 14 字段） | 24 | 部分实现 | 四段判定用代码枚举（C17）；coverage gate 0.40；`source_timestamp_uncertainty_minutes`（EDGAR≈0.1 · 垂类≈1 · 聚合≈15）；拆分 `source_lead_minutes`/`repricing_lead_minutes`；**不写入 `insider`/`knew_first`/`speaks_chinese`/`better_judgment`** |
| C 组 Fit（x402，6 字段） | 6 | 零代码 | 实现；只读撮合模拟 |
| D 组 Cluster（8 指标） | 8 | 接近完整，有测试 | 修 C9/C10；BUY-only、180 分钟窗口、单笔 ≥ 市场 7 日 P99、D1–D6、herding veto；`median_profile_age_days` |
| E 组 Market Screen（6 字段） | 6 | 零代码 | 实现 |

安全命名覆盖：`median_profile_age_days`、`market_novelty_ratio`、非因果 `observed_sequence`、拆分后的两个 lead 字段、`estimateMarketPrice()`。

术语门：`GLOSSARY_COVERAGE=100%`、`UNMAPPED_TERMS=0`、`DUPLICATE_TERM_IDS=0`、`PENDING_DEFINITION=0`。

---

## §7 文件 allowlist

允许修改（执行阶段）：

```
next.config.ts
app/globals.css
app/layout.tsx
app/page.tsx
app/page-client.tsx
app/components/QueryDesk.tsx
app/smart-money/page.tsx
src/ui/state.ts
src/ui/i18n.ts
src/ui/glossary.ts
src/ui/term-help.tsx
src/contracts/index.ts
src/engine/repricing.ts
src/engine/attribution.ts
src/payment/policy.ts
src/payment/server.ts
src/api/platform.ts
app/api/v1/attribution/route.ts
src/adapters/evidence/aggregator-discovery.ts
mcp/tools/catalog.ts
DECISION-LOG.md
APPROVAL-LOG.md
VERIFICATION.md
CHANGELOG.md
HANDOFF.md
```

允许新增：新测试文件、新 fixture 标签一致性测试、preflight 实测产物于 `artifacts/verification/**`。

**禁止**：整包覆盖；复制 ZIP 的 `package.json` 或任何 lockfile；覆盖后端 route；覆盖 payment / MCP / ERC-8004 / Solidity / 数据库或环境配置；把 mock data 当真实 API 数据；把静态 402→200 当真实付款；因 UI 需要而安装未批准依赖；修改已批准 v0.7 Spec；覆盖旧 CR/Plan/验证记录；恢复 Plan v0.2；修改 `main` 或 release worktree。

沙箱标准禁令保留：**不得在本沙箱执行 `git worktree prune`**。ZIP 仅临时只读解压于 `/tmp/zv002`。

---

## §8 实施 Plan（单次批准后连续执行）

- **P1 契约与单位修正**：C13（60× 单位）→ C15（log-odds）→ C6（nullable）→ C20（窗口字面量）→ C22（未来容差）。每步跑 `npm run verify`
- **P2 状态三分离**：落地 D8 的 `data_status`/`metric_status`/`reason_code` 与 ≥17 字段信封；D1/D2/D4/D5/D7 的 null 与 unavailable 语义
- **P3 计费修正**：C12 放行多端点；`unattributed` 免费短路前置到计费之前；恢复/保留 `withPaymentIdempotency`；修零地址 fallback；查证 `withX402` 第 6 参数
- **P4 输入 preflight**：D10 的 12 行逐项实测（含 `/public-profile`、`/v1/closed-positions`、订单簿、`/activity`、`/positions`、`/value`），结果写入 `artifacts/verification/**`，测量而非假定
- **P5 缺失字段实现**：A 组 13 + C 组 6 + E 组 6；`estimateMarketPrice()`
- **P6 信源补齐**：第 1 层三源 + Brave News + 第 3 层证据升格 + `indexes_checked`；修 C4/C26/C27
- **P7 UI 迁移**：按 §3 矩阵执行；`reuse` → `adapt` → 视觉 token 收编 → UI 强制修正 1–10 → 无障碍补齐
- **P8 验收**：§9 全量测试与视觉回归

`pending-decision` 两个 route（`leaderboard`、`wallet-metrics`）在 P3 完成鉴权与限流设计后由执行方按 L1 定档并记入 `DECISION-LOG.md`，不新增审批门。

---

## §9 测试与 DoD

- `npm run verify`（typecheck && lint && test && build）全绿
- 单位断言测试：`_minutes` 字段不得接收秒值
- null 语义测试：每个 unavailable 指标必须同时带 `metric_status` 与 `reason_code`，且断言**不为 0**
- sentinel 测试：`outcomeIndex = 999` 不得映射为 0/YES/NO/false
- 计费测试：`unattributed` → 200 且零扣费；`billable_result_count > 0` → 单次 402；支付重试读同一冻结结果且不重算
- fixture 标签一致性测试：`fixture_status: synthetic` 文件内不得出现 `(recorded)` 来源串
- 无障碍：键盘可达全部交互（含 `smart-money` 行展开与内嵌 QueryDesk）、`aria-live` 存在、轮播可暂停、语言属性随 i18n 切换
- 视觉验收（Task H）：参考图与实现图对照，桌面 / 移动 / 200% 缩放 / reduced-motion / 中英文，GUI/CLI/APP 键盘导航，hover/focus/click，loading/empty/error/unavailable，recorded/live 标注，TermHelp，`GLOSSARY_COVERAGE=100%`、`UNMAPPED_TERMS=0`，Playwright 视觉回归。动态区域可 mask，**不得为提高相似度而删除**；不得新增视觉依赖
- Demo：美国 + 香港，三个 Demo；缺案例时输出 `DEMO_CASE_UNAVAILABLE`，**不得编造 slug**；synthetic 不得进入用户 Demo
- 提交纪律：仅提交到 `feature/wallet-discovery`；不推 `main`

---

## §10 Supersede 声明

- `PLAN-UI-I18N-GLOSSARY-001 v0.2 / v0.3` 未执行部分 → 由本 Bundle supersede，保持暂停，不并行执行；UI v0.3 的 `V-GATE=PAUSED_PENDING` 由本 Bundle 单一路径处置
- `PLAN-WALLET-DISCOVERY-RANKING-001 v0.2` 未执行部分（Phase 2 及其后）→ 由本 Bundle supersede；旧 Phase 2 RESUME 指令失效；不得继续实现已被实测证伪的 90 日取数假设
- 已批准 v0.7 Spec → **不修改**
- 全部历史 CR / Plan / 验证记录 → 只读保留，不删改

---

## §11 执行阶段须追加的治理日志行（本轮未写入）

`DECISION-LOG.md`（追加，不改原文）：

1. ZIP 权威更正：ZIP 为正式 UI 参考包（权威级 4），此前「退出权威输入序列」结论作废；`ATTACHMENT_MISSING` 一节前提被 supersede
2. `HISTORICAL_SIZE_RECORD_MISMATCH` **RESOLVED**（实测：684239 = 解压总字节；162 = 98 文件 + 64 目录条目；ZIP 自身 202494 字节）
3. 子智能体并行委派决策（4 条只读轨道）
4. 本轮只读核验的 L0 行
5. 自记录哈希漂移说明：`09:08:18` 行记 `9bfd1eed…7eb343bc`，实测 `2b2a9f2f…09ab2503`（107 行），原因是此后追加 Phase 1 行与 `ATTACHMENT_MISSING` 一节，属预期增长，**不得静默改写文件内旧值**

`APPROVAL-LOG.md`（追加/更正）：

6. 追加 `APPROVE: WUDP-WALLET-DISCOVERY-002 OPTION A` 行
7. 更正第 17–21 行失效的下一道门指针 `（无。Phase 0→2 已获授权连续执行。）` → 唯一门 `APPROVE: BUNDLE-ALIBI-UI-IO-CONSOLIDATED-001 v0.1 AND EXECUTE`

---

## §12 剩余 L2 决策（需用户在总审查时一并裁定）

1. `app/leaderboard/route.ts` 与 `app/wallet-metrics/route.ts` 是否作为**公开无鉴权**端点保留——当前两者绕过 budget 与 `data_status`。建议：加鉴权 + 限流后保留，按 L1 执行
2. `QueryDesk.tsx` 与 `app/page-client.tsx` 的职责边界（两者功能重叠）
3. `/closed-positions` 弃用后是否切换至 `/v1/closed-positions`——须先实测
4. `src/payment/server.ts:80` `withX402` 第 6 位参数 `true` 的语义——须查证后定

---

## §13 附件 provenance（本轮重算，不沿用历史值）

崩溃后附件由用户重新上传，四份全部到位。本轮对每份重新计算 SHA-256，与历史值交叉核验。

| 附件 | 字节 | 本轮实测 SHA-256 | 历史值 | 结果 |
|---|---|---|---|---|
| `Alibi 输入输出全清单.md`（202 行） | 9502 | `cd3e763a44c25a7bb333892278ffb901366c24c1d5097d4d21115df42520f828` | 同 | **MATCH** |
| `alibi-landing-20260904.html` | 39743 | `5c4820990a40e536612e220dad33c64c37980f33f87ad4caf812c6a5f905823b` | 同 | **MATCH** |
| `alibi-pitch.html` | 137398 | `b6126546119b18abe14198c9dc2f407bb2eeb9b6dcf0e361d7825d1ea79d2876` | 同 | **MATCH** |
| `alibi-trust-agent.zip` | 202494 | `8f5913b330c90c3c354cea2f710d70842d9b3063da7143fa6c1449a8e9916397` | 无历史值 | 新记录 |

上传目录权限 `-r--------`（只读），修改时间 2026-09-05 08:45–09:01。四份均为独立文件，**不在 ZIP 内**。

**provenance 差异（记录在案，不阻塞）**：早先指令称文件名为 `alibi-pitch(3).html`，实际上传为 `alibi-pitch.html`。字节数与 SHA-256 与历史 pitch 值一致，判定为同一内容的不同文件名，仅 `(3)` 浏览器重复下载后缀差异。**不因此阻塞**。

**`ATTACHMENT_MISSING` 前提失效**：`DECISION-LOG.md` 末节的 `ATTACHMENT_MISSING`（2026-09-05T09:54:44-0700）成立前提是「三份权威输入在已上传压缩包中全部缺失」。该判断在当时是正确的——三份文档确实不在 ZIP 内，而当时只上传了 ZIP。本轮四份文件已作为**独立附件**上传，前提消失。原文不删改，由 §11 的 supersede 注记处置。

### 13.1 ZIP 独立复算（本轮，未沿用崩溃前扫描）

| 项 | 实测 |
|---|---|
| ZIP 字节 / SHA-256 | 202494 / `8f5913b3…9916397`（与上表一致） |
| 中央目录条目 | 162 |
| 解压文件数 | **98** |
| 解压目录条目 | **64**（`find -type d` 得 65，含解压根） |
| 98 + 64 | **= 162** ✓ |
| 解压总字节 | **684239** |
| 顶层目录 | 单一 `web-ui-review` |
| inventory hash（`sha256␠␠bytes␠␠path`+LF，98 行 LC_ALL=C 排序） | `fe17e807e6318ef2d9a46afcbc6f8e1d95224e6e72e6936261d24a5f7b2208ee` |

该 inventory hash 与 `artifacts/verification/crash-recovery-consolidated-001/recovery-manifest.json` 的 `inventory_sha256` **逐字符一致**，且是按该文件自述的 `inventory_algorithm` 独立复算得出 —— 这构成崩溃前 artifacts 未被篡改的密码学证据，是本轮复用 Phase 1 证据的依据。

§0.3 另记 `/tmp/zv002-inventory.txt` 哈希 `3efb8d4e…6bfdc9f`（98 行）。该文件为崩溃窗口临时产物，已随 `/tmp` 消失，其行格式未被记录，**本轮无法复算**。记为 `FORMAT_UNRECORDED_NOT_MISMATCH`，不作为矛盾。98 行文件数与本轮一致。

ZIP 解压于 `/tmp/zrec/ex`，只读使用，原文件未改动。**未向产品树复制任何字节。**

---

## §14 Phase 1 实测摘要（复用，未重跑网络探针）

来源 `VERIFICATION.md` §1.0–1.8（2026-09-05T09:54:44-0700）与 151 个 artifacts（5.1 MB）。本轮**零补充探针**，外部支出 USD 0.00。

| 结论 | 实测值 | 影响 |
|---|---|---|
| `/activity` offset 上限 | 5000，**硬报 400** | 最多约 5500 行 |
| 高频钱包速率 | 500 行跨 2400 s = **12.5 行/分** | — |
| `/activity` 覆盖 | 约 **7.33 小时** | 不能支撑 7 日或 90 日 |
| `/trades` limit/offset | 均 10000；offset **含** 10000，10001 → 400 | limit 静默截断 |
| 一万行 `/trades` 覆盖 | 2026-08-15T23:06:34Z → 2026-09-05T16:20:06Z = **20.72 天** | 7 日可算，**90 日不可算** |
| `/trades` side 分布 | **10000 行全 BUY，零 SELL** | `flip_rate` 不可由 side 推导 |
| `/closed-positions` offset | 有效且真实（overlap 10/50、0/50；o100000 返回 `[]`） | 可全量分页 |
| `/closed-positions` 排序 | **`realizedPnl` DESC，非 timestamp** | 必须全量枚举后过滤 |
| `realizedPnl` 单位 | **decimal USDC**（比值 0.7993–1.0000） | 误判差 10⁶ 倍 |
| `outcomeIndex=999` | TRADE {999:**1**}、REDEEM {999:5}、MERGE {999:17} | 真实 TRADE 中出现，必须 unknown |
| HTTP 429 | **从未观测** | — |
| rate-limit headers | `retry-after\|x-ratelimit\|ratelimit-` **零命中** | — |
| 限流状态 | **`UNKNOWN`** | 探针间隔约 2 s，从未逼近阈值 |
| CDN cache | 同 URL 相隔数秒 HIT/EXPIRED/MISS 不同，`age` 最高 1150 s | `as_of` 不得用客户端时间 |
| leaderboard offset | 文档 ≤1000，**实测 10000 仍返回 rank 10001–10050** | 文档上限不存在 |
| `prices-history` | `ph-max` 253 点步长非均匀；`ph-fid` 1441 点步长 **0**（重复时间戳） | 不得假定均匀网格 |
| profile `createdAt` | 所测五端点**均不暴露** | `median_profile_age_days` 依赖 `/public-profile` |

三项仪器化缺陷已在 Phase 1 内部纠正并保留教训（CONNECT 代理首行 200 假象、四个探针状态码未落盘、缓存陈旧误判为数据不一致）。这些是**读法错误**，不是端点行为，不得传播为产品结论。

---

## §15 指标可计算性矩阵

`C` = 可计算（须通过完整性门）· `U` = `unavailable` · `P` = `planned`（端点零实现）。任何 `U` 一律 `value=null`，**禁止填 0**。

| 指标 | 组 | 数据源 | 7 日 | 90 日 | `reason_code` | 前置条件 |
|---|---|---|---|---|---|---|
| `realized_pnl_7d` | A | `/closed-positions` | **C** | U | `incomplete_window` | 全量分页至空页/硬上限，取回后按 timestamp 过滤 |
| `win_rate` | A | `/closed-positions` | **C** | U | 同上 | 分母是**仓位**不是交易 |
| `avg_buy_price` | A | `/trades` | **C** | U | `pagination_cap` | 份额加权 Σ(price×size)/Σ(size) |
| `total_trades` | A | `/trades` | **C** | U | `pagination_cap` | 官方分页，offset 一位偏移须显式编码 |
| `active_markets` | A | `/trades` | **C** | U | `pagination_cap` | 去重 conditionId |
| `last_trade_at` | A | `/trades` | **C** | — | — | — |
| `category_mix` | A | `/trades` + Gamma | **C** | U | `provider_unavailable` | 需 Gamma `/markets` 类目 |
| `flip_rate` | A | 退出事件 | **U** | U | **`exit_events_unavailable`** | 须完整配对 SELL+REDEEM；**禁用 `/trades.side`** |
| `median_exposure_minutes` | A | 退出事件 | **U** | U | `exit_events_unavailable` | 须完整配对 first BUY → SELL/REDEEM |
| `first_deposit_at` | A | `/activity` | **U** | U | `incomplete_window` | 7.33 h 触达内无 DEPOSIT 即不可得 |
| `rebate_income` | A | `/activity` | **U** | U | `incomplete_window` | 单列，**不并入 PnL** |
| `median_profile_age_days` | A/D | `/public-profile` | **P** | P | `profile_endpoint_unverified` | 端点零实现，须先 preflight 实测 |
| `portfolio_value` | A | `/value` | **P** | — | `provider_unavailable` | 端点零实现；快照无历史序列 |
| MDD | A | — | **不输出** | — | — | 以 `median_exposure_minutes` 替代 |
| `lead_rate` | B | 证据层 | 条件 C | U | `coverage_below_gate` | coverage < 0.40 → null |
| `coverage` | B | 证据层 | C | U | — | nullable（修 C6） |
| `source_lead_minutes` | B | 证据层 | 条件 C | U | — | 与 repricing 分离，**不混用单一 `lead_minutes`** |
| `repricing_lead_minutes` | B | `prices-history` | 条件 C | U | `timestamp_uncertain` | 非均匀网格 + 重复时间戳 |
| `indexes_checked` | B | 证据层 | **P** | P | — | 零实现，缺它则 `not_found` 告警不可信 |
| C 组 6 字段 | C | 订单簿 | **P** | P | `provider_unavailable` | 订单簿零实现；只读撮合模拟 |
| D 组 8 指标 | D | `/activity` + Gamma | **C** | U | — | 180 分钟窗口在 7.33 h 触达内**可行**；修 C9/C10 |
| E 组 6 字段 | E | Gamma | **P** | P | — | 零实现 |

**90 日列整列为 U**，依据 §14 的 20.72 天实测上限。这是契约级限制，不是瞬时故障。Goldsky／数据库长期快照／新数据服务仅列为后续候选，**本 Bundle 不默认采用**。

D 组在 7.33 h 触达内可行，是因为其窗口是 180 分钟而非 7 日 —— 这是 `/activity` 唯一仍然成立的用途。

---

## §16 当前 API 与目标 API

| 端点 | 现状 | 目标 | 计费 |
|---|---|---|---|
| Gamma `/markets` | **已实现** | 保留 + 类目 | 免费 |
| CLOB `/prices-history` | **已实现** | 保留 + 非均匀网格处理 | 免费 |
| Data `/trades` | **已实现（单页）** | 官方全量分页 + 覆盖判定 | 免费 |
| Data `/closed-positions` | 零实现 | 全量枚举后过滤；先实测 `/v1/closed-positions` | 免费 |
| Data `/activity` | 零实现 | 仅 D 组 180 分钟窗口 | 免费 |
| Data `/positions` `/value` | 零实现 | preflight 后定 | 免费 |
| Gamma `/public-profile` | 零实现 | preflight 实测 → `median_profile_age_days` | 免费 |
| CLOB 订单簿 | 零实现 | C 组只读撮合模拟 | x402 |
| `estimateMarketPrice()` | **两个名字均零命中** | 用当前 SDK 可验证函数或等价只读实现 | — |
| `/summary` `/attribution` `/audit` | 已实现 | 修计费顺序 + 信封 | 见下 |
| `/leaderboard` `/wallet-metrics` | ZIP 新增，无鉴权 | `pending-decision`（§12 第 1 项） | 待定 |
| MCP 8 工具 | 硬编码 `recorded` | 真实模式 + 补 assess/screen/market-screen | 免费 |

`calculateMarketPrice()` 仅作为 legacy 名记录，不作为实现目标。

计费顺序硬规则：`分析 → 判定 billable_result_count → 仅当 > 0 才 402`。当前 `attribution/route.ts:21-22` 在分析**之前**计费，且 43 次 grep 无退款路径 —— 必修。`402 → payment → 200 unattributed` 流程**禁止**，不得先收费再返回 unattributed。

---

## §17 实施任务与并行路径

P1–P8 见 §8。四条轨道可并行，交汇点为 P8：

| 轨道 | 任务 | 依赖 | 冲突文件 |
|---|---|---|---|
| **T1 契约/引擎** | P1 → P2 → P5 → P6 | 无 | `src/contracts/index.ts`、`src/engine/*`、`src/adapters/evidence/*` |
| **T2 计费/安全** | P3 | T1 的 D8 信封 | `src/payment/*`、`app/api/v1/attribution/route.ts`、`src/api/platform.ts` |
| **T3 只读 preflight** | P4 | 无（纯只读） | 仅 `artifacts/verification/**` |
| **T4 UI** | P7 | T1 的 contract 名 | `app/**`、`src/ui/*` |

T3 可最先启动且全程无写冲突。T1 与 T4 共享 `src/contracts/index.ts` 的字段名 —— T4 须等 T1 的 C13/C6/C20 落地后再改 UI 绑定，否则重复返工。T2 与 T4 无文件交集，可完全并行。

串行必须点：C13（60× 单位错误）**最先**，它是最易造成静默错误的一条，且 T1/T2/T4 都读该字段。

---

## §18 回滚方案

模式：**Git（Plan v0.2 §11.2）**。锚点 `81bfa49c0ec5cf9b723fd7a3a50984e680b04876`。

- 锚点是**来源锚点，不是已知良好状态** —— 它内含未验证的 UI v0.3 改动，`V-GATE=PAUSED_PENDING`
- 单文件回滚 `git checkout 81bfa49c -- <path>`；全轨道回滚 `git checkout 81bfa49c -- <该轨道 allowlist>`
- **权限往返缺口（已实测）**：工作树为 `600`，Git index 为 `100644`，沙箱 `umask=0022` → `git checkout` 式回滚会把文件恢复成 `644`。**回滚后必须补 `chmod 600`**，不得假定权限自动往返
- **禁止**：`reset --hard`、`clean -f`、`stash`、`rebase`、force push、`--amend`、`git tag -f`
- **常设禁令**：本沙箱内永不执行 `git worktree prune` —— release worktree 的 `prunable` 标记是挂载边界外 `gitdir` 不可达造成的可见性假象，不是宿主仓库损坏；执行该命令会摘除健康的 release worktree 注册
- 治理文档（`DECISION-LOG.md`／`VERIFICATION.md`／`APPROVAL-LOG.md`）**只追加不回滚**，历史记录永不删改
- 崩溃前 artifacts（151 文件 / 5.1 MB）为证据，回滚**不删除**

---

## §19 预算

| 项 | 值 |
|---|---|
| 硬上限 | **USD 10**（累计，沿用已批准 v0.7 上限，不提高） |
| 软停止 | **USD 9** —— 达到即停止并报告，不自行续行 |
| 本轮实际支出 | **USD 0.00** |
| 崩溃前 Phase 1 支出 | USD 0.00（全部免费公开只读 GET） |
| 唯一潜在付费项 | Anthropic Messages API（Evidence ↔ Window 分类，`claude-haiku-4-5-20251001`，每组最多 2 次，固定输入上限，失败降级 `unattributed`） |

x402 结算使用 Base Sepolia **测试网**（`eip155:84532`），0.01 USDC = 10000 atomic，不计入 USD 预算。禁止主网。调用 ledger 必须记账；预算耗尽走冻结样本降级，不得静默继续付费调用。

---

## §20 build、replay、Secret scan、clean-room

现有基础设施均已存在，无需新增依赖：`vitest.config.ts`、`playwright.config.ts`、`eslint.config.mjs`、33 个测试文件。

| 门 | 命令 | 通过条件 |
|---|---|---|
| build/verify | `npm run verify`（`typecheck && lint && test && build`） | 全绿 |
| E2E | `npm run test:e2e` | 15/15；本轮**未重测**，`HANDOFF.md` 的「28 Vitest / 82 测试 / 15/15 Playwright」为引用 |
| replay | `npm run verify:offline`（recorded 模式） | 与 recorded fixtures 逐字节一致；**约 22 MB 真实抓取不得被 ZIP 占位覆盖** |
| live 抽查 | `npm run verify:live` | 仅免费只读端点 |
| Secret scan | 64-hex / `sk-ant-*` / `hf_*` / `gh[pousr]_*` / `AKIA*` / PEM / 助记词 | 零命中（已知豁免：solc build-info 内 16 个唯一 64-hex，逐个查证为 9 个 `keccak256` 源码哈希 + 7 个 `PUSH32` event topic）；**不回显任何值** |
| clean-room | 新目录 `git clone` + `npm ci` + `npm run verify` | 不依赖本机残留 `node_modules`、`.next`、`/tmp` 产物 |

`.env.local` 未被跟踪（`.gitignore` 覆盖），三份 `.env.*.example` 敏感键值全空 —— 执行阶段须复核该状态未退化。

---

## §21 Definition of Done

Bundle 执行完成必须**同时**满足：

1. `npm run verify` 全绿；clean-room 复现同结果
2. 单位断言测试：`_minutes` 字段拒绝秒值（C13 回归）
3. null 语义测试：每个 `unavailable` 指标同时带 `metric_status` + `reason_code`，且断言**不为 0**
4. sentinel 回归测试：`outcomeIndex=999` 不映射为 0/YES/NO/false，不参与 YES/NO、经济方向或同向性
5. 90 日指标一律 `unavailable` + limitation；无任何外推或窗口静默缩短
6. 分页完整性测试：静默截断端点不得以「返回行数少于请求数」作唯一终止条件；`/trades` offset 一位偏移显式覆盖
7. `/closed-positions` 全量枚举后过滤；分页未完成 → `unavailable`
8. 计费测试：`unattributed` → 200 且零扣费；`insufficient_evidence` 免费；upstream unavailable 免费；`billable_result_count > 0` → **单次** 402；重试读同一冻结结果不重算
9. `as_of` 来自 `date`/`last-modified`/`age` 推导或响应自带，**不得用客户端完成时间**；限流状态标 `UNKNOWN`
10. fixture 标签一致性测试：`fixture_status: synthetic` 文件内不得出现 `(recorded)` 来源串
11. 安全命名全覆盖：`median_profile_age_days`、`market_novelty_ratio`、`observed_sequence`、`source_lead_minutes`、`repricing_lead_minutes`；`median_account_age_days` 零复活
12. 禁止文案零命中；`insider`/`knew_first`/`speaks_chinese`/`better_judgment` 不写入任何字段
13. 无障碍：全部交互键盘可达（含 `smart-money` 行展开与内嵌 QueryDesk）、`aria-live` 存在、`AnomalyWire` 轮播可暂停（WCAG 2.2.2）、语言属性随 i18n 切换
14. 响应式 + 200% 缩放 + reduced-motion + 中英文；Playwright 视觉回归；screenshot parity 动态区域可 mask，**不得为提高相似度而删除内容**，不得新增视觉依赖
15. `GLOSSARY_COVERAGE=100%`、`UNMAPPED_TERMS=0`、`DUPLICATE_TERM_IDS=0`、`PENDING_DEFINITION=0`；TermHelp 全术语可达
16. UI 强制修正 1–10 全部完成；`CALL_COUNT_BASE=1223`、`TERMINAL_LINES` 静态 402→200 剧本、假结果 JSON、编造 wire 全部移除
17. Iran Demo 保持 `CASE_NOT_REPRODUCED`；**不得用新闻引用代替** market/wallet/trade/price/hash 数据包
18. Demo 缺案例输出 `DEMO_CASE_UNAVAILABLE`，不编造 slug；synthetic 不进入用户 Demo
19. 支出 ≤ USD 10，软停 USD 9；ledger 完整
20. 仅提交 `feature/wallet-discovery`；`main`、release/control worktree、已批准 v0.7 Spec、历史 CR/Plan 零改动
21. UI v0.3 的 `V-GATE` 由本 Bundle 单一路径处置并记入 `VERIFICATION.md`

任一项未达 → 整体记 `PARTIALLY_VERIFIED`，**不得标 `FULLY_LIVE_VERIFIED`**。
