# CR-UI-CLUSTER-CONSISTENCY-001 v0.1 candidate

状态：DRAFT / CHANGE CONTROL REQUIRED

日期：2026-09-05

## 0. 触发与执行状态

执行 PLAN-UI-I18N-GLOSSARY-001 v0.1 时，主 Codex 对批准来源、实际代码和既有测试进行了独立复核。发现 Workstream A 的 D1 要求与已批准的 Cluster CR/Plan 存在无法通过 UI 层解决的实质冲突；同时 D4 的批准语义尚未贯通实际输入、分析管线和 API 输出。

因此本轮暂停后续实现，不进入 Workstream A 的算法修复，不把 D1/D4 正式 TermHelp 接入 UI，也不继续扩展 Workstream B。该候选仅用于一次合并 Change Control，不修改既有 Spec、CR、Plan、产品代码、依赖、数据库、fixtures、支付配置或环境文件。

在发现阻塞前，主 Codex 已在 UI 变更 allowlist 范围内写入一组未接线的初步文件。它们不是已完成的产品实现，见第 8 节的回滚记录。

## 1. 变更原因与准确证据

### C1：D1 经济方向要求与既有 Cluster 规则冲突

已批准的 PLAN-CLUSTER-LANGUAGE-EVIDENCE-001.md 第 7.1 节明确规定：BUY YES/NO 才是经济方向，SELL 仅作为 context，不能进入 candidate、D1 或 D5/herding。已批准的 CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2 也保留了 v0.1 的 BUY-only 规则，并在对应规则段落重复 SELL 不进入 candidate、D1、D5/herding。

实际实现 src/analysis/cluster-language.ts 的现状与上述批准规则一致：eligibleEntries 在约第 84–105 行拒绝非 BUY 交易；D1 在约第 125–133 行按 raw YES/NO 计数；herding 与 formal gate 在约第 175–207 行继续使用 BUY-only 的候选与 raw outcome。

当前已批准的 PLAN-UI-I18N-GLOSSARY-001 v0.1 却要求 Workstream A 将四种组合全部归一化：BUY YES、SELL NO 进入 YES exposure，BUY NO、SELL YES 进入 NO exposure，并要求 SELL 参与 D1 的一致性核验。这不是局部 UI 映射：允许 SELL 进入 eligibility 会影响 candidate、cluster size、D2–D6、D5/herding 及 formal gate；只改 D1 计数则会造成同一候选的输入集合与正式 gate 不一致。

既有测试也证明当前规则不是遗漏实现：tests/unit/cluster-language.test.ts 现有用例明确断言 SELL 被排除。该用例与 UI Plan 的 A 要求不能同时作为通过条件。

结论：C1 是批准规则之间的实质冲突，不是测试命名问题，也不是可以只修改 Glossary 文案解决的问题。

### C2：D4 语义未贯通实际数据管线与 API

批准的 D4 语义是：截至 as-of cutoff，prior_trade_count 小于或等于 2 的 eligible 成员比例；unknown 或 incomplete history 不进入分子或分母，并显示 coverage。

实际实现 src/analysis/cluster-language.ts 第约 151–154 行已经具有 thin-history 的局部计算形态：使用 prior_trade_count 小于或等于 2，并以已知成员计算 coverage。但 history_complete 缺失时的处理不是严格的“unknown 不纳入”：只要 count 存在，当前 evaluator 可能把缺少 history_complete 的记录当作 known。

更重要的是，src/normalize/index.ts 第约 90–111 行的 Trade 归一化对象没有 carrying prior_trade_count、history_complete 或 profile createdAt；src/engine/analyze.ts 第约 77–100 行构造 ClusterTradeInput 时也没有把这些字段从 bundle 传入，并且 baseline_trades 当前为空数组。src/contracts/index.ts 的 Trade contract 没有这些历史覆盖字段，现有 report/API 映射也没有可核验的 first_trade_ratio 数值输出。

结论：当前代码无法证明 D4 数值已经从合法输入、as-of cutoff 和 no-lookahead 管线到达 API，也无法完成“API 数值与 UI 映射一致”的 contract test。若加入字段传输或 API 暴露，范围会进入数据模型/API contract 变更，不属于只改 UI 文件的执行范围。

### C3：D1/D4 的测试基线会发生冲突

当前 SELL-excluded 单元测试必须在 C1 决定后才能保留或重写；现有 cluster integration 主要覆盖 empty baseline 导致的 insufficient_baseline，不能证明四种 side/outcome 组合、tie、unknown、coverage、cutoff、no-lookahead 或 D4 API 数值。

如果直接修改测试以满足 UI Plan，而不先修订批准的 Cluster 规则，会把测试变成对未批准算法的先行批准；如果只保留当前测试，又无法满足 UI Plan 的 A 目标。

## 2. 建议的单一变更边界

本候选建议将 C1、C2、C3 合并为一次 Change Control，批准后才允许更新执行基线。以下内容是唯一推荐的技术决议草案；它不在本轮实施。

### 2.1 D1 推荐修订

将 Cluster 的候选交易方向统一定义为 economic exposure：

| 原始组合 | economic exposure |
| --- | --- |
| BUY YES | YES |
| SELL NO | YES |
| BUY NO | NO |
| SELL YES | NO |
| 缺失或不可确定 | unknown，不进入分子或分母 |

为避免只修 D1 而造成内部不一致，Change Control 必须同时明确：

1. SELL 是否进入 eligible candidate；推荐答案是进入，但必须满足与 BUY 相同的时间、size、price、wallet 和市场资格条件。
2. candidate 的每 wallet 选取、cluster size、D2–D6 输入、D5/herding 输入及 formal gate 是否全部使用 economic exposure；推荐答案是全部使用同一归一化结果。
3. tie 的行为保持现有阈值与 herding 规则不变；没有唯一最高方向时不伪造 dominant direction，按现有 insufficient/indeterminate contract 处理，并在测试中固化。
4. as-of cutoff 先于方向统计应用；cutoff 之后的交易不能影响候选或历史计数。
5. unknown 不进入相应比例分子或分母，coverage gate 与既有阈值不被静默放宽。

这会修订现有 BUY-only Cluster 规则。它不应通过 UI Glossary 或标签变更掩盖。

### 2.2 D4 推荐修订

将 D4 作为同一份 Change Control 的数据完整性事项处理：

1. 明确 history_complete 的缺失、false、null 和 prior_trade_count 缺失都表示 unknown；仅 count 与明确 complete=true 的记录进入 known 集合。
2. 将 prior_trade_count、history_complete、as-of cutoff 所需的来源/provenance 以现有模型允许的最小方式从上游输入传到 cluster evaluator。
3. 仅在现有 API contract 明确允许的字段中映射数值；若必须新增 API 字段、修改 Trade contract 或报告 schema，必须在本次 Change Control 的文件矩阵中显式批准，不能隐式加入 UI 实施。
4. 保留内部兼容字段 first_trade_ratio；UI 只显示 交易历史稀薄度 / Thin-History Ratio。
5. 显示 known coverage 与 unknown count；不得将 unknown history 成员计入分子或分母。
6. D4 的 contract test 必须以同一份 API payload 证明数值、coverage、unknown count 和 UI label 映射一致。

### 2.3 Workstream B 继续条件

Workstream B 只有在 Workstream A 的 D1/D4 contract 与测试通过后，才允许把 D1、D4 的正式 Glossary/TermHelp 接入 UI。其他已批准的 i18n 工作可在相同代码变更中继续，但不得假设 D1/D4 的语义已经解决。

## 3. 影响范围与待批准文件矩阵

下表区分“必须由本 Change Control 允许的范围”和“保持禁止”。精确的最终 allowlist 只有在该候选批准后才生效。

| 目的 | 候选文件 | 是否可能修改 | 测试要求 | 备注 |
| --- | --- | --- | --- | --- |
| economic exposure 归一化、eligibility、formal gate、herding 一致性 | src/analysis/cluster-language.ts | 是 | cluster unit/contract/integration | 现有实现文件；不得只改 label |
| 上游历史字段进入 evaluator | src/normalize/index.ts | 待批准 | normalize/contract/no-lookahead | 只有确认现有输入已有合法字段时才可列入 |
| 分析输入映射 | src/engine/analyze.ts | 待批准 | recorded replay/integration | 需证明不改变其他报告行为 |
| 交易/历史数据类型 | src/contracts/index.ts 或实际对应 contract 文件 | 待批准 | typecheck/API contract | 如需新增字段，构成明确 contract scope |
| report/API 的 D4 数值与 coverage 映射 | 实际 report/API mapping 文件 | 待批准 | API contract/E2E | 必须先由 route inventory 确认确切文件 |
| D1/D4 回归用例 | tests/unit/cluster-language.test.ts 及实际相关测试文件 | 是 | 组合、tie、unknown、cutoff、no-lookahead | 必须先解决 C1/C2 |
| 双语 UI、Glossary、TermHelp | app/page.tsx、app/page-client.tsx、app/globals.css、src/ui/i18n.ts、src/ui/glossary.ts、src/ui/term-help.tsx、src/reports/markdown.ts 及实际批准 allowlist | 仅在 A-GATE 后 | UI unit/integration/E2E/a11y/visual | D1/D4 正式术语不得提前接线 |
| i18n E2E 与 UI verification | tests/e2e/app.spec.ts | 是 | locale/cookie/metadata/a11y/recorded isolation | 不能使用 synthetic 用户 Demo |
| Spec、既有 Cluster CR/Plan、API contract、依赖、lockfile、数据库、fixtures、支付 | 所有对应文件 | 否，除非另行在本 CR 明确批准 | integrity hash/clean-room | 不得隐式扩大 |

如果实施时发现上表的“待批准”文件不可避免，必须在批准后的执行前将它们加入一份确定的 allowlist；不得以“实际需要”为理由静默写入。

## 4. 不变量

以下行为在本 Change Control 中保持不变，除非矩阵明确声明并获得批准：

- API 路径、现有 API JSON 字段、枚举和错误 envelope；
- x402 V2 scoped 包、HTTP 402、payment-required header、价格、网络、facilitator、payTo 和 payment-identifier 幂等；
- Summary 免费、Attribution Detail 的支付边界和所有别名边界；
- recorded/live/unavailable/provider_unavailable 的真实状态语义；
- 不生成或展示 synthetic 用户 Demo；
- evidence hash、原始 URL、原始标题、原始引文和既有 fixtures；
- 既有 D1–D6 阈值、herding veto 和 no-lookahead 原则，除上述经济方向范围明确修订外；
- GUI/CLI/APP、MCP、Chrome Extension、ERC-8004、WebSocket 等既有入口；
- 不执行支付、签名、链上交易、migration、发布或外部付费调用。

## 5. 必要验证

批准并实施后，至少必须完成：

1. BUY/SELL × YES/NO 四种组合的 economic exposure 单元测试；
2. unknown、tie、coverage gate、as-of cutoff 和 no-lookahead 测试；
3. D2–D6 与 herding 输入集合一致性测试；
4. D4 history_complete 缺失/false/null、prior_trade_count 缺失和 unknown exclusion 测试；
5. recorded replay，证明 D1/D4 不读取 cutoff 之后的数据；
6. API contract test，证明 first_trade_ratio（若仍对外提供）、coverage、unknown count 与 UI Thin-History Ratio 映射一致；
7. 现有 API/x402 不变量、价格、headers、支付边界和别名等价测试；
8. i18n、TermHelp、cookie SSR、metadata、keyboard、mobile、200% zoom、reduced-motion、Audit Markdown 双语导出测试；
9. synthetic isolation、secret scan、源代码/lockfile/protected-file hash 和 clean-room verification；
10. typecheck、lint、完整现有测试、build、Playwright 和 recorded Demo 验收。

## 6. 预算、外部资源与安全边界

- 不需要安装新依赖；若实施发现必须新增依赖，立即暂停并将其加入同一份 Change Control，不得现场安装。
- 不需要真实支付、钱包签名、链上交易、主网连接、外部付费 API 或公开发布。
- 允许使用现有本地 node_modules、recorded fixtures 和既有免费只读端点进行验证。
- 任何新的 API key、数据库字段、迁移、服务或架构均超出本候选默认范围。
- 不读取、输出或持久化 Secret；日志与测试输出必须脱敏。

## 7. 失败与回滚

### 实施前

本轮不回滚任何已批准文件。实施前应保存所有候选修改文件的 SHA-256 和安全备份；项目当前没有可用 Git 仓库，不能依赖 git reset 或 git checkout。

### 实施后

只恢复本次 Change Control 实际修改且已记录 hash 的文件：使用修改前安全备份或逐文件 hash 校验后的副本恢复；不得删除或覆盖未知路径，不得触碰用户已有变更。恢复后重新执行 protected-file hash、typecheck、targeted tests 和 clean-room verification。

如果仅 UI 变更失败，先按 UI allowlist 回滚；如果 A 的算法或数据管线失败，按 A 的文件子集回滚。两者必须保持隔离，不能通过回滚 UI 掩盖 Cluster contract 失败。

## 8. 当前工作区事实与初步写入记录

主 Codex 在发现 C1/C2 前已创建以下未接线、未验证的初步 UI 文件：

- src/ui/i18n.ts
- src/ui/glossary.ts
- src/ui/term-help.tsx
- src/reports/markdown.ts
- app/page-client.tsx（当时为 app/page.tsx 的副本，尚未替换入口）

这些文件不构成已完成实现，也没有修改产品入口、Cluster 算法、API、Spec、Plan、依赖、lockfile、数据库或支付配置。后续获批执行前必须先审查其内容、重新生成 hash，并决定保留、修订或按逐文件备份安全恢复。

本轮新增本候选文件本身是一次 Change Control 文档写入。

## 9. 主 Codex 裁决

裁决依据优先级为：

1. 当前用户明确批准的 UI Plan 与其 D1/D4 要求；
2. 已批准的 CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2；
3. 已批准的 PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1；
4. 实际代码路径与可复现测试；
5. Glossary/UI 候选中的展示要求。

按此优先级，不能把 UI Plan 的 A 要求解释成只改 UI，也不能把既有 BUY-only 规则解释成已经支持 SELL 经济归一化。C1 与 C2 必须由一份明确的 Change Control 先统一；在此之前继续实现会违反已批准范围。

## 10. 单一批准口令

批准本候选后，才允许主 Codex 将上述推荐修订转化为明确执行 allowlist，并继续相应的代码、测试、文档和最终验证；本口令不授权真实支付、链上交易、migration、安装依赖或修改 Spec，且不替代任何新增范围的安全审批。

APPROVE: CR-UI-CLUSTER-CONSISTENCY-001 v0.1
