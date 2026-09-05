# Alibi Cluster/Language Evidence 项目交接手册

版本：HANDOFF-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1  
日期：2026-09-04  
项目目录：/Users/a0000/polymarket  
当前阶段：Plan 生成完成，等待独立 Plan 批准  
当前项目状态：PARTIALLY VERIFIED

## 1. 接手者第一条指令

不要直接实现 CR。先等待并核对以下精确批准命令：

APPROVE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1

## v0.2 final execution correction — 2026-09-05

The exact execution authorization was received and the approved Plan was executed. The final local verification is authoritative in `VERIFICATION.md`: 25 Vitest files/76 tests, Playwright 12/12, typecheck, lint, controlled Webpack build, Hardhat compile, MCP verification, local Extension packaging, recorded replay, offline recorded demo verification and final clean-room all passed.

The final clean-room is `/private/tmp/alibi-cluster-language-v02-clean-room-final-f4QJp7`. The local Extension archive is `/Users/a0000/polymarket/artifacts/extension/alibi-extension.zip` with SHA-256 `c6d1d1d012e17351627a90487b8763430536a8992f113ff133edb75a8aac75ab`. Current screenshots and hashes are listed in `VERIFICATION.md`.

The implementation includes the read-only `hydrateMarketChannelTrigger` Data API helper with bounded pagination, wallet-bearing REST hydration, deduplication and reconcile semantics; a live Market Channel stream and live hydration were not invoked. GDELT/Federal availability, 30-sample calibration, real recorded bilingual/cluster artifacts, Anthropic attribution, payment settlement, database runtime and public endpoint publication remain open. Final status is `PARTIALLY VERIFIED`; do not mark `RUNNABLE_DEMO_COMPLETE` or `FULLY_LIVE_VERIFIED`.

## v0.2 execution handoff — 2026-09-04/05

The approved Plan execution is complete within the authorized matrix. Actual final evidence is recorded in `/Users/a0000/polymarket/VERIFICATION.md`, including the 25-file/76-test Vitest run, 12/12 Playwright run, Webpack build, recorded replay, x402 smoke, source preflight, final clean-room path, screenshot hashes, changed-file list and protected hashes.

The implementation preserves `SPEC-ALIBI-PLATFORM.md v0.7`, existing v1 routes, x402 V2 terms, recorded fixtures, MCP, Extension, ERC-8004, database/migration boundaries and dependency manifests. It adds source adapters, dynamic coverage/provenance, absolute-error P95 calibration gates, language interval `indeterminate`, trigger-only Market Channel helpers, read-only `/trades` hydration and reconcile helpers, bounded `PAYMENT-IDENTIFIER` replay and free explicit unattributed Detail handling.

External gates remain open: GDELT timed out; Federal Register was temporarily unavailable; no 30-sample calibration, real bilingual recorded pair/cluster, Anthropic attribution, Base Sepolia settlement, database runtime or public MCP/Extension verification was claimed. Iran remains `CASE_NOT_REPRODUCED`. Default Turbopack is host-sandbox blocked by `listen EPERM`; controlled Webpack build passes. Final project status is `PARTIALLY VERIFIED`.

## 10. 批准后最终交接记录

Plan 已按精确命令批准并执行：`APPROVE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1`。

已完成：

- schema 1.1.0 optional cluster/language/source fields；Spec v0.7 原文件保持不变。
- fixed-point notional、P99/200 baseline、180 分钟窗口、D1–D6、composite、herding veto、formal/observation/restriction/insufficient 状态。
- approved source adapter boundaries、strict official-ID/cross-link pairing、source cutoff、unknown degradation、revision metadata。
- REST pagination/dedup/reconcile contract、WebSocket stale/reconnect/15 秒 fallback state。
- 现有 Summary/Detail 和 GUI/CLI/APP 页面增量展示；synthetic 不进入用户 Demo。
- 25 个 Vitest 文件/76 个测试、Playwright 12/12、Webpack build、recorded replay、402 smoke、recursive Secret scan、MCP/Extension/ERC-8004 preflight、clean-room 通过。

未完成或需人工资源：

- Iran 2026-02-28 所需 9 个 artifact 不存在，严格输出 `CASE_NOT_REPRODUCED`。
- 没有真实 recorded cluster/language package；当前 recorded fixture 的新字段保持保守 empty/unknown。
- live source connectors、Anthropic attribution、Base Sepolia payment settlement、Docker/PostgreSQL/pgvector runtime 仍未验证。
- 默认 Turbopack build 在 sandbox 不能 bind 端口；Webpack build 通过。
- clean-room `npm ci --ignore-scripts` 报告依赖树现有 4 个 high advisories；未执行修复，不改变根目录 lockfile。
- 当前没有 Git repository；本执行回合没有捕获修改前源文件备份，因此 rollback rehearsal 未运行。受保护文件 hash 已保留；未来修改前必须先按 Plan 的精确文件矩阵建立备份。

关键受保护 hash：

- Spec: `6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c`
- package.json: `9b44171d4053e1f1986e095ccab519c84fc86bfdac7455c471b8e82ec992d9b0`
- package-lock.json: `ab2f2883e03dc5563d4175d217748509a9eead740f56446961ba3239032d17b8`
- next.config.ts: `1717de44afb15015a1faaa3fb97746d9716e164f2d5587a721ba8cc21e840536`

下一位接手者：阅读本手册、`PLAN-CLUSTER-LANGUAGE-EVIDENCE-001.md` 和 `VERIFICATION.md`；不得将当前状态改写为 COMPLETE，也不得把 recorded/synthetic 结果写成 live。若要补齐真实案例或 live acceptance，先取得相应数据/凭据和独立变更批准。

在该命令出现前，只允许阅读、核验和报告状态；不得修改代码、依赖、lockfile、Spec、数据库、migration、环境文件、fixtures 或 API/UI。

## 2. 权威文件与读取顺序

按以下顺序阅读：

1. /Users/a0000/polymarket/SPEC-ALIBI-PLATFORM.md
2. /Users/a0000/polymarket/PLAN-ALIBI-PLATFORM.md
3. /Users/a0000/polymarket/MAC-HANDOFF.md
4. /Users/a0000/polymarket/VERIFICATION.md
5. /Users/a0000/polymarket/PLAN-CLUSTER-LANGUAGE-EVIDENCE-001.md
6. /Users/a0000/polymarket/SUMMARY-CLUSTER-LANGUAGE-EVIDENCE-001.md
7. CR 来源附件：/Users/a0000/Downloads/CR-CLUSTER-LANGUAGE-EVIDENCE-001.md

CR 核验 hash：

8d07c2ef4b7d6061de91482374505a19db32f8117c34307a5ba28e69e3ce70bd

Spec v0.7 当前 hash：

6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c

项目内 CR 路径当前不存在。不得自行复制；如后续需要项目内规范文件，先进行独立路径决策。

## 3. 当前状态和已完成工作

已完成：

- CR v0.1 文件读取和预期 SHA-256 核验。
- Spec v0.7 不可变基线核验。
- 当前 contracts、analysis、adapters、agents、API、UI、tests 和现有 verification/handoff 文档的只读审查。
- Plan-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1 生成。
- 当前进度总结和本交接手册生成。

未完成：

- cluster/language deterministic engine。
- source adapters、pairing、gap、revision。
- RTDS trigger、REST hydration、reconcile 和 15 秒 fallback。
- schema 1.1.0 optional fields。
- Summary/Attribution/API/UI 增量接入。
- real recorded cluster、HK bilingual pair 和 artifact hashes。
- 新增 tests、typecheck、lint、build、recorded replay、402 smoke、Playwright、截图、secret scan 和 clean-room verification。

不要把“Plan 已生成”报告成“功能已实现”或“验收完成”。

## 4. 保护边界

禁止本 CR 覆盖、删除或静默改变：

- SPEC-ALIBI-PLATFORM.md；
- PLAN-ALIBI-PLATFORM.md、PLAN-COMPLETE-DEMO.md；
- package.json、package-lock.json；
- next.config.ts、app/layout.tsx；
- x402/payment network、price、asset、payTo、facilitator、402 headers 和 error envelope；
- 现有 /api/v1/* route；
- MCP、Chrome Extension、ERC-8004、Solidity contracts；
- 现有 recorded fixtures、manifest 和 SHA256SUMS；
- 环境文件、数据库数据和 migration；
- 用户未明确授权的外部发布、支付、交易或付费调用。

当前 Plan 也不授权新增依赖。若新实现需要依赖、数据库 schema、migration、public route、产品语义或 protected file，必须暂停并输出：

CHANGE_CONTROL_EXPANSION_REQUIRED

## 5. 批准后的精确续接流程

### T00–T02：只读和完整性门禁

- 重核 CR attachment hash 和 Spec hash。
- 检查项目内 CR 路径仍不存在还是已由人工处理。
- 读取 package.json、package-lock.json、当前 schema、现有测试清单和环境存在性；不得打印 secret。
- 建立允许修改文件的 pre-change SHA-256 manifest。
- 因当前没有 Git repository，创建限定文件集合的安全临时备份。
- 任一 protected file hash 变化、依赖变化、数据库变化或范围冲突都停止。

### T10–T26：确定性 cluster 核心

- 先扩展 contracts，保持旧 schema 读取兼容。
- 使用 base-10 fixed-point，不使用 binary float 参与 threshold。
- 严格执行 180 分钟左开右闭窗口、BUY-only、P99 7 天/200 baseline、D1–D6、coverage、unknown、composite 和 herding veto。
- formal alert 必须同时满足 cluster size、span、evaluable、passed、herding=false、source_state=not_found。
- 3–4 地址只允许 observation；所有 UI/报告使用 addresses，不使用 users/people。
- 所有 raw timestamps、parse info、algorithm version、threshold、exclusion 和 coverage 写入 audit。

### T30–T47：实时与证据

- RTDS/Market Channel 只作为 reevaluation trigger。
- REST 完成 hydration、pagination、dedup、profile/history coverage 和 reconcile。
- 断线或 stale 时使用 15 秒只读 incremental fallback；incomplete coverage 禁止 formal alert。
- 只接 CR 批准的 GIA/HKMA 及可选 CourtListener。
- GDELT/aggregator 只能 discovery。
- cutoff 前 published evidence 才可计入；connector failure、date-only、timestamp 不足或 coverage 不完整均为 unknown。
- pairing 只接受 official release ID 或 official cross-link 规则。
- late source 创建 revision，不删除旧 revision。

### T50–T63：报告和 UI

- 复用既有 Orchestrator、Evidence、Attribution、Quality/Risk、Audit/Report。
- LLM 只能解释结构化结果，不得改 threshold、timestamp、status、gate、cutoff 或 quality。
- 现有 Summary/Attribution/Report 增加 optional cluster_alerts、language_windows、source_coverage、evidence_cutoff_at。
- 不新增 public route 或 v1 adapter。
- 现有 GUI/CLI/APP 三面板继续使用。
- app/page.tsx 内容根节点处理 lang="en"；不改 app/layout.tsx。
- 处理 recorded/live/unavailable/provider_unavailable/payment_required、loading、empty、error、success、insufficient、unattributed、source unknown 等可访问状态。
- 禁止 synthetic ticker、synthetic CLI output、虚构指标、内幕/协调/身份/因果断言和投资建议。

### T60–T74：录制、测试、文档和验收

- Iran replay 不能复现时输出 CASE_NOT_REPRODUCED。
- 真实 recorded cluster 和 HK bilingual pair 必须有 manifest、sources、raw/derived artifact、bytes/hash、retrieval 和算法元数据。
- 执行 Plan 中的 20 类 deterministic/source/API/UI/runtime/clean-room 验证。
- 最终执行完整测试、typecheck、lint、build、recorded replay、402 smoke、Playwright、desktop/mobile/200% zoom 截图、secret scan、source/lockfile integrity 和 cleanup。
- live provider 不可用时保留 PARTIALLY VERIFIED。
- 最终报告必须列出实际 changed files、实际测试数量、截图绝对路径、network/cost、degrade events、未解决问题和 rollback manifest。

## 6. 预算、服务与安全

- 沿用现有 USD 10 累计硬上限。
- deterministic cluster/language 计算不应需要新的 LLM 调用。
- Anthropic 仅可沿用现有 attribution 路径，且不得由 LLM 改写确定性结论。
- Polymarket、GIA、HKMA、CourtListener 只读、限速并记录 retrieval/http/retry/cache/mode。
- 不调用 NewsAPI.ai，不新增付费 provider。
- 不执行真实支付、链上交易、订单、cancel、relayer、bridge 或生产写入。
- 不读取、打印或提交私钥、API key、真实 .env、payment signature 或 JWT。
- 任何 secret scan 命中、预算异常、支付请求、rate-limit 异常或新依赖需求都立即停止。

## 7. 降级规则

| 事件 | 必须状态/动作 |
|---|---|
| RTDS stale/disconnect | stream_degraded；REST 15 秒回退；未 reconcile 不得 alert |
| REST/profile/history 不完整 | pending/unknown；不得填 0 |
| P99 baseline <200 | insufficient_baseline；不得 formal alert |
| 3–4 地址 | cluster_observation |
| herding true/unknown | observation/restriction；阻止 formal alert |
| source connector failure | source_state=unknown |
| date-only/时间不确定 | language_gap_unknown |
| aggregator/GDELT only | discovery only |
| CourtListener unavailable | provider_unavailable，不阻塞 deterministic path |
| Iran 不可复现 | CASE_NOT_REPRODUCED |
| live provider unavailable | PARTIALLY VERIFIED，禁止 COMPLETE |

## 8. 回滚

当前没有 Git repository。

执行前：

1. 对所有允许修改的既有文件建立 SHA-256 manifest。
2. 对新增文件记录不存在状态。
3. 将精确文件备份至限定的 /private/tmp/alibi-cluster-language-backup-<timestamp>/。
4. 不备份或修改 protected file 内容以外的 workspace。
5. 每个阶段后核对 protected hashes。

回滚时只恢复 manifest 中的精确文件，安全移除本次确认新增的文件；不得使用 git reset、git checkout、workspace-wide glob 或递归删除。回滚后重跑 Spec hash、package/lockfile integrity、typecheck、contract tests 和 402 smoke。

## 9. 交接结束状态

当前交接是“等待 Plan 批准”，不是“等待代码测试结果”。接手者不得自行扩大范围或以“继续”“修复吧”“可以”等自然语言代替精确批准命令。

唯一批准命令：

APPROVE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1
