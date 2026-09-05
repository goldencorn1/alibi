# PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1

状态：候选 Plan，等待独立 Plan 批准  
生成日期：2026-09-04  
规范来源：CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1  
批准状态：用户已提供精确批准命令：

APPROVE: CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1

本 Plan 只把已批准 CR 转换为可执行的工程计划。本轮不进入 Execution，不安装依赖，不修改代码、依赖、lockfile、Spec、Plan 之外的项目文件，不运行 migration，不调用外部付费服务，不执行支付或链上交易。

## 1. 输入核验与不可变基线

### 1.1 CR 文件核验

用户指定的项目内路径：

/Users/a0000/polymarket/CR-CLUSTER-LANGUAGE-EVIDENCE-001.md

该路径当前不存在。已读取并核验用户同时提供的附件路径：

/Users/a0000/Downloads/CR-CLUSTER-LANGUAGE-EVIDENCE-001.md

核验结果：

- 文件大小：27,399 bytes
- SHA-256：8d07c2ef4b7d6061de91482374505a19db32f8117c34307a5ba28e69e3ce70bd
- 与用户给出的预期 SHA-256：一致
- 本 Plan 将该已核验附件作为 CR v0.1 的规范来源
- 不复制 CR 到项目根目录；路径差异必须在最终验收报告中作为可复现性记录保留

如果后续 Execution 需要项目内 CR 路径，必须由人工先决定是否将同一哈希文件以受控方式纳入项目；该动作不属于本 Plan 的当前批准范围。

### 1.2 Spec 不可变基线

受保护文件：

/Users/a0000/polymarket/SPEC-ALIBI-PLATFORM.md

当前核验基线：

- 文档标题标识：Alibi Complete Agent Platform Specification — v0.2 active (v0.7 revision)
- Version 字段：v0.2 revision v0.7
- 当前 SHA-256：6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c
- 文件内容、版本和原始路径必须保持不变
- 不在本 CR 中增加 Spec 版本，不回写 Spec，不修改旧 Plan

有效规范集合按以下优先级解释：

1. 现有安全红线与支付安全边界；
2. SPEC-ALIBI-PLATFORM.md v0.7 原文；
3. 已批准 CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1；
4. 本 Plan 的实施顺序、文件边界和验收约束。

若发现 CR 与 Spec 在 cluster、source、language、API optional fields 或现有 UI 展示范围之外发生冲突，必须停止并输出 CHANGE_CONTROL_EXPANSION_REQUIRED，不得自行解释为本 CR 授权。

### 1.3 当前代码基线的只读结论

当前项目已存在以下可复用边界：

- 当前 contracts 入口为 src/contracts/index.ts，SCHEMA_VERSION 为 1.0.0，已有 DataStatus 与 Summary/Detail 报告类型。
- 当前分析入口为 src/engine/analyze.ts，已连接 recorded fixture 与 live 数据路径、repricing、evidence validation、attribution、wallet metrics 和 policy。
- 当前平台响应组装位于 src/api/platform.ts、src/report/build.ts、src/reports/assembler.ts；已有 legacy /summary、/attribution、/audit 与 /api/v1/* 路由。
- 当前 WebSocket 代码主要是 src/adapters/polymarket/market-ws.ts 的 recorded replay helper；src/adapters/polymarket/ws-state.ts 已有连接、stale、reconnecting、closed、去重和重连状态；src/adapters/polymarket/rest-backfill.ts 已有 retry/backfill 基础。
- 当前 Polymarket 数据适配器在 src/data/adapters.ts，已有 Gamma、CLOB、Data API 等读取路径；CR 所要求的低延迟触发、REST hydration、Reconcile 与 15 秒降级回退仍需在批准后设计实现。
- 当前 src/data/evidence.ts 的校验字段少于 CR 的 URL、publisher、title、language、时间类型、精度、不确定性、hash、source tier、connector 状态和 pairing 要求。
- 当前报告没有 cluster_alerts、language_windows、source_coverage、evidence_cutoff_at 这些可选字段。
- 当前 agents 目录已有 Orchestrator、Evidence、Attribution、Quality/Risk、Audit/Report 角色；CR 所需新增逻辑应优先复用这些角色，不增加会改变确定性门槛的 LLM 决策。
- 当前 app/page.tsx 为既有 UI 入口；CR 的 UI 工作应保持在现有页面和 Agent Console，不新建页面。
- 当前 package.json 已声明 Node >=20.9 <27，并使用现有 Next、React、TypeScript、Tailwind 以及已有 viem、pg 等依赖；本 CR 不新增依赖。
- 当前没有证据证明需要新增数据库表才能满足本 CR 的可选报告字段和 recorded artifact；推荐方案先使用现有 report/audit/artifact 边界。若实现前审计证明必须持久化到新数据库表，属于单独 Change Control。

## 2. 目标、范围与硬约束

### 2.1 目标

在不改变现有平台外部行为的前提下，增加两个独立的 evidence-only 能力：

1. cluster_without_verified_source：在固定 180 分钟窗口、确定性 BUY 交易和完整数据覆盖下，识别同一 market/time window 的异常大额同向地址 cluster，并在 cutoff 前没有合格公开来源时允许形成 formal alert。
2. documented_language_window：形成本地语言与 English 公共来源的时间线、可信配对、gap 状态和钱包交易相对关系。

两个能力必须能够给出 provenance、evidence cutoff、coverage、precision、uncertainty、revision 和限制说明。

### 2.2 明确非目标

- 不证明 insider trading、coordination、identity、language ability、long-term skill、causality 或 common control。
- 不输出交易、买卖、入场、跟随、copy、仓位或投资建议。
- 不新增 public route，不删除或替换 /api/v1/*，不改变 legacy /summary、/attribution、/audit UI 调用。
- 不改变 x402 V2 的 network、amount、asset、payTo、facilitator、payment headers、HTTP 402 语义或 recorded/live 的 402 修复。
- 不新增 NewsAPI.ai、付费 provider、链上写入、真实支付、链上交易或 migration。
- 不将 synthetic ticker、synthetic CLI 结果或虚构指标放入用户 Demo、正式 evidence 或 live 结果。
- 不修改 SPEC-ALIBI-PLATFORM.md、package.json、package-lock.json、next.config.ts、环境文件、支付代码、MCP、Chrome Extension、ERC-8004 或 WebSocket 的既有外部入口。

### 2.3 现有行为保护

以下能力为 protected baseline：

- 现有后端、分析引擎和 API 的既有字段及错误语义；
- 现有 recorded/live/unavailable/provider_unavailable/payment_required 状态；
- x402 V2 保护边界和 402 mode 修复；
- 现有 run_id、data_status、recorded fixtures、MCP、Extension、ERC-8004 和 WebSocket 实现；
- 已通过测试及其断言；
- package.json、package-lock.json、Spec、Plan、环境文件和数据库状态。

所有新增字段均应为向后兼容 optional fields；没有 cluster/language 候选时，现有 Summary/Attribution 结果必须保持等价。

## 3. 唯一推荐的整合与实现方案

### 3.1 推荐策略

推荐采用“确定性核心 + 只读证据适配器 + 现有报告可选扩展 + 现有 UI 增量展示”的单一路线：

- 以 base-10 字符串/BigInt fixed-point 工具实现 notional、P99、logit、标准差和阈值比较；不使用 binary floating point 参与阈值判断。
- 以同一 conditionId、side=BUY、takerOnly=true 和固定 as-of window 构造候选交易。
- 以 transactionHash + proxyWallet + asset + side + size + price + timestamp 去重。
- cluster 只报告地址数量，正式 alert 至少 5 个地址；3–4 个地址只能是 cluster_observation。
- D1–D6、composite gate、herding veto、source_state 与 quality 必须由代码确定性计算，LLM 不得改变其阈值、时间戳、状态、gate、cutoff 或 revision。
- source adapter 只读取 CR 批准的香港政府/GIA、HKMA 和可选 CourtListener；GDELT/aggregator 只做 discovery，不能作为 verified source。
- language pairing 仅接受 stable official release ID 或官方 cross-link 加规范化 publisher/topic/date 一致性；语义相似、同日或 LLM 单独判断只能是 pairing_unverified。
- late source 生成新 revision，保留旧 alert，不删除或重写旧事实。
- Summary 只返回压缩 objective state、limits 和 cutoff；付费 Attribution 返回完整 dimensions、evidence、audit、coverage、precision 和 revision。
- UI 复用当前三面板和现有页面，通过明显的 recorded、source_state、coverage、precision、uncertainty、cutoff、limitation 文案展示；无数据使用空状态，synthetic 永不进入用户 Demo。
- RTDS/Market Channel 只触发 reevaluation；REST 负责完整 hydration 和 reconcile；断线时每 15 秒进行只读增量回退；不把 incomplete stream 当成 formal alert。

### 3.2 Schema 迁移策略

当前 schema version 为 1.0.0。批准后应按现有规则递增一个 minor version 到 1.1.0：

- 新增字段全部 optional；
- 空值使用空数组或明确的 unknown/null 语义，不改变旧字段含义；
- 旧客户端忽略新增字段时仍可读取旧 Summary/Detail；
- 新客户端遇到 schema 1.0.0 时将 cluster_alerts 和 language_windows 解释为空，并显示 coverage unavailable，而不是推断 not_found；
- 不修改已有字段的类型、名称或 x402 envelope；
- contract tests 必须验证 1.0.0 输入兼容和 1.1.0 输出；
- 若现有 schema version increment 规则与上述策略冲突，先停在 contract review，要求独立 Change Control。

### 3.3 选定的录制案例策略

不得把 Iran 2026-02-28 假设当作事实。批准后先对公开、可复现数据做候选筛选：

- 若 Iran package 的全部 required artifacts、hash、时间线和算法结果可复现，则使用固定路径 fixtures/recorded/iran-2026-02-28/。
- 若不能复现，必须输出 CASE_NOT_REPRODUCED，不得补造 trades、profiles、sources、derived-result 或指标。
- 只有通过预先定义、确定性排序和排除理由筛选出的真实 recorded case 才能成为替代 demo case。
- 替代 case 的路径在候选筛选完成前不预先命名；Plan 中的模板路径不是授权创建任意 fixture 的许可。
- 用户 Demo 至少需要一个真实、可复现的 recorded cluster；该 cluster 不必是 Iran，但不允许 synthetic 替代。

## 4. 任务分解与依赖

任务编号按依赖执行。括号内为前置任务；同一层、不同文件边界的任务可并行，但最终只能由主 Codex 负责整合和验收。

### 阶段 0：批准后的只读门禁

- T00（无前置）：重新核验 CR 附件 hash、Spec hash、工作区状态、当前 schema、Node/npm、现有测试清单和 protected files。只读，不写文件。
- T01（T00）：检查 CR 与 v0.7 Spec 的冲突；确认没有需要扩大的产品行为、依赖、数据库或 public API 变更。冲突则输出 CHANGE_CONTROL_EXPANSION_REQUIRED 并暂停。
- T02（T00）：建立允许修改文件的 pre-change SHA-256 manifest 和安全备份计划；Spec、package.json、package-lock.json、next.config.ts 与 protected directories 只记录 hash，不纳入可修改集合。

### 阶段 1：Contract 与确定性数学

- T10（T01）：更新 contracts 和 schema types，定义 cluster alert、source coverage、language window、revision、quality、relation、unknown reason、audit metadata 与 optional report fields。
- T11（T10）：实现 base-10 fixed-point parser/operations；拒绝 size<=0、price 不在 0..1、unparseable decimal；记录 invalid row，不填充为 0。
- T12（T10、T11）：实现 quantile、R7 linear interpolation、P99 nearest-rank ceil(.99*n)-1、population stddev、clamp、logit clip 和 Spearman average-rank 工具。
- T13（T10、T11、T12）：实现固定 UTC 时间窗口和时间解析结果；保留 upstream raw time、parse info、timestamp_type、precision、uncertainty。

### 阶段 2：交易、P99 与 cluster engine

- T20（T10–T13）：实现 BUY-only 候选构造、SELL context 排除、economic direction、notional 和 representative earliest BUY。
- T21（T20）：实现 P99 baseline：[window_start - 7d, window_start)，同 conditionId、BUY、takerOnly=true，排除 future lookahead，执行完整 dedup 和最小 200 valid baseline gate。
- T22（T20、T21）：实现成员去重、3–4 observation、>=5 formal candidate、cluster span<=180 minutes 和地址措辞边界。
- T23（T22）：实现 D1 same-side ratio、D2 IQR/time concentration、D3 profile freshness、D4 history thinness、D5 dominant-outcome price dispersion、D6 prior-market no-trade ratio；分别输出 coverage、known/unknown counts 和理由。
- T24（T23）：实现 composite evaluable>=5 且 passed>=4；unknown 不计 pass/fail；输出 per-dimension state/reason。
- T25（T23、T24）：实现 herding veto 的 calculability、时间/价格 distinctness、stable tie sort、Spearman rho、g ratio、true/false/unknown；unknown 或 true 阻止 formal alert。
- T26（T24、T25）：实现 formal alert gate：cluster_size>=5、span<=180、evaluable>=5、passed>=4、herding=false、source_state=not_found；其他情况只能 observation/restriction。

### 阶段 3：实时触发、hydration 与降级

- T30（T10、T13、T20）：审查并扩展现有 market-ws/ws-state；RTDS/Market Channel 事件只触发同一 evaluation_time 的 reevaluation，不绕过 REST 完整数据。
- T31（T30）：扩展 rest-backfill，按 conditionId/asset/时间窗 hydration，保证 pagination、dedup、reconcile 和 raw timestamp provenance。
- T32（T30、T31）：实现连接 stale/reconnecting/closed、15 秒 REST incremental fallback、reconnect 后 reconcile；任何 incomplete coverage 不得形成 formal alert。
- T33（T31、T32）：为交易、profile、history 和 source coverage 设置明确停止条件；不使用 synthetic/cache/recorded 数据伪装 live。

### 阶段 4：公开来源、pairing 与 language window

- T40（T10、T13）：定义 evidence source schema、connector status、source_state、timestamp precision/uncertainty、content hash、retrieval/http/retry/cache/mode 元数据。
- T41（T40）：实现 Hong Kong GIA English RSS、Traditional Chinese RSS、Press Release Search、HKMA EN 和 HKMA TC 只读 adapter；遵守 15 分钟搜索更新约束和 date-only 限制。
- T42（T40）：实现可选 CourtListener adapter；无 token、限流或 provider 不可用时标记 provider_unavailable/unknown，不阻塞不相关的 deterministic output。
- T43（T40）：实现 GDELT/aggregator discovery 隔离；禁止其成为 verified source、primary source 或 formal not_found 的唯一依据。
- T44（T40、T41、T42、T43）：实现 cutoff、published<=cutoff 过滤、required connector health、coverage 规则和 found/not_found/unknown 判定。
- T45（T44）：实现 stable official release ID、official cross-link、publisher/topic/date normalization pairing；语义相似、同日或 LLM 单独判断输出 pairing_unverified。
- T46（T45）：实现 gap_open、gap_closed、gap_unknown、release_order 和四种 wallet relation；date-only 或时间不确定性不满足时必须 unknown。
- T47（T44、T45、T46）：实现 late-source revision，维护 alert_id、created_at、evidence_cutoff_at、revision、supersedes_revision；不得删除旧 revision。

### 阶段 5：Agent、报告与 API

- T50（T26、T47）：复用现有 Orchestrator、Analysis Worker、Evidence Worker、Attribution、Quality/Risk、Audit/Report；将新增 deterministic result 作为结构化输入。
- T51（T50）：确保 Attribution 只解释结构化结果，不重新计算或改变阈值、status、cutoff、gate、relation 或 quality。
- T52（T50、T51）：扩展 report/build、reports/assembler 和 api/platform，向 Summary/Detail 添加 optional cluster_alerts、language_windows、source_coverage、evidence_cutoff_at。
- T53（T52）：核对 legacy /summary、/attribution、/audit 与所有既有 /api/v1/* response；不添加新 route、不改 x402 envelope、不改付款边界。

### 阶段 6：Recorded fixtures 与 UI

- T60（T26、T47）：对 Iran package 做只读可复现性审查；只在真实数据已核验且允许纳入时生成 required artifact set，否则保留 CASE_NOT_REPRODUCED。
- T61（T60）：选择并核验至少一个真实 recorded cluster 和一个 HK bilingual pair；每个 artifact 记录 source tag、bytes、hash、retrieved、algorithm、threshold、result。
- T62（T52、T61）：更新 app/page.tsx，在既有页面三面板中增量显示 cluster、language、source state、cutoff、coverage、precision、uncertainty、revision 和限制；不新增页面或 API adapter。
- T63（T62）：更新 app/globals.css，完成 keyboard focus、semantic landmarks、responsive、200% zoom、reduced-motion、contrast、loading/empty/error/payment-required/success 等状态。

### 阶段 7：测试、文档与最终验收

- T70（T11–T26、T40–T47）：单元、contract、integration、WebSocket/reconnect 和 recorded replay 测试。
- T71（T52、T53、T62、T63）：API contract、legacy/v1 compatibility、x402 402/header invariant、UI/E2E 和 accessibility 测试。
- T72（T60、T61、T70、T71）：manifest/hash、clean-room、secret scan、source/lockfile integrity 和 rollback rehearsal。
- T73（T70–T72）：连续执行完整测试套件、typecheck、lint、build、recorded replay、402 smoke、Playwright E2E、desktop/mobile/200% zoom 截图；外部 live provider 不可用时保持 PARTIALLY_VERIFIED。
- T74（T73）：更新 DATA-SOURCES、VERIFICATION、CHANGELOG、HANDOFF，生成最终报告和实际 changed-files/dependencies/network/cost/results/blockers 清单。

## 5. 精确文件修改矩阵

下表是批准后推荐实施的精确文件边界。除“条件文件”外，表中列出的文件才允许进入实现 diff。文件创建与修改仍需等待本 Plan 的独立批准。

| 文件 | 动作 | 目的 | 是否改变 contract | 需要的测试/证据 | 执行门禁 |
|---|---|---|---|---|---|
| src/contracts/index.ts | 修改 | 增加 1.1.0 optional cluster/language/source/revision types 与报告字段 | 是，向后兼容 minor | contracts、API compatibility | T10 |
| src/analysis/decimal.ts | 新建 | base-10 fixed-point parser、Decimal/BigInt 运算和严格 invalid handling | 否 | decimal boundary/unit | T11 |
| src/analysis/statistics.ts | 新建 | P99、R7 quantile、IQR、logit、stddev、Spearman | 否 | statistics/unit | T12 |
| src/analysis/time-window.ts | 新建 | UTC window、raw timestamp、precision、uncertainty、cutoff | 否 | time boundary/unit | T13 |
| src/analysis/cluster-language.ts | 新建 | cluster candidate、D1–D6、composite、herding、formal gate | 是内部结果 contract | cluster/unit/integration | T20–T26 |
| src/data/evidence.ts | 修改 | 扩展 evidence validation、source status、provenance 和 cutoff 元数据 | 是内部 evidence type | evidence/unit/integration | T40/T44 |
| src/adapters/polymarket/market-ws.ts | 修改 | 接入低延迟事件触发并保留 recorded replay 行为 | 否，保留既有入口 | WebSocket/replay | T30 |
| src/adapters/polymarket/ws-state.ts | 修改 | 补充 stale/reconnect/reconcile coverage 状态 | 否 | WebSocket/reconnect | T30–T32 |
| src/adapters/polymarket/rest-backfill.ts | 修改 | 实现完整 trade/profile/history hydration、pagination、dedup、reconcile | 否 | adapter/integration | T31 |
| src/adapters/evidence/hong-kong.ts | 新建 | GIA/HKMA approved read-only connectors | 否 | source adapter/recorded | T41 |
| src/adapters/evidence/courtlistener.ts | 新建 | 可选 CourtListener connector 与 provider_unavailable 降级 | 否 | connector/degrade | T42 |
| src/adapters/evidence/aggregator-discovery.ts | 新建 | 隔离 GDELT/aggregator discovery，不作 verified evidence | 否 | negative/source safety | T43 |
| src/adapters/evidence/pairing.ts | 新建 | official ID/cross-link pairing 与 pairing_unverified | 是内部 result contract | pairing/unit | T45 |
| src/adapters/evidence/revisions.ts | 新建 | alert revision chain 与 supersedes_revision | 是内部 audit contract | revision/integration | T47 |
| src/engine/analyze.ts | 修改 | 在既有 pipeline 中调用 deterministic cluster/language stages，保留旧路径 | 是，新增 optional result | recorded/live/unavailable | T20–T53 |
| src/agents/contracts.ts | 修改 | 声明新增 worker result 与 audit constraints | 是内部 agent contract | agent contract | T50 |
| src/agents/orchestrator.ts | 修改 | 编排新增 deterministic stages，不授权 LLM 改规则 | 否，内部编排 | orchestration/integration | T50 |
| src/agents/evidence.ts | 修改 | 传递 source coverage、pairing、cutoff、revision | 否，结构化传递 | evidence/integration | T50 |
| src/agents/attribution.ts | 修改 | 只解释结构化结果并保留限制文案 | 否 | attribution/negative | T51 |
| src/agents/quality-risk.ts | 修改 | 计算确定性 quality tier 与 unknown/restriction | 是内部 result contract | quality/unit | T24–T26 |
| src/agents/audit-report.ts | 修改 | 记录算法版本、阈值、排除、coverage、raw time、revision | 是 audit payload | T47/T72 | T47 |
| src/report/build.ts | 修改 | 构造 optional report fields 与 1.1.0 schema | 是，向后兼容 | report/contract | T52 |
| src/reports/assembler.ts | 修改 | 将 cluster/language/source data 接入 Summary/Detail | 是，向后兼容 | report/API | T52 |
| src/api/platform.ts | 修改 | 保留 response semantics，传递 optional fields 和 cutoff | 是，向后兼容 | API/402 | T52/T53 |
| app/page.tsx | 修改 | 在现有三面板显示 recorded evidence-only 状态与限制 | 否，UI only | Playwright/accessibility | T62 |
| app/globals.css | 修改 | responsive、focus、zoom、reduced-motion、状态样式 | 否 | visual/accessibility | T63 |
| tests/unit/decimal.test.ts | 新建 | Decimal invalid/threshold/rounding coverage | 否 | T11 | T70 |
| tests/unit/cluster-language.test.ts | 新建 | D1–D6、composite、herding、formal gate | 否 | T20–T26 | T70 |
| tests/unit/evidence-time.test.ts | 新建 | cutoff、timestamp precision、pairing/gap/relation | 否 | T13/T44–T46 | T70 |
| tests/contract/contracts.test.ts | 修改 | schema 1.0.0 compatibility 与 1.1.0 optional fields | 是，测试 contract | contract | T70/T71 |
| tests/integration/cluster-language.test.ts | 新建 | pipeline、coverage、revision、recorded result | 否 | T20–T26/T47 | T70 |
| tests/integration/api.test.ts | 修改 | legacy/v1 optional fields、status、backward compatibility | 是，测试 contract | T52/T53 | T71 |
| tests/integration/audit.test.ts | 修改 | provenance、threshold、exclusion、revision audit | 是 audit payload | T47/T72 | T70/T72 |
| tests/websocket/market-ws.test.ts | 修改 | RTDS trigger、hydration、dedup、reconnect、15s fallback | 否 | T30–T33 | T70 |
| tests/e2e/app.spec.ts | 修改 | 既有页面三面板、状态文案、synthetic exclusion、keyboard/zoom | 否 | T62/T63 | T71 |
| tests/e2e/cluster-language.spec.ts | 新建 | recorded cluster、HK pair、error/empty/payment-required UI | 否 | T61–T63 | T71 |
| scripts/replay-cluster-language.ts | 新建 | deterministic recorded replay 与 CASE_NOT_REPRODUCED 输出 | 否 | T60/T61/T73 | T72/T73 |
| scripts/verify-cluster-language.ts | 新建 | manifest/hash/clean-room verification | 否 | T72 | T72 |
| DATA-SOURCES.md | 修改 | approved sources、tiers、rate limits、timestamp rules | 否 | doc review | T74 |
| VERIFICATION.md | 修改 | 20 verification classes、recorded/live limits、PARTIALLY_VERIFIED rule | 否 | doc/acceptance review | T74 |
| CHANGELOG.md | 修改 | 记录新增 approved CR capability 与 actual changes | 否 | doc review | T74 |
| HANDOFF.md | 修改 | implementation status、hashes、tests、screenshots、blockers | 否 | handoff review | T74 |

### 5.1 条件文件与明确不授权文件

以下文件不是当前确定修改项：

- fixtures/recorded/iran-2026-02-28/manifest.json
- fixtures/recorded/iran-2026-02-28/market.json
- fixtures/recorded/iran-2026-02-28/trades.ndjson
- fixtures/recorded/iran-2026-02-28/prices.ndjson
- fixtures/recorded/iran-2026-02-28/profiles.ndjson
- fixtures/recorded/iran-2026-02-28/sources.json
- fixtures/recorded/iran-2026-02-28/derived-result.json
- fixtures/recorded/iran-2026-02-28/README.md
- fixtures/recorded/iran-2026-02-28/SHA256SUMS.txt

只有 T60 证明原始公开数据可复现且纳入该 case 合法时，才可在单独的 fixture 变更中创建这些文件；否则只能输出 CASE_NOT_REPRODUCED。

替代真实 recorded case 的固定目录名必须在 T60/T61 通过确定性候选筛选后由主 Codex 记录，不能提前臆造。其 artifact 集合必须与 CR 要求相同。

以下文件和目录禁止被本 CR 覆盖、删除或静默改写：

- SPEC-ALIBI-PLATFORM.md
- PLAN-ALIBI-PLATFORM.md
- PLAN-COMPLETE-DEMO.md
- package.json
- package-lock.json
- next.config.ts
- payment、x402、facilitator、network、payTo 和价格相关代码
- 现有 app/api/v1/* route 文件
- contracts/*、hardhat 配置和既有 ERC-8004 实现
- mcp/*、extension/*
- 既有 recorded fixtures 与其原始 hashes
- 环境文件、数据库迁移和数据库数据

当前 Plan 不授权任何依赖增加。若某实现步骤声称必须添加 Decimal、stats、WebSocket 或 UI 依赖，必须停止并提出新的 Change Control，不得修改 package.json 或 package-lock.json。

## 6. API、状态和 UI 契约映射

### 6.1 API 字段

在现有 Summary、Attribution、Detail/Report response 中增量支持：

- cluster_alerts：默认空数组；Summary 为压缩 objective state，Attribution 为完整 dimension/evidence/audit。
- language_windows：默认空数组；包含语言、source tier、official release ID、pairing、gap、release order、cutoff 和 wallet relation。
- source_coverage：默认明确 object；至少包含 connector 状态、coverage ratio/required coverage、retrieved_at、timestamp precision 和 unknown reasons。
- evidence_cutoff_at：每次结果的 evaluation_time cutoff，不能被当前时间隐式替换。
- revision 字段：包括 alert_id、created_at、evidence_cutoff_at、revision、supersedes_revision。

不得修改已有 run_id、data_status、payment_required、error envelope、x402 headers、HTTP 402、价格、网络、asset、payTo 或 facilitator。

### 6.2 状态语义

必须保持并明确映射：

- recorded：页面和 API 明确显示 recorded；只展示 fixture/hash 绑定的真实 recorded data。
- live：只在真实 live read 成功且 coverage/connector 状态可说明时显示 live；不得用 cache/recorded/aggregator 伪装 live。
- unavailable：数据源未提供结果；显示明确 empty/unavailable，而不是推断 not_found。
- provider_unavailable：某 provider/token/connector 不可用；保留可用的确定性结果，并显示 provider limitation。
- payment_required：继续使用现有 402 和 payment requirement；UI 显示可访问的 payment-required 状态，不启动或模拟支付。
- source_state=found：cutoff 前存在合格来源。
- source_state=not_found：仅在全部 required connectors healthy、coverage 满足要求且没有合格来源时成立。
- source_state=unknown：连接器失败、时间精度不足、路由/coverage 不完整或其他 unknown 条件；绝不能显示为 not_found。
- herding_like_pattern=true/false/unknown：unknown 或 true 阻止 formal alert；不可文案化为“已排除跟随”。
- insufficient_baseline：有效 baseline 少于 200；不得形成 formal alert。
- cluster_observation：3–4 成员或其他 gate 未满足；必须使用地址数量和限制说明。
- language gap：gap_open、gap_closed、gap_unknown；date-only 或 uncertainty 不足时为 gap_unknown。

### 6.3 三面板 UI

保留 GUI / CLI / APP 三面板。APP/GUI 中：

- 页面主要英文内容的内容根节点设置 lang="en"；只在 app/page.tsx 内完成，不修改 layout。
- loading、empty、error、success、payment-required、provider_unavailable、upstream unavailable、insufficient、unattributed、recorded、live、unknown 等状态均有语义化文本、状态角色和键盘可达操作。
- cluster 卡片称为 addresses/address count，不称 users、people、independent traders 或 actors。
- “Language Lead/语言先手”只能紧邻 caveat 使用，并明确仅表示时间位置，不表示读懂语言、关系、copy 或因果。
- 不展示 synthetic ticker、synthetic CLI result、虚构指标、不可验证 win rate 或未经验证 Iran/军事断言。
- 无数据时显示 empty state，不生成占位数字。
- summary 只显示 compressed objective state；attribution/audit 显示完整 reasons、coverage、precision、uncertainty、cutoff、source tier 和 revision。
- responsive 至少覆盖 desktop、mobile、200% zoom；reduced-motion 下取消非必要动画并保留状态变化可理解性。
- 不新增页面、route、环境配置或 API adapter。

## 7. 回归测试与验收测试设计

### 7.1 确定性核心

必须至少覆盖以下边界：

1. 180-minute window 左开右闭；window_start 不含，evaluation_time 含；固定 UTC，保留 raw timestamp。
2. BUY YES/NO 的经济方向；SELL 只作为 context，不能进入 candidate、D1 或 D5/herding。
3. Decimal notional=size×price；size>0、price 0..1；binary-float threshold 误差回归。
4. P99 baseline 7 天窗口、同 conditionId/BUY/takerOnly、future lookahead 排除、完整 dedup、nearest-rank 和 sample/range/exclusion audit。
5. baseline <200 为 insufficient_baseline，不能 formal alert。
6. D1 正常、边界 .85、tie YES stable tiebreak 且 dominance_tied=true 不能通过 .85。
7. D2 R7 IQR、重复 timestamp、span 180、<3 calculable 为 unknown、unparsable coverage 降低。
8. D3 profile_age_days floor、missing/late/unparseable、coverage 80% 和 known>=3。
9. D4 prior history 只看 representative entry 前、pagination/dedup/incomplete 不填 0、ratio 50% 边界。
10. D5 只看 dominant outcome、p clip 到 [1e-6,1-1e-6]、clip_count、population stddev、<3 unknown。
11. D6 只表示 same conditionId 的 prior no-trade；UI 解释为 previously did not trade this market；incomplete unknown。
12. composite evaluable>=5 且 passed>=4；unknown neither pass nor fail；每项 reason 可审计。
13. 3–4 成员 observation；5+ 才可 formal candidate；地址数量措辞。
14. herding 的 distinct member/timestamp/price/span calculability、stable ties、Spearman average rank、rho/g threshold；true/unknown veto。

### 7.2 Evidence 与 language

必须覆盖：

15. cutoff 过滤、source_state found/not_found/unknown、connector health、coverage 和 late source revision。
16. GIA/HKMA EN/TC、Press Release Search 的 connector、date-only 限制、polling uncertainty、retrieval/hash。
17. primary/direct_media/aggregator tier；aggregator/GDELT discovery-only；CourtListener provider_unavailable 降级。
18. official release ID/cross-link pairing；pairing_unverified 不能变成 verified。
19. gap_open/gap_closed/gap_unknown；local_first/english_first/simultaneous/unknown；四种 wallet relation。
20. geopolitical source quality 上限 medium，primary_source_not_applicable 和 direct_media 上限。

### 7.3 API、状态和保护边界

必须覆盖：

- recorded+402：HTTP 402、x402 V2 headers、payment requirement 和 data_status 修复保持不变。
- live+402：同样的 402/header/price/network/payTo/facilitator invariant。
- unavailable/provider_unavailable/upstream unavailable/insufficient/unattributed/loading/empty/error/success UI。
- legacy /summary、/attribution、/audit 调用不变。
- 现有 /api/v1/* route 的 payload 和错误兼容；不新增 v1 adapter。
- Summary/Attribution optional fields 与 schema 1.0.0/1.1.0 compatibility。
- synthetic 不进入用户 Demo、正式报告、CLI/UI fixture 或 live fallback。
- recorded 的来源 artifact、manifest、SHA256SUMS 和 data_status 一致。

### 7.4 质量、运行与交付验收

必须覆盖：

- RTDS trigger、REST hydration、pagination、dedup、reconnect、stale、15 秒 fallback、reconcile。
- real recorded cluster 与 HK bilingual pair；不是 synthetic，不把 public timeline 当 ground truth。
- manifest/hash/clean-room、source/lockfile integrity、secret scan、E2E、desktop/mobile/200% zoom 截图。
- typecheck、lint、build、完整当前测试套件（实际数量以执行日志为准）、recorded replay 和 402 smoke。
- docs/changelog/handoff 与实际 changed files/dependencies/network/cost/results/blockers 一致。
- 外部 live provider 缺失时状态保持 PARTIALLY_VERIFIED，不得宣称 COMPLETE。

## 8. 外部服务、预算、限流和停止条件

### 8.1 预算

- 沿用现有 APPROVED_BUDGET_USD=10 的累计上限。
- 本 CR 推荐的 deterministic cluster/language 计算不需要新的 LLM 调用。
- 若现有 Attribution 需要 Anthropic explanation，仅可在现有预算、现有 model/config 和现有安全路径内运行；LLM 不得计算或改写 deterministic result。
- 不新增 NewsAPI.ai、付费 provider、链上 RPC 付费调用或任何真实支付。
- 最终报告必须记录实际 USD、请求数、重试数、缓存命中、network 和 provider cost；未知 cost 不能填 0。

### 8.2 允许的只读外部来源

- Polymarket 公开读取路径：只读、限速、带 retrieval/http/retry/cache/mode 元数据。
- Hong Kong GIA English/Traditional Chinese RSS、Press Release Search、HKMA EN/TC：只读。
- CourtListener：可选、只读；无 credential 或服务不可用时不阻塞其他结果。
- GDELT/aggregator：只用于 discovery，不得变成 verified evidence。
- 不调用 NewsAPI.ai，不添加其他新 provider。

### 8.3 限流与停止

- REST retry 按现有安全策略，建议最多 4 次，退避 0/2/5/10 秒；遇到明确 rate limit 或成本异常立即停止。
- WebSocket 断线时只读 REST incremental fallback 每 15 秒，不进行高频轮询。
- HK Search 遵守约 15 分钟更新节奏；HKMA date-only 结果不能作为分钟级顺序证据。
- 单 connector 连续失败、coverage 不足、timestamp 不足或 pagination 不完整时输出 unknown/degraded，不降级成 not_found。
- cumulative cost 达到 10 USD、secret exposure、支付请求、链上写入、生产数据写入、需新增依赖/数据库/migration 或超出文件矩阵时立即停止并报告。

## 9. 降级与错误处理

| 条件 | 允许输出 | 禁止输出 |
|---|---|---|
| RTDS 断线或 stale | stream_degraded，尝试 15 秒 REST incremental，coverage 明确 | 假装 live 完整，形成未经 reconcile 的 formal alert |
| REST hydration 未完成 | pending/unknown，保留 incomplete reason | 将缺失行填 0 或生成 alert |
| baseline 少于 200 | insufficient_baseline | formal alert |
| cluster 3–4 地址 | cluster_observation | formal alert、users/people |
| herding unknown/true | observation/restriction | “已排除跟随”或 coordination claim |
| source connector 失败 | source_state=unknown，provider/upstream unavailable | source_state=not_found |
| source timestamp date-only | language_gap_unknown | 推断 local_first/english_first |
| aggregator/GDELT 只有发现结果 | discovery metadata | verified source/not_found 依据 |
| CourtListener 无 token/不可用 | provider_unavailable，继续可用 deterministic path | 假设无来源 |
| Anthropic 不可用 | provider_unavailable，保留 deterministic report | 让 LLM 替换阈值或事实 |
| Iran replay 不可复现 | CASE_NOT_REPRODUCED | 伪造 artifact、指标或 ground truth |
| live 外部服务不可用 | PARTIALLY_VERIFIED | 用 synthetic/recorded 替代后宣称 COMPLETE |

## 10. Rollback 计划

当前项目没有可用 Git repository，不能依赖 git reset、git checkout 或其他破坏性 Git 命令。

批准并开始 Execution 后：

1. T00/T02 对所有允许修改的既有文件生成完整 SHA-256 manifest；对新文件记录“不存在”状态。
2. 将允许修改文件的原始内容复制到明确命名的安全临时备份目录，例如 /private/tmp/alibi-cluster-language-backup-<timestamp>/；备份目录必须限定为这些精确文件，不得递归覆盖 workspace。
3. 修改前后分别核验 manifest；任何 protected file hash 变化都视为失败。
4. 回滚时只恢复 manifest 中的精确文件，并安全移除本次创建且经 manifest 证明为新增的文件；不使用 broad glob，不删除用户无关文件。
5. 回滚后重新执行 typecheck、contract tests、402 smoke、source/lockfile integrity 和 Spec hash check。
6. 如果回滚也失败，停止所有后续服务，保留 backup、hash、命令和日志，请人工介入；不得强制清理或破坏性重置。

回滚验收条件：

- SPEC-ALIBI-PLATFORM.md 恢复为 6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c；
- package.json、package-lock.json、next.config.ts 和现有 protected files 与修改前 hash 一致；
- 旧 API、x402、recorded/live 402 行为和既有测试恢复；
- 备份目录和 rollback log 可供人工复核。

## 11. Clean-room 与验证计划

最终执行顺序必须是：

1. 记录工作区状态、修改前 manifest、Spec/CR hashes、Node/npm、运行端口和环境摘要；不得输出 secret。
2. 在干净的受控工作目录中仅复制批准的源文件、允许的 fixture/artifact 和必要的非 secret 配置；不复制 node_modules、cache、真实 .env、私钥或临时运行产物。
3. 运行 lockfile integrity、package integrity、secret scan 和 source hash check；依赖若未被批准，不得下载或安装。
4. 执行 targeted contract/unit/integration/WebSocket/replay tests。
5. 执行当前完整测试套件，记录实际测试总数、passed、failed、skipped 和 flaky。
6. 执行 typecheck、lint、build。
7. 执行 recorded replay；同时验证 real recorded cluster、HK bilingual pair、manifest 和 SHA256SUMS。
8. 启动现有本地服务，执行 API 402 smoke；只验证 challenge、headers、payment requirement、price、network、mode 和 error envelope，不支付。
9. 执行 Playwright E2E，分别采集 desktop、mobile、200% zoom；记录绝对截图路径和 viewport/zoom 元数据。
10. 验证 keyboard-only、screen-reader semantic landmarks、focus visibility、contrast、reduced-motion、loading/empty/error/payment-required/success。
11. 执行 Secret scan、source/lockfile integrity、service cleanup；清理只限本次启动的进程和临时目录。
12. 生成最终验收包：changed-files、diff summary、hashes、tests、screenshots、network/cost、degrade events、rollback manifest、blockers、最终 PARTIALLY_VERIFIED/COMPLETE 状态。

如果 live external source、RTDS、REST 或 provider 无法访问，仍可完成 offline/recorded 验证，但最终项目状态必须是 PARTIALLY_VERIFIED，不能把 recorded 或 synthetic 结果当作 live COMPLETE。

## 12. CR 验收映射

| CR 要求 | 计划任务 | 主要文件 | 验收证据 |
|---|---|---|---|
| Spec v0.7 原文件/版本/内容不变 | T00–T02、T72 | SPEC-ALIBI-PLATFORM.md（只读） | 原始/最终 hash 一致 |
| fixed 180m UTC window | T13/T20/T70 | time-window.ts、cluster-language.ts | 左开右闭、raw time boundary tests |
| BUY-only、Decimal、P99 200 baseline | T11/T20/T21/T70 | decimal.ts、statistics.ts、cluster-language.ts | valid/invalid/baseline audit |
| D1–D6 与 unknown coverage | T23/T24/T70 | cluster-language.ts | normal/boundary/unknown tests |
| herding veto | T25/T70 | cluster-language.ts | rho/g/tie/span true/false/unknown |
| formal alert gate | T26/T70 | cluster-language.ts | 5+、source_state、gate matrix |
| approved source tiers/connectors | T40–T44/T70 | evidence.ts、hong-kong.ts、courtlistener.ts、aggregator-discovery.ts | connector/coverage/tier tests |
| pairing/gap/language relations | T45/T46/T70 | pairing.ts、time-window.ts | official ID/cross-link/date-only/relation tests |
| source revisions | T47/T70 | revisions.ts、audit-report.ts | old/new revision chain |
| RTDS/hydration/reconnect/fallback | T30–T33/T70 | market-ws.ts、ws-state.ts、rest-backfill.ts | replay/ws integration evidence |
| Summary/Attribution optional backward-compatible fields | T10/T52/T53/T71 | contracts/index.ts、report/build.ts、assembler.ts、api/platform.ts | schema 1.0.0/1.1.0 and legacy/v1 tests |
| x402 boundary unchanged | T53/T71/T73 | api/platform.ts、existing payment boundary（只改允许文件） | 402 smoke, headers, requirement, price/network |
| existing UI only, no new route | T62/T63/T71 | app/page.tsx、app/globals.css、tests/e2e/app.spec.ts | route inventory and E2E |
| accessible status wording | T62/T63/T71 | app/page.tsx、app/globals.css | keyboard, screen-reader, zoom, reduced-motion |
| synthetic exclusion / recorded label | T60–T63/T71/T73 | page.tsx、replay script、fixtures（条件） | negative E2E and fixture provenance |
| Iran hypothesis safety | T60/T61/T74 | replay script、recorded artifacts（条件）、VERIFICATION.md | CASE_NOT_REPRODUCED or reproducible manifest |
| evidence quality limits | T50/T51/T70 | quality-risk.ts、attribution.ts | deterministic quality and geopolitical medium cap |
| data governance / no secrets | T40/T60/T72 | adapters、scripts、docs | secret scan, source/cache/mode audit |
| full 20 verification classes | T70–T73 | tests/*、VERIFICATION.md | actual test log and checklist |
| rollback/cleanup/reporting | T02/T72–T74 | scripts、HANDOFF.md、CHANGELOG.md | hashes, backup, cleanup and final report |

## 13. 人工决定与阻塞项

### 已由当前用户决定

- CR v0.1 已批准为新增硬规范。
- Spec v0.7 原文件、版本和内容保持不变。
- 只生成本 Plan；Plan 后等待独立批准。
- 不安装依赖、不修改代码、不运行 migration、不进入 Execution。

### 仍需独立批准或人工确认

1. 必须先批准本 Plan，精确命令为：

APPROVE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1

2. 若需要把 Downloads 中已核验 CR 复制到项目根目录，必须独立确认该文件纳入项目的路径决策；当前 Plan 不复制。
3. 若 T00/T01 发现现有 schema migration、数据库持久化或新依赖是不可避免的，必须独立 Change Control；不能隐含在本 Plan。
4. 若选择非 Iran 的真实 recorded demo case，必须在 T60/T61 记录确定性候选列表、排序、排除理由和最终 case ID。
5. 是否允许实际访问香港政府/HKMA/Polymarket/CourtListener 的公开只读端点，需按环境的网络和隐私规则单独确认；Plan 不在当前回合访问。
6. 若累计预算、rate limit、credential、provider policy 或现有服务状态不允许 live verification，验收状态只能为 PARTIALLY_VERIFIED。

## 14. Plan 完成门禁

本文件生成后立即停止。当前回合没有代码、依赖、lockfile、Spec、数据库、迁移包、环境文件、fixture、截图或服务写入。

除以下精确命令外，继续、修复吧、可以等自然语言均不构成 Plan 实施批准：

APPROVE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1

