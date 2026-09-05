# Decision Log

本文件记录 L0／L1 级自主决策。L2 决策不记在这里，必须暂停并合并为单个 `WAKE-UP-DECISION-PACKET`，批准结果记入 `APPROVAL-LOG.md`。

本文件在 2026-09-05 之前不存在；此前的 L0／L1 决策散落在 `HANDOFF.md`、`CHANGELOG.md` 与 `VERIFICATION.md`，本文件不回填、不追溯创造历史记录。

| 时间（America/Los_Angeles） | 等级 | 决策 | 依据 | 影响文件 |
|---|---|---|---|---|
| 2026-09-05T08:16:47-0700 | L0 | 创建本文件 `DECISION-LOG.md` | `PROMPT-WALLET-DISCOVERY-PLAN-GENERATION v1.0` 将本文件列入本轮写入 allowlist；`CR-WALLET-DISCOVERY-RANKING-001 v0.2` §13 要求治理记录文件存在 | 新增 `DECISION-LOG.md` |
| 2026-09-05T08:16:47-0700 | L0 | 生成 `PLAN-WALLET-DISCOVERY-RANKING-001-v0.1-candidate.md`，SHA-256 `8fd239976c1c318fc6a491a9a36c04496155fb9b3a218375962054a95b42292d`，466 行 | 已批准 `APPROVE: CR-WALLET-DISCOVERY-RANKING-001 v0.2`，该批准仅授权生成 Plan candidate | 新增 Plan candidate 文件 |
| 2026-09-05T08:16:47-0700 | L0 | 实测确认 `/Users/a0000/polymarket` 不是 Git 仓库（`.git` 不存在），Plan §11.1 据此默认适用逐文件带时间戳备份回滚模式 | 上游修正第 6 条要求回滚方案适配实际 Git 状态 | 无代码改动 |
| 2026-09-05T08:16:47-0700 | L0 | 将 `PLAN-UI-I18N-GLOSSARY-001 v0.2` 与 `v0.3` 的批准证据标记为 `APPROVAL_EVIDENCE_UNVERIFIED` | 这两条批准的文字记录只见于执行方自述文档 `HANDOFF.md:295`、`HANDOFF.md:313`、`CHANGELOG.md:76`、`VERIFICATION.md:366`，未捕获带挂钟时间的独立批准记录。上游修正第 4 条禁止以 L0 推定或创造历史批准，也禁止把「代码已经实现」当作「Plan 已获批准」 | 无文件改动；记录于 Plan §2.4 |
| 2026-09-05T08:16:47-0700 | L0 | UI v0.3 处置采用唯一选定路径「恢复并完成验证至 V-GATE 通过」，另两案仅记为未采用备选 | 上游修正第 1 条禁止让获批 Plan 保留未选择的三选项；已有 28 Vitest 文件／82 项测试／15/15 Playwright 成果不应作废，且两套半成品 UI 叠加会使 Glossary 覆盖率门无法归因 | 记录于 Plan §2.1 |
| 2026-09-05T08:16:47-0700 | L0 | `account_age_days` 采用兼容方案：对外 API 字段名不变，展示层统一为 `Profile Age / 资料档案年龄`，并强制 limitation 文案 | 上游修正第 2 条禁止由 Plan 修改已批准 CR 的 API contract；同时须满足 `src/ui/glossary.ts:67` 禁止称账户／钱包／地址年龄的安全规则与 `GLOSSARY_COVERAGE=100%` 门 | 记录于 Plan §2.2、§12.3 |
| 2026-09-05T08:27:53-0700 | L0 | 对 `CR-WALLET-DISCOVERY-RANKING-001-v0.2-candidate.md` 执行只读 SHA-256 核验，实测 `b9de021549ccc8f690591946b1c9f81a66761105efd231a021353a465d87a335`，394 行／37957 字节 | `REVISE ... TO v0.2` 第 1、2 条。只读核验不修改 CR，不修改 `VERIFICATION.md`，不构成伪造证据 | 无文件改动 |
| 2026-09-05T08:32:02-0700 | L0 | 生成 `PLAN-WALLET-DISCOVERY-RANKING-001-v0.2-candidate.md`，SHA-256 `7c5e62509108ebf8a4dda59bdd7b88ef4ae68d621380be54546562bdc071e915`，562 行；v0.1 原文件保持不变，SHA-256 仍为 `8fd23997…5b42292d` | `REVISE ... TO v0.2` 第 6、8 条要求保留 v0.1 并另建新文件 | 新增 Plan v0.2 candidate 文件 |
| 2026-09-05T08:32:02-0700 | L0 | 将 CR 绝对路径、版本 v0.2、实测 SHA-256、状态 `APPROVED` 与「Plan 仅绑定该精确 artifact」写入 Plan v0.2 §1、§1.1 | `REVISE ... TO v0.2` 第 2 条 | Plan v0.2 §1、§1.1 |
| 2026-09-05T08:32:02-0700 | L0 | Phase 0 任务 0.3 改为「重算 CR hash 并与 Plan 固定值比对」：一致则记录后继续，不一致则停止并输出 `CR_INTEGRITY_MISMATCH`，禁止用执行阶段新 hash 静默替换已批准 hash | `REVISE ... TO v0.2` 第 3 条 | Plan v0.2 §1.2、§4 任务 0.3、§17 风险 12、§18 |
| 2026-09-05T08:32:02-0700 | L0 | 明确批准 Plan v0.2 的语义为「前瞻性授权」：保留 UI v0.3 改动、补齐验证、满足 A／B／V-GATE、再进入 Phase 3；不构成对历史 UI v0.2／v0.3 执行或审批记录的追溯性批准，`APPROVAL_EVIDENCE_UNVERIFIED` 必须保留 | `REVISE ... TO v0.2` 第 4 条 | Plan v0.2 §2.1.1、§2.4 |
| 2026-09-05T08:32:02-0700 | L0 | 新增 Phase 0 任务 0.5：Plan v0.2 获批后为 `APPROVAL-LOG.md` 第 9、10 行追加 `APPROVAL_EVIDENCE_UNVERIFIED`，只追加不删除、不补写时间，并在本文件记录原记录／证据缺口／修正后状态／前瞻性授权范围四要素 | `REVISE ... TO v0.2` 第 5 条 | Plan v0.2 §2.4 第 5 点、§4 任务 0.5、§10.2 |
| 2026-09-05T08:32:02-0700 | L0 | 本轮写入仍限 Plan v0.2 与本文件；`APPROVAL-LOG.md`、Plan v0.1、CR、Spec、产品代码、依赖、lockfile、数据库、verification artifacts、支付配置均未改动 | `REVISE ... TO v0.2` 第 7 条 | 无其他文件改动 |

## 待处理的候选台账修正（本轮不执行）

上游修正第 5 条将本轮写入 allowlist 限定为 `PLAN-WALLET-DISCOVERY-RANKING-001-v0.1-candidate.md` 与 `DECISION-LOG.md`，因此以下问题只登记，不修改 `APPROVAL-LOG.md`，留待后续获批执行阶段处理。

1. `APPROVAL-LOG.md` 第 9 行 `PLAN-UI-I18N-GLOSSARY-001 v0.2` 现标为 `APPROVED`，第 10 行 `v0.3` 现标为 `EXECUTION AUTHORIZED / PAUSED`；按上述 `APPROVAL_EVIDENCE_UNVERIFIED` 判定，这两行的状态标记强于实际证据，应补加该标记。

   更新（2026-09-05T08:32:02-0700）：该修正已从「留待后续」改为 Plan v0.2 §4 的 Phase 0 任务 0.5，在 `APPROVE: PLAN-WALLET-DISCOVERY-RANKING-001 v0.2` 之后执行。执行时只追加标记，保留原文字与原结果列，不删除历史行，不补写未曾捕获的精确时间；并在本文件记录原记录、证据缺口、修正后状态、当前 Plan 的前瞻性授权范围四要素。本轮（Plan v0.2 生成阶段）`APPROVAL-LOG.md` 仍未改动。
2. `APPROVAL-LOG.md` 与 `HANDOFF.md` 之间关于 UI 完成度的描述存在历史冲突：较早章节描述 UI 已完成，而 2026-09-05T02:48:12-07:00 的 v0.3 暂停检查点显示 `V-GATE=PAUSED_PENDING`。以最新检查点为准，历史章节不得作为当前代码证据。本轮不修订这些历史文档。
3. 本文件创建前的历史 L0／L1 决策未集中登记，属既有缺口，不回填。

## 未决 L2（不在本文件处置）

无。本轮未触发 L2。
