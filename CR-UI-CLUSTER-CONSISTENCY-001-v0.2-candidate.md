# CR-UI-CLUSTER-CONSISTENCY-001 v0.2 candidate

状态：DRAFT / 规则冲突修正候选
日期：2026-09-05

## 0. 版本与批准关系

- CR-UI-CLUSTER-CONSISTENCY-001 v0.1 candidate 保留为历史候选，不覆盖、不修改。
- v0.1 未获批准；本文件是 v0.2 candidate。
- 已批准的 PLAN-UI-I18N-GLOSSARY-001 v0.1 因含有四向 economic exposure 要求，不再可执行。
- 本文件只修正 UI Plan 与既有 BUY-only Cluster 规则之间的冲突；不修改已批准的 SPEC-ALIBI-PLATFORM.md v0.7、CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2、PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1、CR-UI-I18N-GLOSSARY-001 v0.2 或任何产品实现。
- 本文件获批后，才可生成 PLAN-UI-I18N-GLOSSARY-001 v0.2 candidate；新 Plan 获批前不得继续代码实施。

本轮仅生成本候选文件。没有运行测试、安装依赖、执行 migration、执行支付、签名、链上交易或修改代码。

## 1. v0.1 → v0.2 精确 Diff

### 1.1 D1 规则

v0.1 的问题：允许并要求 BUY/SELL 四向 economic exposure：SELL NO → YES、SELL YES → NO，并要求 SELL 参与 candidate、D1 及相关一致性修复。

v0.2 的决定：删除并撤销上述四向 economic exposure 要求，恢复并明确既有批准规则：

- BUY YES → YES entry；
- BUY NO → NO entry；
- SELL → context only；
- SELL 不进入 candidate、cluster member count、D1、D2–D6、D5、herding 或 formal alert gate；
- side 或 outcome 缺失、无法确定的交易不进入已知方向分母；
- same_side_ratio 是 eligible BUY entries 中占比最高 outcome 的比例；
- 180 分钟窗口、P99、coverage、as-of cutoff、no-lookahead、herding veto、既有阈值和 alert gate 保持不变；
- 现有 SELL-excluded 回归测试必须保留并加强。

撤销的内容包括：

- SELL NO → YES exposure；
- SELL YES → NO exposure；
- BUY/SELL 四组合全部进入候选；
- 用 economic exposure 替换 BUY-only entry direction。

### 1.2 same_side_ratio Glossary

v0.1 的问题：将 same_side_ratio 写成 economic-direction ratio，并要求 BUY/SELL/YES/NO 归一化。

v0.2 的唯一显示定义：

中文：

“符合候选条件的 BUY 进场记录中，占比最高的 YES 或 NO outcome 比例。SELL 仅作为上下文，不进入该指标。该指标不证明协调、因果或内幕行为。”

英文：

“The highest YES-or-NO outcome share among eligible BUY entry records. SELL records are context only and are excluded from this metric. The metric does not establish coordination, causality, or insider activity.”

内部字段、API 字段、枚举和算法取值不因 Glossary 修订而改变。

### 1.3 D4 数据边界

v0.1 的问题：要求将 D4 数据从 Trade contract、normalize、engine、report/API mapping 接通，并要求用 API payload 证明数值与 UI 映射一致。

v0.2 的决定：本次 UI 国际化不修改 D4 数据管线、API 或 contract。继续保留以下既有语义和安全边界：

- UI 显示名称为 交易历史稀薄度 / Thin-History Ratio；
- 内部兼容字段为 first_trade_ratio；
- 定义为截至 as-of cutoff，历史成交笔数小于或等于 2 的 eligible BUY 成员比例；
- unknown 或 incomplete history 不进入分子或分母；
- unknown 不得当作 0；
- 必须显示已有 coverage 或 unavailable 状态；
- 浏览器端不得补算；
- 不得用 recorded 默认值、synthetic 数据或常量填充；
- 不新增 API 字段，不修改 Trade contract，不修改 normalize、engine、report/API mapping 或数据库。

只有现有可信分析 payload 同时提供 D4 数值和必要覆盖信息时，UI 才显示数值。字段未贯通、coverage 不足或 provenance 不可验证时，UI 显示 unavailable 或 insufficient_evidence，并解释不可用原因。TermHelp 可以解释 D4 定义，但不得把不可用状态伪装成数值结果。

D4 数据贯通如未来需要，必须作为独立产品 Change Request，不纳入本次 UI 国际化。

### 1.4 规则优先级

v0.2 将既有 Cluster CR/Plan 的 BUY-only 规则作为 D1 的高优先级依据；UI CR 的双语、Glossary、TermHelp、cookie、Markdown、安全、无障碍和视觉要求继续有效，但不能改变算法或 D4 数据边界。

## 2. BUY-only 最终规则

### 2.1 候选与维度输入

只有满足当前批准候选条件的 BUY 交易进入 Cluster candidate。SELL 交易可以作为原始上下文保留在不改变 API contract 的现有位置，但不得进入 cluster member count 或任何正式维度输入。

对于 D1：

- BUY 且 outcome=YES 计为 YES；
- BUY 且 outcome=NO 计为 NO；
- outcome 缺失或不在批准的 YES/NO 集合中，不进入 D1 已知方向分母；
- SELL、side 缺失或无法确定的记录不进入 candidate，也不进入 D1 分子或分母；
- tie、coverage、180 分钟窗口、P99、as-of cutoff、no-lookahead、既有阈值、herding veto 和 formal alert gate 的行为保持既有批准定义。

same_side_ratio = max(known BUY YES count, known BUY NO count) / known BUY YES/NO count。

该公式不得扩展为 SELL 方向归一化，也不得以 Glossary 文案改变 `src/analysis/cluster-language.ts` 的实际 BUY-only 行为。

### 2.2 回归要求

必须保留并加强 SELL 被排除的回归断言，至少覆盖：

- BUY YES 可进入候选并计入 YES；
- BUY NO 可进入候选并计入 NO；
- SELL YES 不进入候选、D1、D2–D6、D5、herding 或 formal gate；
- SELL NO 不进入候选、D1、D2–D6、D5、herding 或 formal gate；
- unknown side/outcome 不伪造已知方向；
- tie、coverage、cutoff、no-lookahead 和既有阈值保持现有结果。

这些是对既有规则的验证，不是新增产品功能。

## 3. D4 unavailable / insufficient 显示规则

UI 只能消费现有可信 payload：

| Payload 条件 | UI 状态 | 数值显示 | TermHelp |
| --- | --- | --- | --- |
| D4 数值、coverage 和可信 provenance 均存在 | success 或现有业务状态 | 显示 first_trade_ratio 对应数值及 coverage | 显示 Thin-History Ratio 定义 |
| 数值缺失 | unavailable | 不显示数值，不补零 | 说明当前 payload 未提供 D4 |
| coverage 不足 | insufficient_evidence | 不显示确定性数值，显示 coverage/unknown 信息 | 说明覆盖率不足 |
| provenance 无法验证或 history incomplete | unavailable 或 insufficient_evidence，按现有状态 contract | 不显示确定性数值 | 说明历史记录不可验证 |
| payload 标记 synthetic | 不进入用户 Demo | 不显示任何 synthetic 指标 | 显示安全限制 |

UI 不新增字段、不改变内部 `first_trade_ratio`、不把 unknown 转成 0，不从交易数组或浏览器状态重新计算 D4。

## 4. 保护范围

以下路径和能力在本候选中受到明确保护，不得因 UI 国际化修改：

- src/analysis/**，包括 D1–D6、180 分钟窗口、P99、coverage、as-of cutoff、no-lookahead、herding veto 和 alert gate；
- src/contracts/**，包括 Trade、报告、状态和错误 contract；
- src/normalize/**；
- src/engine/**；
- app/api/**；
- Summary、Attribution、Audit 的服务端 route；
- x402 V2、payment-required、payment-identifier、价格、网络、facilitator、payTo 和支付边界；
- recorded fixtures、synthetic isolation 和数据状态判定；
- package.json、package-lock.json、node_modules、数据库 schema、migration 和环境文件；
- MCP、Chrome Extension、ERC-8004、WebSocket、RAG、Solidity 及其入口；
- SPEC-ALIBI-PLATFORM.md v0.7、PLAN-ALIBI-PLATFORM.md v0.7、既有 Cluster CR/Plan 和 CR-UI-I18N-GLOSSARY-001 v0.2。

## 5. 初步未接线文件审计

以下文件已由只读审计前的主 Codex 初步生成，当前均未接入产品入口。本轮不得继续修改它们。

| 文件 | 当前 SHA-256 | BUY-only / D4 判断 | 四向 economic exposure 残留 | 后续处理结论 |
| --- | --- | --- | --- | --- |
| src/ui/i18n.ts | 09a0bc8ad206d8875b368655e966d1106f5ce545a5dcdbe7080b169930177280 | 通用 UI 文案基本可复用；需重新审查 D4 unavailable 文案 | 未发现直接四向规则 | 后续 UI Plan 可明确保留并按 v0.2 文案审查 |
| src/ui/glossary.ts | 7d833e2d0b56331daece62c19b8a0a4378a30f020c5d8594396ae219c66b5874 | D4 名称存在但需保留 unavailable 纪律 | 存在：same_side_ratio 写有 economic-direction、BUY/SELL normalization | 不得原样保留；后续 Plan 必须允许精确重写该文件 |
| src/ui/term-help.tsx | b08b12ab566fd5619dd07ca05b82c1e7ef3f7476171a341c7dce8def3620248e | 交互骨架未接线，无法证明 D4 状态映射 | 未发现算法规则 | 后续 UI Plan 可明确保留并完成状态/无障碍审查 |
| src/reports/markdown.ts | 5fd05c37d4e7b1ab7749bc309ba7246ec0120195485061b36a5f2cecc332a7b2 | 未接线，需确保 D4 unavailable 不生成虚构数值 | 未发现直接四向规则 | 后续 UI Plan 可明确保留并按 Audit-only 范围审查 |
| app/page-client.tsx | 45f32ff7402738550a7e25c6080d6f4d88cfe4471a346603f83f031d922d2bb8 | 为 app/page.tsx 的未接线副本，当前不能视为 UI 实现 | 未发现直接四向规则 | 后续 UI Plan 可明确保留、重写或安全恢复；必须逐文件记录 hash |

审计结论：只有 `src/ui/glossary.ts` 已确认包含不符合 v0.2 的 same_side_ratio 经济方向残留；其余四个文件没有发现四向规则文字，但均未经过编译、集成或运行验证，不能宣称可直接使用。

## 6. 后续 UI-only 精确文件边界

v0.2 获批后的新 Plan 只能在以下明确路径内实现 UI 国际化；以下路径之外不得写入：

### 6.1 允许修改或创建的文件

- app/layout.tsx
- app/page.tsx
- app/page-client.tsx
- app/globals.css
- src/ui/i18n.ts
- src/ui/glossary.ts
- src/ui/term-help.tsx
- src/reports/markdown.ts
- tests/unit/i18n.test.ts
- tests/unit/glossary.test.ts
- tests/unit/markdown.test.ts
- tests/unit/term-help.test.tsx
- tests/e2e/app.spec.ts
- tests/e2e/i18n-glossary.spec.ts
- VERIFICATION.md
- HANDOFF.md
- CHANGELOG.md

截图和 clean-room 证据只能写入既有 verification artifact 目录中明确属于本任务的文件：

- artifacts/verification/ui-i18n-glossary-001/**

如果某个列出的测试文件实际不存在，后续 Plan 只能在该确切路径创建它，不能在其他目录创建替代测试文件。

### 6.2 明确禁止写入的文件

除 6.1 外的所有路径都禁止写入，尤其包括所有算法、contract、normalize、engine、API、支付、fixture、依赖、数据库、migration、环境、MCP、Extension、ERC-8004、WebSocket、RAG、Spec、既有 CR 和既有 Plan 文件。

## 7. 后续测试与回滚要求

后续 UI-only Plan 必须包含并执行：

- BUY-only same_side_ratio 文案与术语单元测试；
- D4 数值存在、unavailable、insufficient_evidence、unknown exclusion、coverage 展示和 synthetic isolation 测试；
- locale cookie、SSR initial locale、metadata、html lang、中文默认值和切换不刷新/不重请求测试；
- TermHelp hover/focus transient、click/touch pinned、Escape、outside click、再次点击、单实例、键盘、移动端、200% zoom、reduced-motion 测试；
- Audit Markdown 双语客户端 renderer 测试，原始标题、URL、引文、hash、内部枚举和 JSON/API contract 不变；
- API 路由、402、x402 headers、payment requirement、价格、网络、支付边界和 fixtures 不变量测试；
- typecheck、lint、完整既有测试、build、Playwright、双语截图、Secret scan、protected hash 和 clean-room verification。

回滚必须使用实施前逐文件 SHA-256 和安全备份。项目没有可用 Git 仓库，不得使用破坏性 Git 命令。只恢复本次确切 allowlist 中实际修改的文件，不删除或覆盖其他路径。

## 8. 既有 UI CR 与 Plan 的覆盖关系

### 8.1 对 CR-UI-I18N-GLOSSARY-001 v0.2 的覆盖

本候选只覆盖以下冲突部分：

- `same_side_ratio` 从四向 economic exposure 解释改为 BUY-only eligible entry 解释；
- D4 从“必须贯通 Trade/API 并证明数值映射”改为“不改管线，按可信 payload 显示，否则 unavailable/insufficient_evidence”。

以下要求继续完整有效：

- zh-CN/en、默认中文、locale cookie + SSR initial locale；
- 双语 metadata 和 html lang；
- 集中式类型安全 Glossary 与 TermHelp；
- Audit Markdown 客户端双语导出；
- 原始证据内容不翻译；
- API JSON 字段、路由、枚举、状态和 x402 边界不变；
- 无障碍、键盘、移动端、200% zoom、reduced-motion、synthetic 禁止和安全要求。

### 8.2 对 PLAN-UI-I18N-GLOSSARY-001 v0.1 的覆盖

该 Plan 不再可执行。其 Workstream A 中所有四向 economic exposure、SELL 进入 candidate/D1/D5/herding/formal gate、修改 Cluster 实现和 D4 数据管线/API 的要求全部撤销。

其 Workstream B 的 UI-only 目标只有在按本 v0.2 重新生成 `PLAN-UI-I18N-GLOSSARY-001 v0.2 candidate` 并获批后，才可继续。新的 Plan 必须使用第 6 节的固定文件边界。

## 9. 无待决项声明

本候选中的人类规则决定已经关闭：

- D1 保留既有 BUY-only；
- SELL 仅为 context；
- same_side_ratio 使用 BUY eligible entries 的 YES/NO outcome share；
- D4 本次不改数据管线/API/contract；
- D4 数据缺失、coverage 不足或 provenance 不可验证时显示 unavailable 或 insufficient_evidence；
- UI 国际化继续限定为 UI-only 范围。

没有需要人类继续选择的开放选项。未来若实际代码发现无法在第 6 节文件边界内满足上述已确定规则，必须停止并生成新的合并 Change Request，不得自行扩大范围；这不是本候选的未决项。

## 10. 本轮结果与完整性

- 新增文件：CR-UI-CLUSTER-CONSISTENCY-001-v0.2-candidate.md；
- 未修改：v0.7 Spec、已批准 Cluster CR/Plan、UI CR v0.2、UI Plan v0.1、产品代码、依赖、lockfile、数据库、fixtures、环境和支付配置；
- 未运行：测试、构建、E2E、migration、支付、签名、链上交易和外部付费调用；
- 候选文件 SHA-256 在生成后审计输出中提供。

## 11. 唯一批准命令

APPROVE: CR-UI-CLUSTER-CONSISTENCY-001 v0.2
