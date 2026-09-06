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
| 2026-09-05T08:45:00-0700 | L2 | 提交 `WUDP-WALLET-DISCOVERY-001`：要求分支 `feature/wallet-discovery` 与受保护 worktree `/Users/a0000/polymarket-release` 均不存在（工作区非 Git 仓库），暂停等待裁定 | Plan v0.2 §18「已批准规范之间不可调和冲突」、§3.2 越出授权文件矩阵；`git init`＋建分支＋建 worktree 属创建基础设施，Plan 未授权 | 无文件改动 |
| 2026-09-05T08:45:00-0700 | L1 | 撤回上一轮「`/Users/a0000/polymarket-release` 与 `/private/tmp` 快照不存在」的判断，改记为「不可核验」 | 该两路径位于执行沙箱挂载边界之外，`ls` 失败只证明沙箱不可见，不能证明宿主不存在。禁止把工具边界失败写成事实结论 | 无文件改动；更正见 WUDP §2 |
| 2026-09-05T08:56:45-0700 | L0 | 按 `APPROVE: WUDP-WALLET-DISCOVERY-001 OPTION C` 恢复：完成只读 Git 拓扑／remote／worktree／hash／完整性核验，11 个 hash 全部 MATCH，`git status` clean，分支为 `feature/wallet-discovery`，HEAD `81bfa49c` | 调用方 `GITHUB-BOOTSTRAP-AND-WORKTREE: COMPLETE` 报告第 1 条；Plan v0.2 §4 任务 0.1 | 写入 `VERIFICATION.md`（新增 Phase 0 resume 章节） |
| 2026-09-05T08:56:45-0700 | L0 | 任务 0.3 CR 完整性比对 **MATCH**：`b9de0215…d87a335` 与 Plan v0.2 §1 固定值一致，未触发 `CR_INTEGRITY_MISMATCH`；只比对、未改写已批准 hash | Plan v0.2 §1.2 | `VERIFICATION.md` |
| 2026-09-05T08:56:45-0700 | L0 | 将 baseline commit `81bfa49c` 与 tag `alibi-dev-snapshot-v0.1` 的注释缺失标记记为 `L0 reporting difference`，不 amend、不重写 tag、不 force push、不暂停；权威状态以 `VERIFICATION.md`／本文件／amendment 为准 | 调用方指令第 7 条与 AMENDMENT；Git 历史重写属破坏性操作且未获授权 | `VERIFICATION.md`（记录差异表） |
| 2026-09-05T08:56:45-0700 | L0 | 独立复核 Secret scan 得 PASS，未采信报告结论即放行：三个 tracked `.env.*.example` 敏感键值全为空；`.env.local` 未被跟踪；993 个 tracked 文件的私钥／API token 模式扫描仅命中 solc build-info 内 16 个唯一 64-hex，逐个查证为 9 个 `keccak256` 源码哈希＋7 个 `PUSH32` event topic，无私钥 | 安全红线「不接收、保存或输出用户私钥」；不伪造测试与证据 | `VERIFICATION.md`；未回显任何值 |
| 2026-09-05T08:56:45-0700 | L0 | 查明 release worktree 被标 `prunable` 的成因为 `gitdir` 指向沙箱挂载边界外的 `/Users/a0000/polymarket-release/.git`，属沙箱可见性假象而非宿主仓库损坏；据此确立常设禁令：本沙箱内永不执行 `git worktree prune` | 该命令会摘除健康的 release worktree 注册，属不可逆破坏；调用方指令第 5 条要求不得修改 release worktree | `VERIFICATION.md`（常设禁令） |
| 2026-09-05T08:56:45-0700 | L0 | 回滚模式由 Plan v0.2 §11.3（非 Git 逐文件备份）切换为 §11.2（Git 模式），锚点 `81bfa49c`，唯一开发分支 `feature/wallet-discovery`；同时记明该锚点**包含**未验证的 UI v0.3 改动，是来源锚点而非已知良好状态 | §11.1 记录的非 Git 前提已因外部 bootstrap 失效；§11.2 要求 baseline 不得被当作已验证基线 | `VERIFICATION.md` |
| 2026-09-05T08:56:45-0700 | L0 | 确认 UI v0.3 六个文件 hash 与暂停检查点逐一一致，`V-GATE=PAUSED_PENDING` 与 A／B-GATE、`RUNNABLE_DEMO_COMPLETE`、`FULLY_LIVE_VERIFIED` 全部保持原值；baseline commit 的存在不得解释为功能已验证 | 调用方 AMENDMENT；Plan v0.2 §2.1 | `VERIFICATION.md` |
| 2026-09-05T08:56:45-0700 | L0 | `/private/tmp` v0.3 快照不可核验一事按调用方裁定关闭，不触发回滚，依据是六个文件当前 hash 与暂停检查点一致 | 调用方 `OPTION C` 消息明示裁定 | 无文件改动 |
| 2026-09-05T08:56:45-0700 | L0 | ONNX 约 51.91 MB 已知且已推送，本轮不迁移 Git LFS、不删除、不重新下载，不因此暂停 | 调用方指令第 8 条 | 无文件改动 |
| 2026-09-05T08:59:16-0700 | L0 | 执行 Phase 0 任务 0.5：为 `APPROVAL-LOG.md` 第 9、10 行追加 `APPROVAL_EVIDENCE_UNVERIFIED` 标记，只追加、不删原文、不改原结果列、不补写虚假时间；四要素见下节 | Plan v0.2 §2.4 第 5 点、§4 任务 0.5、§10.2；`REVISE ... TO v0.2` 第 5 条 | `APPROVAL-LOG.md`（修改前 SHA-256 `667ab20bfc426be7bd94668de9d9ab13ec16148bf5933bc5e289762a42c12a89`，21 行） |
| 2026-09-05T08:59:16-0700 | L0 | 补记 `PLAN-WALLET-DISCOVERY-RANKING-001 v0.2`＋`START: SLEEP-SAFE AUTONOMOUS EXECUTION` 与 `WUDP-WALLET-DISCOVERY-001 OPTION C`（含 AMENDMENT）两行批准；日期只写日期，不补写未捕获的精确挂钟时间 | 台账须反映实际生效的批准；`APPROVAL-LOG.md` 现有「补记行只写日期」规则 | `APPROVAL-LOG.md` 新增 2 行 |
| 2026-09-05T08:59:16-0700 | L0 | 任务 0.4 更正失效指针：`APPROVAL-LOG.md`「当前等待的下一道审批门」原写 `APPROVE: PLAN-WALLET-DISCOVERY-RANKING-001 v0.1`，与实际落地的 v0.2 批准矛盾，改记为已作废并说明 v0.1 永不执行；同时说明 Phase 3 是前置条件门而非审批门 | v0.1 为历史未批准 candidate，把它列为待批门会误导后续审批；只更正指针、不删除历史批准行 | `APPROVAL-LOG.md` 尾部章节 |
| 2026-09-05T09:08:18-0700 | L0 | 记录三份治理文件本轮写入后的 SHA-256：`APPROVAL-LOG.md` `c6b63e74…97197f5b`（29 行）、`DECISION-LOG.md` `9bfd1eed…7eb343bc`、`VERIFICATION.md` `f453458e…4507cf63`；并实测确认本轮 `git status` 仅 3 个文件 modified，9 行批准表结构完整 | 任务 0.5 只记录了变更前 hash，未记录变更后 hash，构成可核验性缺口 | 无文件改动（只读核验） |
| 2026-09-05T09:08:18-0700 | L0 | 任务 0.2 在 §11.2 Git 模式下**不创建**带时间戳备份副本，改以 baseline commit `81bfa49c` 承担备份职能，并将该处置显式写入 `VERIFICATION.md` 而非静默跳过 | 证据而非假定：`APPROVAL-LOG.md` 在 baseline 中的 blob 与任务 0.5 编辑**前**独立捕获的 `667ab20b…42c12a89` 逐字节一致，证明 baseline 确实保存了变更前内容；§11.3 的备份前提已因仓库存在而失效 | `VERIFICATION.md` 新增任务 0.2 章节 |
| 2026-09-05T09:08:18-0700 | L0 | 完成 §10 allowlist 全量变更前清单：18 个既有文件的 baseline blob hash／大小／权限／index mode，8 个 §10.1 新增路径记为「不存在」 | Plan v0.2 §4 任务 0.2 | `VERIFICATION.md` |
| 2026-09-05T09:08:18-0700 | L0 | 实测确认 13 个代码文件（contracts／adapters／rankings／routes／UI 六件套／reports）与 baseline 逐字节一致，本轮仅 3 份治理文档被修改；据此二次确认 UI v0.3 六文件冻结未被破坏 | 任务 0.2 清单比对结果；调用方 AMENDMENT 要求保持六文件内容与 hash 不变 | 无代码改动 |
| 2026-09-05T09:08:18-0700 | L0 | 记录权限往返缺口：工作树为 `600`，Git index 为 `100644`，本沙箱 `umask=0022`，故 `git checkout` 式回滚会把文件恢复成 `644`。要求未来回滚后补 `chmod 600`，不假定权限自动往返 | Git 不保存 owner-only 位；不记录则回滚会静默放宽敏感文件权限 | `VERIFICATION.md`（回滚注意事项）；本轮未改任何权限 |
| 2026-09-05T09:54:44-0700 | L1 | **撤回**首轮「29 个探针全部 HTTP 200、无 429、无限流响应头」的判断。本沙箱经 CONNECT 代理出网，每份 `.headers.txt` 首行是代理自身的 `HTTP/1.1 200 Connection established`，`head -1` 因此把失败探针也读成 200。改用 `grep -aoE '^HTTP/[0-9.]+ [0-9]{3}'` 取**末**行，实测为 24× `HTTP/2 200`＋5× `HTTP/2 400` | 不得把工具伪影写成事实结论；该错误读法同时会让「无 429／无限流头」成为不可靠推论 | `VERIFICATION.md` §1.0 第 1 条 |
| 2026-09-05T09:54:44-0700 | L0 | 限流状态记为 `UNKNOWN` 而非「已确认无限流」：全部响应头 `retry-after|x-ratelimit|ratelimit-` 零命中且从未收到 429，但探针间隔约 2 秒、从未逼近任何阈值，因此只能证明**未观测到**限流 | 未观测 ≠ 不存在；Phase 2 不得假定无限吞吐 | `VERIFICATION.md` §1.1 |
| 2026-09-05T09:54:44-0700 | L0 | 重探 `lb-off1500/2000/5000/10000` 四个只有 body、无 `.headers.txt` 的探针（实测均 200、`ssl_verify_result=0`）；重探覆盖了原 body，故所有 leaderboard offset 结论按**新字节**重新推导，不沿用旧数字 | 状态码未落盘即不可断言；用旧结论配新证据等于伪造证据链 | `VERIFICATION.md` §1.0 第 2 条 |
| 2026-09-05T09:54:44-0700 | L0 | 判定 `/trades` 疑似排序倒置为 **Cloudflare 陈旧缓存**而非数据不一致：`tr-head2` 为 `cf-cache-status: HIT`、`age: 67`、`last-modified: 16:51:02`，而 `tr-snap2`／`tr-o9999b`／`tr-o5000b` 为 EXPIRED／MISS／MISS 且严格 DESC。据此确立契约规则：`as_of` 必须由 `date`／`last-modified`／`age` 推导，不得等同于请求时间 | 同一 URL 相隔数秒的两次读取新鲜度可不同；leaderboard 观测到 `age` 高达 1150s | `VERIFICATION.md` §1.0 第 3 条、§1.1 |
| 2026-09-05T09:54:44-0700 | L0 | 保留「合成 DNS 下 HTTP 200 本身不构成触达真实基础设施的证据，判别依据是 TLS 链校验 `ssl_verify_result=0`」的表述，不upgrade为「已确认绕过透明代理」 | 本沙箱把所有主机名解析进 `198.18.0.0/15`；只陈述可核验的部分 | `VERIFICATION.md` §1.1 |
| 2026-09-05T09:54:44-0700 | L0 | 实测分页边界并按 §5.3 以实测覆盖文档：三处**静默截断**（leaderboard `limit`、`/activity` `limit`、`/closed-positions` `limit`、`/trades` `limit`）、两处**硬报 400**（`/activity` offset>5000、`/trades` offset>10000，后者边界**含** 10000）、一处**文档上限根本不存在**（leaderboard offset 文档 ≤1000，实测 10000 仍返回 rank 10001–10050） | Plan v0.2 §5.2、§5.3 | `VERIFICATION.md` §1.2 |
| 2026-09-05T09:54:44-0700 | L0 | 记录两条 Phase 2 必须显式编码而非推断的分页语义：静默截断端点上「返回行数少于请求数」不能作为唯一终止条件；`/trades` `offset=5000` 对应 bulk 索引 **4999**（偏移相对零基索引错一位），而 `offset=9999` 与 `bulk[9999]` 精确一致 | 实测；若按直觉实现会静默丢行或重复行 | `VERIFICATION.md` §1.2 |
| 2026-09-05T09:54:44-0700 | L0 | 在 Plan §5.1 列举的四个端点之外**增加探测** `/trades`。理由为实测否证：`/activity` 500 行仅跨 40.0 分钟、12.5 行/分，叠加硬性 5000 offset 上限后最多只能触达约 5500 行 ≈ **7.33 小时**，90 天需约 160 万行，故其无法支撑 `realized_pnl_7d`／`total_trades`／`flip_rate` | 只读公开探测在授权边界内；把无法支撑的假设留到 Phase 2 才发现代价更高。**注意：把 `/trades` 纳入 Phase 2 adapter 面属超出 §5.1 枚举范围，已登记为待裁定 L2，本轮不实施** | `VERIFICATION.md` §1.3、§1.7；无代码改动 |
| 2026-09-05T09:54:44-0700 | L0 | 记录 `/closed-positions` 排序键为 `realizedPnl` **DESC 而非 `timestamp`**（首页 2026-05-19 与 2026-08-28 交错），故 7 天窗口必须**全量枚举、不得提前终止**；并以 `pnl ≈ totalBought*(curPrice-avgPrice)`（8 组比值 0.7993–1.0000）证明 `realizedPnl` 单位是十进制 USDC，不是 6 位定点整数 | 按时间戳提前终止会静默丢弃合格行；单位判错会使金额差 10^6 倍 | `VERIFICATION.md` §1.4 |
| 2026-09-05T09:54:44-0700 | L0 | 将 `outcomeIndex: 999` 判为 `unavailable` 哨兵值，**不得映射为 0**：按类型分布 TRADE {999:1, 0:239, 1:169}、REDEEM {999:5,…}、MERGE {999:17}，其中 1 行是真实 TRADE | 已批准契约「缺失值不得填 0」；`/trades` 一万行中 999 计数为 0，说明该值端点相关 | `VERIFICATION.md` §1.4 |
| 2026-09-05T09:54:44-0700 | L0 | 记录 `/activity` 中 `side`／`asset` 的空值为**结构性而非缺失**：恰好在 MERGE(17)＋REDEEM(74)=91 行为空、409 个 TRADE 行全部有值，故聚类逻辑必须先过滤 `type=="TRADE"` 再读 `side` | 把结构性空值当缺失数据会污染 D1 同向比例 | `VERIFICATION.md` §1.4 |
| 2026-09-05T09:54:44-0700 | L0 | 记录 `account_age_days`／`Profile Age` 在本轮所测五个端点中**均不可得**：`/activity` 无 `createdAt`，`/v1/leaderboard` 8 字段无年龄字段（且 `rank` 为字符串），其余端点亦无；该字段状态记为 `UNKNOWN`，仍依赖已批准契约指定的 public-profile `createdAt` 来源 | 不得因端点缺字段就改写已批准契约，也不得假称可从现有端点推导 | `VERIFICATION.md` §1.4、§1.7 |
| 2026-09-05T09:54:44-0700 | L0 | 记录 `prices-history` 不可假定均匀网格与唯一时间戳：`ph-max` 253 点跨 1.74 天、步长非均匀（121s、576–584s…）；`ph-fid`（`interval=1d&fidelity=1`）1441 点跨 1.00 天、步长为 **0**（时间戳重复） | 重定价窗口算法若假定均匀网格会在真实数据上错位 | `VERIFICATION.md` §1.5 |
| 2026-09-05T09:54:44-0700 | L0 | 大响应体（每份 >7MB）采用「先对原文取 SHA-256 → 验证 `zcat \| sha256sum` 往返一致 → 才删除原文」的证据链，保留 `.gz` 与 `large-body-hashes.txt`；删除原文需 `mcp__cowork__allow_cowork_file_delete` | 先压后删会使压缩件失去可核验来源；往返校验是压缩件可采信的前提 | `artifacts/verification/wallet-discovery-001/large-body-hashes.txt`；`VERIFICATION.md` §1.6 |
| 2026-09-05T09:54:44-0700 | L0 | 明确本轮**未**执行 build／typecheck／lint／test，`HANDOFF.md` 的「28 Vitest 文件／82 测试／15/15 Playwright」为引用而非本轮实测；本轮未提交任何 Git commit；预算支出 USD 0.00（全部为免费公开只读 GET，未调用下单／撤单／余额授权／交易认证接口，未发送任何凭据） | 不伪造测试与证据；安全红线「Polymarket 只读」 | 无 |

## Phase 0 任务 0.5 四要素记录（2026-09-05T08:59:16-0700）

Plan v0.2 §2.4 第 5 点要求对每一条被修正的台账行记录四要素。以下为逐行记录。修正方式一律为**追加标记**：原结果列文字、原备注文字、原日期写法全部保留，未删除任何历史行，未补写任何未曾捕获的精确挂钟时间。

### `APPROVAL-LOG.md` 第 9 行 — `PLAN-UI-I18N-GLOSSARY-001 v0.2`

1. **原记录**：日期列「2026-09-05（未捕获精确挂钟时间）」，批准命令 `APPROVE: PLAN-UI-I18N-GLOSSARY-001 v0.2`，结果列 `APPROVED`，备注说明系补记、原始记录只存在于 `HANDOFF.md`。
2. **证据缺口**：`APPROVED` 的全部文字依据均来自执行方自述文档 —— `HANDOFF.md:295`、`CHANGELOG.md:76`、`VERIFICATION.md:366`。这三处都是执行方自己写的，不构成独立批准证据；未捕获任何带挂钟时间的批准记录。执行方自述「已获批准」与「确实获得批准」是两件事，代码已实现也不等于 Plan 已获批准。
3. **修正后状态**：`APPROVED` + `APPROVAL_EVIDENCE_UNVERIFIED`。结果列本身不改写为其他状态，因为无证据支持批准发生，同样也无证据支持批准未发生；标记的作用是把不确定性显式化，而非替换为相反结论。
4. **当前 Plan 的前瞻性授权范围**：Plan v0.2 §2.1.1 的前瞻性授权不覆盖本行。本行是历史 v0.2 执行记录，其审批真实性仍然未定，标记必须保留至找到精确批准证据为止。

### `APPROVAL-LOG.md` 第 10 行 — `PLAN-UI-I18N-GLOSSARY-001 v0.3`

1. **原记录**：日期列「2026-09-05（未捕获精确挂钟时间）」，命令 `EXECUTE: PLAN-UI-I18N-GLOSSARY-001 v0.3`，结果列 `EXECUTION AUTHORIZED / PAUSED`，备注含 Plan SHA-256 `ce88cf93…1bfe4f1`、用户主动暂停、`V-GATE=PAUSED_PENDING`、不得自动恢复。
2. **证据缺口**：`EXECUTION AUTHORIZED` 的文字依据只见于 `HANDOFF.md:313`、`VERIFICATION.md:366`，同为执行方自述；未捕获独立的带挂钟时间批准记录。注意暂停事实本身证据充分（六个文件 hash 与检查点一致、`VERIFICATION.md` 有完整暂停章节），缺口仅在于**授权**部分。
3. **修正后状态**：`EXECUTION AUTHORIZED / PAUSED` + `APPROVAL_EVIDENCE_UNVERIFIED`。`PAUSED` 与 `V-GATE=PAUSED_PENDING` 不受影响，继续有效。
4. **当前 Plan 的前瞻性授权范围**：本行的**后续**执行权限由 Plan v0.2 §2.1.1 前瞻性授权提供，具体为四项 —— 保留现有 UI v0.3 工作区改动；恢复并完成其缺失验证；满足 A-GATE／B-GATE／V-GATE；然后进入 Wallet Discovery Phase 3。四项明确排除：不追溯批准本行历史记录；不追认第 9、10 行的审批真实性；不得把已实现的 v0.3 代码复述为「当时已正式获批」；不得补写时间戳或批准命令。也就是说，v0.3 的**未来**动作已有合法授权，其**过去**审批仍标记为未核验。

本次未发现第 9、10 行之外的其他证据不足行，因此未触发 Plan v0.2 §4 任务 0.5 的「越出范围即升级 L2」条件。

## 待处理的候选台账修正

上游修正第 5 条将本轮写入 allowlist 限定为 `PLAN-WALLET-DISCOVERY-RANKING-001-v0.1-candidate.md` 与 `DECISION-LOG.md`，因此以下问题只登记，不修改 `APPROVAL-LOG.md`，留待后续获批执行阶段处理。

1. `APPROVAL-LOG.md` 第 9 行 `PLAN-UI-I18N-GLOSSARY-001 v0.2` 现标为 `APPROVED`，第 10 行 `v0.3` 现标为 `EXECUTION AUTHORIZED / PAUSED`；按上述 `APPROVAL_EVIDENCE_UNVERIFIED` 判定，这两行的状态标记强于实际证据，应补加该标记。

   更新（2026-09-05T08:32:02-0700）：该修正已从「留待后续」改为 Plan v0.2 §4 的 Phase 0 任务 0.5，在 `APPROVE: PLAN-WALLET-DISCOVERY-RANKING-001 v0.2` 之后执行。执行时只追加标记，保留原文字与原结果列，不删除历史行，不补写未曾捕获的精确时间；并在本文件记录原记录、证据缺口、修正后状态、当前 Plan 的前瞻性授权范围四要素。本轮（Plan v0.2 生成阶段）`APPROVAL-LOG.md` 仍未改动。

   **已结（2026-09-05T08:59:16-0700）**：Phase 0 任务 0.5 已执行完毕，第 9、10 行均已追加 `APPROVAL_EVIDENCE_UNVERIFIED`，四要素见上节。本条不再是待处理项。
2. `APPROVAL-LOG.md` 与 `HANDOFF.md` 之间关于 UI 完成度的描述存在历史冲突：较早章节描述 UI 已完成，而 2026-09-05T02:48:12-07:00 的 v0.3 暂停检查点显示 `V-GATE=PAUSED_PENDING`。以最新检查点为准，历史章节不得作为当前代码证据。本轮不修订这些历史文档。
3. 本文件创建前的历史 L0／L1 决策未集中登记，属既有缺口，不回填。

## 未决 L2（不在本文件处置）

以下三项已触发 L2，按治理要求合并为**单个** `WUDP-WALLET-DISCOVERY-002` 提交裁定，本文件只登记、不处置、不自行决定。Phase 1 已完成并已落盘；Phase 2 在裁定前**不启动**。

1. **90 天窗口不可计算 → 属已批准契约的实测冲突（Plan v0.2 §18「已批准规范之间不可调和冲突」）。** 实测 `/trades` 一万行仅跨 20.72 天且 offset 硬性封顶 10000，`/activity` 最多触达约 7.33 小时。已批准 CR v0.2 中依赖 90 天窗口的字段无法由本轮所测端点算出。可选处置只能由裁定方选择，不由执行方选择：改为返回 null＋`data_status`＋limitation；或缩短窗口定义；或引入新数据源（后者另属依赖／契约变更）。**不得填 0，不得静默缩短窗口。**
2. **把 `/trades` 纳入 Phase 2 adapter 面超出 Plan §5.1 枚举的四个端点**，且会替换现行「90 天单页」取数路径，触及 Plan v0.2 任务 2.10「新增直接依赖、数据库或 API contract 变更即 L2」。本轮只做了只读探测（在授权内），**未改任何代码**。
3. **指令冲突，不由执行方单方消解。** 常设 `SLEEP-SAFE AUTONOMOUS EXECUTION: RESUME` 第 3 条要求「连续推进 Phase 1、Phase 2」；后到的 `PROMPT-ALIBI-UI-IO-CONSOLIDATED-CHANGE v1.0` 要求「保持 Plan v0.2 暂停。不得直接恢复执行」。两者对 Phase 2 是否启动给出相反指令。

附带记录（不构成 L2，但须与上述一并回报）：`PROMPT-ALIBI-UI-IO-CONSOLIDATED-CHANGE v1.0` 点名的三份权威输入在已上传压缩包中**全部缺失**，按该提示词自身的边界条件判为 `ATTACHMENT_MISSING`，因此本轮**未**生成其要求的三份候选文件。详见下节。

## `ATTACHMENT_MISSING`（2026-09-05T09:54:44-0700）

`PROMPT-ALIBI-UI-IO-CONSOLIDATED-CHANGE v1.0` 要求以三份组长输入为权威依据：`Alibi 输入输出全清单.md`、`alibi-landing-20260904.html`、`alibi-pitch(3).html`。

已上传并解压的 `alibi-trust-agent.zip`（162 个条目／684239 字节／单一顶层目录／无 zip 注释／无嵌套压缩包，解压至 `/tmp/gl/web-ui-review/`）中，`*.html`、`*清单*`、`*landing*`、`*pitch*` 四类通配**零命中**；全部 `.md` 仅 4 份（3 份 agent-run `report.md` ＋ 1 份 critique）。压缩包实际内容是一套完整 Next.js 源码树，其中 `src/rankings/replay.ts`、`src/rankings/ranker.ts`、`app/mcp/route.ts` 与本项目 baseline blob **逐字节一致**。

因此该提示词的边界条件「如果附件缺失：停止并报告 `ATTACHMENT_MISSING`」成立：Task A 的清单逐条比对、Task B 的 UI Reference Map 视觉权威、Task H 的参考截图对比均**无权威来源可依**，不得以记忆或推测代替。视觉 token（`--ink:#17211b`、`--muted:#65746b`、`--paper:#f5f1e8`、`--card:#fffdf8`、`--line:#d8d0c0`、`--accent:#cf4b32`、硬阴影 `10px 10px 0`、小阴影 `5px 5px 0`、CLI 面板 `#18221f`）与默认 IA（`/` 为落地页、`/app` 为现有应用、Analyze 跳转 `?input=&mode=`）可从提示词正文本身复原，但落地页与 pitch 的 HTML 结构、以及输入输出全清单的条目，**不可**复原。

已上传压缩包为只读参考，本轮未从其中复制任何代码进入产品树，未安装依赖，未修改 `package.json` 或 lockfile。

## 崩溃恢复与 Bundle 续写（2026-09-05T18:48Z 之后，`ALIBI-EXECUTOR-CRASH-RECOVERY-AND-BUNDLE v1.0`）

上一个执行窗口（Codex）在写出 Bundle 候选后意外崩溃。本节由接替窗口写入，全部为只读核验 + 文档续写，**未修改任何产品代码**。

| 时间 | 层级 | 决策 | 依据 | 影响文件 |
|---|---|---|---|---|
| 恢复轮 | L0 | 判定崩溃现场工作区「不干净」为**合法遗留进度**而非错误：3 份治理文档 modified（时间戳 08:56–09:54，属已批准 Plan v0.2 Phase 0/1 写入）、1 份 Bundle 候选 untracked（11:45 写入）、2 个 artifacts 目录 untracked。未执行 reset／checkout 覆盖／stash／clean／rebase／force push，未删除任何文件 | 恢复提示词第 1 节规则 1–3 | 无 |
| 恢复轮 | L0 | 独立复算 ZIP inventory hash 得 `fe17e807e6318ef2d9a46afcbc6f8e1d95224e6e72e6936261d24a5f7b2208ee`，与 `recovery-manifest.json` 的 `inventory_sha256` **逐字符一致**（按该文件自述算法复算）。据此判定崩溃前 151 个 artifacts 未被篡改，**允许复用 Phase 1 证据、不重跑网络探针** | 密码学一致性；恢复提示词第 5 节「只有 artifact 缺失／损坏／哈希不一致才允许补探针」 | 无（只读） |
| 恢复轮 | L0 | 四份附件本轮重算 SHA-256：三份与历史值 **MATCH**（清单 `cd3e763a…`、Landing `5c482099…`、Pitch `b6126546…`），ZIP `8f5913b3…` 为新记录。ZIP 复算 202494 字节／162 条目＝98 文件＋64 目录／解压 684239 字节，与 §0.3 记录逐字节一致 | 恢复提示词第 3、4 节 | Bundle §13 |
| 恢复轮 | L1 | **`ATTACHMENT_MISSING` 前提失效，该节被 supersede。** 上节判断在当时正确——三份文档确实不在 ZIP 内，且当时只上传了 ZIP。本轮四份文件已作为**独立附件**上传并全部通过哈希核验，故 Task A／B／H 已有权威来源。**原文一字不删**，仅由本行注记其前提消失 | 恢复提示词第 3 节「ZIP 不是错误附件，不得退出输入序列」；治理规则「不覆盖、不删除历史记录」 | 本文件（追加注记） |
| 恢复轮 | L1 | 记录 provenance 差异：早先指令称 `alibi-pitch(3).html`，实际上传 `alibi-pitch.html`；字节数与 SHA-256 与历史 pitch 值一致，判为同一内容的不同文件名（浏览器重复下载后缀）。**不作为阻塞** | 恢复提示词第 3 节明示「记录差异但不当成阻塞」 | Bundle §13 |
| 恢复轮 | L0 | 记录 `/tmp/zv002-inventory.txt`（§0.3 哈希 `3efb8d4e…6bfdc9f`，98 行）为崩溃窗口临时产物，已随 `/tmp` 消失且其行格式未被记录，本轮**无法复算**。记为 `FORMAT_UNRECORDED_NOT_MISMATCH`，不作为矛盾；98 行文件数与本轮一致 | 不得把不可核验写成矛盾，也不得写成已核验 | Bundle §13.1 |
| 恢复轮 | L0 | 判定 Bundle 候选（33127 字节／372 行／SHA-256 `a7293319…52ce8a36`）为**合法未完成候选**，可安全续写：结构完整、§0–§12 编号连续、结尾停在 §12 末条且无截断句。缺 25 项要求中的 8 项（provenance、ZIP inventory、Phase 1 摘要、可计算性矩阵、当前/目标 API、并行路径、回滚、预算、build/replay/clean-room、DoD）→ 以 §13–§21 追加补齐，**未改写原 §0–§12 任何一字**，故不需要 `-recovered` 后缀 | 恢复提示词第 8 节 | Bundle |
| 恢复轮 | L0 | 核对 Bundle 第 10 行「本轮未修改治理日志」与 `git status` 显示 3 份治理文档 modified 的表面矛盾，判定**不矛盾**：治理文档修改时间戳为 08:56–09:54（Plan v0.2 Phase 0/1 写入），Bundle 写入时间为 11:45，两者属不同轮次。该行陈述其自身轮次，准确 | 时间戳证据；不得把无矛盾写成矛盾 | 无 |
| 恢复轮 | L0 | 本轮**零补充探针**、零网络请求、外部支出 **USD 0.00**；未执行 build／typecheck／lint／test；未 commit；未安装依赖；未改 `package.json`／lockfile；未触碰 `main`、`/Users/a0000/polymarket-release`、`/Users/a0000/polymarket-control`、已批准 v0.7 Spec、历史 CR/Plan | 恢复提示词第 10 节轮次边界 | 无 |
| 恢复轮 | L0 | 未发现本项目遗留进程：3000／3100 端口无监听，无 node／next／playwright／vitest 进程。未清理任何其他进程 | 恢复提示词第 1 节规则 8 | 无 |

### 本轮对 §11 待追加治理行的处置

Bundle §11 列出 7 条「执行阶段须追加」的治理行。其中第 1 条（ZIP 权威更正）与第 5 条（自记录哈希漂移）属**恢复轮职责**，已在上表落地。第 5 条具体说明：`09:08:18` 行记 `DECISION-LOG.md` 为 `9bfd1eed…7eb343bc`，此后本文件持续追加 Phase 1 行、`ATTACHMENT_MISSING` 节与本节，行数由记录时增至当前值，**哈希必然漂移**，属预期增长。**不得为迁就旧记录而改写文件内任何旧值。** 其余第 2、3、4、6、7 条保留至执行阶段。
