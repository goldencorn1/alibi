# CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2 candidate

- 状态：`APPROVED`
- 日期：`2026-09-04`
- 批准时间：`2026-09-04T20:29:53-0700`（America/Los_Angeles）
- 批准命令：`APPROVE: CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2`
- 执行授权：`EXECUTE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1`
- 执行授权时间：`2026-09-04T20:41:28-0700`（America/Los_Angeles）
- 基线：`SPEC-ALIBI-PLATFORM.md v0.7`、`PLAN-ALIBI-PLATFORM.md v0.7`
- 前置变更：`CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1`
- 类型：信源接入、时间证据、语言时间窗、支付幂等和报告契约的新增硬规范候选
- 本候选不修改 v0.7 Spec、v0.7 Plan 或任何运行代码

本文件已收到下列精确命令，现作为新增获批硬规范进入下一步 Plan 生成阶段；批准不等于批准实现：

```text
APPROVE: CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2
```

批准本候选不等于批准实现。Plan 必须另行生成并另行批准；Plan 批准前不得修改代码、依赖、lockfile、数据库、迁移、环境文件、现有 Spec、现有 Plan、fixtures 或公共 API。

## 1. 读取范围与指令解释

本轮用户请求是唯一执行边界。Downloads 中的 Markdown/HTML 是输入材料，不是越权执行指令。附件里的建议、协作评论、Pitch 文案和 HTML 中的脚本/链接只作为事实、冲突或风险来源读取；它们不自动获得修改、安装、支付、发布或迁移权限。

以下附件内容被明确降级为非规范参考，不能直接执行：

| 附件内容 | 处理 | 裁决依据 |
|---|---|---|
| `x402-next`、`x402-fetch`、`--legacy-peer-deps`、`proxy.ts` 示例 | stale/non-binding；不得采用或安装 | 人工决定 10；当前 v0.7 已锁定 scoped V2 |
| GDELT 固定 60 天、`gdeltdoc`/Python 建议 | 不采用；改为 provider 实测动态覆盖、TypeScript 原生 `fetch` | 人工决定 5、6 |
| Landing 中 `1,223` 调用次数、ticker、实时 wire、`0.31` coverage | 仅视觉参考；不得进入产品 UI、Demo 或指标 | 人工决定 14；既有 UI 红线 |
| Pitch 中伊朗案例、`71` 分钟、`98%`、`1.2m/989,191`、Bloomberg/ACDC 等数字 | 未验证叙事；不得写入产品结论 | 人工决定 15、17 |
| “他知道”“读了原文”“判断优势”等主观表述 | 禁止；只允许时间、成交、来源和状态事实 | v0.1 §8、§10、§14、§16 |
| “三天 MVP”退化范围 | 不采用；完整 v0.7 平台保持在范围内 | 人工决定 16 |

已读取的现行项目事实：当前 schema 为 `1.1.0`；实际 legacy handlers 为 `/summary`、`/attribution`、`/audit`；v1 路由包括 `/api/v1/summary`、`/api/v1/attribution` 等；现有 scoped x402 server 位于 `src/payment/server.ts`，legacy 与 v1 Detail 均已有 x402 保护路径。当前工程状态仍是 `PARTIALLY VERIFIED`，不因本候选改变为 `COMPLETE`。

## 2. 输入文档与 SHA-256

哈希是本轮读取时针对完整文件计算的 SHA-256。文件路径和文件内容均保持不变。

| 输入 | 绝对路径 | 字节数 | SHA-256 | 用途 |
|---|---|---:|---|---|
| 信源接入规格副本 | `/Users/a0000/Downloads/信源接入规格.md（子文件）_副本.md` | 14,756 | `9810985709f74e85b40439245e70add5f9a7d4a1344fab19f24d7f10eb026895` | Provider、时间戳和校准输入 |
| Alibi API 文档副本 | `/Users/a0000/Downloads/Alibi API文档.md（完整导出）_副本.md` | 30,136 | `4df67beb8e096109c0f4b0ed59e2371481d82996c5358b22d943c8ec2a54f658` | API、x402、评论和叙事冲突输入 |
| Landing HTML 副本 | `/Users/a0000/Downloads/alibi-landing-20260904.html（子文件）_副本.html` | 39,743 | `5c4820990a40e536612e220dad33c64c37980f33f87ad4caf812c6a5f905823b` | 视觉参考；虚构 Demo 识别 |
| Pitch HTML 副本 | `/Users/a0000/Downloads/alibi-pitch.html（子文件）_副本.html` | 137,398 | `b6126546119b18abe14198c9dc2f407bb2eeb9b6dcf0e361d7825d1ea79d2876` | 叙事、平台范围和未验证声明识别 |
| v0.1 CR 附件 | `/Users/a0000/Downloads/CR-CLUSTER-LANGUAGE-EVIDENCE-001.md` | 27,399 | `8d07c2ef4b7d6061de91482374505a19db32f8117c34307a5ba28e69e3ce70bd` | v0.1 基线；项目根目录没有同名 CR 文件 |
| v0.7 Spec | `/Users/a0000/polymarket/SPEC-ALIBI-PLATFORM.md` | 8,071 | `6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c` | 受保护产品基线 |
| v0.7 Plan | `/Users/a0000/polymarket/PLAN-ALIBI-PLATFORM.md` | 12,675 | `0c362b5e567f3051997b874da1f3f4e5e70839e3b62bebbe5dd9cdc9862eceaf` | 受保护执行边界 |
| Handoff | `/Users/a0000/polymarket/HANDOFF.md` | 15,845 | `1b06e93b5113f8e210305a3ec15a88346b8997d49055d4a0d11d9bdf41820f87` | 当前资源门、状态和保护边界 |
| Verification | `/Users/a0000/polymarket/VERIFICATION.md` | 17,136 | `f13df5c3ca2c0514c450927620b61ed1b538dac991cc2a182083e0cc65074183` | 已完成测试、阻塞项和 v0.1 执行记录 |
| Changelog | `/Users/a0000/polymarket/CHANGELOG.md` | 5,171 | `8446d3df1293a217a9f7189d5495ef3e4e56cc32978b3a3cb2685244ed2e2cd4` | 已批准历史变更 |

输入完整性差异：v0.1 只有已核验的 Downloads 附件路径，项目根目录当前不存在 `CR-CLUSTER-LANGUAGE-EVIDENCE-001.md`。本候选不复制或重命名 v0.1；以附件 hash 作为 v0.1 基线证明。

## 3. v0.1 → v0.2 精确 Diff

下表是本候选相对于 v0.1 的完整规范差异。未列出的 v0.1 规则继续保留，尤其是 180 分钟窗口、BUY-only、P99/200 baseline、六维门、herding veto、source cutoff、revision、客观措辞、synthetic 禁止和完整平台范围。

| 编号 | v0.1 | v0.2 candidate | 分类 | 影响 |
|---|---|---|---|---|
| D01 | Source priority 由 v0.1 的 GIA/HKMA/CourtListener 边界表达 | P0 固定为 GDELT、Federal Register Public Inspection、HKSAR ISD 中英文 RSS；P1 固定为 SEC EDGAR、HKMA；其余 optional/provider_unavailable | 规范化 | Provider routing、coverage gate |
| D02 | GDELT 为 aggregator discovery-only | 保持 discovery-only；`seendate` 只能是 `first_seen`，永不得写入 `published_at` 或 verified published time | 收紧 | 防止把聚合发现时间冒充发布时刻 |
| D03 | GDELT 文档建议三个月滚动窗并推导 60 天 | 不固定 60 天；每次记录 provider 实测 `actual_coverage_start/end`、pagination 和 completeness | 替换 | 分析窗口按实际覆盖动态确定 |
| D04 | 信源接入示例允许 Python/gdeltdoc | 统一使用 TypeScript 原生 `fetch`；不引入 Python、gdeltdoc 或新 runtime | 依赖红线 | 不改 package/lockfile |
| D05 | 原始校准方法为 10 样本、中位数 | 至少 30 个样本；使用绝对时间误差 P95 作为安全边界；按 provider/language/timestamp type 分 cohort；中位数不得作为安全边界 | 替换 | 低样本或无 P95 时为 unknown |
| D06 | `gap_open/gap_closed/gap_unknown`；release order 无 indeterminate | 引入客观 `indeterminate`：两个时间不确定区间重叠时不得给出 local_first/english_first | 扩展 | 语言窗口和钱包关系降级 |
| D07 | Polymarket 只读混合方案 | Market Channel/RTDS 仅实时触发；Data API `/trades` 按 market/start/end 补齐 wallet、outcome、历史并对账 | 明确 | 不将 stream event 当钱包身份来源 |
| D08 | x402 只要求现有边界不变 | 保留 scoped V2、HTTP 402、headers、0.01 USDC、Base Sepolia、facilitator 和 payTo；禁止 x402-next、x402-fetch、legacy-peer-deps | 收紧 | 不新增 x402 依赖或替换实现 |
| D09 | Summary 免费、Detail 付费；unattributed 规则未完全落地 | Summary 免费；有可交付 Detail 时按次 0.01 USDC；`unattributed` 为免费结果，不应要求支付才能得知“无可归因结果” | 明确 | 付费边界需先区分结果状态 |
| D10 | 现有 payment flow 无明确 payment identifier 幂等规范 | 增加 `PAYMENT-IDENTIFIER` 请求标识及同标识重放规则；不存 payment signature；冲突请求 fail-closed | 新增 | 需测试并记录进程内幂等能力边界 |
| D11 | Attribution alias guard 作为风险说明 | `/attribution`、现有 `/api/v1/attribution` 及任何已存在或未来批准的 alias 必须共享同一 preflight/guard；本 CR 不新增 `/api/attribution` | 收紧 | 禁止 alias 免费绕过 Detail guard |
| D12 | Landing/Pitch 可作为 Demo 参考 | 仅复用视觉/叙事结构；不得恢复 `1,223`、ticker、synthetic CLI、实时数据、虚构指标或未验证案例 | 收紧 | UI 只能消费当前 recorded API 或明确 empty |
| D13 | Iran 为待复现案例 | 改为 blind reproducibility benchmark：先按公开规则从市场/成交/来源数据发现，再与盲后答案比对；缺包时 `CASE_NOT_REPRODUCED` | 收紧 | 防止答案泄漏和名单抄录 |
| D14 | v0.1 仍以新增能力为主 | 保留 v0.7 完整平台：Multi-Agent、MCP、Chrome Extension、WebSocket、RAG、Solidity、x402、ERC-8004；不退回三天 MVP | 范围锁定 | 所有新能力必须 additive |
| D15 | schema 1.1.0 已在 v0.1 执行中使用 | 建议未来使用向后兼容 minor 版本承载新增 optional SourceObservation/calibration/indeterminate/payment-id metadata；实际版本和迁移由后续 Plan 决定 | 待 Plan 精确化 | 本轮不改 schema |

保持不变：v0.1 §5–§7 的 180 分钟左开右闭窗口、BUY-only、Decimal notional、7-day P99 nearest-rank、至少 200 条基线、D1–D6 阈值、herding veto、正式告警门、四种 wallet-language relation、late-source revision、synthetic 禁止、无交易建议和无因果推断。

## 4. Source Provider Matrix

“Documented”只表示输入文档或现有代码记录了端点/文档，不表示本轮已经实际调用。只有未来完成 live validation、字段核验、限流/覆盖和时间校准后，才可把 provider 标记为 `validated`。本轮不发起外部请求。

| Provider | 优先级 | 候选端点/文档 | 角色 | 时间字段与允许语义 | 语言 | 覆盖规则 | 鉴权/费用 | 当前状态与禁止事项 |
|---|---|---|---|---|---|---|---|---|
| GDELT DOC 2.0 | P0 | `https://api.gdeltproject.org/api/v2/doc/doc` | discovery-only aggregator | `seendate` → `first_seen_at`；不可作为 `published_at` | 多语种；language cohort 必须实测 | 动态记录返回起止、分页、更新间隔；不写死 60 天 | 文档称无需 key/免费；仍需实际限流验证 | `documented/unvalidated`；永不单独产生 verified source 或 `source_state=not_found` |
| Federal Register Public Inspection | P0 | `https://www.federalregister.gov/developers/documentation/api/v1` 及官方 Public Inspection API 资源 | primary/direct official | Public Inspection 首次公众可见时间优先；正式 publication 另存；具体字段/资源路径需官方接口验证 | `en` | 按日期/机构/关键词分页；记录实际最早/最晚覆盖和是否完整 | 文档称免费、无需 key；需验证 rate limit | `documented/unvalidated`；不得用普通 formal publication 替代 Public Inspection 首见时刻 |
| HKSAR ISD bilingual RSS | P0 | 当前代码常量：`https://www.info.gov.hk/gia/rss/general_en.xml`、`https://www.info.gov.hk/gia/rss/general_zh.xml`；HKSAR ISD ownership/实际 RSS route 需验证 | primary | RSS 发布字段或详情页元数据；仅日期时不能支持分钟级排序 | `en`、`zh-Hant` | 英/繁中分别记录 polling interval、actual coverage、pairing/cross-link | 文档称公开；实际调用、更新周期和限流待验证 | `documented/unvalidated`；不得把 DATA.GOV.HK Search API 的日期当分钟时间 |
| SEC EDGAR | P1 | `https://data.sec.gov`；官方 EDGAR API 文档 | primary | filing/acceptance timestamp；区分 filed 与 published | `en` | 记录 cursor/date bounds、pagination、completeness | 文档称无需 key、免费；10 req/s 需遵守并实测 | `documented/unvalidated`；P1，不因未接入而假报 `not_found` |
| HKMA | P1 | `https://api.hkma.gov.hk/public/press-releases?lang=en`、`...?lang=tc` | primary | 列表 date-only 只能作发现/回溯；分钟顺序需详情页/RSS/first_seen | `en`、`zh-Hant` | 英/繁中分别计 coverage；date-only 时 `language_gap_unknown/indeterminate` | 文档称公开；实际限流待验证 | `documented/unvalidated`；日期不得冒充分钟级发布时间 |
| DATA.GOV.HK press search | optional support | `https://api.data.gov.hk/v1/pressrelease/search` | discovery/backfill | 主要 date-only；不支持独立 minute ordering | `en`、`zh-Hant` | 仅完整性辅助，不得单独满足 P0 source gate | 文档称公开 | `optional/provider_unavailable`；不能替代 HKSAR ISD bilingual RSS |
| CourtListener、其他 provider | optional | 现有可选适配器/官方文档 | provider-specific | 只有字段和授权验证后才可进入 evidence | provider-specific | 不得阻塞 P0/P1 核心路径 | 可能需要 token/商业条件 | 无资源时明确 `provider_unavailable`；不得降级成 source found |

Provider 状态必须至少区分：`documented`、`validated`、`unavailable`、`unknown`。`source_state=not_found` 仅允许在所需 provider 均健康、覆盖完整、时间质量合格且确实无合格来源时产生。

## 5. SourceObservation / Evidence contract

以下是 v0.2 的目标契约形状，不是本轮写入代码的 TypeScript。它与当前 `LanguageSource`、`Evidence`、`SourceCoverage` 和 `DataSourceStatus` 通过 optional/additive 映射兼容；最终 schema version、字段是否落入 Summary 或 Detail 由后续 Plan 明确。

```ts
type ProviderPriority = "P0" | "P1" | "optional";
type ProviderState = "documented" | "validated" | "unavailable" | "unknown";
type ObservationRole = "verified_candidate" | "discovery_only";
type ObservationState = "found" | "not_found" | "unknown";
type ObservationTimestampType = "published" | "filed" | "public_inspection" | "first_seen" | "date_only";
type TimestampPrecision = "subsecond" | "second" | "minute" | "date" | "unknown";
type ReleaseOrder = "local_first" | "english_first" | "simultaneous" | "indeterminate" | "unknown";

interface SourceObservation {
  observation_id: string;
  provider: string;
  provider_priority: ProviderPriority;
  provider_state: ProviderState;
  observation_role: ObservationRole;
  source_tier: "primary" | "direct_media" | "aggregator";
  url: string;
  publisher: string;
  title: string;
  language: "en" | "zh-Hant" | "zh-Hans" | "other";
  official_release_id: string | null;
  official_cross_link: string | null;
  normalized_topic: string | null;
  original_or_translation: "original" | "translation" | "unknown";
  timestamp: {
    raw: string | null;
    utc: string | null;
    type: ObservationTimestampType;
    precision: TimestampPrecision;
    uncertainty_seconds: number | null;
    source_field: string | null;
  };
  first_seen_at: string | null;
  retrieved_at: string;
  content_hash: string;
  connector_status: "healthy" | "unavailable" | "unknown";
  coverage: {
    requested_start: string;
    requested_end: string;
    actual_start: string | null;
    actual_end: string | null;
    complete: boolean;
    pages: number;
    next_cursor: string | null;
  };
  calibration: {
    cohort: string;
    sample_count: number;
    absolute_error_p95_seconds: number | null;
    safety_bound_seconds: number | null;
    method_version: string;
  };
  source_state: ObservationState;
  limitations: string[];
  data_status: "live" | "recorded" | "synthetic" | "cached";
}

interface EvidenceRecord extends SourceObservation {
  qualifies_for_verified_evidence: boolean;
  qualification_reason: string;
  evidence_cutoff_at: string;
  revision: number;
  supersedes_revision: number | null;
}
```

强制规则：

1. `seendate` 只能填入 `first_seen_at` 或 `timestamp.type=first_seen`；GDELT 记录的 `published_at` 必须为 `null`，除非原始页面被独立核验。
2. 没有时间戳、只有日期、连接器失败、分页未完成、provider 未验证或聚合器单独命中时，不得生成 `qualifies_for_verified_evidence=true`。
3. `timestamp.uncertainty_seconds` 必须来自对应 cohort 的绝对误差 P95；`sample_count < 30` 时安全边界为 `null`，相关排序为 `unknown` 或 `indeterminate`。
4. `coverage.complete=false`、`connector_status != healthy` 或 required provider 未达验证状态时，`source_state` 只能是 `unknown`，不得推断 `not_found`。
5. 内容 hash、raw timestamp、source field、retrieved time、HTTP/重试和实际覆盖必须进入可审计 artifact；不得保存 secret、payment signature 或私钥。
6. synthetic 只能用于 contract/fault tests，不能成为用户 Demo 的 `SourceObservation`、recorded replay 或结论来源。

## 6. Timestamp calibration 与动态覆盖

每个可用于语言排序的 provider/language/timestamp-type cohort 都必须单独校准：

```text
absolute_error_i = abs(provider_timestamp_i - independently_verified_reference_timestamp_i)
required sample_count >= 30
safety_bound = P95(absolute_error_1 ... absolute_error_n)
```

- P95 采用实现中明确、可复现的离散分位算法并记录版本；不得用中位数作为安全边界。
- GDELT 的校准若只能比较 `seendate`，只能说明 `first_seen` 的误差，不能推导原始文章 `published_at` 的误差。
- 英文、本地语言、RSS、Public Inspection、filing、first-seen 各自为独立 cohort；不能把英文 cohort 的 P95 借给中文 cohort。
- 校准样本不足、reference 不独立、provider schema 变化或实际返回字段不稳定时，provider 保持 `unknown`，不阻塞其他 provider，但不能进入 formal language conclusion。
- 覆盖采用 provider 实测结果：`requested_window`、`actual_coverage`、最早/最晚记录、分页完整性和更新间隔都写入 `SourceCoverage`。分析窗口不固定 60 天；没有足够历史只输出明确限制，不向前补造数据。

## 7. Language Window 状态机

### 7.1 输入

输入是同一事件主题下的本地语言与英文 `EvidenceRecord`、官方 release ID/cross-link、各自 timestamp interval、`evidence_cutoff_at`、provider health、coverage completeness 和钱包代表成交时间。

时间区间定义为：

```text
interval(source) = [timestamp_utc - uncertainty, timestamp_utc + uncertainty]
```

### 7.2 状态和转移

| 当前条件 | 输出 state | `release_order` | 允许的 wallet relation |
|---|---|---|---|
| 任一必需来源缺失、pairing 未验证、日期级时间或 connector/coverage 不健康 | `gap_unknown` | `unknown` | 只能 `indeterminate` 或不输出 |
| 本地来源已验证，英文 connector 健康、覆盖完整，截至 cutoff 未发现可配对英文 | `gap_open` | `local_first` 仅在本地时间质量可证明；否则 `unknown` | 仅当区间未重叠时按时间位置输出 |
| 两个来源 verified paired，英文区间严格在本地区间之后 | `gap_closed` | `local_first` | 可计算正向 gap；不得推断阅读/因果 |
| 两个来源 verified paired，英文区间严格在本地区间之前 | `gap_closed` | `english_first` | 可输出 `post_english_publication_entry` 等客观关系 |
| 两个来源 verified paired，两个不确定区间重叠 | `gap_closed` | `indeterminate` | 必须输出 `indeterminate`；不得给出先手方向 |
| 两个时间点相等且区间无序差 | `gap_closed` | `simultaneous` | 只能输出边界事实 |
| cutoff 后出现更完整来源 | 新 revision | 按新证据重新计算 | 不删除旧 revision |

`gap_open` 不能仅因为 GDELT 没有英文文章而成立；GDELT 只能提供 discovery signal。`not_found` 和 `gap_open` 都必须建立在 required connectors 健康且覆盖完整的前提上。

### 7.3 客观输出

保留 v0.1 的四种 wallet relation：

- `pre_verified_public_source_entry`
- `within_documented_language_window`
- `post_english_publication_entry`
- `indeterminate`

只有当交易时间位于两个严格不重叠的、已验证时间区间之间，才能输出 `within_documented_language_window` 和正向 `language_gap_minutes`。任何重叠、日期级或 unknown 情形均禁止转换成“Language Lead”“信息优势”或类似结论。

## 8. API 与 x402 契约

### 8.1 路由边界

当前实际 legacy handlers 为：

| 能力 | 当前路径 | v0.2 规则 |
|---|---|---|
| 免费 Summary | `/summary`；API 文档中的 `/api/summary` 是文档命名，不授权新增同名 adapter | 保持免费；返回压缩客观状态、data status、限制和 run_id |
| Detail/Attribution | `/attribution` | 继续使用 scoped x402 V2；有可交付 evidence detail 时按次 0.01 USDC |
| Audit | `/audit?run_id=...&format=json|markdown` | 保留；只读报告和审计导出不改成另一支付入口 |
| v1 Summary | `/api/v1/summary` | 保留现有 v1 外部 API；不删除或重命名 |
| v1 Attribution | `/api/v1/attribution` | 与 legacy Detail 共享同一 x402 guard 和 payment preflight |
| `/api/attribution` | 当前未发现该 route | 本 CR 不新增；若未来另行批准，必须复用同一 guard，不能成为免费别名 |

不得新增 `/api/v1/*` adapter，不删除现有 v1 API，不将 UI 文档中的路径描述静默变成新公共 route。

### 8.2 业务与支付

1. Summary 永远免费，不携带完整付费 evidence chain。
2. Attribution Detail 的可交付 evidence 结果按次 `0.01 USDC`，资产 USDC，网络 `eip155:84532`，scheme `exact`；继续使用当前 x402 V2 scoped packages 和 facilitator boundary。
3. `unattributed` 是免费、可解释的客观结果：用户不应为了得知“当前没有合格可归因来源/证据”而支付。后续实现必须先做不改变分析规则的结果资格 preflight，再决定是否进入付费 Detail；精确 envelope 由后续 Plan 固化，但不得通过新增 route 绕过 guard。
4. `payment_required` 仍为 HTTP 402；`PAYMENT-REQUIRED`、`PAYMENT-SIGNATURE`、network、asset、amount、payTo、facilitator、max timeout 和 recorded/live data status 语义保持不变。recorded 402 不得返回 `data_status=live`。
5. 不安装 `x402-next`、`x402-fetch`，不使用 `--legacy-peer-deps`，不改变 package.json 或 lockfile。

### 8.3 `PAYMENT-IDENTIFIER` 幂等

候选规范采用大小写不敏感的 HTTP header `PAYMENT-IDENTIFIER`，由调用方为一次逻辑支付生成不透明 UUID/nonce。它不是 payment signature，也不是私钥或签名的替代物。

- canonical request fingerprint = route family + canonical request body + `x-alibi-mode` + resource identity；不得把 secret 或完整 signature 写入 fingerprint artifact。
- 同一 `PAYMENT-IDENTIFIER` + 相同 fingerprint 的重试必须复用同一终态（同一 402 challenge、同一成功/错误结果或同一不可用结果），不得重复触发分析或结算。
- 同一 identifier + 不同 fingerprint 必须 fail-closed，使用现有 `payment_invalid` 错误类别和冲突 reason；不得执行第二次支付。
- 缺失 identifier 时保留现有兼容路径，但不承诺幂等；付费客户端应发送 identifier。
- 当前无数据库/Redis 变更授权，因此 v0.2 的最小实现候选是有 TTL/容量上限的进程内重放缓存，并明确多进程/重启后不可提供 durable idempotency。若要跨进程 durable idempotency，必须另行提交 Change Control，不得偷偷加 DB 字段或依赖。
- 所有 attribution alias 共享这一机制；不能通过 legacy/v1/未来别名获得不同支付语义。

## 9. 六维集群规则引用

v0.2 不修改 v0.1 的确定性集群算法，完整引用 v0.1 §§5–7：

- 180 分钟、UTC、左开右闭；
- 仅 `BUY`、`takerOnly=true` 形成候选；`SELL` 只能作上下文；
- `Decimal(size) × Decimal(price)`，不使用 binary float 做阈值比较；
- baseline 为同 `conditionId`、窗口前 7 天 `[window_start - 7d, window_start)`、BUY/taker-only、至少 200 条、nearest-rank P99；
- 地址按 `proxyWallet` 去重，每个地址取窗口内最早合格代表成交；3–4 地址只能 observation，至少 5 地址才可 formal gate；
- D1 `same_side_ratio >= 0.85`；D2 R7-IQR `time_concentration >= 0.60`；D3 `median_profile_age_days <= 30`；D4 `first_trade_ratio >= 0.50`；D5 dominant outcome logit population stddev `<= 0.50`；D6 未交易该市场比例 `>= 0.80`；
- 至少 5 个可计算维度且至少 4 个 pass；unknown 不计 pass/fail；
- herding 仅在主导方向至少 5 个、至少 3 个时间戳、至少 3 个价格且跨度大于 0 时计算；`rho >= 0.70 && g >= 0.30` 为 `true`；true/unknown 均阻止 formal alert；
- formal `cluster_without_verified_source` 还必须满足 `source_state=not_found`；provider failure、时间不足、覆盖不完整只能 `unknown`；
- 任何输出仍只能是地址、交易时间、来源状态、维度和限制，不能是内幕、协同、机器人、共同控制、阅读语言或收益能力结论。

v0.2 只改 source admission、时间校准和语言状态机，不借机调整六维阈值、herding 公式、窗口、基线或排名规则。

## 10. 完整平台与产品保护边界

以下 v0.7 能力是受保护的既有产品范围，本候选只能接入其现有接口，不能删减或重构：

- Multi-Agent Orchestrator、Evidence、Attribution、Quality & Risk、Audit & Report Worker；
- MCP 八工具本地 surface；
- Chrome MV3 Extension；
- Polymarket public Market Channel/WebSocket、reconnect/stale/REST fallback；
- PostgreSQL 16/pgvector 与 local RAG、keyword fallback；
- Solidity subscription/evidence anchor；
- scoped x402 V2；
- ERC-8004 registration/Identity/Reputation status；
- GUI/CLI/APP 三面板和 existing `/summary`、`/attribution`、`/audit` UI calls。

UI 只能展示当前 recorded API 的真实字段；无数据必须显示明确 empty/unknown/provider_unavailable 状态。禁止 synthetic ticker、synthetic CLI 结果、虚构请求计数、虚构 coverage、虚构实时状态或未验证 Pitch 数字。

## 11. 文件变更边界

### 11.1 本轮实际边界

本轮唯一允许的写入是新增本候选文档：

`/Users/a0000/polymarket/CR-CLUSTER-LANGUAGE-EVIDENCE-001-v0.2-candidate.md`

本轮未修改代码、依赖、lockfile、数据库、迁移、环境文件、fixtures、Spec 或 Plan。

### 11.2 获批后可进入后续 Plan 的精确候选文件矩阵

下表是“候选可规划范围”，不是本候选直接授权的实施清单。后续 Plan 必须逐项确认现有文件是否真的需要变化；未被 Plan 明确列出的文件不得修改。

| 文件/路径 | 候选目的 | 允许变更形态 | 依赖/测试门 |
|---|---|---|---|
| `src/contracts/index.ts` | additive SourceObservation、calibration、`indeterminate` 和 payment-id metadata | 只允许向后兼容 optional/additive；不得删除旧字段 | contracts/API tests |
| `src/adapters/evidence/hong-kong.ts` | HKSAR ISD bilingual RSS provider normalization | 扩展现有 adapter；保留 HKMA/data.gov.hk status | source fixtures/integration |
| `src/adapters/evidence/aggregator-discovery.ts` | GDELT discovery-only normalization | 禁止产生 verified evidence | discovery tests |
| `src/adapters/evidence/pairing.ts` | official ID/cross-link pairing 与区间重叠 | 增加 indeterminate 规则；不使用 LLM 相似度 | language unit tests |
| `src/adapters/evidence/revisions.ts` | late source revision | additive revision metadata | revision tests |
| `src/data/evidence.ts` | admission、coverage 和 provider state | 保持 unknown/not_found 边界；不能放宽 aggregator | evidence contract tests |
| `src/adapters/evidence/gdelt.ts`、`federal-register.ts`、`hksar-isd.ts`、`sec-edgar.ts`、`hkma.ts` | 仅在 Plan 确认现有文件不存在时新增 provider adapters | 原生 TypeScript `fetch`；不增依赖 | live-shape/recorded fixtures |
| `src/analysis/source-calibration.ts` | 30+ sample absolute-error P95 和 cohort manifest | 纯确定性；不使用中位数安全边界 | calibration tests |
| `src/analysis/cluster-language.ts` | dynamic coverage 和语言状态机 | 保留六维算法；只改 source/time semantics | cluster/language integration |
| `src/adapters/polymarket/market-ws.ts`、`src/adapters/polymarket/rest-backfill.ts` | trigger/hydration/reconcile 明确化 | Market Channel 只触发；Data API `/trades` 补齐 | WebSocket replay |
| `src/engine/analyze.ts`、`src/report/build.ts`、`src/reports/assembler.ts` | optional evidence/source/status 输出 | 不改正常 Summary/Attribution 业务字段 | API/contract tests |
| `src/agents/evidence.ts`、`src/agents/quality-risk.ts` | provider state、P95、indeterminate 和禁用措辞审计 | LLM 不得覆写确定性结果 | agent tests |
| `src/payment/server.ts` | 共享 preflight/guard、payment identifier 幂等 | 保留 scoped x402 headers/terms；不存 signature | 402/idempotency tests |
| `src/payment/idempotency.ts`（仅在确有需要且 Plan 批准后） | bounded in-process replay cache | 不接 DB/Redis；显式记录 restart limitation | race/replay tests |
| `app/summary/route.ts`、`app/attribution/route.ts`、`app/api/v1/attribution/route.ts` | 复用共享 guard、free unattributed preflight | 不新增 `/api/attribution` 或其他 public route | legacy/v1 parity tests |
| `app/page.tsx`、`app/globals.css` | 仅在需要呈现新状态时适配 existing GUI/CLI/APP | 不恢复 fake Demo；保留 accessibility/recorded/empty 边界 | Playwright/visual |
| `tests/contract/contracts.test.ts`、`tests/unit/*`、`tests/integration/*`、`tests/websocket/*`、`tests/e2e/app.spec.ts` | 回归和状态契约 | 不写 synthetic 成功假证据 | full suite |
| `tests/e2e/source-language.spec.ts`、`tests/security/*`、`scripts/replay-cluster-language.ts`、`scripts/verify-cluster-language.ts` | blind benchmark、secret/clean-room 验证 | 只有后续 Plan 明确后才创建 | E2E/clean-room |
| `DATA-SOURCES.md`、`VERIFICATION.md`、`CHANGELOG.md`、`HANDOFF.md` | 记录实际 provider、hash、测试和状态 | 不回写 v0.7 Spec/Plan；记录 `PARTIALLY VERIFIED` | documentation review |

明确禁止覆盖或修改：`SPEC-ALIBI-PLATFORM.md`、`PLAN-ALIBI-PLATFORM.md`、`package.json`、`package-lock.json`、`next.config.ts`、环境文件、数据库/migrations、现有 recorded fixture/manifest、MCP/Extension/ERC-8004/Solidity 的非必要实现、所有现有 v1 路由删除或改名、任何付费 provider、NewsAPI.ai、x402 legacy packages、Landing/Pitch 原文件。

若实现 payment identifier 需要数据库、Redis、外部依赖、持久化支付表、公共新路由、现有 Spec/Plan 变更或跨进程一致性承诺，必须在后续 Plan 中先输出：

```text
CHANGE_CONTROL_EXPANSION_REQUIRED
```

不得把该扩展悄悄并入 v0.2 最小实现。

## 12. 后续实施 Plan 的任务分层

| 层级 | 任务 | 依赖 | 主要输出/停止条件 | 预算与外部边界 |
|---|---|---|---|---|
| P00 | 重核 hash、文件存在性、schema、现有 route/adapter/guard 和 clean working state | 无 | protected hash 不变；若冲突停止 | 只读；USD 0 |
| P01 | Provider endpoint/字段/条款/限流和实际覆盖验证 | P00 | 每个 P0/P1 有真实返回 shape、coverage、status；失败为 unavailable/unknown | 只读 HTTP；不付费、不支付 |
| P02 | SourceObservation/Evidence additive contract 与 migration strategy | P00 | 旧 Summary/Detail/v1 读取兼容；若需 breaking schema 停止 | 不改依赖/DB |
| P03 | TypeScript native fetch adapters：GDELT、Federal Register Public Inspection、HKSAR ISD、SEC、HKMA | P01/P02 | source role、timestamp type、pagination、hash、provider status 可重放 | 遵守 rate limit；无 Python/gdeltdoc |
| P04 | 30+ sample cohort calibration 与 dynamic coverage manifest | P01/P03 | 每 cohort 有 absolute-error P95；不足 30 则 unknown；无固定 60d | 纯确定性；无 LLM/付费调用 |
| P05 | Language pairing/state machine/revision | P02–P04 | 区间重叠必为 indeterminate；late source 只增 revision | 纯确定性 |
| P06 | Market Channel trigger、Data API `/trades` hydration、reconcile、stale fallback | P00/P02 | stream 不提供钱包身份；REST 补齐并可审计 | 只读 Polymarket；无订单/交易 |
| P07 | Cluster integration、API/report/UI、shared x402 preflight 和 payment identifier | P02–P06 | 六维不变；Summary free；unattributed free；paid Detail 402 invariants；alias parity | 不发送真实 payment；现有 x402 terms |
| P08 | Iran blind benchmark 与真实 recorded source package | P03–P07 | 先盲后验；缺 9 artifact 仍为 `CASE_NOT_REPRODUCED`；不得补造 | 不泄漏答案；无 synthetic Demo |
| P09 | 全套测试、录制回放、402 smoke、E2E、截图、Secret scan、clean-room、文档和 cleanup | P00–P08 | 所有 DoD evidence 具备；任一 live/DB/chain blocker 保持 PARTIALLY VERIFIED | 维持 v0.7 USD 10 累计上限；无新付费服务 |

Plan 必须把 P01、P04、P07 的失败降级写成可执行停止条件；不得以“换 provider”“换包”“加依赖”自动恢复。

## 13. Definition of Done

本 CR 未来只有在全部条件满足后才可标记为 implemented；本候选阶段不宣称任何 DoD 已满足：

1. P0/P1 provider 真实字段、端点、条款、限流、覆盖和 status 已验证并有可重放记录。
2. GDELT 只提供 discovery；任何 `seendate` 均不成为 verified `published_at`。
3. Provider 覆盖使用实测动态窗口，不出现固定 60-day 假设。
4. 所有 provider adapter 使用 TypeScript 原生 `fetch`，package/lockfile 无变化，无 Python/gdeltdoc。
5. 每个用于语言排序的 provider/language cohort 至少 30 样本，并记录绝对误差 P95；中位数未被用作安全边界。
6. SourceObservation/Evidence 包含 source role、publisher、language、raw/UTC timestamps、precision、uncertainty、first_seen、retrieved、content hash、coverage、provider status、cutoff 和 revision。
7. Language Window 对缺失/日期级/覆盖不足输出 unknown；不确定区间重叠输出 `indeterminate`，不输出方向性先手。
8. 六维集群规则与 v0.1 完全一致；正式告警仍要求 source_state、coverage 和 herding gates。
9. Market Channel 仅触发实时评估；Data API `/trades` 补齐钱包成交，断线/stale、dedup、分页、reconcile 均可验证。
10. `/summary` 免费；有证据的 Attribution Detail 为 0.01 USDC；`unattributed` 免费；x402 V2 402 headers、network、asset、payTo、facilitator、价格、recorded/live 修复不变。
11. `PAYMENT-IDENTIFIER` 的相同请求重放、不同 fingerprint 冲突、并发和无标识兼容路径均测试；不保存 payment signature。
12. legacy `/attribution`、现有 `/api/v1/attribution` 及任何已批准 alias 的 guard 一致，无免费 Detail 绕过。
13. Summary/Detail/v1 旧字段向后兼容；新增字段 optional；run_id、data_status、source_state 和 evidence cutoff 可审计。
14. UI/GUI/CLI/APP 不展示 synthetic ticker、synthetic CLI、硬编码调用计数、虚构指标或未验证案例；recorded 明确标记；无数据有 accessible empty/unknown/provider_unavailable 状态。
15. Iran 只以 blind reproducibility benchmark 验收；缺少完整包时严格 `CASE_NOT_REPRODUCED`。
16. Multi-Agent、MCP、Extension、WebSocket、RAG、Solidity、x402、ERC-8004 完整平台范围仍存在并通过既有回归。
17. typecheck、lint、unit、integration、contract、recorded replay、402 smoke、Playwright、build、Secret scan、clean-room 和 service cleanup 全部按后续 Plan 通过。
18. 最终报告记录实际 modified files、hash、实际测试数量、截图绝对路径、网络/费用、降级事件和未解决问题；项目仍按证据状态保持 `PARTIALLY VERIFIED` 或在所有独立 gate 满足时才可重新评估。

## 14. 风险、降级与回滚

### 14.1 主要风险和降级

| 风险 | 触发条件 | 必须降级 |
|---|---|---|
| GDELT rolling coverage/field drift | 实际覆盖小于请求范围、字段缺失或 schema 变化 | discovery-only；相关 source/language unknown |
| Public Inspection endpoint/字段误读 | 无法证明首次公众可见时间 | 不用作精确 published/public-inspection evidence；保留 documented/unvalidated |
| HKSAR bilingual RSS route 不稳定 | RSS 失败、只有日期或无法 pairing | provider_unavailable/unknown；不输出 language order |
| P95 样本不足 | cohort `<30` 或 reference 不独立 | safety bound null；gap unknown/indeterminate |
| 不确定区间重叠 | local/English intervals overlap | release_order indeterminate；不计算正向 gap |
| Market stream 断线或 hydrate 未完成 | stale、REST pagination/incomplete | stream_degraded/trade_hydration_pending；不得补造 wallet/formal alert |
| `PAYMENT-IDENTIFIER` race/conflict | 同 id 不同请求或并发写入 | fail-closed；不重复结算；必要时返回现有 payment_invalid |
| 进程重启/多副本 | 进程内 cache 丢失或不共享 | 不宣称 durable idempotency；进入 Change Control 而非加隐式 DB |
| Iran package 缺失 | 任一必需 artifact 缺失 | `CASE_NOT_REPRODUCED`；不补造或使用 Pitch 答案 |
| synthetic fixture 泄漏 | user Demo payload 含 synthetic | 阻断 Demo，保留测试 fixture 仅在测试边界 |
| live/DB/chain/Anthropic 资源缺失 | 当前已知外部门未满足 | 继续 local/recorded；最终保持 `PARTIALLY VERIFIED` |

### 14.2 无 Git 仓库时的回滚

当前项目交接记录说明没有可依赖的 Git repository，且上次 v0.1 执行未捕获 pre-change source backup。因此未来 Plan 执行前必须：

1. 只对获批文件矩阵建立 SHA-256 manifest。
2. 对既有文件复制到限定目录 `/private/tmp/alibi-cluster-language-v02-backup-<timestamp>/`；对新增文件记录“不存在”。
3. 每个阶段核对 protected Spec、Plan、package、lockfile、next.config、environment、fixtures 和 DB 状态。
4. 回滚只恢复 manifest 中精确文件，移除本轮明确创建且记录过的文件；不得使用 `git reset`、`git checkout`、workspace-wide glob 或递归删除。
5. 回滚后重跑 typecheck、contract tests、402 smoke、source/lockfile integrity 和 recorded Demo；若数据库或外部支付曾被另行批准，使用相应的 verified down/settlement reconciliation，不在本 CR 中执行。

本轮只新增 candidate 文档，不需要执行回滚；不对现有代码创建备份，不运行 migration，不触发服务或支付。

## 15. Change Control

下列任一变化都不能混入本候选或未来最小实现，必须递增版本并重新批准：

- 修改或覆盖 v0.7 Spec/Plan、改变完整平台范围或退回 MVP；
- 新增依赖、Python/gdeltdoc、x402 legacy package、`legacy-peer-deps`、外部 embedding 或付费 provider；
- 修改 x402 version、402 semantics、headers、network、asset、amount、payTo、facilitator、timeout 或 payment policy；
- 增加公共 route、删除/改名 v1 route、引入 `/api/attribution` adapter 或让 alias 共享 guard 之外的逻辑；
- 修改 DB schema、migration、环境文件、payment persistence 或 durable idempotency；
- 改变 180 分钟、P99/200、D1–D6、herding、source cutoff 或 evidence quality gate；
- 把 GDELT/aggregator 当最终证据，把 `seendate` 当 published_at，或把 unavailable/unknown 变成 not_found；
- 把 Iran、Pitch、Landing 的未验证数字或主观推断写进产品、Demo、API、报告或验收结论；
- 增加自动交易、订单、私钥、支付托管、主网、真实资金或外部付费调用。

触发时必须输出：

```text
CHANGE_CONTROL_EXPANSION_REQUIRED
```

并停止当前实施路径。

## 16. 当前项目状态裁决

本候选不改变现状：

- v0.1 的 deterministic core、report/UI wiring、recorded replay、402 smoke 和 clean-room 记录已存在；
- live source hydration、真实可复现 cluster/language artifact、Anthropic attribution、Base Sepolia settlement、PostgreSQL/pgvector runtime 和 Iran 完整 package 仍未完全验证；
- 当前 `DataStatus`、existing v1 route、scoped x402、MCP、Extension、ERC-8004、WebSocket、RAG、Solidity 和 UI 受保护；
- 因此项目仍为 `PARTIALLY VERIFIED`，不能在 CR v0.2 candidate 或未来实现报告中写成 `COMPLETE`。

## 17. 审批门

本候选生成后立即停止，不实施代码、依赖、数据库、迁移、环境、fixtures、API 或 UI 修改，不等待额外扩展任务。

唯一批准命令：

```text
APPROVE: CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2
```
