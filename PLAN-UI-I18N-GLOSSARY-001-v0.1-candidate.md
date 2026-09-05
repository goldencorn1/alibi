# PLAN-UI-I18N-GLOSSARY-001 v0.1 candidate

状态：DRAFT_MODE／候选，未批准，未执行。

本 Plan 基于已正式批准的 CR-UI-I18N-GLOSSARY-001 v0.2，并引用已批准的 CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2 及其 Plan。当前只生成 Plan；不修改产品代码、Spec、依赖、数据库、fixtures、环境文件、支付配置或外部状态。

## 1. 批准来源与优先级

执行时按照以下优先级裁决：

1. 本 Plan 获批后的明确执行边界和 CR-UI-I18N-GLOSSARY-001 v0.2。
2. CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2 与 PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1。Workstream A 只修复既有实现缺陷，不引入新产品功能。
3. SPEC-ALIBI-PLATFORM.md v0.7 与 PLAN-ALIBI-PLATFORM.md v0.7。
4. 实际 source、contracts、tests、fixtures、HANDOFF、VERIFICATION、DATA-SOURCES 和可复现实验证据。
5. landing、pitch 和视觉 redesign 仅作为表现参考，不能恢复虚构调用次数、ticker、实时指标、synthetic Demo 或未经验证的产品结论。

当前只读基线 hash：

| 文件 | SHA-256 |
|---|---|
| CR-UI-I18N-GLOSSARY-001-v0.2-candidate.md | b604b5372455afeb10c903168af3665adfded096e4557fa81d429c3d2a240d17 |
| CR-CLUSTER-LANGUAGE-EVIDENCE-001-v0.2-candidate.md | 0ca8f95afc69c91d4eda5fadca8dafae03a68676f5f4de2837b4754431404fa2 |
| PLAN-CLUSTER-LANGUAGE-EVIDENCE-001.md | 2e50c181ebdd6e6302f0abfd029943ebb277d1a535172bb1ffed18cbb5bdbfdf |
| SPEC-ALIBI-PLATFORM.md | 6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c |
| PLAN-ALIBI-PLATFORM.md | 0c362b5e567f3051997b874da1f3f4e5e70839e3b62bebbe5dd9cdc9862eceaf |
| package.json | 9b44171d4053e1f1986e095ccab519c84fc86bfdac7455c471b8e82ec992d9b0 |
| package-lock.json | ab2f2883e03dc5563d4175d217748509a9eead740f56446961ba3239032d17b8 |

执行开始时必须重新计算这些 hash。受保护 hash 变化时暂停，不覆盖、不恢复、不使用破坏性 Git 命令。

## 2. 目标、边界与最终状态

### 2.1 目标

- 修复既有 cluster D1 的经济方向归一化缺陷；
- 核验并稳定 D4 的兼容字段与 thin-history 语义；
- 在 Workstream A 完成并通过验证后，接入 zh-CN／en 双语 UI、集中式 Glossary、TermHelp、locale cookie、SSR metadata 和现有 Audit Markdown 的客户端本地化；
- 用测试、截图和 clean-room 证据证明 API、x402、recorded/synthetic 和原始证据边界没有改变。

### 2.2 绝不改变

- SPEC-ALIBI-PLATFORM.md v0.7；
- 既有 Cluster CR／Plan 的产品范围、阈值、herding veto 和语言时间窗规则；
- API route、method、JSON 字段、枚举、run_id、evidence hash、原始 URL、标题、引文；
- x402 V2、HTTP 402、PAYMENT-REQUIRED、scheme、network、asset、amount、payTo、resource、facilitator 和 payment-identifier；
- package.json、package-lock.json、依赖、数据库 schema、migration、fixtures 和环境文件；
- MCP、Chrome Extension、ERC-8004、WebSocket、RAG 和多 Agent 既有入口；
- recorded、live、synthetic、unavailable、indeterminate 的真实状态；
- 既有 Session Request Count 的从 0 开始、本地会话真实计数语义。

不执行 npm install、npm ci、依赖升级、migration、签名、付款、链上交易、主网访问、外部付费调用或公开发布。

### 2.3 状态定义

- PARTIALLY_VERIFIED：仍有未验证的外部服务、校准或结算流程。
- RUNNABLE_DEMO_COMPLETE：本地 recorded 双语 Demo、完整本地测试、构建、E2E、截图和 clean-room 全部通过。
- FULLY_LIVE_VERIFIED：真实外部服务、支付、链上和公共端点全部独立验证后才可使用；本 Plan 不授权达到该状态。

## 3. Workstream A/B 隔离与依赖

### Workstream A：既有 Cluster 实现一致性修复

只处理 CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2 已批准的 defect remediation：

- D1 的 BUY/SELL 与 YES/NO 经济方向归一化；
- D4 的 first_trade_ratio 兼容映射与 thin-history 数值核验；
- 保留现有 eligibility、as-of cutoff、no-lookahead、threshold、coverage、状态、herding veto 和数据模型；
- 不修改 Spec，不新增 API，不新增产品功能。

### Workstream B：UI 国际化与 Glossary

只处理 CR-UI-I18N-GLOSSARY-001 v0.2：

- zh-CN／en dictionary；
- alibi_locale cookie＋SSR initial locale；
- 双语 metadata 和 html lang；
- 全部人类可见 UI 双语；
- 唯一、类型安全 Glossary；
- TermHelp transient／pinned 状态机；
- 现有 Audit Markdown 的客户端双语导出；
- API JSON、原始证据、x402 和现有 route 保持不变。

### 依赖规则

| 依赖 | 规则 |
|---|---|
| A0 → A1/A2 | 先冻结 source、contract、tests、fixtures 和 hash。 |
| A1/A2 → A3 | D1/D4 修改后先运行 unit、integration、contract 测试。 |
| A3 → A-GATE | 主 Codex 独立复核方向、unknown、coverage、as-of、no-lookahead 和 API 数值。 |
| B0/B1 | 可在 A 期间准备字符串 inventory、dictionary schema 和 Glossary；不得为 D1/D4 显示已验证的正式 TermHelp。 |
| A-GATE → B2 | A 完成并验证后，才允许把 D1/D4 接入正式 UI 指标和 TermHelp。 |
| B2/B3/B4/B5 → B-GATE | locale、TermHelp、Markdown、页面状态和 metadata 集成后运行 UI 回归。 |
| A-GATE＋B-GATE → V-GATE | 完整测试、截图、clean-room、Secret scan、hash 和文档汇总。 |

Workstream A 和 B 文件所有权隔离。A 不修改 dictionary、TermHelp 或 metadata；B 不通过文案掩盖 A 的算法差异。主 Codex 是唯一写入者。

## 4. Workstream A 任务

### A0：基线冻结与冲突登记

输入：

- src/analysis/cluster-language.ts；
- src/contracts/index.ts、src/report/build.ts；
- existing cluster unit/integration/E2E tests；
- approved cluster CR/Plan、recorded fixtures、HANDOFF、VERIFICATION、DATA-SOURCES。

输出：

- artifacts/verification/ui-i18n-glossary-001/baseline-hashes.txt；
- artifacts/verification/ui-i18n-glossary-001/workstream-a-baseline.json；
- D1/D4 conflict ledger。

DoD：

- 证明当前 D1 entry 过滤只接受 BUY，D1 统计只使用 YES/NO；
- 证明当前 D4 用 prior_trade_count <= 2 计算 thin ratio，并排除 unknown/incomplete history；
- 确认 ClusterDimensionResult、ClusterAlert、Summary/Detail JSON shape 不需改变；
- protected hash 与执行前重新计算结果一致。

回滚：只清理验证 artifacts，不触碰源文件。

### A1：D1 经济方向归一化

唯一生产实现文件：src/analysis/cluster-language.ts。

每笔 eligible 交易必须映射为：

| side | outcome | economic exposure |
|---|---|---|
| BUY | YES | YES exposure |
| SELL | NO | YES exposure |
| BUY | NO | NO exposure |
| SELL | YES | NO exposure |
| 缺失、UNKNOWN 或其他无法确定组合 | 任意 | unknown |

unknown 不进入 D1 分子或分母，但进入 eligible member_count，coverage 为 known economic exposure members / eligible members。same_side_ratio 是已知 economic exposure 中占比最高方向的比例。

必须保持：

- tie 的既有不通过／相应状态语义，不引入随机 tie-break；
- as-of cutoff 为 evaluation_time；
- cutoff 之后的 trade、profile、history、source 不得参与；
- 既有 eligibility、180 分钟 cluster window、baseline P99、wallet 去重、threshold、dimensions_evaluable、dimensions_passed、formal alert gate 和 herding veto 的阈值不变；
- herding 继续使用既有 veto 语义和阈值，仅把方向输入替换为归一化后的经济方向；
- public API 字段、状态和数据模型不变；
- reason 不再写成 Same-side BUY ratio，但不增加证据结论。

DoD：

- BUY/SELL × YES/NO 四组合各有断言；
- tie、unknown、coverage gate、as-of、no-lookahead 各有断言；
- 既有阈值和 herding snapshots 仅发生预期的方向归一化差异；
- contract shape、enum、data_status 和 API route 无变化；
- no new dependency。

输出：D1 数值、coverage、state、reason 和 herding regression evidence。

回滚：恢复 src/analysis/cluster-language.ts 的执行前 hash；不使用 destructive Git。

### A2：D4 contract 核验

默认只允许修改 src/analysis/cluster-language.ts；禁止先改 contract。

必须证明：

- internal compatibility field 继续为 first_trade_ratio（如现有 payload 暴露该字段）；
- 语义为截至 as-of cutoff，prior_trade_count <= 2 的 eligible member ratio；
- history_complete 为 false、null、undefined 或无法取得时为 unknown；
- unknown/incomplete history 不进入分子或分母；
- coverage 为 known history / eligible members；
- D4 threshold、state、known_count、member_count 与已批准规则一致；
- UI 使用 term_id first_trade_ratio，但显示 交易历史稀薄度 / Thin-History Ratio；
- 若当前 JSON 只有 D4 dimension value，不新增字段，使用集中映射；
- 如果实际 payload 或算法含义不同，停止，输出合并 Change Request candidate，不能只改 label。

DoD：

- API numerical value、D4 dimension value 和 UI mapping 可追溯；
- unknown、coverage、as-of、no-lookahead 有测试；
- 没有 API schema 变化。

回滚：恢复 A2 修改前文件；若未修改生产文件，只清理 artifacts。

### A3：A-GATE

修改范围：

- tests/unit/cluster-language.test.ts；
- tests/integration/cluster-language.test.ts；
- tests/e2e/cluster-language.spec.ts；
- tests/contract/contracts.test.ts。

测试完成后，主 Codex 必须重新阅读 A1/A2 代码和测试，并生成：

- artifacts/verification/ui-i18n-glossary-001/workstream-a-gate.json；
- 明确 A_COMPLETE 或 A_BLOCKED；
- 四组合、tie、unknown、coverage、as-of、no-lookahead、D4 mapping 和 herding 证据。

只有 A_COMPLETE 才允许 B 让 D1/D4 显示正式 TermHelp。

## 5. Workstream B 任务

### B0：UI inventory 与行为基线

输入：

- app/page.tsx、app/layout.tsx、app/globals.css；
- src/ui/state.ts、src/contracts/index.ts；
- src/observability/audit-agent.ts、app/audit/route.ts、v1 agent audit route；
- approved UI CR。

输出：

- artifacts/verification/ui-i18n-glossary-001/ui-string-inventory.json；
- artifacts/verification/ui-i18n-glossary-001/protected-ui-behavior.json。

DoD：

- Summary、Attribution、Evidence、六维指标、语言时间窗、Agent Console、x402、所有状态、限制、免责声明、JSON/Audit Markdown export 均有 inventory；
- raw evidence、enum、API field、session count 和 request path 已分类；
- synthetic guard 和 recorded label 已有基线；
- 确认不恢复 CALL_COUNT_BASE=1223。

### B1：Dictionary、Glossary 与 coverage audit

允许新增：

- src/ui/i18n.ts；
- src/ui/glossary.ts。

要求：

- Locale 只有 zh-CN 与 en，默认 zh-CN；
- 两种 locale 的 dictionary key 集合完全相同；
- 缺失翻译 fallback 到英文并记录，不渲染空白；
- term_id 唯一；
- documented_language_window 只出现一次；
- D3 使用 median_profile_age_days、中文 中位资料年龄、英文 Median Profile Age；
- D4 保留 first_trade_ratio 兼容名，中文 交易历史稀薄度、英文 Thin-History Ratio；
- D6 使用 UI term market_novelty_ratio，内部 field market_familiarity_ratio，中文 市场陌生度比例、英文 Market Novelty Ratio；
- D1 解释为经济方向最高占比，不使用 dominant BUY；
- D3 基于 public profile createdAt，unknown 不入 median，显示 coverage 与 unknown count；
- D4 unknown history 不入分子／分母，显示 coverage；
- D6 表示此前未在该市场交易比例，不可反向说越高越熟悉；
- 所有实际显示的专业指标、证据状态、支付状态、MCP、ERC-8004、x402、Base Sepolia 都有唯一 term_id；
- registry 中 pending_definition 实例数量为 0；
- 不把钱包、报告、run_id、API response 或 payment payload 放入 dictionary。

DoD：

- type-safe dictionary 和 Glossary 编译通过；
- unique term_id 和 pending_definition=0 测试通过；
- duplicate explanation 静态审计通过；
- A-GATE 未通过时，D1/D4 只可标记为未验证，不得宣称算法一致性。

回滚：删除新增 UI modules，恢复可能修改文件的执行前 hash。

### B2：SSR locale、cookie 与 metadata

允许修改：

- app/layout.tsx；
- app/page.tsx；
- 必要时新增 app/page-client.tsx。

规则：

- cookie 名 alibi_locale；
- 只接受 zh-CN、en；缺失／非法／损坏回退 zh-CN，非法值清除；
- SameSite=Lax; Path=/; Max-Age=31536000；
- HTTPS 增加 Secure；
- cookie 只保存 locale；
- SSR initial locale、React initial state 和 html lang 一致；
- title、description、html lang 随 locale 正确输出，Alibi 不翻译；
- 可接受因读取 cookie 而动态渲染；
- 切换只更新 React state、cookie 和 html lang，不刷新、不重新调查、不重新请求、不清除已有结果；
- 不改变 SEO route、API route、JSON contract；
- 遵守仓库 AGENTS.md 指向的本地 Next.js guide，不用自动下载依赖的 npx。

DoD：

- 无 cookie 首次访问为中文；
- 两种合法 cookie 得到正确 metadata；
- 非法 cookie 回退中文；
- fetch/POST 计数、run_id、Summary、Detail、Audit 和 data_status 在切换时不变；
- 无明显 hydration mismatch 或语言闪烁。

回滚：恢复 layout、page 和必要 client split 的执行前 hash。

### B3：TermHelp 与可访问性

允许新增 src/ui/term-help.tsx，允许修改 page 或 page-client、globals.css。

状态机：

| 状态 | 进入 | 离开 |
|---|---|---|
| closed | 初始、Escape、外部点击、再次点击 | hover/focus 或 click/touch |
| transient hover | pointer enter | pointer leave、Escape、外部点击或 pin |
| transient focus | focus | focus leave、Escape、外部点击或 pin |
| pinned | click/touch、Enter、Space | Escape、再次点击、外部点击、切换另一个 term_id |

固定规则：

- pinned 不因 pointer leave 或 focus leave 关闭；
- 同一时间最多一个 pinned term；
- locale 切换保留相同 term_id 和 pinned/transient 状态；
- 使用真实 button、当前 locale aria-label、aria-describedby 或等价关联；
- 支持 Tab、Enter、Space、Escape、touch；
- hover 不是唯一入口；
- popover 不遮挡关键按钮、不越出 viewport；
- mobile、200% zoom、reduced-motion 均可用；
- 不新增 tooltip/popover 依赖。

DoD：

- 所有可见专业指标、证据状态和支付状态引用唯一 term_id；
- A-GATE 通过后才正式挂接 D1/D4 TermHelp；
- invalid term_id 不生成解释；
- focus ring、ARIA、keyboard、outside click、边界位置和 motion 测试通过。

回滚：删除 term-help.tsx，恢复 page/css hash。

### B4：Audit Markdown 客户端双语 renderer

允许新增 src/reports/markdown.ts，允许修改 page 或 page-client 中现有 Audit Markdown 下载入口。

禁止修改：

- app/audit/route.ts；
- app/api/v1/agents/runs/[runId]/route.ts；
- src/observability/audit-agent.ts；
- 任意 API route 或 contract。

要求：

- 纯函数只接收已有 Audit JSON 和 locale；
- 不读 cookie、不发请求、不访问数据库、不调用支付、不依赖 server-only module；
- UI 在点击时以当前 locale 用 Blob 下载；
- 只本地化现有 Audit Markdown；
- 不新增 Summary／Attribution Markdown route、button 或 locale query；
- server English Markdown 行为保持兼容；
- JSON export 仍为英文 contract；
- 原始 title、publisher、quote、URL、timestamp、timezone、hash、run_id、worker/agent id、数字、enum、policy flags 不翻译、不修改。

DoD：

- zh-CN/en 输出的 raw evidence、URL、hash、run_id、数字和 enum 完全一致；
- 标题、字段 label、表头、Limitations、说明和 disclaimer 按 locale；
- locale switch 不重新请求 Audit JSON；
- server audit route 和 v1 agent route 无 diff。

回滚：删除 client renderer 并恢复下载逻辑；server files 不应有 diff。

### B5：页面状态集成

允许修改 page、page-client、globals.css。

双语覆盖：

- loading、empty、success、error；
- recorded、live、synthetic；
- provider_unavailable、upstream_unavailable；
- payment_required、insufficient_evidence、unattributed、indeterminate；
- unsupported_language、cluster_without_verified_source、documented_language_window；
- Summary、Attribution、时间证据链、D1-D6、语言时间窗、Agent Console、x402、限制和免责声明。

要求：

- UI 文案改变不改变 enum、test id、API value；
- recorded 明确显示 recorded；
- synthetic 仅用于 test-only 阻断测试，不进用户 Demo；
- unavailable 保持 unavailable；
- language window 与 cluster_without_verified_source 独立；
- 不输出语言能力、内幕、因果、身份、买卖或投资成功推断；
- Payment Required 只说明 challenge，不接收或显示私钥；
- Session Request Count 从 0 开始并由当前 session 真实计算。

DoD：所有状态有双语文案、正确 ARIA、empty/error/retry 语义，且无 synthetic 用户内容。

### B6：B-GATE

主 Codex 必须：

- 重新核对可见字符串 inventory、dictionary key、Glossary 唯一性和 pending_definition=0；
- 证明 D1/D4 TermHelp 没有掩盖 A 的冲突；
- 比较中英文 Audit Markdown raw fields；
- 复核 metadata、cookie、请求计数、recorded guard 和截图；
- 生成 artifacts/verification/ui-i18n-glossary-001/workstream-b-gate.json。

## 6. 精确文件修改 allowlist

主 Codex 获批后只能在以下清单中写入：

| 文件 | 工作流 | 操作和目的 |
|---|---|---|
| src/analysis/cluster-language.ts | A | D1 economic exposure normalization；D4 最小实现／映射核验。 |
| app/layout.tsx | B | SSR locale、cookie、metadata、html lang。 |
| app/page.tsx | B | dictionary、TermHelp、状态和 Audit client export。 |
| app/page-client.tsx | B | 仅在必要 server/client split 时新增。 |
| app/globals.css | B | focus、popover、responsive、200% zoom、reduced-motion。 |
| src/ui/i18n.ts | B | Locale、dictionary、fallback、normalization。 |
| src/ui/glossary.ts | B | unique type-safe Glossary、mapping、coverage。 |
| src/ui/term-help.tsx | B | TermHelp 状态机和 ARIA。 |
| src/reports/markdown.ts | B | Audit JSON client-safe pure renderer。 |
| tests/unit/cluster-language.test.ts | A | D1/D4 边界和数值测试。 |
| tests/integration/cluster-language.test.ts | A | recorded pipeline、payload、state、as-of。 |
| tests/e2e/cluster-language.spec.ts | A/B | cluster UI、recorded、coverage、unknown、responsive。 |
| tests/contract/contracts.test.ts | A/B | contract shape、enum、字段不变。 |
| tests/unit/ui-i18n.test.ts | B | locale、dictionary、Glossary、coverage。 |
| tests/unit/audit-markdown.test.ts | B | renderer 和 raw field preservation。 |
| tests/integration/api-contract.test.ts | B | legacy/v1 API 和 x402 invariants；如已有测试覆盖，使用既有文件的等价断言。 |
| tests/integration/payment-idempotency.test.ts | B | 仅必要时补充既有幂等回归。 |
| tests/integration/api.test.ts | B | 仅必要时补充 locale-independent API/402 regression。 |
| tests/e2e/i18n.spec.ts | B | locale、SSR、metadata、no-requery。 |
| tests/e2e/term-help.spec.ts | B | hover/focus/click/touch/Escape/outside/ARIA。 |
| tests/e2e/accessibility.spec.ts | B | 双语、200% zoom、keyboard、reduced-motion。 |
| tests/e2e/app.spec.ts | B | recorded、synthetic、status、session count 回归。 |
| VERIFICATION.md | V | 实际测试、截图、clean-room、hash、状态。 |
| HANDOFF.md | V | 启动、操作、回滚、限制和剩余阻塞。 |
| CHANGELOG.md | V | CR/Plan 批准和实际执行记录。 |

如果 tests/integration/api-contract.test.ts 不适合当前结构，可将相同断言放入 allowlist 内已有 API test 文件；不得创建第二份重复 contract 逻辑或修改生产 API。

允许的验证输出目录只有 artifacts/verification/ui-i18n-glossary-001/，包括日志、sanitized snapshots、coverage、screenshots、clean-room manifest 和 Secret scan 结果。不得把 secret、private key、wallet credential、payment payload 或敏感响应写入 artifact。

## 7. 受保护文件与禁止范围

禁止修改：

- SPEC-ALIBI-PLATFORM.md；
- PLAN-ALIBI-PLATFORM.md；
- CR-CLUSTER-LANGUAGE-EVIDENCE-001-v0.2-candidate.md；
- PLAN-CLUSTER-LANGUAGE-EVIDENCE-001.md；
- package.json、package-lock.json；
- src/contracts/**；
- app/api/**、app/summary/route.ts、app/attribution/route.ts、app/audit/route.ts；
- src/observability/audit-agent.ts；
- x402/payment implementation 和配置；
- database schema、migration、fixtures、environment files；
- MCP、Chrome Extension、ERC-8004、WebSocket、RAG、多 Agent 既有入口；
- Desktop launcher、用户其他桌面文件和项目外文件。

以上 protected baseline hash 见第 1 节。allowlist 外出现 diff 时立即停止并按第 14 节进入合并 Change Control。

## 8. 任务输入、输出、DoD 与回滚点总表

| Task | 输入 | 输出 | DoD | 回滚点 |
|---|---|---|---|---|
| A0 | code、contract、tests、fixtures、approved CR/Plan | baseline、conflict ledger | 冲突可复现，hash 冻结 | 清理 artifacts |
| A1 | ClusterTradeInput、现有 eligibility | D1 normalized result | 四组合、tie、unknown、coverage、as-of、no-lookahead | 恢复 cluster-language.ts |
| A2 | D4 result/payload | mapping note、contract evidence | <=2、unknown 排除、coverage、UI mapping 一致 | 恢复 A 文件或清理 artifact |
| A3 | A1/A2 | A-GATE | A tests 和主 Codex review 通过 | 恢复 A code/tests |
| B0 | visible UI、state、routes | string inventory | 所有可见项分类、guard 基线 | 清理 artifacts |
| B1 | approved glossary | dictionary、Glossary、audit | unique term_id、pending=0、无重复解释 | 删除新增 modules |
| B2 | cookie/SSR rules | metadata、html lang、initial locale | no flash、no requery | 恢复 layout/page split |
| B3 | Glossary | TermHelp、CSS | state machine、ARIA、responsive、motion | 恢复 UI/CSS |
| B4 | existing Audit JSON | client renderer、raw diff | Audit-only、server compatible | 删除 renderer、恢复下载 |
| B5 | existing states | localized UI | all states bilingual、recorded safe | 恢复 page/CSS |
| B6 | B outputs | B-GATE | UI/API/a11y/screenshots passed | 恢复 B files |
| V0 | A/B outputs | full logs | tests、build、hash、scan complete | clean-room only |
| V1 | verified app | screenshots、a11y report | matrix passed | restore screenshots/artifacts |
| V2 | allowlist、clean copy | clean-room manifest | no undeclared file/dependency/network | discard temp copy |
| V3 | all evidence | VERIFICATION/HANDOFF/CHANGELOG | docs reflect actual results | restore docs from backups |

## 9. 测试矩阵

### Unit

- D1：BUY YES→YES、SELL NO→YES、BUY NO→NO、SELL YES→NO；
- D1：缺失／UNKNOWN side、缺失／未知 outcome 不进分子／分母；
- D1：tie、coverage、as-of cutoff、cutoff 后数据排除、no-lookahead；
- D1：既有 0.85、wallet、evaluable/pass、formal alert 和 herding veto 阈值不变；
- D4：prior_trade_count <= 2、known history 分母、unknown/incomplete 排除、coverage；
- D4：as-of 与 no-lookahead；
- Glossary：唯一 term_id、documented_language_window 恰一条、pending_definition=0；
- Glossary：D1/D3/D4/D6 禁止错误 wording；
- locale：白名单、非法回退中文、dictionary key 完整、fallback 非空；
- TermHelp：transient/pinned transitions、再次点击、Escape、outside click、唯一 pinned、locale 保留 term_id；
- Markdown：raw evidence、URL、hash、run_id、数字、enum 保持，只有 renderer-owned text 变化。

### Contract 与 integration

- legacy /summary、/attribution、/audit 与现有 /api/v1/* route、method、request body、JSON shape、field、enum、data_status 不变；
- D1/D4 API numerical value 与 UI mapping 可追溯；
- server /audit format=markdown 与 v1 agent Markdown 仍为原有英文行为；
- 不新增 locale query；
- locale switch 不增加 fetch/POST，不改变 run_id、result、data_status、evidence；
- metadata 只改变 title、description、html lang；
- recorded Summary 明确显示 recorded；
- synthetic child data 和 synthetic response 继续被 guard 阻断；
- provider_unavailable、upstream_unavailable、unattributed、insufficient_evidence、indeterminate 仍为原状态。

### API 与 x402

只使用未付款请求、受控 mock 或已有 recorded path：

- HTTP 402 语义不变；
- PAYMENT-REQUIRED 可解析；
- scheme、network、asset、amount、payTo、resource 与 baseline 一致；
- Base Sepolia eip155:84532 和 0.01 USDC contract 不变；
- payment-identifier 重放、冲突 payload、并发请求行为不变；
- 未付款不释放付费 Detail；
- 不读取、打印、存储 private key；
- 不签名、不发送交易、不连接主网、不调用付费 facilitator；
- locale 不进入 API JSON 或 payment payload；
- scoped x402 package、package.json、lockfile hash 不变。

### E2E 状态

- 无 cookie 首次中文；
- valid en cookie 英文 SSR；
- invalid cookie 中文；
- 切换 locale 后 Summary、Detail、Audit、run_id、状态、请求计数不变；
- loading、empty、success、error、payment_required、unattributed、insufficient、indeterminate；
- provider_unavailable、upstream_unavailable；
- recorded label；
- synthetic 只验证 test-only block，不进入用户 Demo；
- D3 coverage、unknown count、public profile createdAt；
- D4 coverage、unknown history count、Thin-History Ratio；
- D6 Market Novelty Ratio；
- D1 四组合后的 same-side 经济方向文案；
- language window 与 cluster_without_verified_source 独立；
- Agent Console、JSON export、Audit Markdown export；
- session count 从 0 开始，不出现 1223 基数。

### Accessibility 与视觉

- axe 或现有 accessibility harness；
- TermHelp button、Tab、Enter、Space、Escape、ARIA；
- focus ring；
- mobile touch；
- 200% zoom；
- reduced-motion；
- viewport 顶部、底部、左、右边界；
- popover 不遮挡 retry、payment、export、language switch；
- 中文／英文长文本换行和原始 URL；
- 所有状态 role、label、live region 或 alert 等级正确。

## 10. 双语截图矩阵

截图使用 recorded Demo；受控 mock 必须标记 test-only，不能当用户 Demo。

| ID | 画面 | 必须检查 | 预期 artifact |
|---|---|---|---|
| S1 | 中文 desktop | 首屏、Summary、Evidence、D1-D6、language window、限制、Agent Console、recorded | screenshots/zh-desktop.png |
| S2 | English desktop | English labels、html lang=en、Alibi unchanged | screenshots/en-desktop.png |
| S3 | 中文 mobile | responsive、touch、原文、TermHelp | screenshots/zh-mobile.png |
| S4 | English mobile | same | screenshots/en-mobile.png |
| S5 | 中文 200% | no clipping、focus、popover、payment controls | screenshots/zh-200.png |
| S6 | English 200% | same | screenshots/en-200.png |
| S7 | Keyboard | Tab、Enter/Space pin、Escape、outside close | screenshots/keyboard-flow.png |
| S8 | reduced-motion | no unnecessary motion、状态可读 | screenshots/reduced-motion.png |
| S9 | top/bottom popover | auto placement、no overflow | screenshots/popover-vertical.png |
| S10 | left/right popover | narrow viewport、no obstruction | screenshots/popover-horizontal.png |
| S11 | Audit Markdown | zh/en labels change，raw fields equal | markdown-diff.txt |
| S12 | metadata | title、description、html lang both locales | metadata.json |

## 11. Clean-room verification

主 Codex 在 A/B 通过后创建新的 /private/tmp clean-room，不覆盖既有目录：

1. 记录执行前 manifest 和 protected hashes；
2. 只复制 allowlist 源码、现有 node_modules、recorded fixtures 和必要的非敏感配置；
3. 不复制真实 env secret、钱包、付款数据、缓存或用户数据；
4. 使用当前已安装 Node/Next，不运行 npm install、npm ci、npx 下载或依赖升级；
5. 运行 typecheck、lint、build、targeted tests、recorded page smoke；
6. 检查无 allowlist 外文件、网络服务、数据库或未声明环境依赖；
7. 对输出做 Secret scan；
8. 比较 API route、JSON sample、x402 challenge 和 raw evidence hash；
9. 清理临时 clean-room，只保留 sanitized manifest 和结果 artifact；
10. 再次检查项目根目录没有 allowlist 外写入。

clean-room 失败不得通过新增依赖、修改环境文件、创建 fixture 或放宽 contract 解决。

## 12. 子智能体任务、权限与文件所有权

子智能体均只读，不得编辑、创建、删除文件，不得创建下级智能体，不得运行 payment、signature、migration 或外部付费调用。主 Codex 是唯一写入者。

| 子智能体 | 任务 | 读取范围 | 输出 |
|---|---|---|---|
| Agent A：Cluster Contract Auditor | D1 四组合、D4、threshold、as-of、no-lookahead、herding | cluster source、contracts、cluster tests、approved CR/Plan | 带行号的通过／冲突证据 |
| Agent B：UI I18n/Accessibility Auditor | 字符串、Glossary coverage、TermHelp、SSR locale、metadata、200%／mobile／motion | app、src/ui、UI tests、approved UI CR | inventory、a11y 缺口、断言建议 |
| Agent C：API/x402/Recorded Safety Auditor | legacy/v1 route、Audit Markdown、402、payment-idempotency、synthetic guard | API routes、contracts、payment tests、fixtures | contract matrix、禁止变更项 |
| Agent D：Clean-room/Verification Auditor | allowlist、hash、logs、screenshots、clean-room、最终 diff | artifacts、docs、package/lock、最终变更 | 只读最终复核 |

主 Codex 必须重新核验所有关键发现。冲突以 approved CR/Plan、实际代码和可复现实验证据裁决。

## 13. 主 Codex 整合与最终复核

主 Codex 必须：

1. 重新计算 protected hashes；
2. 完成 A0/B0；
3. 按 A→A-GATE→B 依赖写入；
4. 只在 allowlist 内修改；
5. 独立复核 D1/D4 数值、UI mapping、dictionary、Glossary、metadata、TermHelp 和 Markdown raw preservation；
6. 运行全部测试、typecheck、lint、build、recorded replay、API smoke、截图、Secret scan 和 clean-room；
7. 让 Agent D 独立审查最终 diff 和 artifacts；
8. 更新 VERIFICATION、HANDOFF、CHANGELOG；
9. 再次检查 protected hashes、allowlist、端口／进程、无支付／migration 记录；
10. 根据实际证据报告最终状态，不能把 PARTIALLY_VERIFIED 改成 COMPLETE 或把本地 Demo 说成 FULLY_LIVE_VERIFIED。

冲突裁决：

- Spec／CR／Plan 实质冲突：暂停并生成一份合并 Change Request；
- D1/D4 实现不符合批准语义：保留为 defect，不能只改文案；
- 子智能体冲突：主 Codex 重读代码并运行最小复现实验；
- recorded／synthetic／unavailable 状态冲突：保守保持 unknown/unavailable，禁止标 live；
- 测试与截图冲突：记录两者，不能以视觉通过掩盖 contract 失败。

## 14. 失败、回滚与合并 Change Control

下列条件必须暂停：

- 批准规则不足以确定 D1；
- D4 实际 payload 或算法含义不同；
- 必须修改 API、数据模型、依赖、架构、数据库、支付、环境或外部服务；
- 必须修改 Spec、既有 CR／Plan 或 fixtures；
- 安全、权限、真实资金或不可恢复操作阻塞；
- allowlist 外出现 diff；
- protected hash 变化；
- 需要把 recorded、synthetic、unavailable 或 indeterminate 标为 live。

失败处理：

1. 停止写入和外部调用；
2. 保留 sanitized logs、hash、diff 和失败原因；
3. 将同一轮所有问题合并为一份 Change Request candidate，不拆成多轮；
4. candidate 必须列出冲突、影响文件、最小方案、预算、测试、回滚和唯一批准口令；
5. 未获批前只允许安全恢复 allowlist 内文件，不得继续扩展。

回滚：

- 项目当前不是 Git repository，执行前对每个修改文件保存 SHA-256；
- 备份放在 /private/tmp/alibi-ui-i18n-rollback-<timestamp>/；
- 只恢复 allowlist 文件，删除本次新增 UI 文件；
- 不删除用户无关修改；
- 回滚后重新执行 hash、contract、build、recorded、Secret scan 和 clean-room。

## 15. 无人值守执行边界

Plan 获批后主 Codex 可以连续执行完整 A/B、测试、截图、clean-room 和文档交付，不需要逐批人工确认，但必须只使用当前依赖和 recorded fixtures，且不得越过 allowlist、支付边界或 protected files。

普通 CSS、翻译缺失、hydration mismatch、可访问性、测试失败和实现错误，只要可以在 allowlist 内安全修复，主 Codex 自行诊断并继续。

只有以下情况唤醒并暂停：

- D1 无法确定；
- D4 payload／algorithm semantics 不一致；
- 必须越过 allowlist；
- 必须新增依赖、数据库、API、架构、支付或环境凭据；
- 安全、权限、真实资金、不可恢复操作；
- Spec、CR、Plan 无法执行的实质冲突；
- 不可降级的预算、资源或外部凭据限制。

## 16. 最终验证与交付

批准后的顺序：

1. baseline hashes、manifest；
2. A0 和只读子智能体 A-D；
3. A1/A2；
4. A unit、integration、contract、recorded E2E；
5. A-GATE；
6. B1-B5；
7. B unit、integration、API/x402、E2E、a11y、视觉；
8. 完整现有测试套件，实际测试数量以日志为准；
9. typecheck、lint、build；
10. recorded replay、local API smoke、Audit Markdown compatibility；
11. 双语 desktop/mobile/200%/keyboard/reduced-motion/popover screenshots；
12. Secret scan；
13. clean-room；
14. Agent D 独立复核；
15. 更新 VERIFICATION、HANDOFF、CHANGELOG；
16. 最终 allowlist、hash、端口／进程和禁止操作检查。

最终必须交付：

- 实际修改／新增文件和前后 SHA-256；
- 实际测试命令、数量、失败和重试；
- A-GATE、B-GATE、V-GATE；
- D1/D4 经济方向和 payload mapping 证据；
- locale、metadata、TermHelp、Markdown raw preservation；
- 双语截图绝对路径；
- clean-room manifest 和 Secret scan；
- 未验证外部流程和剩余阻塞；
- 最终状态是否为 RUNNABLE_DEMO_COMPLETE；
- 不宣称 FULLY_LIVE_VERIFIED，除非真实外部服务、支付、链上和公共端点另行全部验证。

VERIFICATION.md 追加测试、截图、clean-room、hash、状态和未执行 payment/signature/chain/migration 记录。

HANDOFF.md 追加启动、recorded Demo、locale cookie、Audit Markdown、TermHelp、D1/D4 说明、rollback 路径和剩余限制。

CHANGELOG.md 追加 CR-UI-I18N-GLOSSARY-001 v0.2、PLAN-UI-I18N-GLOSSARY-001 v0.1 的批准／执行结果和真实最终状态；不得提前写成 COMPLETE 或 FULLY_LIVE_VERIFIED。

## 17. Plan 自检结果

- A/B 两个隔离工作流已定义，A-GATE 是 D1/D4 正式 TermHelp 的硬依赖；
- D1 四组合、unknown、tie、coverage、as-of、no-lookahead、阈值和 herding 已列入任务与测试；
- D4 first_trade_ratio、thin-history <=2、unknown 排除、coverage 和 UI mapping 已列入；
- zh-CN/en、SSR cookie、metadata、html lang、dictionary、Glossary、TermHelp、Audit Markdown、状态和 accessibility 已列入；
- 精确 allowlist、protected files 和 hash 已列出；
- 每项任务都有输入、输出、DoD 和回滚点；
- API、HTTP 402、x402 V2、payment-identifier 和 JSON contract invariants 已列入；
- recorded/synthetic isolation、截图和 clean-room 已列入；
- 子智能体只读，主 Codex 独占写入并负责最终裁决；
- 不新增依赖、数据库、API 或支付范围的证明已列出；
- 失败时使用一份合并 Change Control；
- 本轮未修改代码、Spec、依赖、lockfile、数据库、fixtures、环境文件或支付配置；
- 本轮未执行测试、migration、支付、签名或链上操作。

## 18. 候选状态与唯一批准命令

本文件是 PLAN-UI-I18N-GLOSSARY-001 v0.1 candidate。输出后停止，不实施代码。

候选文件 SHA-256：在文件最终写入后计算，并在任务最终报告中给出；不将自引用 hash 写入正文。

APPROVE: PLAN-UI-I18N-GLOSSARY-001 v0.1
