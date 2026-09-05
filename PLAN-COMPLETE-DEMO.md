# Alibi Complete Runnable Demo Execution Plan

版本：v0.2  
状态：APPROVED VIA `AGENT-OBS-BUNDLE-001 v0.2`  
规划日期：2026-09-04（Asia/Shanghai）  
批准基线：`SPEC-COMPLETE-DEMO.md v0.2` 与 `CHANGE-AGENT-OBS-001` 已收到原子批准  
预算上限：USD 10

## 1. 执行目标与边界

本 Plan 只编排 `SPEC-COMPLETE-DEMO.md v0.2` 和其中已批准的 v0.1 基线，不创建 Spec 之外的产品范围。执行结果必须是一个可安装、可启动、可测试、可联网验证、可在离线模式重复演示的 Alibi 单页 Demo，并增加同一 Orchestrator 内的 Agent Console 与确定性 Audit & Report Agent；若 24 项基线 DoD 或 8 项 v0.2 observation DoD 中任一项未通过，最终状态不得写成 `COMPLETE`。

优先级固定为：安全红线 > 人类最新明确决定 > 已批准 Spec > 本 Plan > PRD > 工程推断。

执行期间始终遵守：

- 只读访问 Polymarket；不下单、不取消订单、不复制交易；
- 只使用 Base Sepolia 测试网；禁止主网和真实资金；
- 不连接 Alibi 用户钱包，不在 Alibi 服务端保存、接收或输出买方私钥；
- 不推断钱包持有人身份，不指控主体，不把时间相关性写成因果或内幕交易；
- LLM 只做候选证据与重定价窗口的相关性判断；价格、时间、覆盖率、先手率均由确定性代码计算；
- `live`、`recorded`、`synthetic`、`cached` 必须如实贯穿数据、API、UI、fixture 与报告；
- 不新增页面、正式新闻 API、数据库、交易接口、MCP 服务、Bazaar 注册、浏览器插件或主网部署；
- 本阶段仍不写应用代码、不安装依赖。只有 Plan 获批后才进入执行。

## 2. 完成定义与执行闸门

### 2.1 状态判定

| 最终状态 | 判定条件 |
|---|---|
| `COMPLETE` | 24 项基线 DoD 与 8 项 v0.2 observation DoD 全部有可复核证据，包含真实 Polymarket 数据、三市场、两钱包、一个真实 unattributed、Web 与 Agent 两条真实 Base Sepolia x402 解锁、脱敏 recorded 回放、Agent event/report replay 和干净环境复现 |
| `PARTIALLY VERIFIED` | 主要实现可运行，但一项或多项外部联网硬验收未完成；必须列出未通过项和已完成证据 |
| `BLOCKED` | 缺少不可替代权限、凭据、测试网资源，或所有预授权重试与降级都失败 |
| `FAILED` | 已实现结果违反 Spec、安全约束，或关键路径不能运行且无法在批准范围内修复 |

### 2.2 获批后的启动闸门 E0

Plan 获批后先执行 10 分钟内可完成的只读/无费用检查，不因单个缺失项放弃其他工作：

1. 确认 Node.js `>= 20.9`、npm、Git、浏览器可用；记录版本。
2. 记录工作区基线和已有文件，保护用户原有 `alibi-pitch_1.html`，不覆盖无关文件。
3. 只检查所需环境变量“存在/缺失”，绝不回显值。
4. 对 Gamma、CLOB、Data API、x402 facilitator、Base Sepolia RPC 做最小健康检查；不调用 Anthropic、不发支付。
5. 将预算上限写入本地成本账本配置；累计实际外部费用初值为 0。
6. 缺少 LLM 或测试网凭据时继续所有不依赖它们的实现，并把对应最终验收标为待验证。

## 3. 技术选择与批准依赖

### 3.1 运行时基线

- Node.js：`>=20.9 <27`；最终锁文件记录实际版本。Next.js 官方当前最低要求为 Node.js 20.9。[Next.js 安装文档](https://nextjs.org/docs/app/getting-started/installation)
- 包管理器：npm；提交 `package-lock.json`，后续使用 `npm ci` 复现。
- 应用：Next.js App Router + TypeScript + Tailwind CSS；一个页面、三个根路由 `POST /summary`、`POST /attribution`、`GET /health`。
- 测试：Vitest 负责确定性单元/契约/集成测试；Playwright Chromium 负责单页状态与端到端流程。
- 缓存：进程内缓存加工作区文件 fixture；不引入数据库或远端缓存。
- 部署目标：验证 `next build` 和 Vercel 兼容边界；本 Plan 不授权创建 Vercel 项目或公开部署。

### 3.2 获批依赖白名单

Plan 获批即授权安装下列 npm 包的安装时最新稳定兼容版本，并由锁文件固定精确版本。若一个包需要同一包的 patch/minor 版本修复，可在白名单内调整并记录；新增任何未列出的直接依赖必须走 Change Control。

| 类别 | 允许的直接依赖 | 用途 |
|---|---|---|
| Web 运行时 | `next`, `react`, `react-dom` | App Router、Route Handlers、单页 UI |
| LLM | `@anthropic-ai/sdk` | 服务端归因请求；禁止浏览器暴露 key |
| x402 服务端 | `@x402/core`, `@x402/next`, `@x402/evm` | HTTP 402、facilitator、Base Sepolia `exact` 验证与结算 |
| x402 买方 | `@x402/fetch`, `viem` | 本地买方 signer、付款策略、自动重试；仅测试网 |
| TypeScript 工具 | `typescript`, `tsx`, `@types/node`, `@types/react`, `@types/react-dom` | 类型检查和本地 TypeScript 脚本 |
| 样式/构建 | `tailwindcss`, `@tailwindcss/postcss`, `postcss` | 已批准的 Tailwind 样式链 |
| 质量 | `eslint`, `eslint-config-next` | 静态检查 |
| 单元/覆盖率 | `vitest`, `@vitest/coverage-v8` | 单元、契约、故障注入和覆盖率报告 |
| 浏览器 E2E | `@playwright/test` | Chromium 单页状态、真实 HTTP 状态与支付 UI 验证 |

不批准 `axios`、Zod、数据库客户端、状态管理框架、新闻 API SDK、钱包连接 SDK、Solana/AVM 包、MCP 包或 x402 扩展包。JSON Schema 使用 TypeScript 内的静态 schema 和手写运行时校验器；HTTP 使用原生 `fetch`。

x402 v2 的官方 Next.js 推荐方式是对 API handler 使用 `withX402`，买方使用 `@x402/fetch`；Base Sepolia 标识为 `eip155:84532`。[卖方 Quickstart](https://docs.x402.org/getting-started/quickstart-for-sellers) · [买方 Quickstart](https://docs.x402.org/getting-started/quickstart-for-buyers)

## 4. 文件和模块边界

以下是获批后允许创建或修改的项目文件边界。实现时可在同一目录内拆小文件，但不得新增架构层或另一个应用。

```text
/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ globals.css
│  ├─ summary/route.ts
│  ├─ attribution/route.ts
│  └─ health/route.ts
├─ src/
│  ├─ contracts/          # Spec 数据类型、schemaVersion、错误 envelope、运行时校验
│  ├─ input/              # market/profile/0x 解析和规范化
│  ├─ data/               # Gamma/CLOB/Data/evidence/recorded adapters 与 retry/cache
│  ├─ normalize/          # market、price、trade 规范化和 data_status
│  ├─ engine/             # repricing、evidence validation、attribution、wallet、coverage
│  ├─ report/             # Summary/Detail 投影与脱敏
│  ├─ payment/            # x402 server 配置、challenge 校验、付款策略
│  └─ ui/                 # 单页中的状态组件；不是新页面
├─ scripts/
│  ├─ buyer-agent.ts      # 自动 402 → 本地签名 → 重试
│  ├─ web-payment.ts      # 为 Web 演示生成不含私钥的 payment header
│  ├─ select-demo-data.ts # 三市场/两钱包的确定性筛选
│  ├─ capture-recorded.ts # 仅成功 live 后运行的脱敏录制
│  └─ verify-demo.ts      # 验收编排和证据索引
├─ fixtures/
│  ├─ synthetic/          # 仅单元和故障测试
│  └─ recorded/           # live 成功后生成；含 manifest
├─ tests/
│  ├─ unit/
│  ├─ contract/
│  ├─ integration/
│  └─ e2e/
├─ artifacts/verification/ # 脱敏日志、报告、截图、JUnit/coverage、成本账本
├─ .env.example
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ next.config.ts
├─ postcss.config.mjs
├─ eslint.config.mjs
├─ vitest.config.ts
├─ playwright.config.ts
├─ README.md
├─ ARCHITECTURE.md
├─ DATA-SOURCES.md
├─ SECURITY.md
├─ VERIFICATION.md
├─ CHANGELOG.md
└─ DEMO-SCRIPT-90S.md
```

Spec、Plan 和两份研究矩阵保留原文件名。`artifacts/verification` 只保存脱敏产物，不保存 secret、完整付款签名或未删减响应头。

## 5. 执行阶段与任务依赖

### 5.1 任务依赖图

```text
E0
 └─ T01 Scaffold
     ├─ T02 Contracts ─┬─ T04 Input + adapters ─┬─ T06 Repricing
     │                 │                        └─ T08 Wallet alignment
     │                 ├─ T05 Evidence + samples ── T07 Attribution
     │                 └─ T03 Test harness
     └─ T03 Test harness

T06 + T07 + T08 ── T09 Reports + API ── T10 Single-page UI
T02 + T09 ── T11 x402 server ─┬─ T12 Agent buyer
                              └─ T13 Web buyer flow
T04..T13 live success ── T14 Recorded capture ── T15 Offline/fault verification
T01..T15 ── T16 Docs + 90s script ── T17 Clean-room final verification
```

并行原则：同一批次中标注“可并行”的任务可以同时推进；外部服务单点失败不阻塞不依赖它的任务。共享 contract 由 T02 先锁定，避免并行分支产生字段漂移。

### 5.2 任务明细

| ID / 批次 | 任务与依赖 | 输入 | 输出 | 验证方法 | 失败处理 |
|---|---|---|---|---|---|
| T00 / E0 | 执行预检；依赖 Plan 批准 | Spec、Plan、工作区、权限、环境变量存在性 | `artifacts/verification/preflight.json`（只含布尔状态和版本） | 路径、Node/npm、端点健康、预算值、测试网链 ID；扫描输出不得含 secret | 记录缺失项，继续无依赖工作；主网链 ID 或预算不一致立即停止该分支 |
| T01 / E1 | 项目脚手架；依赖 T00 | 白名单依赖、Node/npm | Next.js/TS/Tailwind 项目、脚本、锁文件、`.env.example` | `npm ci`、typecheck、lint、`next build`、本地 `/health` | 仅在白名单内调整兼容版本；需新包则 Change Control |
| T02 / E1 | 固化 contract；依赖 T01；可与 T03 并行 | Spec 第 5、8 节 | 类型、运行时校验、统一 error、schemaVersion、data_status 传播 | contract golden tests；错误字段缺失即失败 | 不放宽 Spec 字段；上游额外字段放 raw，不污染稳定 contract |
| T03 / E1 | 测试与证据框架；依赖 T01；可与 T02 并行 | DoD、白名单测试包 | Vitest、Playwright、coverage/JUnit、脱敏日志与成本账本框架 | 空白 smoke、报告目录、secret-pattern 扫描 | 浏览器不可用则先跑单元/集成，稍后重试；最终 E2E 不可跳过 |
| T04 / E2 | 输入解析与只读 adapters；依赖 T02、T03 | Gamma/CLOB/Data 官方 contract | parser、Gamma/CLOB/Data client、normalizers、timeout/retry/cache | 三种合法输入、非法输入、分页、429/5xx、1m fidelity、90 天时间窗 contract tests；确认无写接口 | 3 次总尝试后返回显式状态；可用已验证 cache/recorded，绝不自动改 synthetic 为 live |
| T05 / E2 | 实际样本筛选与精选证据集；依赖 T02、T03；可与 T04 并行 | 公开 Polymarket、受控网页检索、筛选规则 | 3 个市场、2 个钱包、证据 metadata、1 个候选 unattributed control | 每个市场可获得分钟级历史；钱包时间戳/映射/90 天样本可用；证据 URL、published/retrieved 时间与限制可验证 | 单个样本不合格则换样本；禁止为了通过验收降低字段门槛或编造证据 |
| T06 / E3 | 重定价引擎；依赖 T04 | PricePoint、默认阈值 | 稳定去重的 RepricingWindow、合并关系、数据完整性 | 边界值 `0.079/0.080`、60 分钟边界、乱序、重复点、UP/DOWN、不同 fidelity、golden tests | 算法歧义按 Spec 最保守解释；阈值只按第 10 节校准 |
| T07 / E3 | 证据校验与 Anthropic 归因；依赖 T05、T06 | 窗口、合格 Evidence、归因 schema | claim-level 标签、time_relation、confidence、limitations、Unattributed | URL 必须在输入白名单；缺/晚 published_at；幻觉 URL；结构输出；LLM 超时/429；同输入 replay | 两次总尝试；失败转 `unattributed`/`partial_data`，不调用更贵模型自动兜底 |
| T08 / E3 | 钱包时间对齐、覆盖率和估算指标；依赖 T04、T06、T07 | Trade、RepricingWindow、90 天范围 | WalletMetrics、`size × price_change` 方向收益、逐笔排除原因、持仓周期偏差 | 方向一致、盈利估算、早于/晚于窗口、覆盖率 `0.399/0.400`、长期持仓排除/披露 | 关键字段不足或覆盖率低于 0.40：只返回 `insufficient_evidence` |
| T09 / E4 | Summary/Detail 投影和 API；依赖 T06-T08 | 分析结果、contract | 接收 `{input, mode}` 的 `POST /summary`、未加支付逻辑的 Detail handler、`GET /health` | JSON contract、HTTP 状态、Summary 不泄漏 Detail、全部批准错误 code、health 不联网/不付费 | 部分上游失败返回显式 partial；不扩大 Summary/Detail 边界 |
| T10 / E4 | 单页 UI；依赖 T09；可与 T11 并行 | API 与六种 UI 状态 | 输入、3 个 preset、Summary、Detail 区域、loading/error/insufficient/unattributed/payment/success | Playwright 按 API fixture 驱动六态；键盘/窄屏 smoke；只有 `/` 页面 | 视觉问题在同一页面修复；不得为测试新增路由页面 |
| T11 / E5 | x402 服务端保护；依赖 T02、T09；可与 T10 并行 | `exact`、0.01 USDC、Base Sepolia、payTo、facilitator | `POST /attribution` 的真实 402、verify/settle、付款后 Detail | 无 header=402；错链/错金额/过期/重复/无效签名；成功=200+receipt；Summary/health 免费 | facilitator 最多 3 次总尝试；失败保留 402 并继续其他工作；禁止切主网/换未批准服务 |
| T12 / E5 | 买方 Agent；依赖 T11 | 本地 testnet signer、402 challenge、付款策略 | CLI 自动 request→402→校验→签名→retry→Detail | 硬校验 scheme/network/asset/amount/payTo/resource；成功 receipt；拒绝任何超限或主网要求 | 每个流程最多 3 次；不输出 key/payment signature；测试网余额不足标记阻塞 |
| T13 / E5 | Web 用户付款；依赖 T10、T11、T12 | 同一 402 contract、本地 signer CLI | 页面 payment card + 外部本地 signer 生成的临时 payment payload 输入/重试 | 浏览器首次请求真 402；用户在 Alibi 页面外本地签名；页面只接收一次性付款 payload，重试后 Detail 成功 | 不接钱包 SDK、不把 key 注入浏览器或服务端；若真实 Web 解锁最终未通过则不得 COMPLETE |
| T14 / E6 | live 成功后录制和脱敏；依赖 T04-T13 相应 live 成功 | 已验证 live 响应、证据、支付结果 | recorded fixtures、manifest、来源时间、schema、hash、脱敏报告 | 录制前置检查、schema replay、hash、secret/PII 扫描、`data_status=recorded` | live 未成功不生成伪 recorded；该案例保留待录制状态 |
| T15 / E6 | 离线与故障注入；依赖 T14 | recorded + synthetic faults | 可重复的 offline Demo、限流/超时/缺字段/LLM/x402 故障测试 | 断开外部依赖后跑 Summary、Detail replay、六态 UI；synthetic 只出现在 tests | recorded 不完整则明确部分回放；不得把 synthetic 补成验收证据 |
| T16 / E7 | 文档与 90 秒脚本；依赖实现持续更新，最终依赖 T15 | 代码、测试、成本、来源、限制 | 第 13 节全部文档和演示脚本 | 链接检查、命令实跑、禁止措辞扫描、DoD 逐项证据索引 | 文档与行为冲突时以测试暴露并修正，不能只改文案掩盖失败 |
| T17 / V1 | 干净环境最终验证；依赖 T01-T16 | 锁文件、README、资源和 fixtures | `VERIFICATION.md`、最终状态、完整验收包 | 新临时目录 `npm ci`→build→test→start；真实 live；Web/Agent x402；offline replay；24 项审计 | 失败项允许在 Spec 范围内修复并整套重跑；最终仍失败则按 2.1 降级状态 |

## 6. 外部服务、调用契约与写入影响

| 服务 | 允许用途 | 认证/费用 | 写入影响 | 请求策略与降级 |
|---|---|---|---|---|
| Gamma API `https://gamma-api.polymarket.com` | market/event/profile 映射与 token metadata | 公开只读，预期 USD 0 | 无 | 12s timeout；最多 3 次；尊重 429；cache/recorded |
| CLOB `https://clob.polymarket.com/prices-history` | token 历史价格，优先 `interval=1m` 或 `fidelity=1` | 公开只读，预期 USD 0 | 无；禁止 orders/cancel/auth endpoints | 同上；若无法满足 <=1h 粒度，价格归因主流程 No-Go |
| Data API `https://data-api.polymarket.com/trades` | 指定钱包最近 90 天公开交易 | 公开只读，预期 USD 0 | 无 | 用 `start/end/limit/offset` 分页；offset 接近 10,000 时切时间片；cache/recorded |
| 公开证据网页与检索 | 发现并核验事件 URL、标题、发布时间、限制 | 优先免费，无正式新闻 API | 无 | 搜索结果只作发现，最终必须读取来源页；来源不可验证则 unattributed |
| Anthropic Messages API | 仅做 Evidence ↔ Window 相关性分类 | `ANTHROPIC_API_KEY`；计入 USD 10 | 无外部数据写入，存在付费调用 | 默认 `claude-haiku-4-5-20251001`；结构化输出；每组最多 2 次；固定输入上限；失败降级 unattributed |
| x402.org facilitator | Base Sepolia `exact` verify/settle | 测试 facilitator，无正式账号；测试币 | 会在 Base Sepolia 结算测试 USDC | 只允许 `https://x402.org/facilitator`，最多 3 次/流程；不能切主网或生产 facilitator |
| Base Sepolia RPC | 链 ID、测试币余额、receipt 核验 | 用户安全配置 endpoint；测试网 | 只读 RPC；交易由 facilitator 根据买方授权结算 | 链 ID 必须 84532；错误链立即拒绝；不得调用主网 RPC |
| npm registry | 下载白名单依赖 | 预期 USD 0 | 写 `node_modules` 与 lockfile | 锁版本；失败重试；不得临时加入包 |

官方现有契约确认：CLOB price history 支持 `1m/1h` 与分钟 fidelity；Data API trades 提供 timestamp、market mapping 和基于 `start/end` 的分页；当前公开限流远高于本 Demo 的串行调用量，但实现仍主动节流。[price history](https://docs.polymarket.com/api-reference/markets/get-prices-history) · [trades](https://docs.polymarket.com/api-reference/core/get-trades-for-a-user-or-markets) · [rate limits](https://docs.polymarket.com/api-reference/rate-limits)

## 7. 环境变量与 Secret 边界

`.env.example` 只列变量名和非敏感示例；真实值进入 `.env.local` 或进程 Secret 环境，`.env.local` 必须被 Git 忽略。

| 变量 | 必需阶段 | 敏感性 | 规则 |
|---|---|---|---|
| `MAX_EXTERNAL_API_COST_USD=10` | E0 | 非敏感 | 缺失时使用获批上限 10，不能取更高值 |
| `ANTHROPIC_API_KEY` | T07 live | secret | 只在服务端读取，不回显、不写 fixture |
| `ANTHROPIC_MODEL` | T07 live | 非敏感 | 默认固定 `claude-haiku-4-5-20251001`；最终记录实际 model ID |
| `X402_FACILITATOR_URL` | T11-T13 | 非敏感 | v0.1 只接受 `https://x402.org/facilitator` |
| `X402_NETWORK` | T11-T13 | 非敏感 | 必须精确为 `eip155:84532` |
| `ALIBI_PAYMENT_ADDRESS` | T11 | 公开地址 | EVM 地址格式校验；不得与 buyer key 混用 |
| `BASE_SEPOLIA_RPC_URL` | T00、T11-T13 | 配置敏感 | 只校验 chainId/可用性，日志去掉 query token |
| `BUYER_AGENT_PRIVATE_KEY` | T12/T13 本地买方进程 | 高敏 secret | 不进入 Next.js 服务端、浏览器 bundle、日志、fixture、报告或聊天；只允许测试专用钱包 |
| `APP_BASE_URL` | T12-T17 | 非敏感 | 默认 `http://127.0.0.1:3000` |
| `ALIBI_DATA_MODE` | T04-T17 | 非敏感 | `live|recorded`；synthetic 不能作为应用正常模式 |

任何命令输出和 artifact 均执行模式扫描：私钥模式、`ANTHROPIC_API_KEY`、RPC query token、`PAYMENT-SIGNATURE`/付款 payload 全量值一经发现即失败并删除该 artifact。不得让用户在聊天中提供私钥。

## 8. x402 精确实施与两条验收路径

### 8.1 固定参数

- 协议：x402 v2，scheme=`exact`；
- network：`eip155:84532`（Base Sepolia）；
- asset：测试网 USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e`；
- decimals：6；价格 `0.01 USDC` = `10000` 原子单位；
- facilitator：`https://x402.org/facilitator`；
- protected resource：`POST /attribution`；
- 免费资源：`POST /summary`、`GET /health`。

上述 Base Sepolia 默认资产与精度来自 x402 官方 network/token 表，并必须在执行时从 402 challenge 再核验一次。[Networks & Token Support](https://docs.x402.org/core-concepts/network-and-token-support)

### 8.2 付款前硬策略

买方代码在签名之前必须逐项匹配：resource host/path/method、scheme、network、asset、atomic amount、payTo、facilitator allowlist 和单次上限。任一不一致都拒绝签名。禁止仅靠提示词控制付款。

测试支付上限：只允许完成 DoD 所需的 Web 1 次和 Agent 1 次成功结算；考虑短暂失败后重试，整个项目最多 6 次成功结算、合计最多 `0.06` 测试 USDC。重复请求必须使用 SDK/receipt 和 challenge 语义避免意外重复结算。

### 8.3 Web 用户路径（不连接钱包）

1. 浏览器请求 Detail，接收真实 HTTP 402 并展示 payment-required 状态。
2. 用户在 Alibi 页面之外运行 `web-payment` 本地命令；testnet 私钥只存在该进程。
3. 命令先验证 402 条款，再产生一次性、不含私钥的付款 payload；页面只接收该 payload。
4. 浏览器用 payload 重试同一请求，成功后展示 Detail 和脱敏 receipt 摘要。

这样既完成 Web 操作闭环，又不引入 wallet-connect SDK，不将私钥放入浏览器或 Alibi 服务端。Playwright 只在测试进程中调用相同 signer 逻辑并驱动页面输入，不捕获 payload 全值。

### 8.4 买方 Agent 路径

`buyer-agent` 使用 `@x402/fetch` 自动执行 request → 402 → policy check → local sign → retry。输出只包含 status、network、amount、asset、脱敏 payTo、receipt hash 和 Detail schema 校验结果，不输出私钥或完整签名。

## 9. 真实样本与证据选择方法

### 9.1 市场选择

脚本先构建候选集，再按固定规则选择三例，避免只挑“最好看”的结果：

1. 公开市场页面和 Gamma token 映射可解析；
2. CLOB 可在相关时段提供 `<= 60` 分钟粒度，优先 1 分钟；
3. 默认阈值至少产生一个稳定重定价窗口；
4. 至少两个市场存在可验证 `published_at` 的公开一手或高质量二手证据；
5. 至少一个市场保留真实无合格证据的窗口作为 `unattributed`，不能通过放宽规则制造；
6. 三市场尽量跨不同主题或事件类型，降低单一案例偏差。

每次筛选保存候选数量、排除原因和检索时间；最终 preset 固定为其中一个市场和两个钱包。

### 9.2 钱包选择

候选钱包必须：

- 是 Data API 可查询的公开 0x 地址；
- 最近 90 天有 timestamp、conditionId/market、side、price、size 的短周期事件相关交易；
- 能映射到已分析市场或另行满足同等证据要求的市场；
- 覆盖率 `>=0.40` 才能成为“有先手率输出”的两例；
- 长期持仓占比、无法对齐项和排除原因完整披露；
- 不使用 profile 姓名、头像、bio，不推断真实身份。

若候选覆盖不足，继续换样本；不得修改 40% 门槛。另用 synthetic 边界 fixture 验证 `<0.40` 必须隐藏结论，但它不计入两钱包真实验收。

### 9.3 证据等级

| 等级 | 允许来源 | 作用 |
|---|---|---|
| L1 | 政府、法院、监管者、赛事/选举/公司一手公告 | 可支持 `[Confirmed]` 字段 |
| L2 | 具名编辑流程的主流媒体、通讯社，且发布时间可验证 | 可与 L1/L2 共同支持 `[Strong inference]` |
| L3 | 市场页面、研究文章、其他公开网页 | 背景或 `[Hypothesis]`，不能单独支撑强结论 |
| 不合格 | 无稳定 URL、无 published_at、搜索摘要、社交传闻、LLM 生成链接 | 不能作为支持证据；窗口转 `[Unattributed]` |

只保存必要 metadata 和短摘录/摘要，不复制整篇受版权保护内容。每条 Evidence 必须记录使用限制。

## 10. 阈值校准计划

默认生产参数保持 `60 分钟 / abs(delta)>=0.08 / 90 天 / coverage>=0.40`。校准只针对重定价绝对变化阈值，不能改变指标含义、60 分钟窗口、90 天窗口或 40% 门槛。

### 10.1 预注册样本

- 使用 T05 选定的 3 个真实市场，并尽量收集至少 6 个独立、可验证 published_at 的外部事件锚点；
- 保留至少一个真实 unattributed control；
- 在查看候选阈值结果前冻结事件锚点和时间区间 hash；
- synthetic 不参与校准；recorded 只有来自已成功 live 且 hash 可验证时才参与。

### 10.2 候选与指标

固定候选 `{0.06, 0.08, 0.10, 0.12}`，窗口固定 60 分钟。分别计算：

- event-anchor recall：已注册事件附近是否检测到窗口；
- duplicate/noise ratio：去重前后重复窗口和无合格证据窗口占比；
- evidence-qualified coverage：有合格时间证据的窗口比例；
- fidelity stability：在可用的 1m、5m/重采样、1h 数据上方向与窗口是否稳定；
- leave-one-market-out stability：每次留出一个市场后候选排序是否翻转。

### 10.3 采用门槛

`0.08` 是默认和基准。只有候选值同时满足以下条件才可自主采用：

1. 不降低基准对预注册 event anchors 的 recall；
2. duplicate/noise ratio 相对基准有明确下降；
3. evidence-qualified coverage 相对基准下降不超过 5 个百分点；
4. 三市场和不同 fidelity 上没有方向性翻转；
5. leave-one-market-out 不显示结果只由单市场驱动。

若没有候选全部通过，保持 `0.08`。若通过，`CHANGELOG.md` 必须记录旧值、新值、样本 hash、原因和测试影响，`VERIFICATION.md` 同时展示 `0.08` 与采用值；候选范围外的阈值或方法变化必须走 Change Control。

## 11. 测试矩阵与验收命令

### 11.1 自动测试层次

| 层次 | 覆盖范围 | 通过标准 |
|---|---|---|
| Unit | parser、normalizer、repricing、time relation、wallet math、coverage、redaction、payment policy | 所有边界和禁止路径通过；确定性模块行覆盖率目标 >=90%，总体不以覆盖率替代功能验收 |
| Contract | Gamma/CLOB/Data 响应、Anthropic JSON schema、Summary/Detail/error、x402 challenge/receipt | fixture 与 live shape 均通过；未知字段可容忍，必需字段缺失显式失败 |
| Integration | adapter→engine→report、recorded replay、故障注入、402 wrapper | 不静默降级、不泄漏 Detail/secret、状态贯穿 |
| E2E | 三输入、preset、六 UI 状态、Summary、Web 402/解锁、offline | Chromium 全通过；每一 UI 状态由 API/fixture 驱动 |
| Live acceptance | 3 市场、1 unattributed、2 钱包、Agent x402、Web x402 | 保存脱敏 evidence index 和时间戳；不得用 synthetic 替代 |
| Clean-room | 新临时目录安装、build、test、start、live/recorded | README 单条命令可执行；完整套件可重跑 |

### 11.2 计划中的标准命令

实际 npm script 名在 T01 固定为：

```text
npm run setup-and-demo     # 全新环境的一条命令：安装锁定依赖并启动 recorded Demo
npm run verify            # typecheck + lint + unit + contract + integration + build
npm run test:e2e          # 本地服务 + Chromium 单页 E2E
npm run verify:live       # 有凭据时的三市场/两钱包/x402 验收
npm run verify:offline    # 禁用外网，仅使用 recorded
npm run demo              # 已安装环境启动可演示应用，默认 recorded；显式参数切 live
```

`npm run verify:live` 不得在缺少支付资源时伪装成功；它应把待验证项以非零退出码和结构化报告呈现。

### 11.3 必测故障

- 空输入、伪造 Polymarket URL、非 40 hex 的地址、未知 profile；
- 上游 timeout、429、500、无 JSON、字段缺失、乱序/重复时间点；
- `0.079` 不触发、`0.080` 触发、59/60/61 分钟边界；
- published_at 缺失/晚于窗口、LLM 生成未提供 URL、schema 错误、低证据；
- coverage `0.399` 隐藏结论、`0.400` 允许计算、长期持仓披露；
- Summary 无 Detail 证据明细；未付费 Detail 真 402；
- `invalid_input`、`upstream_unavailable`、`rate_limited`、`partial_data`、`insufficient_evidence`、`unattributed`、`payment_required`、`payment_invalid` 的 error envelope；
- x402 错网络、错 asset、错金额、错 payTo、过期、重复、facilitator unavailable；
- offline 时无外部请求；recorded/synthetic 标签不可混淆；
- 日志与产物 secret 扫描；禁止性措辞扫描。

## 12. 重试、回放与预授权降级

### 12.1 统一重试策略

- 公开 GET：12 秒超时，最多 3 次总尝试，指数退避约 1s/2s 并尊重 `Retry-After`（单次最多等待 30s）；
- Anthropic：最多 2 次总尝试，仅对 timeout/429/5xx；不因失败切换更贵模型；
- x402：每条 Web/Agent 流程最多 3 次总尝试；每次重试前重新校验 challenge 和是否已 settlement；
- 同一不可用端点不会无限轮询；先继续不依赖任务，在最终 live verification 再试一次完整流程。

### 12.2 预授权降级表

| 故障 | 允许动作 | 禁止动作 | 最终影响 |
|---|---|---|---|
| 单个市场数据不足 | 按第 9 节换候选市场 | 降阈值、补 synthetic | 无，若找到替代；否则对应 DoD 失败 |
| 单个钱包覆盖不足 | 换符合规则的钱包；显示 insufficient | 输出先手率或能力结论 | 找不到两例则非 COMPLETE |
| 新闻 API 缺失 | 用精选公开证据集和受控网页核验 | 新增正式新闻 API | 无，只要证据验收通过 |
| Polymarket 临时不可用 | retry→已验证 cache/recorded；稍后重试 live | 把 replay 写成 live | final live 未通过则 PARTIALLY VERIFIED/BLOCKED |
| Anthropic key 缺失/失败 | 完成确定性引擎、replay 和测试；live 归因 unattributed | 用另一个 LLM 服务 | real attribution 未验证则非 COMPLETE |
| x402/facilitator 短暂失败 | 完成其余任务，按策略重试，保留真实 402 | mock 支付冒充成功、切主网 | 最终真实结算未过则非 COMPLETE |
| Base test USDC/gas/RPC 缺失 | contract tests 和未付费 402 继续 | 购买真实币、要求聊天贴 key | Web/Agent 解锁未过则 BLOCKED/PARTIAL |
| 浏览器不可用 | 先完成非 UI 测试，安装批准的 Chromium 后重试 | 仅截图宣称 E2E | 最终 UI DoD 未过 |
| 预算接近上限 | 停止非必要付费调用，使用 cache/recorded | 超预算、隐瞒调用 | 硬验收缺失则非 COMPLETE |

recorded fixture 只能由已成功 live 流程产生，manifest 必须含：schemaVersion、captured_at、source URL 或脱敏 query、原始 HTTP 状态、data_status、sanitizer 版本、文件 hash、使用限制。删除 profile name/bio/avatar、secret、RPC token、完整付款 header/payload；钱包显示为别名和短地址，保留必要的可复核 public source 说明。

## 13. 预算计划

成本账本按每次外部调用记录 provider、purpose、timestamp、request count、input/output tokens、估算 USD、累计 USD；不记录 prompt 中的完整证据文本或 secret。

| 预算项 | 上限 USD | 控制方式 |
|---|---:|---|
| Anthropic 开发/contract/live 样本归因 | 4.50 | 默认 Haiku 4.5；候选 evidence 截断；结构化输出；优先 cache；禁止 web-search/tool calls |
| Anthropic 最终 live 复验 | 2.00 | 只复验冻结的 3 市场/2 钱包必要窗口，不全量重跑探索 |
| 已批准 Base Sepolia RPC/公开证据的潜在计量费 | 1.00 | 仅用户已安全配置的 endpoint；优先免费来源；不得开新套餐 |
| 兼容性/故障后的必要重试 | 1.50 | 只用于已批准 provider 和白名单流程 |
| 最终保留金 | 1.00 | 累计达到 9.00 后仅允许完成一次最低必要硬验收 |
| **合计** | **10.00** | 绝不突破获批上限 |

Anthropic 当前官方价格中 Haiku 4.5 为输入 USD 1/MTok、输出 USD 5/MTok；执行时仍按当日官方价格重新计算，但若价格上涨不得扩大 10 美元上限。[Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)

测试网 USDC 和 testnet gas 不视为真实 USD 支出，但单独记录数量；禁止购买、桥接或使用任何主网资产。公开 Polymarket、npm、GitHub、arXiv 预期 USD 0。

硬停止规则：累计付费成本 `>=9.00` 后停止探索性调用，保留 1 美元仅用于最终必要验证；任何预计会让累计费用超过 10 美元的调用不得发起。若因此缺硬验收，继续免费任务并以非 COMPLETE 状态交付。

## 14. 权限使用计划

用户已给出 `GRANT: PREFLIGHT-PERMISSIONS v18.0` 和 `BUDGET: USD 10`；宿主沙箱和每次高风险审批仍优先。

| 权限 | 使用阶段 | 边界 |
|---|---|---|
| READ_PRD / READ_WORKSPACE | 全程 | 只读基线和已有文件 |
| WRITE_WORKSPACE / CREATE_PROJECT_FILES | T01-T17 | 仅当前工作区；保护用户原文件 |
| INSTALL_APPROVED_DEPENDENCIES | T01 | 只安装第 3.2 节白名单 |
| RUN_LOCAL_COMMANDS / RUN_TESTS | 全程 | 不执行破坏性命令，不删除用户文件 |
| START_LOCAL_SERVICES | T01、T09-T17 | 仅 loopback；不公开监听 |
| NETWORK_POLYMARKET_READ | T00、T04-T05、T17 | 只读批准端点 |
| NETWORK_PUBLIC_EVIDENCE_READ / NETWORK_NEWS_SEARCH | T05、T07、T17 | 发现和核验公开来源；无新正式 provider |
| USE_LLM_API | T07、T17 | Anthropic；预算和用途双重限制 |
| NETWORK_BASE_SEPOLIA | T00、T11-T13、T17 | 仅 84532；测试支付 |
| READ_APPROVED_ENV_VARS | 需凭据任务 | 只在进程内读取，不回显 |
| USE_TESTNET_BUYER_CREDENTIAL | T12-T13、T17 | 只在本地买方进程；不得进入服务端/浏览器 bundle |
| CREATE_RECORDED_FIXTURES | T14 | 仅 live 成功后，先脱敏再落盘 |
| USE_BROWSER_FOR_LOCAL_VERIFICATION | T10、T13、T15、T17 | loopback UI 与 E2E |

如果宿主要求额外网络或文件权限，按宿主审批机制请求；用户的协议授权不绕过系统沙箱。

## 15. Change Control 触发器

出现下列任一事项立即停止对应分支，生成 `CHANGE-<id>.md`，未经 `APPROVE: CHANGE-<id>` 不实施：

- 改变目标、功能边界、24 项验收或安全红线；
- 使用第 3.2 节以外的直接依赖，或更换技术栈/包管理器；
- 新增数据库、队列、独立后端、MCP、Bazaar、Chrome 插件或架构层；
- 新增页面或改变三个批准 API 的产品 contract；
- 新增正式新闻/检索供应商，或把搜索摘要当证据；
- 使用 Anthropic 以外 LLM provider；
- 使用 x402.org 以外 facilitator、Base Sepolia 以外网络、非 exact scheme 或非 0.01 USDC；
- 使用主网、真实资金、用户钱包连接、服务端代签或要求私钥；
- 使用第 10 节范围外阈值、样本或方法；
- 增加/改变 Spec 稳定数据模型；
- 预计费用超过 USD 10，或需要升级付费套餐；
- 公开部署到 Vercel 或任何新托管服务。

同一白名单依赖的兼容 patch/minor、同一候选规则下更换不合格市场/钱包、批准的 retry/cache/recorded 降级、同一页面内视觉修复不触发 Change Control，但必须进 `CHANGELOG.md`。

## 16. Definition of Done 映射

| # | 验收项 | 主要任务 | 最终证据 |
|---:|---|---|---|
| 1 | 单条命令安装启动 | T01、T17 | clean-room `npm run setup-and-demo` 日志 |
| 2 | 三种输入 | T04、T10 | parser tests + E2E |
| 3 | 真实 Polymarket | T04、T05、T17 | live response metadata + source index |
| 4 | recorded 降级 | T14、T15 | offline report |
| 5 | 规范化时间线 | T02、T04 | contract/golden tests |
| 6 | 默认/批准阈值 | T06、T10 | boundary tests + calibration report |
| 7 | 三个真实市场证据时间线 | T05-T07、T17 | market acceptance index |
| 8 | 一个真实 unattributed | T05、T07、T17 | unattributed source-gap record |
| 9 | 两钱包对齐与先手率 | T05、T08、T17 | wallet acceptance reports |
| 10 | `<40%` 禁止结论 | T08、T10 | 0.399/0.400 tests + UI E2E |
| 11 | Summary/Detail 边界 | T09 | schema diff + leakage tests |
| 12 | 未付费真 402 | T11 | raw status/header-shape 脱敏证据 |
| 13 | Web 测试支付解锁 | T13、T17 | Playwright trace + receipt hash |
| 14 | Agent 测试支付解锁 | T12、T17 | buyer-agent report + receipt hash |
| 15 | 服务端无私钥 | T03、T12-T14 | bundle/env/log/fixture secret scan |
| 16 | 六种 UI 状态 | T10、T15 | state matrix E2E + screenshots |
| 17 | 自动化覆盖核心规则/402 | T03、T06-T13 | JUnit + coverage + integration report |
| 18 | 状态映射、无新页面 | T10、T17 | route inventory + Playwright |
| 19 | 至少一次真实 x402 | T11-T13、T17 | Base Sepolia tx/receipt hash |
| 20 | live 后脱敏 recorded | T14 | manifest + sanitizer/secret scan |
| 21 | 完整离线演示 | T15、T17 | network-disabled run log |
| 22 | 文档齐全 | T16 | deliverables checklist |
| 23 | 四类免责声明/限制 | T09、T10、T16 | text policy tests + UI/API audit |
| 24 | 全新环境复现 | T17 | clean-room transcript、版本与 hash |

## 17. 风险与控制

| 风险 | 可能性/影响 | 控制与判断 |
|---|---|---|
| LLM 对证据过度归因 | 中/高 | URL allowlist、published_at gate、结构化输出、claim 标签、无证据即 unattributed |
| 价格数据采样导致窗口漂移 | 中/高 | 优先 1m、保存 fidelity、重采样稳定性、默认 0.08 对照 |
| Data API 分页或字段变化 | 中/中 | contract fixture + live shape、时间片分页、未知字段容忍、缺字段显式 insufficient |
| 长期持仓被误写为先手 | 高/高 | 90 天范围、逐笔时间关系、持仓周期偏差、不能将先后等同因果 |
| 真实 unattributed 被“优化掉” | 中/高 | 预注册 control、缺证据不放宽、验收必须保留至少一例 |
| x402 重试造成重复结算 | 低/高 | challenge/receipt 检查、总尝试和总测试币 cap、完整签名前策略 |
| Web 支付与“不连接钱包”冲突 | 中/高 | 外部本地 signer + 一次性 payload；无 wallet SDK、无 browser/server key |
| secret 泄漏到日志/fixture | 低/极高 | allowlist logging、脱敏、构建产物/日志扫描；发现即失败和清除产物 |
| 外部服务波动 | 高/中 | bounded retry、cache/recorded、独立任务继续、最终透明降级 |
| 预算耗尽 | 低/高 | Haiku、冻结样本、调用 ledger、9 美元软停止、10 美元硬停止 |
| Vercel runtime 与本地不同 | 中/中 | `next build`、Node runtime route、无本地数据库；不以未部署冒充验证 |

## 18. 最终交付物

最终验收包必须包含且内容已实跑核验：

- `README.md`
- `SPEC-COMPLETE-DEMO.md`
- `PLAN-COMPLETE-DEMO.md`
- `ARCHITECTURE.md`
- `RESEARCH-OPEN-SOURCE.md`
- `RESEARCH-ARXIV.md`
- `DATA-SOURCES.md`
- `SECURITY.md`
- `VERIFICATION.md`
- `CHANGELOG.md`
- `DEMO-SCRIPT-90S.md`
- 源代码、`package-lock.json`、`.env.example`
- unit/contract/integration/E2E 测试与报告
- 三市场、两钱包、真实 unattributed 的脱敏联网证据索引
- Web 与 Agent x402 的 Base Sepolia receipt/transaction hash 证据
- recorded manifest、sanitizer 说明、offline replay 报告
- 成本账本汇总、未解决问题、最终状态

90 秒脚本必须演示：输入钱包或 preset → 免费 Summary → 时间线/覆盖率与限制 → 真实 unattributed → Web 或 Agent 402 → Base Sepolia 解锁 → offline replay 说明；不能展示虚构百分比或把 recorded 当 live。

## 19. v0.2 Agent Observation Addendum

### 19.1 任务原则

- 只在现有单一 Investigation Orchestrator 内增加事件发出和观察汇总；不创建第二个 Orchestrator，不引入多 LLM Agent framework、队列、数据库、外部服务、WebSocket 或新页面。
- 9 个逻辑 Worker 为 `input`、`market-data`、`repricing`、`evidence`、`attribution`、`wallet-analysis`、`policy-verification`、`report`、`payment`；它们是既有管线的可审计职责标签。
- 只有现有 Attribution Provider 可以调用 Anthropic；Audit & Report Agent 只监听、校验、写入 append-only JSONL 和聚合，不调用 LLM、不修改业务结果。
- 所有时间、URL、data status、coverage、限制和政策 flag 由现有确定性 Policy Verifier 校验；无证据为 `unattributed`，coverage `<0.40` 为 `insufficient_evidence`。
- 只使用现有 Next.js、TypeScript、React、Vitest、Playwright 和工作区 JSONL/JSON artifacts，不新增 npm 依赖。

### 19.2 Change task sequence

| ID | 任务 | 输入/依赖 | 输出 | 验证 | 失败处理 |
|---|---|---|---|---|---|
| C-OBS-01 | Event contract、runtime validator、redaction | Spec v0.2 §12.3、现有 contracts | event types、enum、schema、脱敏器 | 合法/非法字段、sequence、时间、coverage、digest tests | 无效事件拒绝并写结构化 error；不放宽合同 |
| C-OBS-02 | Orchestrator event emission | C-OBS-01、T02–T17 既有模块 | 9 个 Worker 的 started/completed/skipped/failed 事件 | 顺序、retry、status、data_status、业务结果 deep-equal | 事件失败不改业务结果；报告标记 audit partial |
| C-OBS-03 | Audit & Report Agent | C-OBS-01、C-OBS-02 | append-only `events.jsonl`、聚合 report JSON/Markdown | 事件重放确定性、无 LLM、无业务突变 | 保留有效事件并显式标记失败，不补造事实 |
| C-OBS-04 | `run_id` metadata 与 `/audit` API | C-OBS-03 | 可选 response `meta.run_id`；`GET /audit?run_id=&format=json|markdown` | JSON/Markdown、not_found、无外部调用 | 保持现有 Summary/Detail contract 和 x402 gate |
| C-OBS-05 | 单页 Agent Console | C-OBS-04、T10 | 折叠 Console、轮询、状态/限制显示、导出按钮 | Playwright running/done/blocked/error/insufficient/unattributed/payment_required | 不新增页面；轮询失败显示 error/partial |
| C-OBS-06 | 三 preset recorded acceptance | C-OBS-05、T14–T17 artifacts | Market、Wallet A、Wallet B 的 Console/reports | data_status、coverage、unattributed、402 边界 | 无 key/x402 时保持 recorded/blocked/payment_required |
| C-OBS-07 | Regression、security、clean-room | C-OBS-01–06 | tests、screenshots、verification artifacts | npm verify、E2E、offline、clean-room、secret scan | 失败停止变更实现，不修改基线业务行为 |
| C-OBS-08 | 文档和 90 秒脚本 | C-OBS-07 | README、ARCHITECTURE、VERIFICATION、CHANGELOG、演示脚本 | 链接、命令、措辞和 DoD 追踪检查 | 文档不能掩盖未验证 live 资源 |

执行依赖：`T17 -> C-OBS-01 -> C-OBS-02 -> C-OBS-03 -> C-OBS-04 -> C-OBS-05 -> C-OBS-06 -> C-OBS-07 -> C-OBS-08`。C-OBS-01、C-OBS-03 的纯 contract 工作可与不依赖其输出的文档审阅并行；共享 event contract 必须先锁定。

### 19.3 Event/artifact/API implementation contract

每个 run 的事件必须包含：`run_id`、`sequence`、`agent_id`、`event_type`、`status`、`started_at`、`completed_at`、`duration_ms`、`data_status`、`input_digest`、`output_artifact`、`source_count`、`coverage`、`retry_count`、`cost_usd`、`error_code`、`policy_flags`。具体类型和值域完全按 Spec v0.2 §12.3 执行，不得在 Plan 中扩展。

唯一持久化位置：

```text
artifacts/agent-runs/<run_id>/events.jsonl
artifacts/agent-runs/<run_id>/report.json
artifacts/agent-runs/<run_id>/report.md
```

`events.jsonl` append-only；报告可由事件重放生成。新增只读 API 为 `GET /audit?run_id=<id>&format=json|markdown`；现有 `/summary`、`/attribution`、`/health` 的请求语义和支付边界保持不变。Console 在同一 `/` 页面每 1–2 秒轮询，完成/失败/blocked 后停止。

### 19.4 Recorded/no-credential acceptance

无 `ANTHROPIC_API_KEY` 和无真实 x402 凭据时，必须完成：recorded Summary、9 Worker event stream、coverage/unattributed gate、Agent Console、JSON/Markdown report 和 payment-required 402 boundary。Attribution event 必须是 `blocked`/`unattributed`，Payment event 必须是 `payment_required`；synthetic 只用于 contract/fault/integration/E2E/UI tests。

以下不在无凭据条件下宣称通过：live Anthropic attribution、真实 Base Sepolia verify/settle、Web/Agent unlock、receipt hash 和真实 paid Detail success。最终仍按基线规则标记 `PARTIALLY VERIFIED`，不得标记 `COMPLETE`。

### 19.5 v0.2 observation DoD

| ID | 验收项 | 主要任务 | 证据 |
|---|---|---|---|
| OBS-01 | 单一 Orchestrator 产生 9 个逻辑 Worker 的合法有序事件 | C-OBS-01/02 | event contract + sequence report |
| OBS-02 | Audit & Report Agent 只读事件、无 LLM、业务结果不变 | C-OBS-03 | deep-equal replay + provider scan |
| OBS-03 | JSONL append-only，JSON/Markdown 可重放生成 | C-OBS-03/04 | artifact replay/hash |
| OBS-04 | `/audit` 与可选 `run_id` metadata 向后兼容 | C-OBS-04 | API contract/fault tests |
| OBS-05 | 单页 Console 支持轮询、完成停止和限制状态 | C-OBS-05 | Playwright DOM/screenshot evidence |
| OBS-06 | 三个 recorded preset 完成 Console、Summary、coverage/unattributed、402 gate | C-OBS-06 | recorded reports + screenshots |
| OBS-07 | schema、redaction、error、API、E2E、visual、offline、build、clean-room 通过 | C-OBS-07 | JUnit、scan、clean-room report |
| OBS-08 | 无 Anthropic/x402 凭据仍可完成 recorded Console/Report demo，且不误标 live/COMPLETE | C-OBS-06/07/08 | verification + wording scan |

### 19.6 预算、权限和安全

- 不增加批准预算上限 USD 10；Audit & Report Agent 不产生外部 LLM 费用；Anthropic 费用仍只由既有 Attribution Provider budget guard 管理。
- 不新增依赖、数据库、外部服务或供应商；不改变只读 Polymarket、Base Sepolia-only、无服务端代签和无用户钱包连接边界。
- 事件、报告、截图、日志和下载均不得包含 API Key、私钥、完整请求头、Authorization、Cookie、PAYMENT-SIGNATURE、Anthropic prompt 或原始 Anthropic response。
- 发现泄露、Spec 冲突、预算突破、宿主权限拒绝或所有降级路径失败时停止变更实现并保留当前基线。

### 19.7 v0.2 审批状态

本 Plan v0.2 由 `AGENT-OBS-BUNDLE-001 v0.2` 原子审批包激活。候选内容或 SHA-256 任一变化，必须生成新版本并重新审批。
