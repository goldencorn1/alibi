# PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1 candidate

- 状态：`APPROVED / EXECUTION AUTHORIZED`
- 生成时间：`2026-09-04T20:29:53-0700`（America/Los_Angeles）
- 规范来源：`CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2`（已批准）
- CR 批准命令：`APPROVE: CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2`
- 本 Plan 的批准命令：`APPROVE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1`
- Plan 执行授权命令：`EXECUTE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1`
- Plan 执行授权时间：`2026-09-04T20:41:28-0700`（America/Los_Angeles）
- 当前项目状态：`PARTIALLY VERIFIED`；本 Plan 不得把它改写为 `COMPLETE`

本文件是基于已批准 CR v0.2 的执行计划候选，不是执行授权。当前轮只完成批准记录和 Plan 文件生成；不修改产品代码、依赖、lockfile、数据库、migration、环境文件、fixtures、v0.7 Spec 或 v0.7 Plan，不安装依赖，不运行 migration，不发送链上交易，不调用付费服务。

本项目已有 `/Users/a0000/polymarket/PLAN-CLUSTER-LANGUAGE-EVIDENCE-001.md`，它是 CR v0.1 的历史 Plan/执行记录。本候选使用独立文件名，避免覆盖历史文件；只有在独立 Plan 批准后，才可决定是否以受控方式归档或替换历史文档，不能在本轮覆盖它。

## 1. 权威性、输入和批准边界

### 1.1 有效规范优先级

1. 安全红线和最新人工决定；
2. `SPEC-ALIBI-PLATFORM.md v0.7` 原文件；
3. 已批准 `CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2`；
4. 本 Plan 的任务顺序、文件边界、测试和降级规则。

v0.7 Spec 和 v0.7 Plan 是受保护基线。本 Plan 不能回写它们。若实现需要改变完整平台范围、x402 条款、数据库、依赖、公共路由或已有 contract，必须停止并输出 `CHANGE_CONTROL_EXPANSION_REQUIRED`。

### 1.2 输入 hash manifest

| 输入 | SHA-256 | 在本 Plan 中的用途 |
|---|---|---|
| `/Users/a0000/polymarket/CR-CLUSTER-LANGUAGE-EVIDENCE-001-v0.2-candidate.md`（已转 APPROVED） | `4aa441062c0e43fc4d06be83c159e49183e1efd0174a04f3a21206d7e4e15183` | 本 Plan 的直接规范来源 |
| `/Users/a0000/polymarket/SPEC-ALIBI-PLATFORM.md` | `6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c` | protected platform baseline |
| `/Users/a0000/polymarket/PLAN-ALIBI-PLATFORM.md` | `0c362b5e567f3051997b874da1f3f4e5e70839e3b62bebbe5dd9cdc9862eceaf` | protected v0.7 execution boundary |
| `/Users/a0000/polymarket/PLAN-CLUSTER-LANGUAGE-EVIDENCE-001.md` | 读取为 v0.1 历史 Plan，不作为 v0.2 规范 | 不覆盖；用于识别已完成能力和历史误差 |
| `/Users/a0000/polymarket/HANDOFF.md` | `1b06e93b5113f8e210305a3ec15a88346b8997d49055d4a0d11d9bdf41820f87` | 当前资源门、平台范围、PARTIALLY VERIFIED 状态 |
| `/Users/a0000/polymarket/VERIFICATION.md` | `f13df5c3ca2c0514c450927620b61ed1b538dac991cc2a182083e0cc65074183` | 当前测试、阻塞项和既有 v0.1 执行证据 |
| `/Users/a0000/polymarket/CHANGELOG.md`（批准记录前） | `8446d3df1293a217a9f7189d5495ef3e4e56cc32978b3a3cb2685244ed2e2cd4` | 历史变更基线 |
| `/Users/a0000/polymarket/APPROVAL-LOG.md` | `0352e526f6bc45b6bdf492cf88e2759ad4de1ae19eb86d03cb3b9bccda7fa8fd` | 本次 CR 批准记录 |
| `/Users/a0000/polymarket/package.json` | `9b44171d4053e1f1986e095ccab519c84fc86bfdac7455c471b8e82ec992d9b0` | 依赖/engine 只读基线 |
| `/Users/a0000/polymarket/package-lock.json` | `ab2f2883e03dc5563d4175d217748509a9eead740f56446961ba3239032d17b8` | lockfile 只读基线 |

CR v0.1 的规范附件仍由 `/Users/a0000/Downloads/CR-CLUSTER-LANGUAGE-EVIDENCE-001.md` 提供，hash 为 `8d07c2ef4b7d6061de91482374505a19db32f8117c34307a5ba28e69e3ce70bd`；项目根目录没有同名 v0.1 文件。本 Plan 不复制它。

### 1.3 独立 Plan 批准门

本候选生成后停止。只有下列精确命令有效：

```text
APPROVE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1
```

“继续”“开始”“修复吧”“可以”等自然语言不构成执行批准。

## 2. 目标与不可变保护

### 2.1 目标

在不改变 v0.7 完整平台外部行为的前提下，实现或核验：

1. P0 GDELT、Federal Register Public Inspection、HKSAR ISD 英/繁中 RSS；P1 SEC EDGAR、HKMA；其余 provider 保持 optional 或 `provider_unavailable`。
2. SourceObservation/Evidence provenance、provider state、实际 coverage、时间精度、不确定度、content hash、cutoff 和 revision。
3. GDELT discovery-only、`seendate` 不进入 verified `published_at`、分析覆盖动态计算。
4. 每个用于排序的 provider/language/timestamp cohort 至少 30 个样本，以绝对误差 P95 作为安全边界。
5. 时间不确定区间重叠时输出 `indeterminate`，不输出方向性语言先手。
6. v0.1 的 180 分钟、BUY-only、P99/200、D1–D6 和 herding 否决规则保持不变。
7. Market Channel 只触发实时重评估，Data API `/trades` 补齐钱包成交、分页、去重、重连和对账。
8. 现有 legacy `/summary`、`/attribution`、`/audit` 与所有 `/api/v1/*` 保持兼容；Summary 免费，合格 Detail 按次 0.01 USDC，`unattributed` 免费；支付边界采用现有 scoped x402 V2 并加入 `PAYMENT-IDENTIFIER` 幂等。
9. GUI/CLI/APP、MCP、Chrome Extension、Multi-Agent、RAG、WebSocket、Solidity、x402、ERC-8004 全部保留；synthetic 不进入用户 Demo。
10. 伊朗案例采用 blind reproducibility benchmark；不可复现时严格 `CASE_NOT_REPRODUCED`。

### 2.2 不可变保护

- `SPEC-ALIBI-PLATFORM.md v0.7` 原文、版本和 hash 不变。
- `PLAN-ALIBI-PLATFORM.md v0.7` 不变；本 Plan 不改变其任务矩阵或批准状态。
- 不增依赖、不改 `package.json`、`package-lock.json`、`next.config.ts`，不使用 `x402-next`、`x402-fetch` 或 `legacy-peer-deps`。
- 不新增 `/api/v1/*` adapter，不删除、重命名或免费暴露既有 v1 API。
- 不改变 HTTP 402、`PAYMENT-REQUIRED`、`PAYMENT-SIGNATURE`、x402 V2、network `eip155:84532`、USDC asset、`0.01 USDC`、payTo、facilitator、timeout 或 recorded/live 402 修复。
- 不运行 migration，不新增 DB/Redis 表或字段；durable multi-process payment idempotency 若被证明需要持久化，必须进入 Change Control。
- 不把 Landing/Pitch 的 `1,223`、ticker、synthetic CLI、虚构 coverage、未验证 Iran 数字或主观推断写入产品、Demo、报告或 API 结论。
- 不发送真实支付、链上交易、订单、私钥、生产写入或外部付费调用。

## 3. 当前基线与缺口

### 3.1 已核验的代码基线

| 能力 | 当前事实 | 计划处理 |
|---|---|---|
| Contract | `src/contracts/index.ts` 当前 `SCHEMA_VERSION = 1.1.0`；已有 `DataStatus`、`LanguageSource`、`LanguageWindow`、`SourceCoverage`、Summary/Detail optional cluster fields | 只读复核后做 additive v0.2 扩展；不重复实现已通过部分 |
| Cluster | `src/analysis/cluster-language.ts` 已有 180m、BUY/taker、P99/200、D1–D6、herding 和 formal gate | 保留六维算法；只接入 v0.2 source/time semantics |
| Evidence | `src/data/evidence.ts` 已有 language source validation、coverage → source_state；`src/adapters/evidence/*` 有 HK、aggregator、pairing、revision 边界 | 加入 P0/P1 adapter/preflight、P95、indeterminate 规则 |
| Polymarket | `src/adapters/polymarket/market-ws.ts`、`ws-state.ts`、`rest-backfill.ts` 已有 recorded/reconnect/stale/reconcile 基础；`src/data/adapters.ts` 已有 Data API | 明确 Market Channel trigger 与 Data API `/trades` wallet hydration |
| Agent | 已有 Orchestrator、Evidence、Attribution、Quality/Risk、Audit/Report Worker | 只允许结构化结果流转；LLM 不得覆写算法 |
| API | 实际 legacy routes 为 `/summary`、`/attribution`、`/audit`；v1 有 `/api/v1/summary`、`/api/v1/attribution` 等；不存在 `/api/attribution` | 维持 route inventory；不新增 `/api/attribution` |
| x402 | `src/payment/server.ts` 使用 `@x402/core`、`@x402/evm`、`@x402/next` scoped V2；legacy/v1 Detail 均调用共享保护逻辑 | 增加统一 preflight/idempotency 设计；保留 paid Detail 402 invariants |
| UI | `app/page.tsx` 保留 GUI/CLI/APP、recorded 防泄漏、payment-required、audit/run_id；`app/globals.css` 为现有样式入口 | 增量映射 source/language/cluster 状态和 accessibility |
| MCP/Extension/ERC-8004/RAG/Solidity | v0.7 本地实现和既有验证记录存在 | 只做 payload/state compatibility 检查和回归，不顺手改架构 |

### 3.2 当前已知缺口

- P0/P1 source adapters 的 live shape、实际覆盖、限流和时间校准尚未形成 v0.2 证据包。
- 当前 GDELT/HK 代码需要保证 `seendate`/date-only 不会被错误提升为 verified published time。
- 当前 `LanguageGap`/`ReleaseOrder` 需要评估 `indeterminate` 的 additive contract 方案。
- 当前项目仍缺少完整真实 recorded cluster/language package；Iran 所需 9 个 artifact 未齐时不能补造。
- x402 当前已能产生 402，但 `PAYMENT-IDENTIFIER` 幂等和 `unattributed` 免费 preflight 尚未实现；须先做不改变 paid Detail headers 的设计审查。
- 当前环境仍有 Anthropic、Base Sepolia、数据库运行时等既有外部门；它们不能被本 CR 伪装成已验证。

## 4. Source Preflight 与实测记录方案

### 4.1 每个 provider 的 preflight 记录

P01/P02 只读核验每个 provider 的：

- 官方 endpoint、文档链接、provider ownership 和访问条款；
- HTTP method、query/body 参数、返回字段、分页/cursor、更新时间和错误结构；
- HTTP 状态、响应字节数、retrieved_at、attempts、retry-after、rate limit 观察；
- `actual_coverage_start/end`、请求范围、分页是否完整、记录数、是否 date-only；
- timestamp field、raw format、UTC conversion、timestamp type、precision 和 first_seen 语义；
- 是否需要 key、免费/付费限制、是否可用于当前本地环境；
- 规范化字段 hash、脱敏 recorded sample、preflight manifest 和 unknown reason。

任何“文档说已验证”都不能替代实际调用。实际调用结果必须区分 `documented`、`validated`、`unavailable`、`unknown`。

### 4.2 P0/P1 provider 任务

| Provider | P0/P1 任务 | 关键验收 | 失败降级 |
|---|---|---|---|
| GDELT DOC 2.0 | 使用原生 TypeScript `fetch` 调 `https://api.gdeltproject.org/api/v2/doc/doc`；验证 `artlist`/必要 timeline metadata、`seendate`、language filter 和动态覆盖 | 只能生成 discovery record；`published_at=null`，除非原始页面独立验证；记录实际滚动覆盖 | discovery-only；不能 `verified_source` 或 formal `not_found` |
| Federal Register Public Inspection | 从官方 API 文档解析并验证 Public Inspection 资源路径、字段、分页和首次公众可见时间；不得凭记忆硬编码未核验 endpoint | 能区分 public inspection、filed、formal publication；timestamp provenance 完整 | provider unknown；不能用普通 formal publication 替代首见时间 |
| HKSAR ISD bilingual RSS | 复核当前代码中的 `general_en.xml`/`general_zh.xml` URL 是否属于 HKSAR ISD；验证 RSS fields、详情页元数据、英繁配对和更新时间 | 英/繁中独立 coverage、official release id/cross-link、时间精度和 P95 | provider_unavailable/unknown；date-only 不能给方向性语言时间 |
| SEC EDGAR | 验证 `https://data.sec.gov` 公开字段、filed/acceptance timestamp、历史分页与 10 req/s 约束 | P1 provider 的实际 shape 和 filed 语义进入 matrix | P1 unavailable/unknown；不得假报 not_found |
| HKMA | 验证 EN/TC API、日期字段、详情或可核验精确时间路径 | date-only 与 minute timestamp 彻底分离 | provider_unavailable/unknown；列表日期只作发现 |

### 4.3 Optional provider

CourtListener、DATA.GOV.HK press search 和其他 provider 只保持 optional。没有 token、条款、可靠字段或历史覆盖时，返回 `provider_unavailable`/`unknown`，不能提高 source quality，不能替代 P0/P1，也不能触发付费 provider 安装。

## 5. Source contract、adapter 和 calibration

### 5.1 Contract 目标

在现有 `LanguageSource`/`Evidence`/`SourceCoverage` 上做 additive 扩展，至少包含：

```text
observation_id, provider, provider_priority, provider_state, observation_role,
source_tier, url, publisher, title, language, official_release_id,
official_cross_link, normalized_topic, original_or_translation,
raw_timestamp, utc_timestamp, timestamp_type, timestamp_precision,
timestamp_uncertainty_seconds, timestamp_source_field, first_seen_at,
retrieved_at, content_hash, connector_status, requested/actual coverage,
pagination, calibration cohort/sample_count/absolute_error_p95,
source_state, evidence_cutoff_at, revision, supersedes_revision,
data_status, limitations
```

契约约束：

1. `observation_role=discovery_only` 的 record 不得成为 verified evidence。
2. `GDELT.seendate` 只映射 `first_seen_at`/`timestamp_type=first_seen`。
3. provider 未验证、connector 不健康、分页不完整、只有日期或缺少 raw provenance 时，source_state 不能是 `not_found`。
4. `not_found` 只能在 required connectors healthy、coverage complete、时间质量满足且没有合格 source 时产生。
5. 旧客户端忽略新增 optional 字段时，Summary/Detail 仍可解析；既有字段不删、不改名、不改类型。

### 5.2 Adapter 边界

- Adapter 只负责 HTTP、解析、normalize、coverage、retry 和 provenance，不负责 cluster gate 或 LLM inference。
- Adapter 必须使用当前 TypeScript/Node 原生 `fetch` 及现有 HTTP helper；不引入 Python、gdeltdoc 或新依赖。
- Adapter 不保存 secret、private key、payment signature 或完整授权 header。
- Adapter 需支持 live/recorded 的明确标记；recorded 只有在相应真实读取成功、脱敏并 hash 后才能产生。
- Adapter 的失败使用 `provider_unavailable`、`upstream_unavailable` 或 `unknown`，不把失败折算为无来源。

### 5.3 时间校准

每个 provider/language/timestamp-type cohort：

```text
absolute_error_i = abs(provider_timestamp_i - independently_verified_reference_i)
sample_count >= 30
safety_bound = absolute-error P95
```

- 30 是最小样本数，不足时安全边界为 null；不能输出方向性 gap。
- P95 算法、排序、插值/nearest-rank 版本和原始 sample hash 进入 manifest。
- 英文、zh-Hant、zh-Hans、RSS、Public Inspection、filed、first_seen 分开校准。
- 中位数只能作为描述性统计，不能作为安全边界。
- GDELT 的样本只能校准 `first_seen` 误差；不能推导原始页面 `published_at` 误差。

### 5.4 动态 coverage

每次请求记录 `requested_start/end` 和 `actual_start/end`。任何 source/analysis window 不得写死 60 天；如果 provider 实测只能提供更短覆盖，则缩短可证明范围并显示限制，不补齐、不外推、不改写历史。

## 6. Language Window 与不确定区间

### 6.1 Pairing

只有以下任一条件可以 `pairing=verified`：

1. 两个语言版本共享稳定官方 release ID；或
2. 官方页面相互 cross-link，且 publisher、normalized topic 和发布日期一致。

标题相似、同日、GDELT 语言曲线或 LLM 判断只能 `pairing_unverified`。

### 6.2 区间和状态机

```text
interval(source) = [utc_timestamp - uncertainty, utc_timestamp + uncertainty]
```

| 条件 | gap | release_order | 结果 |
|---|---|---|---|
| 必需来源/配对/coverage/precision 不完整 | `gap_unknown` | `unknown` | 钱包 relation 只能 unknown/indeterminate |
| 本地来源 verified，英文 connector healthy、coverage complete、cutoff 前未找到 paired English | `gap_open` | 仅在不重叠时 `local_first`，否则 unknown | 不依赖 GDELT 单独缺失 |
| 两来源 verified，local interval 严格早于 English interval | `gap_closed` | `local_first` | 可计算正向 gap |
| 两来源 verified，English interval 严格早于 local interval | `gap_closed` | `english_first` | 只报告客观时序 |
| 两来源 verified，但 intervals overlap | `gap_closed` | `indeterminate` | 禁止 local_first/english_first 和正向先手 |
| 两来源同刻且区间无序差 | `gap_closed` | `simultaneous` | 只报告同时/边界事实 |
| cutoff 后收到新来源 | 新 revision | 重新计算 | 保留旧 revision，不删除历史 |

### 6.3 Wallet relation

保留 v0.1 的：`pre_verified_public_source_entry`、`within_documented_language_window`、`post_english_publication_entry`、`indeterminate`。只有两个严格不重叠、已验证时间区间之间的交易才可 `within_documented_language_window`；不得推断钱包读懂语言、存在关系、复制行为或因果。

## 7. 六维集群与 herding 否决门

本 Plan 不重新设计算法，直接锁定 CR v0.1 §§5–7：

- UTC 180 分钟左开右闭窗口；
- 仅 BUY、takerOnly=true 形成候选，SELL 只作 context；
- Decimal fixed-point notional；
- 同 conditionId、窗口前 7 天 `[window_start - 7d, window_start)`、至少 200 条有效交易的 nearest-rank P99；
- 完整 dedup、每地址最早代表 BUY、3–4 地址只出 observation、至少 5 地址才进 formal gate；
- D1 `same_side_ratio >= 0.85`；D2 R7-IQR `time_concentration >= 0.60`；D3 profile age `<=30 days`；D4 prior trade thinness `>=0.50`；D5 dominant-outcome logit population stddev `<=0.50`；D6 prior same-market no-trade ratio `>=0.80`；
- `dimensions_evaluable >=5 && dimensions_passed >=4`；unknown 不计 pass/fail；
- herding 需要主导方向至少 5 个地址、至少 3 个时间戳、至少 3 个价格和正跨度；`rho>=0.70 && g>=0.30` 为 true；true/unknown 均阻止 formal alert；
- formal alert 还要求 `source_state=not_found`、coverage healthy、无 look-ahead；source unknown 只能 observation/restriction。

实现时不得调整阈值、窗口、P99、herding、quality gate 或把 `indeterminate` 降级成 local_first。

## 8. Market Channel + Data API 实时管线

### 8.1 数据流

1. Public Market Channel/RTDS `last_trade_price` 事件只作为低延迟 trigger，不能提供钱包身份。
2. Trigger 触发同一 `conditionId`/token 的 Data API `/trades` hydration，补齐 `proxyWallet`、outcome、timestamp、transaction hash、历史窗口和去重键。
3. REST 负责分页、时间范围、profile/history coverage 和 reconcile；不能用 stream event 填充缺失 wallet。
4. 使用既有 bounded retry/backoff；记录 attempts、HTTP status、retrieved_at、coverage 和 error code。
5. WebSocket stale/disconnect 时进入 `stream_degraded`，按既有 15 秒只读增量回退；恢复后按 transaction hash 与完整 dedup key 对账。
6. hydration 未完成、分页截断、coverage 不完整或时间无法解析时进入 pending/unknown，禁止 formal cluster alert。
7. 不使用 private/user channel，不读取 Polymarket private key，不下单、撤单、签名或交易。

### 8.2 依赖任务

- 先审计当前 `market-ws.ts`、`ws-state.ts`、`rest-backfill.ts` 和 `src/data/adapters.ts`。
- 只扩展既有公开数据入口和 recorded replay；不引入新的 WebSocket SDK。
- 为 trigger-only、REST hydration、duplicate event、stale、reconnect、fallback 和 reconcile 分别提供测试。

## 9. API、状态和 x402 V2 幂等

### 9.1 API compatibility

| 路径 | 现状 | v0.2 计划 |
|---|---|---|
| `/summary` | legacy free Summary | 保留；可选返回 cluster/language/source fields |
| `/attribution` | legacy Detail，现有 x402 protection | 证据 Detail 按次 0.01 USDC；与 v1 使用同一 preflight/guard |
| `/audit` | read-only audit export | 保留 run_id、revision、provenance、limits |
| `/api/v1/summary` | existing v1 Summary | 保留外部 API，向后兼容 optional fields |
| `/api/v1/attribution` | existing v1 protected Detail | 复用 legacy 的 x402 guard/idempotency；不能成为 alias bypass |
| `/api/summary` | 当前不存在的文档命名 | 不新增 adapter/route |
| `/api/attribution` | 当前不存在 | 不新增；若日后另行批准必须共享同一 guard |

`run_id`、`data_status`、error envelope、`source_state`、`evidence_cutoff_at` 和现有字段名称/类型保持稳定。Summary 只返回压缩客观状态；合格 Detail 才返回完整 evidence/dimension/audit。

### 9.2 Payment behavior

- Summary 免费。
- 有可交付 evidence Detail 时为 `exact` scheme、`0.01 USDC`、USDC asset、`eip155:84532`、当前 payTo/facilitator/max timeout。
- `unattributed` 是免费结果。执行顺序必须先识别是否存在可交付 Detail；如果确定没有合格归因，不应要求用户付费才能看到 `unattributed`。该 preflight 只能在既有 route family 中实现，不能用新增 alias 绕过。
- 对需要支付的 Detail，HTTP 402 和 `PAYMENT-REQUIRED` 内容保持当前 v2 语义；recorded 请求必须保持 `data_status=recorded`，live 请求才可为 live。
- 不变更 `PAYMENT-SIGNATURE` 的标准用途；不把 payment identifier 当签名。

### 9.3 `PAYMENT-IDENTIFIER` idempotency

实现只允许在当前 payment boundary 内增加 bounded idempotency：

1. 客户端可发送不透明 UUID/nonce 的 `PAYMENT-IDENTIFIER` header。
2. key = route family + canonical body + `x-alibi-mode` + resource identity + identifier；不保存完整 payment signature 或私钥。
3. 同 identifier、同 fingerprint 的重试复用同一终态，不重复 analysis/settlement。
4. 同 identifier、不同 fingerprint 以现有 `payment_invalid` 类别 fail-closed；不得执行第二次支付。
5. 无 identifier 继续兼容，但不承诺幂等。
6. 没有 DB/Redis 变更授权时，只允许 TTL/容量受限的进程内 replay cache，并明确重启/多进程 limitation；若需要 durable idempotency，立即 Change Control。
7. legacy `/attribution` 和 `/api/v1/attribution` 共享同一 guard、preflight、fingerprint 和 replay behavior。

## 10. Multi-Agent 任务分工和并行策略

批准后如启用子智能体，最多 4 个，子智能体只读、不得创建下级智能体、不得写入项目；主 Codex 负责所有写入、冲突裁决和最终验证。没有子智能体能力时，主 Codex 顺序完成相同只读审查，不改变范围。

| Lane | 只读任务 | 不得做的事 | 汇报证据 |
|---|---|---|---|
| A — Source/Calibration Auditor | P0/P1 endpoint、字段、覆盖、限流、时间校准和 GDELT discovery-only 审查 | 不创建 adapter，不调用付费服务，不写 artifact | endpoint、HTTP/fields、coverage、样本 hash、P95、unknown |
| B — Contract/Cluster Auditor | 当前 contracts、cluster engine、六维、herding、source state、language state 兼容性 | 不改 schema，不调阈值 | symbol、现状、冲突、最小 additive diff |
| C — Market/API/Payment Auditor | Market Channel、Data API trades、route inventory、x402 guard、payment identifier 风险 | 不支付、不交易、不改 payment code | route、header、402、race/idempotency evidence |
| D — UI/Platform/Security Auditor | GUI/CLI/APP、MCP、Extension、status mapping、synthetic/secret/clean-room 风险 | 不改 UI，不打包发布，不泄漏 secret | file、state、accessibility/security gap |

并行前置：T00/T01/T02。四条 lane 可在 T02 后并行；所有 lane 完成后由主 Codex 复核，不以多数票裁决冲突。写入阶段严格按依赖顺序执行。

## 11. UI、MCP、Chrome Extension 状态映射

### 11.1 UI

只允许修改现有 `app/page.tsx`、`app/globals.css`（如 Plan 批准后证明必要）。保留 GUI/CLI/APP 三面板，不新建页面。

必须为以下状态提供可访问且不误导的呈现：

| 状态 | UI 语义 |
|---|---|
| `recorded` | 明显显示 recorded、retrieval/capture 限制和 artifact provenance |
| `live` | 只有真实 live read 且 coverage 合格才显示 live |
| `unavailable` / `provider_unavailable` | 显示 provider unavailable/empty limitation，不等于 no source |
| `upstream_unavailable` | 显示可重试错误和 source limitation，不输出结论 |
| `payment_required` | 显示 HTTP 402/x402 V2 payment-required，绝不模拟付款 |
| `insufficient` / `insufficient_baseline` | 显示 coverage/sample gate，不显示 formal alert |
| `unattributed` | 免费、明确表示当前无合格归因，不显示虚构证据 |
| `loading` | 语义化 loading，键盘/屏幕阅读器可感知 |
| `empty` | 无数据时空状态；不填 0、不造 ticker/metrics |
| `error` | 显示错误类别、retryable 和限制 |
| `success` | 显示 source tier、cutoff、precision、uncertainty、revision 和 recorded/live 标签 |
| `indeterminate` | 显示时间区间重叠，禁止“local first/lead”方向性文案 |

页面主要英文内容的内容根节点在 `app/page.tsx` 设置正确 `lang`；不修改 `app/layout.tsx`。200% zoom、responsive、键盘 focus、reduced-motion、contrast、aria role/live region 和不依赖颜色的状态提示均纳入验收。硬编码 `CALL_COUNT_BASE=1223`、synthetic CLI、fake ticker 和虚构 coverage 必须不存在。

### 11.2 MCP 与 Extension

- MCP 工具继续读取现有 API/报告 contract；新增 optional fields 可透明转发，不能把 recorded/cache/synthetic 改写成 live。
- Chrome Extension 继续只读 Polymarket market/profile surface，不能 sign/pay/trade/cancel/bridge/read credentials；状态 mapping 与网页一致。
- MCP、Extension、ERC-8004、WebSocket、RAG、Solidity 的既有入口不因本 CR 删除或降级到三天 MVP。
- 若发现必须改 MCP/Extension 源码才能维持 contract，必须把具体文件加入本 Plan 的受控矩阵；否则只新增只读/contract tests。

## 12. 伊朗 blind reproducibility benchmark

### 12.1 流程

1. 先锁定公开市场/condition id、日期和允许的 source/trade/profile 输入；不读取 Pitch 中的答案名单作为筛选条件。
2. 在 blind phase 只使用批准的 provider、确定性 query、动态 coverage、BUY-only、P99/200、六维和 herding 规则产生 candidate list/result。
3. 保存输入/输出 hash、算法版本、threshold、cutoff、source coverage、排除原因和所有 artifact manifest。
4. 在 blind artifact 完成后才允许与外部公开资料/答案进行 comparison；comparison 不改变产品结论。
5. 如果 9 个必需 artifact 中任一缺失，输出 `CASE_NOT_REPRODUCED`；不得补造地址、交易、价格、profile、source、时间或指标。

### 12.2 Conditional artifact boundary

只有 benchmark 通过并且具体原始数据合法可获取时，才允许创建：

```text
fixtures/recorded/iran-2026-02-28/
  manifest.json
  market.json
  trades.ndjson
  prices.ndjson
  profiles.ndjson
  sources.json
  derived-result.json
  README.md
  SHA256SUMS.txt
```

否则不创建该目录，不把 Iran 作为用户 Demo，不以 synthetic 替代。替代真实 recorded cluster 必须按预先公开的确定性排序和排除理由选择，路径和 hash 在执行时才记录。

## 13. 精确文件变更矩阵

下表是本 Plan 批准后允许进入 implementation diff 的精确集合。当前轮不修改其中任何文件；未列文件默认禁止修改。`conditional` 文件只有满足表内条件时才可创建。

| 文件 | 动作 | 目的 | contract/行为边界 | 依赖与验收 |
|---|---|---|---|---|
| `src/contracts/index.ts` | modify | SourceObservation、provider state、P95、indeterminate、payment-id optional metadata | 只 additive；保留 `SCHEMA_VERSION=1.1.0` 兼容策略，若要变更版本先做 review | T10；contract tests |
| `src/analysis/source-calibration.ts` | create | 30+ sample absolute-error P95、cohort manifest | 纯确定性；不使用 median safety bound | T20；calibration tests |
| `src/analysis/cluster-language.ts` | modify | dynamic source coverage、language interval state 和 relation | 六维、180m、P99/200、herding 阈值不变 | T30–T36 |
| `src/data/evidence.ts` | modify | evidence admission、provider state、coverage/cutoff/revision | aggregator/GDELT 不得 verified；unknown 不得 not_found | T21/T34 |
| `src/adapters/evidence/aggregator-discovery.ts` | modify | GDELT discovery-only/native fetch boundary | `seendate` 不得 published_at | T22 |
| `src/adapters/evidence/hong-kong.ts` | modify | HKSAR ISD RSS normalization和 date-only限制 | 英/繁中独立 coverage；不把 search API 当 minute source | T24 |
| `src/adapters/evidence/pairing.ts` | modify | official ID/cross-link pairing 和 overlap→indeterminate | LLM/semantic similarity 不能 verified | T34 |
| `src/adapters/evidence/revisions.ts` | modify | late-source revision | 不删除旧 revision | T35 |
| `src/adapters/evidence/gdelt.ts` | create conditional | GDELT native fetch adapter | 仅 discovery；不增加依赖 | T22 |
| `src/adapters/evidence/federal-register.ts` | create conditional | Public Inspection adapter | endpoint 必须先从官方 docs 实测确认 | T23 |
| `src/adapters/evidence/hksar-isd.ts` | create conditional | HKSAR ISD bilingual RSS adapter | 只有 ownership/route 验证后创建 | T24 |
| `src/adapters/evidence/sec-edgar.ts` | create conditional | SEC P1 adapter | filed/acceptance timestamp 明确 | T25 |
| `src/adapters/evidence/hkma.ts` | create conditional | HKMA EN/TC adapter | date-only 不支持分钟排序 | T26 |
| `src/adapters/polymarket/market-ws.ts` | modify | Market Channel trigger-only | 不从 stream 读取 wallet identity | T40 |
| `src/adapters/polymarket/ws-state.ts` | modify | stale/reconnect/stream_degraded state | incomplete coverage 禁止 formal alert | T40/T41 |
| `src/adapters/polymarket/rest-backfill.ts` | modify | Data API `/trades` hydration、pagination、dedup、reconcile | public read-only；不交易 | T41 |
| `src/data/adapters.ts` | modify | 接入现有 live market/wallet adapter 的 coverage/provenance | 保留现有 public sources | T41 |
| `src/engine/analyze.ts` | modify | 调度 source/cluster/language stages | 旧 Summary/Detail 无候选时等价 | T50 |
| `src/agents/contracts.ts` | modify | Agent structured result types | LLM 不改规则 | T51 |
| `src/agents/orchestrator.ts` | modify | stage orchestration | 不新增自由决策权 | T51 |
| `src/agents/evidence.ts` | modify | provider/coverage/pairing/revision 传递 | 只传递结构化结果 | T51 |
| `src/agents/quality-risk.ts` | modify | unknown/coverage/quality/禁用措辞检查 | 不调整阈值 | T51 |
| `src/agents/audit-report.ts` | modify | 记录 raw time、P95、coverage、cutoff、revision | 不记录 secrets/signatures | T52 |
| `src/report/build.ts` | modify | optional Summary/Detail fields | 不删除旧字段 | T53 |
| `src/reports/assembler.ts` | modify | 统一 legacy/v1 report assembly | 不改变 x402 | T53 |
| `src/api/platform.ts` | modify | response compatibility | 不新增 route | T53 |
| `src/payment/server.ts` | modify | shared preflight/guard、payment-id replay integration | 保留 scoped V2/402/header/price/network | T54 |
| `src/payment/idempotency.ts` | create conditional | bounded process-local replay cache | 不接 DB/Redis；durable 需求触发 Change Control | T54 |
| `app/summary/route.ts` | modify | Summary optional source/cluster/language output | 保持 free | T53 |
| `app/attribution/route.ts` | modify | legacy preflight + shared x402/idempotency | paid eligible Detail only；unattributed free | T54 |
| `app/api/v1/attribution/route.ts` | modify | v1 parity | 共享同一 guard；不免费绕过 | T54 |
| `app/page.tsx` | modify | GUI/CLI/APP accessible state mapping | 不展示 synthetic/fake metrics；lang 只在内容根 | T60/T61 |
| `app/globals.css` | modify | responsive/keyboard/200% zoom/reduced motion/contrast | UI only | T61 |
| `tests/contract/contracts.test.ts` | modify | current 1.1.0 compatibility + new optional fields | 不改 production contract in test | T70 |
| `tests/unit/cluster-language.test.ts` | modify | existing six-dimension/herding regression | v0.1 thresholds locked | T70 |
| `tests/unit/evidence-time.test.ts` | modify | timestamp/P95/interval/indeterminate | overlap must be indeterminate | T70 |
| `tests/unit/source-calibration.test.ts` | create | 30/29 sample gate、absolute P95、cohort isolation | median cannot pass safety gate | T70 |
| `tests/integration/cluster-language.test.ts` | modify | provider state、dynamic coverage、revision | no look-ahead/formal gate | T70 |
| `tests/integration/api.test.ts` | modify | legacy/v1 optional fields and state mapping | no new API route | T71 |
| `tests/integration/payment-idempotency.test.ts` | create | same id replay、conflict、concurrency、no signature retention | x402 headers unchanged | T71 |
| `tests/websocket/market-ws.test.ts` | modify | trigger/hydration/reconnect/stale/fallback/reconcile | no wallet identity from stream | T70 |
| `tests/mcp/*` | modify only if needed | optional-field/status forwarding | no MCP architecture change | T72 |
| `tests/extension/*` | modify only if needed | status mapping and no permission expansion | no publish/sign/pay/trade | T72 |
| `tests/e2e/app.spec.ts` | modify | all UI states, keyboard, responsive, synthetic exclusion | no fake Demo | T72 |
| `tests/e2e/cluster-language.spec.ts` | modify | recorded/empty/unknown/indeterminate/payment-required | no synthetic source | T72 |
| `tests/e2e/accessibility.spec.ts` | create | keyboard/ARIA/200% zoom/reduced-motion | page only; no layout change | T72 |
| `scripts/replay-cluster-language.ts` | modify | recorded replay and CASE_NOT_REPRODUCED | only verified recorded inputs | T73 |
| `scripts/verify-cluster-language.ts` | modify | manifest/hash/source/lockfile/clean-room checks | no migration/payment | T73 |
| `fixtures/recorded/iran-2026-02-28/*` | create conditional | blind benchmark artifact package | only after T80 passes; otherwise absent | T80 |
| `DATA-SOURCES.md` | modify | actual P0/P1 preflight/coverage/calibration record | document facts only | T90 |
| `VERIFICATION.md` | modify | actual tests, blockers, hashes, status | preserve PARTIALLY VERIFIED | T90 |
| `CHANGELOG.md` | modify | approved CR and actual implementation record | no false COMPLETE | T90 |
| `HANDOFF.md` | modify | exact handoff, rollback manifest, blockers | no secret values | T90 |

禁止修改：`SPEC-ALIBI-PLATFORM.md`、`PLAN-ALIBI-PLATFORM.md`、现有历史 `PLAN-CLUSTER-LANGUAGE-EVIDENCE-001.md`（除非另有文档归档批准）、`package.json`、`package-lock.json`、`next.config.ts`、`app/layout.tsx`、DB/migrations、环境文件、既有 v0.7 平台源文件的非必要重构、x402 legacy package、Landing/Pitch 原件、现有 fixtures/manifest 的无关内容。

## 14. 依赖、环境变量、预算和外部资源矩阵

### 14.1 依赖与运行时

| 项目 | 当前/目标 | 本 Plan 动作 | 风险处理 |
|---|---|---|---|
| Node | `package.json` engine `>=20.9 <27`；既有 Mac 验收记录为 Node `24.19.0`，目标参考 `24.16.0` | T00 只读记录；不修改系统 Node；将已验证版本纳入兼容记录，只有复现差异时才申请精确对齐 | 当前版本在 engine 内不构成功能阻塞；版本差异影响复现时唤醒 |
| npm | 既有 Mac 记录 `11.17.0`，目标参考 `11.15.0` | 只记录；不重写 lockfile | `npm ci` 仅在未来 clean-room gate，当前不执行 |
| Next/React/TS/Tailwind | current package: Next `^16.3.4`、React `^19.2.8`、TypeScript `^6.0.3`、Tailwind `^4.3.3` | 不改版本；读取 `node_modules/next/dist/docs/` 相关 guide 后再写 Next 代码 | guide 缺失或 API 不兼容停止，不升级依赖 |
| x402 | `@x402/core/@x402/evm/@x402/fetch/@x402/next` `^2.24.0` | 保持现有 scoped V2 | 禁止 x402-next/x402-fetch/legacy-peer-deps |
| Decimal/HTTP/XML | 使用现有 TypeScript、BigInt/fixed-point 和 native fetch/helper | 不增加库 | 若必须增加依赖，Change Control |
| PostgreSQL/pgvector/Docker | v0.7 local platform prerequisite；当前 DB runtime 未完全验证 | 只做存在性/health/readiness 检查；不运行 migration | DB 缺失保持 existing blocker，不阻塞纯 source/unit work |

### 14.2 环境变量

本 Plan 不新增环境变量，也不打印值；只检查存在性和安全 public metadata：

| 变量 | 作用 | 当前基线/状态 | 计划规则 |
|---|---|---|---|
| `X402_FACILITATOR_URL` | facilitator | 当前资源缺失；允许值为 `https://x402.org/facilitator` | 不为本 CR 修改；缺失走既有 402 blocked path |
| `X402_NETWORK` | x402 network | 当前资源缺失；锁定 `eip155:84532` | 不改 network |
| `ALIBI_PAYMENT_ADDRESS` | payTo | 当前缺失 | 不读取/打印 secret；无配置不做真实 settlement |
| `ANTHROPIC_API_KEY` | existing attribution | 当前缺失 | 本 CR 不发起新 LLM call；provider unavailable |
| `DATABASE_URL` | existing DB runtime | 当前缺失 | 不迁移、不写 DB |
| `COURTLISTENER_API_TOKEN` | optional provider | 可缺失 | 缺失即 provider_unavailable |
| `BUYER_AGENT_PRIVATE_KEY` | existing test buyer | 当前缺失 | 本 Plan 禁止支付/链上交易 |
| `PAYMENT-IDENTIFIER` | HTTP request header，不是环境变量 | v0.2 新增候选机制 | 不持久化 signature；bounded process-local idempotency |

### 14.3 预算和外部资源

| 资源 | 本 Plan 上限 | 允许用途 | 禁止/停止条件 |
|---|---:|---|---|
| 付费服务 | USD 0 | 无 | 任何付费 provider/paywall 停止 |
| x402/链上支付 | 0 transactions / USD 0 | 只做 local 402/fault/recorded contract tests | 需要签名、settle、receipt 或真实 USDC 时停止并唤醒 |
| LLM | 0 新调用 | 确定性 source/cluster/language 不用 LLM | 不得让 LLM改阈值、时间、state、cutoff 或 quality |
| P0/P1 HTTP preflight | 每 provider 最多 20 个有界请求，retry 计入；总计最多 100 个请求 | endpoint/shape/coverage/rate-limit spot check | 超预算、429 风险、条款不明或要求 key 时停止该 provider |
| Calibration | 每 cohort 目标 30–60 个独立样本；总样本/请求由 manifest 记录 | absolute error P95；优先批量/公开历史数据 | `<30`、reference 不独立或需付费时 unknown/Change Control |
| Request timeout/retry | 单请求 12 秒；最多 3 次 attempts，遵守 provider retry-after | 复现现有 bounded HTTP policy | 超时/持续 5xx 不扩大 retry |
| 本地磁盘 | clean-room/backup 仅限 `/private/tmp/alibi-cluster-language-v02-*` | hash、test、日志、截图 | 不写 workspace 外的其他位置，不递归删除用户文件 |

## 15. 测试矩阵

### 15.1 Contract/确定性测试

| ID | 测试 | 明确断言 |
|---|---|---|
| C01 | schema compatibility | 旧 1.1.0 payload 可读；新增 fields optional；旧字段不变 |
| C02 | 180m/BUY/P99 | 边界、SELL 排除、Decimal、7d lookback、nearest-rank、200 gate、无 look-ahead、dedup |
| C03 | D1–D6 | 正常、阈值边界、unknown/coverage、profile/history/date invalid、logit clip、R7 IQR |
| C04 | herding | average ranks、distinct time/price、rho/g、true/false/unknown；true/unknown 阻止 formal |
| C05 | source state | found/not_found/unknown；connector failure/incomplete/date-only 不得 not_found |
| C06 | dynamic coverage | 不出现固定 60d；实际 start/end/pagination/complete 进入 audit |
| C07 | calibration | 29 样本失败为 unknown；30 样本生成 P95；median 不能成为 safety bound；cohort 隔离 |
| C08 | language | official ID/cross-link pairing；gap open/closed/unknown；interval overlap 必须 indeterminate；late revision 保留历史 |

### 15.2 Provider/market/API/payment tests

| ID | 测试 | 明确断言 |
|---|---|---|
| P01 | GDELT | native fetch、artlist parse、seendate→first_seen、published_at null、discovery-only |
| P02 | Federal Register | Public Inspection field/path verified before use；首见时刻与 formal publication 分开 |
| P03 | HKSAR RSS | en/zh-Hant RSS fields、pairing、poll interval、date-only fallback、P95 metadata |
| P04 | SEC/HKMA | P1 status、filed/date-only handling、provider unavailable fallback |
| P05 | Market pipeline | Market Channel trigger only；Data API `/trades` wallet hydration、pagination、dedup、reconcile |
| P06 | WebSocket fault | stale/disconnect/reconnect/15s fallback；incomplete coverage no formal alert |
| P07 | API compatibility | `/summary`、`/attribution`、`/audit`、`/api/v1/summary`、`/api/v1/attribution` old/new payload parity；no new `/api/*` route |
| P08 | x402 invariant | HTTP 402、`PAYMENT-REQUIRED`、network、asset、amount、payTo、facilitator、recorded/live status unchanged |
| P09 | unattributed free | no verified attribution returns free explicit `unattributed`; eligible paid Detail still returns unchanged 402 until valid payment |
| P10 | payment identifier | same id/body replays same terminal result; conflicting body fails closed; concurrent duplicate no double settlement; signature absent from artifacts |

### 15.3 UI/platform/security tests

| ID | 测试 | 明确断言 |
|---|---|---|
| U01 | GUI/CLI/APP | recorded API data only; no synthetic ticker/CLI/call count/fictional metrics; empty has no fabricated values |
| U02 | state mapping | provider_unavailable、upstream unavailable、payment_required、insufficient、unattributed、loading、empty、error、success、indeterminate all visible and accessible |
| U03 | accessibility | keyboard-only navigation/focus, semantic landmarks, screen-reader status, contrast, reduced-motion |
| U04 | responsive | desktop/mobile/200% zoom screenshots; no clipping or unreachable controls |
| U05 | MCP/Extension | optional states forward correctly; no secret/permission/sign/pay/trade/publish behavior |
| U06 | blind benchmark | no answer leakage; all artifact hashes and deterministic ranking recorded; missing Iran package stays CASE_NOT_REPRODUCED |
| U07 | integrity | protected hashes, source/lockfile, no unapproved files, Secret scan, clean-room and service cleanup |

### 15.4 完整验收命令族（批准后才可执行）

按 T90 的实际环境选择现有项目脚本：

```text
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:offline
npm run test:e2e
```

另外执行 source preflight/calibration、recorded replay、API 402 smoke、MCP/Extension contract、desktop/mobile/200% zoom screenshot、Secret scan、source/lockfile integrity、clean-room install/test/build 和 service cleanup。默认 Turbopack 若受 sandbox `listen EPERM` 阻塞，记录环境差异并用受控 Webpack build 验证；不能把该差异隐瞒为 PASS。

## 16. Definition of Done

只有以下项目全部满足，才能把本 CR 的实现标为 complete；其中任一 live/provider/DB/chain gate 缺失时项目仍为 `PARTIALLY VERIFIED`：

1. P0/P1 endpoint、字段、实际返回、coverage、限流、时间 type 和条款均有实测记录。
2. GDELT discovery-only，`seendate` 未被提升为 verified `published_at`。
3. Provider coverage 动态记录，不存在固定 60 天假设。
4. TypeScript native fetch，无 Python/gdeltdoc，新依赖为 0，package/lockfile hash 不变。
5. 每个用于排序的 cohort 至少 30 个独立样本，absolute-error P95 和方法 hash 可审计；中位数不作安全边界。
6. SourceObservation/Evidence 具备 source role、provider state、raw/UTC time、precision、uncertainty、first_seen、retrieved、hash、coverage、cutoff、revision。
7. Language pairing 只接受 official ID/cross-link；interval overlap 输出 `indeterminate`；date-only/unknown 不输出方向性先手。
8. 180m、BUY-only、P99/200、D1–D6、herding 和 formal gate 与 v0.1 完全一致。
9. Market Channel 只 trigger，Data API `/trades` 补齐 wallet，reconnect/stale/fallback/reconcile 通过测试。
10. Summary 免费；合格 Attribution Detail 0.01 USDC；unattributed 免费；x402 V2 402/header/network/asset/payTo/facilitator/recorded-live invariant 通过。
11. `PAYMENT-IDENTIFIER` replay、conflict、race 和 no-signature-retention 通过；legacy/v1 guard 一致；没有 durable idempotency 的虚假承诺。
12. GUI/CLI/APP、MCP、Chrome Extension 与全平台状态一致；synthetic、fake count/ticker/metric、未验证 Pitch claims 不进入用户 Demo。
13. Iran benchmark 已 blind 运行；缺 artifact 时为 CASE_NOT_REPRODUCED；至少一个真实 recorded cluster 和一个真实 recorded bilingual pair 才能宣称该功能本地 Demo 完整。
14. typecheck、lint、unit、integration、contract、recorded replay、402 smoke、Playwright、build、Secret scan、clean-room、截图和 cleanup 的实际结果已记录。
15. 实际 changed files、hash、依赖、网络请求、费用、截图绝对路径、降级、阻塞和 rollback manifest 已写入验证/交接文档；项目状态未被错误改为 COMPLETE。

## 17. 依赖顺序、并行任务和无人值守边界

### 17.1 主任务依赖图

```text
T00 Read-only baseline
 ├─ T10 Source preflight ─ T20 Adapter/coverage ─ T30 Calibration ─ T40 Language state/revision
 ├─ T11 Contract review ─ T12 Deterministic regression ─ T40
 ├─ T13 Market trigger audit ─ T21 REST hydration/reconcile ─ T40
 └─ T14 API/x402 review ─ T50 Shared guard/idempotency ─ T60 API/report/UI integration

T40 + T50 + T60 ─ T70 tests ─ T80 blind benchmark/recorded package ─ T90 full verification/docs/cleanup
```

### 17.2 可并行任务

- T10、T11、T13、T14 在 T00/T01/T02 完成后可并行只读审计。
- T20–T30 的 source adapter/preflight、T12 的 contract/cluster regression、T21 的 market replay analysis 可并行，但不得重复扫描整个项目。
- T40 language logic、T50 payment/API design、T60 UI/status mapping 在各自输入核验完成后可并行设计；实际写入由主 Codex 按文件矩阵串行整合。
- T70 测试仅在所有 implementation diffs 静态审查后运行。

### 17.3 无人值守执行

Plan 批准后，主 Codex 可在不再次询问的情况下连续执行以下范围：读取文件、创建受控备份、修改本矩阵内代码/测试/文档、运行本地测试和本地 clean-room、做不付费的只读 provider preflight、生成脱敏 hash/报告、清理本轮服务进程。

无人值守不得扩展到：

- 新依赖、系统 Node/Docker 安装、package/lockfile 变更；
- DB migration、DB schema/数据写入、Redis/持久化 payment store；
- 真实 x402 payment、chain transaction、订单/交易/签名/bridge；
- 付费服务、Anthropic 新调用、需 key 的 provider、生产写入、公开部署、MCP/Chrome Store 发布；
- 新公共路由、删除/改名 v1、Spec/Plan 修改、Landing/Pitch 修改；
- 任何未在文件矩阵中的文件、产品语义、阈值、平台范围或用户 Demo 数据。

### 17.4 唤醒/停止条件

出现任一条件立即停止当前 lane，并向人类报告具体证据：

1. Spec/Plan/protected hash 变化或工作区出现未解释的外部写入；
2. 新依赖、版本升级、Python/gdeltdoc、legacy x402 package 或 `legacy-peer-deps` 被要求；
3. 必须改 DB、migration、env、public route、durable idempotency 或现有 v1 contract；
4. provider 要求付费/key、rate limit 超出预算、条款不明或 P0 endpoint 无法确认；
5. P95 `<30`、reference 不独立、interval overlap 需要方向性裁决或 source_state 语义冲突；
6. secret scan 命中、payment signature/private key 出现在 artifact、synthetic 泄漏到用户 Demo；
7. 需要真实支付、链上交易、生产写入、外部发布或主观产品结论；
8. 任何测试失败需要修改保护边界、放宽阈值、改变 x402 或改变 `PARTIALLY VERIFIED` 状态。

停止文本：

```text
CHANGE_CONTROL_EXPANSION_REQUIRED
```

## 18. 回滚与 clean-room 验证

### 18.1 回滚

当前没有可依赖的 Git repository。实现前：

1. T02 对精确允许文件建立 pre-change SHA-256 manifest；新增文件记录“不存在”。
2. 将仅限矩阵内既有文件备份到 `/private/tmp/alibi-cluster-language-v02-backup-<timestamp>/`，不备份/覆盖广泛 workspace。
3. 每个阶段后核对 Spec、v0.7 Plan、package、lockfile、next.config、环境、fixtures 和 DB 状态。
4. 失败时只恢复 manifest 中的确切文件，并安全移除本轮明确创建且记录过的文件；禁止 `git reset`、`git checkout`、workspace-wide glob 和递归删除。
5. 回滚后重跑 typecheck、contract/API tests、402 smoke、recorded replay、source/lockfile integrity 和 clean-room smoke。

### 18.2 Clean-room

批准后建立限定的 `/private/tmp/alibi-cluster-language-v02-clean-room-<id>/`：

- 复制受控 source/fixtures 和批准后的 manifest，不复制 secrets；
- `npm ci --ignore-scripts` 只在 clean-room 运行，不改变根目录 lockfile；
- 验证 Node/npm compatibility、typecheck、lint、unit/contract、recorded replay、Webpack/production build、API 402 fault path、Playwright/截图；
- 运行递归 Secret scan，确认无 key/private key/payment signature/JWT/header 泄漏；
- 确认用户 Demo 中没有 synthetic ticker/CLI/虚构指标；
- 关闭 dev server、WebSocket、Playwright、Docker 临时进程并记录 cleanup；
- 记录 clean-room 路径、命令、退出码、测试数量、hash、网络/费用和未解决问题。

Clean-room 失败不得自动改依赖或重写锁文件；只能根据失败类别修复矩阵内代码，或唤醒并进入 Change Control。

## 19. 最终交付包与状态报告

执行完成后，主 Codex 必须生成：

- approved CR hash、Plan hash、protected hash manifest；
- Source preflight/provider matrix、实际返回 shape、coverage 和 calibration/P95 manifest；
- SourceObservation/Evidence schema sample、language state/revision sample；
- Market Channel/Data API replay、stale/reconnect/fallback/reconcile 证据；
- legacy/v1 API compatibility、x402 402 headers、payment-id replay evidence；
- blind benchmark 结果或 `CASE_NOT_REPRODUCED`；
- actual changed files/created artifacts/bytes/SHA-256；
- 实际测试数量、typecheck/lint/build/replay/Playwright/screenshots/Secret scan/clean-room/cleanup；
- 网络请求和费用（本 CR 目标为无付费调用、无支付、无链上交易）；
- 未解决 blocker 和 degradation；
- 最终状态：若仍有 live provider、Anthropic、Base Sepolia、DB runtime、真实 recorded case 或其他 v0.7 gate 未验证，明确保持 `PARTIALLY VERIFIED`，不得写 `COMPLETE`。

本 Plan candidate 生成后立即停止，等待独立批准；不执行上述实现任务。
