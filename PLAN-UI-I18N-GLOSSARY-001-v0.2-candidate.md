# PLAN-UI-I18N-GLOSSARY-001 v0.2 candidate

状态：DRAFT / 等待独立 Plan 批准
日期：2026-09-05

## 0. 目标与执行前提

本 Plan 依据已批准的 CR-UI-I18N-GLOSSARY-001 v0.2 和已批准的 CR-UI-CLUSTER-CONSISTENCY-001 v0.2，替代不可执行的 PLAN-UI-I18N-GLOSSARY-001 v0.1。它只规划 UI 国际化、Glossary、TermHelp、Audit Markdown 客户端导出、无障碍和验证工作。

Workstream A 不再修复 Cluster 算法。它只执行 BUY-only 一致性 A-GATE，确认 UI 文案、Glossary 和状态映射不会重新引入四向 economic exposure，并确认 D4 缺失数据按 unavailable/insufficient_evidence 处理。Cluster 算法、D4 数据管线和 API contract 均受保护。

本 Plan 获批后，主 Codex 可连续完成本 Plan 全部实现和验证，无需逐批人工确认。只有第 15 节列出的硬阻塞可以暂停；任何超出边界的问题必须合并为一份 Change Request。

## 1. 批准来源与优先级

发生冲突时按以下优先级裁决：

1. SPEC-ALIBI-PLATFORM.md v0.7；
2. PLAN-ALIBI-PLATFORM.md v0.7；
3. CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2 与 PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1；
4. CR-UI-I18N-GLOSSARY-001 v0.2；
5. CR-UI-CLUSTER-CONSISTENCY-001 v0.2；
6. 本 Plan；
7. 实际实现、现有测试和可复现验证证据。

本 Plan 不修改上述批准来源。CR-UI-CLUSTER-CONSISTENCY-001 v0.2 对 UI CR 仅覆盖 D1 四向 economic exposure 和 D4 数据贯通冲突；其他双语、TermHelp、cookie、Markdown、安全和无障碍要求继续有效。

## 2. 不可变产品边界

以下内容在整个执行期间必须保持不变：

- D1 使用 BUY-only candidate；BUY YES 是 YES entry，BUY NO 是 NO entry；SELL 仅作 context，不进入 candidate、member count、D1–D6、D5、herding 或 formal alert gate；
- same_side_ratio 是 eligible BUY entry 中最高 YES/NO outcome share，不采用 economic exposure；
- 180 分钟窗口、P99、coverage、as-of cutoff、no-lookahead、herding veto、既有阈值和 alert gate；
- D4 不修改数据管线、Trade contract、normalize、engine、report/API mapping 或数据库；
- D4 只有可信现有 payload 同时提供数值、coverage 和 provenance 时才显示数值；否则为 unavailable 或 insufficient_evidence；浏览器不补算，unknown 不当作 0；
- API 路径、API JSON 字段、枚举、状态、run_id、错误 envelope 和 legacy 调用；
- x402 V2 包、402 语义、payment-required header、价格、网络、facilitator、payTo、payment-identifier 和所有支付边界；
- recorded fixtures、synthetic isolation、外部证据标题、URL、引文、hash 和原始语言；
- MCP、Chrome Extension、ERC-8004、WebSocket、RAG、Solidity 以及 GUI/CLI/APP 三面板；
- 不安装依赖，不修改 package.json、package-lock.json、环境文件、数据库或 migration；
- 不执行支付、签名、链上交易、主网访问、migration、公开发布或付费外部调用。

## 3. 两个彼此隔离的 Workstream

### Workstream A：BUY-only 与 D4 UI 一致性 A-GATE

#### A1 输入

- 已批准的 Cluster CR/Plan、UI CR v0.2、UI Cluster Consistency CR v0.2；
- src/analysis/cluster-language.ts 和现有 cluster 测试的只读事实；
- 当前五个未接线 UI 文件的 hash 和内容审计；
- 现有 API/report 类型与 recorded payload 的只读审计。

#### A2 工作

1. 静态核验实现仍拒绝 SELL 进入 candidate、member count、D1–D6、D5、herding 和 formal gate；不得改动实现。
2. 保留现有 SELL-excluded 回归测试；执行现有针对性 cluster 测试，但不修改 Cluster 算法或 contract。
3. 检索所有 UI 文案和 Glossary，删除或改写任何把 same_side_ratio 描述为 economic-direction、BUY/SELL normalization 或四向 exposure 的文本。
4. 固化 same_side_ratio 双语文案：eligible BUY entry 的最高 YES/NO outcome share；SELL 为 context only；不证明协调、因果或内幕行为。
5. 审查 D4 UI 分支：不得从交易数组、默认值、fixture 常量或浏览器状态补算；可信数值缺失、coverage 不足或 provenance 不可验证时只显示 unavailable 或 insufficient_evidence。
6. 确认 D4 TermHelp 即使数值 unavailable 仍解释定义和不可用原因，不宣称已有数值。

#### A3 A-GATE 通过条件

- BUY-only 静态核验与既有 SELL-excluded 测试通过；
- UI Glossary 和可见文案不存在四向 economic exposure 残留；
- same_side_ratio 双语定义与批准 CR 完全一致；
- 不修改 src/analysis、src/contracts、src/normalize、src/engine、app/api 或 D4 数据管线；
- D4 unavailable/insufficient 映射测试通过；
- A-GATE 证据写入 artifacts/verification/ui-i18n-glossary-001/，并记录 protected hash。

A-GATE 未通过时，Workstream B 可以继续处理与 D1/D4 无关的本地化骨架，但不得接入 D1/D4 TermHelp，也不得进入 B-GATE。

### Workstream B：UI 国际化与 Glossary

#### B1 输入

- 当前 app/page.tsx、app/layout.tsx、app/globals.css 和实际 API 调用；
- 初步未接线文件的已记录 hash；
- CR-UI-I18N-GLOSSARY-001 v0.2 的双语范围、术语纪律和交互要求；
- A-GATE 的 D1/D4 结论。

#### B2 实现目标

1. 支持 zh-CN 与 en；首次访问默认 zh-CN。
2. 使用 alibi_locale cookie 做 SSR initial locale；只接受 zh-CN/en；缺失、非法或损坏值回退 zh-CN。
3. cookie 属性固定为 SameSite=Lax、Path=/、Max-Age=31536000；HTTPS 时增加 Secure；不得写入钱包、报告、run_id、付款或其他敏感数据。
4. app/layout.tsx 根据 SSR locale 输出正确的 html lang、title 和 description；品牌名 Alibi 不翻译，不改变 SEO 路由或 API 行为。
5. app/page.tsx 负责把 SSR initial locale 传给页面客户端层；切换时只更新 React state、cookie 和 html lang，不刷新、不重新调查、不重新请求、不清除已有分析状态。
6. 将所有人类可见字符串集中到 src/ui/i18n.ts；缺失翻译键回退英文并记录缺失键，不显示空白。
7. 将术语集中到 src/ui/glossary.ts；每个 term_id 唯一；pending_definition 必须为 0；组件不得维护第二份解释。
8. 通过 src/ui/term-help.tsx 提供真实 button 和可访问 tooltip/popover：hover/focus 为 transient，click/touch 为 pinned；pinned 不因普通 pointer leave 或 focus leave 关闭；Escape、再次点击或 outside click 关闭；同一时间只能 pinned 一个 term_id；语言切换保持 term_id。
9. 只本地化既有 Audit Markdown 导出，使用当前已获取的 Audit JSON 在客户端通过 src/reports/markdown.ts 生成；不新增 Summary/Attribution Markdown 路由或按钮，不给 /audit 或 /api/v1 增加 locale query；服务端英文 Markdown 行为保持兼容。
10. 原始证据标题、市场问题、机构名、引文、URL、hash、JSON 字段、内部枚举和状态值保持原样；只翻译 UI 标签、Markdown 标题、字段说明和免责声明。
11. D1 TermHelp 使用 BUY-only 定义；D4 TermHelp 使用 Thin-History Ratio 定义并根据 payload 显示 unavailable/insufficient 原因。

## 4. 精确文件修改 allowlist

主 Codex 只能修改、创建或更新以下路径；任何其他路径写入均视为范围违规。

### 4.1 UI 与 renderer

- app/layout.tsx：SSR locale、metadata、html lang；
- app/page.tsx：SSR 页面入口与 initial locale 传递；
- app/page-client.tsx：现有 UI 的双语状态、TermHelp 接入、D4 安全显示、Audit 导出按钮、无刷新切换；
- app/globals.css：popover、focus、responsive、200% zoom、reduced-motion 和状态样式；
- src/ui/i18n.ts：类型安全 locale、dictionary、cookie helper 和缺失键记录；
- src/ui/glossary.ts：唯一 term_id、双语定义和 pending_definition=0 校验；
- src/ui/term-help.tsx：TermHelp 状态机与可访问交互；
- src/reports/markdown.ts：Audit-only 双语纯 renderer；

### 4.2 测试

- tests/unit/i18n.test.ts；
- tests/unit/glossary.test.ts；
- tests/unit/markdown.test.ts；
- tests/unit/term-help.test.tsx；
- tests/e2e/app.spec.ts；
- tests/e2e/i18n-glossary.spec.ts；

### 4.3 验证与交接文档

- VERIFICATION.md；
- HANDOFF.md；
- CHANGELOG.md；
- artifacts/verification/ui-i18n-glossary-001/**；

artifact 目录只允许保存本任务的截图、脱敏测试输出、hash、clean-room 记录和验收清单。

## 5. 明确禁止修改的路径

- src/analysis/**；
- src/contracts/**；
- src/normalize/**；
- src/engine/**；
- app/api/**；
- Summary、Attribution、Audit 服务端 route；
- x402/payment 相关实现；
- fixtures/**；
- package.json、package-lock.json、node_modules/**；
- 数据库、migration、环境文件和 secret store；
- MCP、Chrome Extension、ERC-8004、WebSocket、RAG、Solidity 相关文件；
- SPEC-ALIBI-PLATFORM.md v0.7；
- PLAN-ALIBI-PLATFORM.md v0.7；
- CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2；
- PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1；
- CR-UI-I18N-GLOSSARY-001 v0.2；
- CR-UI-CLUSTER-CONSISTENCY-001 v0.2；
- PLAN-UI-I18N-GLOSSARY-001 v0.1 candidate；
- 桌面启动器和工作区之外的任何文件。

## 6. 受保护基线 hash

执行前必须重新计算并与下列基线比较；任何变化都暂停并记录为完整性异常：

| 文件 | 执行前 SHA-256 |
| --- | --- |
| SPEC-ALIBI-PLATFORM.md | 6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c |
| PLAN-ALIBI-PLATFORM.md | 0c362b5e567f3051997b874da1f3f4e5e70839e3b62bebbe5dd9cdc9862eceaf |
| CR-CLUSTER-LANGUAGE-EVIDENCE-001-v0.2-candidate.md | 0ca8f95afc69c91d4eda5fadca8dafae03a68676f5f4de2837b4754431404fa2 |
| PLAN-CLUSTER-LANGUAGE-EVIDENCE-001.md | 2e50c181ebdd6e6302f0abfd029943ebb277d1a535172bb1ffed18cbb5bdbfdf |
| CR-UI-I18N-GLOSSARY-001-v0.2-candidate.md | b604b5372455afeb10c903168af3665adfded096e4557fa81d429c3d2a240d17 |
| CR-UI-CLUSTER-CONSISTENCY-001-v0.2-candidate.md | 853a2de8f314e5776666efeed2c47e4fd7654de487d7af3bb7e9e9163697d4d7 |
| package.json | 9b44171d4053e1f1986e095ccab519c84fc86bfdac7455c471b8e82ec992d9b0 |
| package-lock.json | ab2f2883e03dc5563d4175d217748509a9eead740f56446961ba3239032d17b8 |

上表中的 CR-UI-CLUSTER-CONSISTENCY-001-v0.2-candidate.md hash 已按当前实际文件核验。

初步未接线文件基线：

| 文件 | 当前 SHA-256 |
| --- | --- |
| src/ui/i18n.ts | 09a0bc8ad206d8875b368655e966d1106f5ce545a5dcdbe7080b169930177280 |
| src/ui/glossary.ts | 7d833e2d0b56331daece62c19b8a0a4378a30f020c5d8594396ae219c66b5874 |
| src/ui/term-help.tsx | b08b12ab566fd5619dd07ca05b82c1e7ef3f7476171a341c7dce8def3620248e |
| src/reports/markdown.ts | 5fd05c37d4e7b1ab7749bc309ba7246ec0120195485061b36a5f2cecc332a7b2 |
| app/page-client.tsx | 45f32ff7402738550a7e25c6080d6f4d88cfe4471a346603f83f031d922d2bb8 |

## 7. 任务分层、依赖和文件所有权

### A0：基线与保护检查

- 输入：批准文件、protected hash、当前工作区；
- 输出：preflight.json、受保护 hash 清单、allowlist 清单；
- 文件所有权：主 Codex 只写 artifacts/verification/ui-i18n-glossary-001/**；
- DoD：Node/npm、node_modules、工作区状态和基线 hash 已记录，未输出 Secret。

### A1：BUY-only 一致性 A-GATE

- 输入：Cluster 实现、既有 tests/unit/cluster-language.test.ts、Glossary 文本；
- 输出：A-GATE 记录和 targeted test 输出；
- 文件所有权：只读子智能体审查；主 Codex 写 verification artifact；
- DoD：BUY-only、SELL exclusion、same_side_ratio 文案和 D4 不补算规则全部通过；
- 依赖：A0。

### B0：SSR locale 与 metadata

- 输入：Next.js 16 现有 layout/page、cookies 规则；
- 输出：locale-aware layout/page；
- 修改文件：app/layout.tsx、app/page.tsx；
- DoD：首屏默认 zh-CN、合法 cookie 恢复 locale、html lang/title/description 一致且无 hydration mismatch；
- 依赖：A0；可与 B1 并行设计，必须先于 B3 集成。

### B1：dictionary 与 Glossary

- 输入：可见字符串审计、批准术语定义、A-GATE 结果；
- 输出：typed dictionary、typed Glossary、缺失键和 pending_definition 校验；
- 修改文件：src/ui/i18n.ts、src/ui/glossary.ts；
- DoD：所有实际可见状态和指标均映射唯一 term_id；D1 BUY-only 文案正确；D4 不可用纪律正确；
- 依赖：A1；可与 B0 并行。

### B2：TermHelp 与 CSS

- 输入：Glossary、interaction state machine、a11y requirements；
- 输出：可复用 TermHelp 和响应式样式；
- 修改文件：src/ui/term-help.tsx、app/globals.css；
- DoD：transient/pinned、keyboard、Escape、outside click、single pinned term、viewport clamp、200% zoom、mobile、reduced-motion 通过；
- 依赖：B1；可与 B0 并行实现基础组件。

### B3：页面与 Audit renderer 集成

- 输入：B0、B1、B2、现有 API/report state；
- 输出：双语 GUI/CLI/APP、Summary、Attribution、Audit、Agent Console、x402、loading/empty/error/status 页面；
- 修改文件：app/page-client.tsx、src/reports/markdown.ts；
- DoD：切换不刷新、不重新调查、不重新请求；Audit Markdown 以当前 locale 生成；原始证据和 JSON/API contract 保持原样；D4 只按 payload 显示或 unavailable/insufficient；
- 依赖：A1、B0、B1、B2。

### B4：单元与集成验证

- 修改文件：tests/unit/i18n.test.ts、tests/unit/glossary.test.ts、tests/unit/markdown.test.ts、tests/unit/term-help.test.tsx；
- DoD：locale、dictionary、Glossary uniqueness、D1/D4 text discipline、renderer preservation、TermHelp keyboard/state 全部通过；
- 依赖：B1、B2、B3。

### B5：E2E、视觉与 clean-room 验证

- 修改文件：tests/e2e/app.spec.ts、tests/e2e/i18n-glossary.spec.ts、artifacts/verification/ui-i18n-glossary-001/**；
- DoD：recorded Demo 双语、cookie、metadata、API non-regression、desktop/mobile/200% zoom、keyboard、reduced-motion、popover edge、synthetic isolation 通过；
- 依赖：B4、A-GATE。

### D0：文档交付

- 修改文件：VERIFICATION.md、HANDOFF.md、CHANGELOG.md；
- DoD：记录真实修改文件、前后 hash、测试数量、截图路径、A/B/V-GATE、遗留问题、最终状态和回滚信息；
- 依赖：B5 和最终 clean-room。

## 8. 并行调度与只读子智能体

主 Codex 是唯一写入者、整合者和最终裁决者。最多使用四个只读子智能体，每个任务边界如下，子智能体不得创建下级智能体或写入文件：

| 子任务 | 只读范围 | 输出证据 | 文件所有权 |
| --- | --- | --- | --- |
| A-Gate Auditor | src/analysis/cluster-language.ts、相关批准文档、现有 cluster tests | BUY-only、SELL exclusion、D1 规则、D4 边界和行号 | 无写入 |
| Locale/Contract Auditor | app/layout.tsx、app/page.tsx、API 调用和 UI 状态 | locale、SSR、metadata、API/状态不变量 | 无写入 |
| UI/A11y Auditor | app/page.tsx、app/globals.css、TermHelp 初步文件 | 可见字符串、键盘、responsive、200% zoom、reduced-motion、popover 风险 | 无写入 |
| Security/Clean-room Auditor | allowlist、protected files、fixtures、依赖和 Secret pattern | 越界写入、synthetic isolation、hash 和 Secret 风险 | 无写入 |

可并行：A-Gate Auditor、Locale/Contract Auditor、UI/A11y Auditor、Security/Clean-room Auditor，以及 B0/B1 的只读设计审查。

必须串行：A0 → A1 → B3 → B4 → B5 → D0；B0/B1 可在 A1 后并行，B2 依赖 B1，B3 依赖 B0/B1/B2。

主 Codex 必须独立复核每一项关键结论；子智能体结论冲突时，以批准文档、实际代码和可复现实验证据为准。

## 9. 测试矩阵

### 9.1 Unit

- normalizeLocale：合法、缺失、非法、损坏值；
- dictionary：zh-CN/en 完整键集、缺失键英文回退并记录；
- Glossary：term_id 唯一、pending_definition=0、所有可见指标/状态都有唯一映射；
- same_side_ratio：文案明确 BUY-only、SELL context-only，不出现 economic exposure；
- D4：first_trade_ratio 兼容字段、Thin-History Ratio 文案、unknown 不当作 0；
- renderer：当前 locale、标题、字段标签、免责声明双语，raw title/URL/quote/hash/status/id 保持不变；
- TermHelp：transient、pinned、Escape、outside click、再次点击、single pinned、term_id preservation。

### 9.2 Contract / integration

- existing /summary、/attribution、/audit 调用路径不变；
- API JSON 字段、run_id、data_status、状态机取值不变；
- D4 可信数值显示、字段缺失 unavailable、coverage 不足 insufficient_evidence、provenance 不可验证 unavailable；
- 不新增 `/api/v1/*` adapter、locale query 或 API 字段；
- x402 HTTP 402、PAYMENT-REQUIRED、scheme/network/asset/amount/payTo/resource 和 payment boundary 不变；不付款；
- recorded payload 显示 recorded；synthetic payload 被阻止，不进入用户 Demo。

### 9.3 E2E

- 首次访问默认中文；
- cookie 恢复英文；非法 cookie 回退中文；
- 切换语言不刷新、不重新请求、不清除 Summary/Attribution/Audit 状态；
- title、description、html lang 与 locale 一致，品牌 Alibi 不翻译；
- GUI、CLI、APP、Summary、Attribution、时间证据链、六维指标、语言时间窗、Agent Console、x402 页面、限制和免责声明双语；
- loading、empty、error、success、recorded、live、synthetic、provider_unavailable、upstream_unavailable、payment_required、insufficient_evidence、unattributed、indeterminate、unsupported_language、cluster_without_verified_source、documented_language_window 状态覆盖；
- Audit Markdown 客户端下载内容使用点击时 locale；服务端英文兼容路径不变；
- 原始外部证据内容不被翻译或改写。

### 9.4 Accessibility / visual

- 中文 desktop；英文 desktop；
- 中文 mobile；英文 mobile；
- 中文 200% zoom；英文 200% zoom；
- 纯键盘 Tab/Enter/Space/Escape；
- reduced-motion；
- TermHelp 位于顶部、底部、左右边界和小屏幕边缘；
- focus ring、button semantics、aria-label、aria-expanded、aria-describedby、tooltip/popover 语义；
- 不遮挡关键按钮、不超出视口、不依赖 hover；
- loading、empty、error、payment-required 和 unavailable 状态的可读性。

## 10. D1 / D4 / API / x402 验收不变量

### D1

验收只确认现有 BUY-only 规则未被 UI 变更改变：BUY YES/NO 可见方向保持，SELL 不进入正式 cluster 结果；same_side_ratio 解释与算法一致。不得添加 SELL exposure 测试或修改算法以支持四向规则。

### D4

验收只确认 UI 不伪造数据：已有可信数值才显示；缺失、coverage 不足、provenance 不可验证时显示 unavailable/insufficient_evidence；不新增字段、不浏览器补算、不将 unknown 当作 0。

### API / x402

对 recorded Summary、未付款 Attribution、Audit 和既有别名执行 non-mutating smoke/contract checks；必须证明响应、HTTP 402、headers、payment requirement、金额、网络和错误语义未变化。不执行真实付款、签名或链上操作。

## 11. recorded / synthetic 隔离

- 用户 Demo、截图和 E2E 演示数据仅使用当前 recorded API/fixtures；页面必须明确 recorded；
- synthetic 只能在隔离的负向测试中验证“拒绝进入用户 Demo”，不得出现在用户演示截图或成功路径；
- live、unavailable、provider_unavailable、upstream_unavailable 只能显示实际 payload 状态；不把 recorded 或 unavailable 标为 live；
- 不新增 staged fixtures 或环境配置。

## 12. clean-room、Secret scan 与完整性验证

执行后由主 Codex 和只读 Security/Clean-room Auditor 分别核对：

1. 实际文件修改集合是第 4 节 allowlist 的子集；
2. 第 5 节禁止路径 hash 与执行前一致；
3. package.json、package-lock.json、fixtures、API、payment 和数据库没有变化；
4. 未出现私钥、token、API key、真实 wallet secret 或新增环境文件；
5. renderer 不读取外部网络、不引入依赖、不生成 synthetic evidence；
6. clean-room 目录中仅有本任务 artifact；
7. 重新运行 typecheck、lint、test、build、Playwright 和 targeted API checks，记录真实数量与退出码。

## 13. 回滚计划

执行前对第 4 节每个文件保存逐文件 SHA-256 和安全备份；项目没有可用 Git 仓库，不得使用 git reset、git checkout 或其他破坏性命令。

失败时按以下顺序回滚：

1. 先停止本任务启动的本地服务和测试进程；
2. 仅恢复第 4 节中本次实际修改的文件，以预存副本逐文件恢复；
3. 保留并重新验证禁止路径 hash；
4. 重新运行 typecheck、lint、targeted tests 和 clean-room hash；
5. 在 VERIFICATION/HANDOFF 中记录失败阶段、恢复文件和残留问题。

如果问题要求修改任何禁止路径、API、contract、依赖、数据库、支付或算法，停止并生成一份合并 Change Request；不得通过扩大 allowlist、临时配置或 fixtures 绕过。

## 14. Definition of Done

只有全部条件满足才算本 Plan 完成：

- A-GATE 通过，BUY-only 规则和 same_side_ratio 文案一致；
- B-GATE 通过，zh-CN/en、cookie、SSR、metadata、html lang、dictionary、Glossary、TermHelp、Audit renderer 全部通过；
- V-GATE 通过，unit、contract、integration、E2E、a11y、视觉、200% zoom、reduced-motion、Secret scan、clean-room 和保护 hash 全部有证据；
- UI 没有改变 API、x402、fixtures、算法、数据库、依赖或支付边界；
- D4 缺失/coverage/provenance 情况均显示安全的 unavailable/insufficient_evidence，不产生伪造数值；
- 用户 Demo 全部为 recorded 或明确 empty/unavailable 状态，无 synthetic；
- 实际修改文件、前后 hash、测试数量、截图绝对路径、未验证外部流程和剩余问题已写入 VERIFICATION.md、HANDOFF.md、CHANGELOG.md；
- 若本地双语 recorded Demo、API non-regression、截图和 clean-room 全部通过，可标记 RUNNABLE_DEMO_COMPLETE；
- 不得标记 FULLY_LIVE_VERIFIED。

## 15. 无人值守执行边界与唤醒条件

批准后可无人值守连续执行普通代码、CSS、国际化、hydration、无障碍、测试、截图、文档和清理问题，只要修改仍在第 4 节 allowlist 内，且不改变第 2 节不变量。

必须暂停并合并为一份 Change Request 的条件：

- 现有批准规则仍不足以确定 BUY-only D1 显示；
- 实际 D4 payload 与本 Plan 的“可信数值，否则 unavailable/insufficient”规则无法兼容；
- 必须修改任何禁止路径、API、数据模型、依赖、架构、支付或数据库；
- 需要真实凭据、真实资金、签名、链上交易、主网、公开发布或不可恢复操作；
- 保护 hash 在执行前异常变化，或发现 Secret/权限/安全问题；
- 必须创建不在第 4 节的文件。

不因普通 lint、typecheck、hydration、响应式、键盘、翻译键、截图或 CSS 问题暂停；这些问题在 allowlist 内自行修复并继续。

## 16. 最终交付

主 Codex 最终交付：

- 实际修改文件及前后 SHA-256；
- A-GATE、B-GATE、V-GATE 结果；
- D1 BUY-only 与 D4 unavailable 映射证据；
- 测试、构建、E2E、无障碍、截图和 clean-room 结果；
- 双语 UI、cookie、metadata、TermHelp、Audit Markdown 验收结果；
- API、x402、fixtures、依赖和保护文件未变化证据；
- VERIFICATION.md、HANDOFF.md、CHANGELOG.md；
- 未解决问题、未验证外部流程和最终项目状态。

## 17. 自检结果与候选 hash

生成本候选时不修改产品代码，不安装依赖，不运行 migration，不执行测试、支付或链上操作。

候选文件 SHA-256 将在生成后完整文件校验中报告；候选文件自身的 hash 不作为实施前受保护产品基线。执行前必须重新核验第 6 节所有基线，并修正其中任何与实际文件不一致的文档记录后再开始实现；该修正只能作为执行前的文档完整性步骤，不能修改受保护产品文件。

唯一批准命令：

APPROVE: PLAN-UI-I18N-GLOSSARY-001 v0.2
