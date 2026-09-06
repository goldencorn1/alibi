# Alibi 项目交接手册

## V25 / ALIBI-PLATFORM-BUNDLE-005 v0.7 execution continuation — 2026-09-04

Exact approval was received and the v0.7 activation record remains in `artifacts/verification/alibi-platform-bundle-005-activation-v07.json`. User files and the prior Complete Demo Spec/Plan remain protected. New platform implementation is additive.

Completed after activation:

- P02–P07: platform contracts, deterministic time/repricing/DEES/coverage/risk/final-state modules, 90-day ranking/replay, WebSocket replay state + REST fallback, local q4 MiniLM model download/hash manifest and local vector/keyword RAG, PostgreSQL 16 + pgvector compose/migrations.
- P08–P13: four logical Agent facades, single Orchestrator, Audit & Report compatibility, persisted report exports, Console high-level Agent cards.
- P14–P20: v1 Summary/Detail/wallet/ranking/agent APIs, subscription/ERC-8004 status contracts, ERC-8004 registration schema, Solidity contracts + local compile manifest, MCP eight-tool stdio/HTTP surface, MV3 unpacked/zip artifacts.
- P21–P23: typecheck, lint, 41 tests, production build, Playwright 2/2, real local ONNX 384-dimension smoke, API smoke, recorded replay and browser screenshots.
- Added `src/reports/assembler.ts` and routed v1 Detail through x402 protection when configured; the v1 unpaid boundary has a regression test.
- Local Hardhat chain smoke passed for TestUSDC, AlibiSubscription and AlibiEvidenceAnchor; evidence is `artifacts/verification/contracts-local-chain.json`, and no public-chain transaction was sent.
- Final local regression: fresh clean-room `npm ci` (558 packages), clean-room typecheck/lint/19 files/41 tests/build, isolated port 3010 browser flow, 4 platform Agent cards, 9 Worker rows and both audit exports.

Current resource gates:

- `ANTHROPIC_API_KEY`, Base Sepolia RPC/payment/buyer wallets, `DATABASE_URL`, public MCP endpoint and Chrome extension ID are absent. These are not read or printed; local implementation continues, but live attribution, chain settlement, DB runtime, public MCP and store verification are not complete.
- Docker CLI is installed but the Docker Desktop Linux daemon is unavailable, so PostgreSQL migration was not executed. No chain transaction, ERC-8004 registration, MCP Registry publication or Chrome Store publication was performed.
- Final state remains `PARTIALLY VERIFIED`; never mark `COMPLETE` until the live gates and full v0.7 local DoD are rerun.

Resume commands:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run verify:offline
npm run mcp:verify
npm run package-extension
npx hardhat compile
```

When resources are later supplied, only check existence and safe public addresses first. Keep owner equal to payment address, client distinct, chain ID 84532, the 5/500,000/1,500,000 caps, and `validation=not_enabled`. Do not disclose secrets or execute public release without final human acceptance.

状态：`PARTIALLY_VERIFIED`  
快照时间：2026-09-04T09:22:20+08:00（Asia/Shanghai）  
工作目录：`E:\gpt plus\HK JKS`  
当前阶段：Stage 4 / V1，所有可执行本地任务已完成；Anthropic live attribution 与 Base Sepolia x402 仍待凭据  
外部实际费用：USD 0 / 已批准上限 USD 10

## 1. 给接手模型的第一条指令

继续执行已批准的 `COMPLETE-DEMO-PLAN v0.1`。不要重新请求 Spec 或 Plan 批准，不要修改已批准文档内容；先核验本手册、执行协议、Spec、Plan 和两份研究矩阵，再运行最终验证或处理剩余外部凭据门控。

用户已恢复执行。当前工作已保存；后续接手者应直接运行最终核验命令，不要修改已批准的 Spec/Plan。

## 2. 已获得的正式授权

以下精确指令已经收到并生效：

```text
GRANT: PREFLIGHT-PERMISSIONS v18.0
BUDGET: USD 10
APPROVE: COMPLETE-DEMO-SPEC v0.1
APPROVE: COMPLETE-DEMO-PLAN v0.1
```

Plan 获批后已向用户发出协议要求的“前置确认已经完成，可以去睡觉”通知。后续执行在批准范围内不需要逐批询问；只有协议列明的 Change Control、宿主权限、安全、预算或不可替代资源阻塞才应唤醒用户。

## 3. 必读文件与优先级

1. `E:\codex\attachments\ce1b8957-6a93-4fb7-869d-c9a503e75933\pasted-text.txt`：Complete Runnable Demo Execution Protocol v18.0。
2. `E:\gpt plus\HK JKS\SPEC-COMPLETE-DEMO.md`：已批准 Spec v0.1，唯一产品硬规范。
3. `E:\gpt plus\HK JKS\PLAN-COMPLETE-DEMO.md`：已批准 Plan v0.1，执行任务、依赖、预算和降级规则。
4. `E:\gpt plus\HK JKS\RESEARCH-OPEN-SOURCE.md`：开源研究矩阵。
5. `E:\gpt plus\HK JKS\RESEARCH-ARXIV.md`：论文应用矩阵。
6. `E:\wechat\xwechat_files\wxid_sn9qojc6euro22_d75c\msg\file\2026-09\alibi-pitch.html`：原始 PRD。

优先级：安全红线 > 人类最新明确决定 > Spec > Plan > PRD > 工程推断。

## 4. 已完成进度

### Stage 0

- PRD 和执行协议已读取。
- 权限、凭据、预算与降级路径已完成预检。
- 用户已批准权限并设置 USD 10 上限。

### Stage 1

- 开源与 arXiv 研究完成。
- `RESEARCH-OPEN-SOURCE.md`、`RESEARCH-ARXIV.md` 已生成。
- `SPEC-COMPLETE-DEMO.md v0.1` 已生成并正式批准。

### Stage 2

- `PLAN-COMPLETE-DEMO.md v0.1` 已生成并正式批准。
- Plan 含 18 个执行任务、24 项 DoD 映射、依赖白名单、阈值校准、x402、预算、重试、recorded 回放和 Change Control。

### Stage 3 / E0

- 运行环境：Node `v24.16.0`、npm `11.15.0`、Git `2.45.0.windows.1`。
- 无费用网络健康检查已完成：
  - Gamma API：HTTP 200；
  - Data API：HTTP 200；
  - CLOB price history：使用故意无效 token 得到预期 HTTP 400，说明端点可达；
  - x402 test facilitator `/supported`：HTTP 200。
- 预检证据保存在 `artifacts/verification/preflight.json`。

### Stage 3 / E1 → Stage 4 / V1（本地部分完成）

- 已创建 `package.json`、`package-lock.json`、`.gitignore`、`.env.example`，并安装 Plan 白名单内依赖；npm 报告 `0 vulnerabilities`。
- 已完成 `app/`、`src/`、`scripts/`、`tests/` 以及 Next/TypeScript/Tailwind/ESLint/Vitest/Playwright 配置。
- 已完成 contract、输入解析、Polymarket 只读 adapters、重定价、证据边界、钱包 coverage gate、Anthropic adapter、API、UI、x402 402 边界、Web/Agent helper、recorded replay、文档和 clean-room verification。
- 当前没有运行中的项目 Node/npm 服务、未结算支付或 Anthropic 付费调用；工作区文件已保存。
- `ANTHROPIC_API_KEY`、Base Sepolia/x402 买方资源仍缺失，因此最终状态保持 `PARTIALLY VERIFIED`，不可标记 `COMPLETE`。

## 5. 已安装依赖快照

运行时：

```text
@anthropic-ai/sdk  ^0.123.0
@x402/core         ^2.24.0
@x402/evm          ^2.24.0
@x402/fetch        ^2.24.0
@x402/next         ^2.24.0
next               ^16.3.4
react              ^19.2.8
react-dom          ^19.2.8
viem               ^2.56.3
```

开发依赖：

```text
@playwright/test       ^1.62.1
@tailwindcss/postcss   ^4.3.3
@types/node            ^26.4.1
@types/react           ^19.2.18
@types/react-dom       ^19.2.7
@vitest/coverage-v8    ^5.0.0
eslint                 ^9.39.5
eslint-config-next     ^16.3.4
postcss                ^8.5.28
tailwindcss            ^4.3.3
tsx                    ^4.23.13
typescript             ^6.0.3
vitest                 ^5.0.0
```

安装时 npm 对 `eslint@9.39.5` 输出“版本不再受支持”的弃用警告，但没有安全漏洞。接手后先核验 Next 16.3.4 的 peer compatibility；同一白名单包的兼容 patch/minor 调整可直接记录，跨 major 或新依赖按 Plan 的 Change Control 判断。不要仅为消除警告擅自新增 linter。

## 6. 当前缺失资源

只检查过“存在/缺失”，没有读取或记录 secret 值：

| 资源 | 当前状态 | 影响 |
|---|---|---|
| `ANTHROPIC_API_KEY` | 缺失 | 不能完成真实 Anthropic 归因；可先完成确定性边界和 synthetic/recorded contract tests |
| `ALIBI_PAYMENT_ADDRESS` | 缺失 | 不能生成可结算的正式 402 challenge |
| `BASE_SEPOLIA_RPC_URL` | 缺失 | 不能做链 ID、余额和 receipt 的独立核验 |
| `BUYER_AGENT_PRIVATE_KEY` | 缺失 | 不能完成 Web/Agent 两条真实 testnet 支付 |
| `X402_FACILITATOR_URL` | 缺失 | Plan 默认只允许 `https://x402.org/facilitator` |
| `X402_NETWORK` | 缺失 | Plan 默认且只允许 `eip155:84532` |
| `MAX_EXTERNAL_API_COST_USD` | 缺失 | 使用用户明确批准的硬上限 10，不得更高 |
| `ANTHROPIC_MODEL` | 存在 | 非敏感；最终记录实际 model ID，Plan 默认 Haiku 4.5 |

不要要求用户在聊天中粘贴私钥。缺失资源不阻塞本地实现、公开 Polymarket 接入、测试、UI 和文档；真实 LLM/x402 最终仍缺失时只能提交非 `COMPLETE` 状态。

## 7. 当前安全与范围边界

- 只读 Polymarket；不得调用 orders、cancel、relayer、bridge 或交易认证接口。
- 禁止主网、真实资金、用户钱包连接、服务端代签和私钥输出。
- Anthropic 只用于 Evidence 与 RepricingWindow 相关性判断。
- 不推断钱包真实身份，不指控主体，不把先后关系写成因果或内幕交易。
- 不得把 synthetic、recorded、cached 写成 live。
- recorded 只能在相应 live 流程成功后生成并先脱敏。
- 不新增页面、数据库、MCP/Bazaar、Chrome 插件、新闻 API 或 Plan 白名单外直接依赖。
- 当前实际外部费用为 USD 0；累计 9 美元软停止、10 美元硬停止。
- 保护用户原有 `E:\gpt plus\HK JKS\alibi-pitch_1.html`，不要覆盖或删除。

## 8. 精确续接顺序

### 第一步：恢复状态

1. 完整读取协议、Spec、Plan、本手册。
2. 运行只读 `Get-ChildItem`、`npm ls --depth=0` 和环境变量存在性检查；不得回显值。
3. 确认没有未完成 npm/Node 进程，不重复安装已存在依赖。
4. 不要修改已批准 Spec/Plan 的内容或版本。

### 第二步：E1 已完成

使用 `apply_patch` 创建：

- `tsconfig.json`、`next.config.ts`、`postcss.config.mjs`、`eslint.config.mjs`；
- `vitest.config.ts`、`playwright.config.ts`；
- `app/layout.tsx`、最小 `app/page.tsx`、`app/globals.css`、`app/health/route.ts`；
- `src/contracts/*`：DataStatus、InputRef、PricePoint、Trade、Evidence、RepricingWindow、WalletMetrics、Summary/Detail、error envelope、schema version 和运行时校验；
- `tests/contract/*` 的最小 contract tests。

已运行 typecheck、lint、unit/contract/integration tests 和 `next build`，结果通过。

### 第三步：Plan T04-T17 已完成

1. 输入 parser、Gamma/CLOB/Data adapters、retry/cache 和 normalizer。
2. 真实候选市场/钱包筛选和精选证据 metadata。
3. 重定价、归因约束、钱包对齐与 coverage gate。
4. `/summary`、`/attribution`、`/health` 和单页六状态 UI。
5. x402 服务端与 Web/Agent 本地 signer 客户端；无 secret 时先完成 contract/fault tests。
6. 公开 Polymarket live read-only 成功后已生成 sanitized recorded fixtures；Anthropic live 未执行。
7. offline、E2E、文档、90 秒脚本和 clean-room verification 均已完成。

### 第四步：真实资源仍缺失时

继续完成所有免费和本地任务，不要提前中止整个项目。最终精确列出：

- 已通过的 DoD；
- 因 `ANTHROPIC_API_KEY` 缺失而未通过的 live attribution；
- 因 Base Sepolia 资源缺失而未通过的 Web/Agent x402；
- 是否能合法生成 recorded；
- 最终应为 `PARTIALLY VERIFIED` 或 `BLOCKED`，不能写 `COMPLETE`。

## 9. 当前文件完整性快照

```text
SPEC-COMPLETE-DEMO.md       559343EE5ED265267F20457768BA533BD2B2E268110B42310516A0A68DBAB29B
PLAN-COMPLETE-DEMO.md       C3FA2EC5F9330416904405D93E577355CBE37F449C2EB7B282F6D7D18CBF3DE4
RESEARCH-OPEN-SOURCE.md     10A838B075482B9B2C06CF72B82A6402D70DB8DB1F785ADAACCC68674451B176
RESEARCH-ARXIV.md           FEEF6E1E60368B3D5AE3D07691D89ECD41F13DAE9FE5A598DA5EAAD933E339BD
package.json                2BB88CBB75EC3A0DDD6CDFACEF718E643DA9F1D5D77E7C6CB4D3398012370FD7
package-lock.json           5D217AD64E1698C6B57CE050AD1867AEEF7D7DA6053415181AA9A9E1AE6FB6D9
.env.example                F3846700B97BFA1733E7BBD3B55CAF4480E9D19EBD724E8A040310FFFA1165FA
.gitignore                  993CDA7B2FBA76F82433AF0AED1778F3F1B189C72C096C21E308D87DD2DB6FC5
artifacts/verification/preflight.json
                            828D452CE6AE1095271EFF10309012C3F4B63143F7A6C4F59D6F82907CB85F45
```

这是暂停时的参考快照，不是要求后续实现保持相同 hash；任何已批准执行产生的代码和 lockfile 变化应记录到 `CHANGELOG.md`。

## 10. 当前交接结论

项目没有运行中的项目后台任务，没有未结算支付，也没有 Anthropic 付费调用。`npm run verify`、`npm run test:e2e`、`npm run verify:offline` 和 clean-room verification 已通过；`npm run verify:live` 会正确报告 `partial`，因为缺少 Anthropic 与 Base Sepolia/x402 凭据。Wallet A/B 的 recorded coverage 分别为 1.88% 和 0.01%，因此应用保守返回 `insufficient_evidence`，不输出 lead-rate 或能力结论。接手后仅需在安全配置凭据后重跑 live acceptance；不得把 synthetic/recorded 结果写成 live 或真实归因。
## Current CR handoff — Cluster/Language Evidence

The active task is PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 execution after exact approval. The dedicated handoff is:

/Users/a0000/polymarket/HANDOFF-CLUSTER-LANGUAGE-EVIDENCE-001.md

Current feature status is local implementation in progress; do not claim COMPLETE. The CR attachment hash is 8d07c2ef4b7d6061de91482374505a19db32f8117c34307a5ba28e69e3ce70bd. SPEC-ALIBI-PLATFORM.md v0.7 remains protected and must retain hash 6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c.

The implementation must remain additive and evidence-only. Do not change package.json, package-lock.json, next.config.ts, payment/x402 terms, existing /api/v1/* routes, MCP, Extension, ERC-8004, environment files, database state or existing recorded fixtures. If a dependency, migration, new public route or product claim is required, stop with CHANGE_CONTROL_EXPANSION_REQUIRED.

Before final acceptance, run the current full suite, typecheck, lint, build, recorded replay, 402 smoke, Playwright desktop/mobile/200% zoom, secret scan, source/lockfile integrity and clean-room checks. Record actual changed files, test counts, screenshot paths, external network/cost, blockers and final PARTIALLY VERIFIED/COMPLETE state.

## Current CR execution result — 2026-09-04

The Plan approval was received and executed. The local deterministic cluster/language implementation and additive report/UI integration are complete within scope. Verification passed for typecheck, lint, 25 Vitest files/76 tests, 12 Playwright tests, Webpack production build, recorded replay, legacy HTTP 402/x402 V2 smoke, recursive recorded-fixture Secret scan, MCP local construction, Extension local packaging, ERC-8004 preflight and isolated clean-room install/test/build.

The project remains `PARTIALLY VERIFIED`. The Iran case is `CASE_NOT_REPRODUCED` because all nine requested artifacts are absent. Live source hydration, a real recorded cluster/language artifact, Anthropic attribution, Base Sepolia settlement and PostgreSQL/pgvector runtime remain unverified. The default Turbopack build is blocked by the host sandbox's `listen EPERM`; the Webpack build passed. No payment, chain transaction, migration, production write or dependency/lockfile change occurred.

Final evidence and actual file lists are recorded in `/Users/a0000/polymarket/VERIFICATION.md` and `/Users/a0000/polymarket/HANDOFF-CLUSTER-LANGUAGE-EVIDENCE-001.md`.

## CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2 execution handoff — 2026-09-04/05

The exact execution authorization was received and completed within the approved Plan matrix. The v0.7 Spec and Plan, package manifests, `next.config.ts`, environment files, database/migrations, existing recorded fixtures, x402 terms, MCP/Extension/ERC-8004 production sources and public endpoints remain protected. This is a no-Git workspace; rollback uses the pre-change manifest and backup at `/private/tmp/alibi-cluster-language-v02-backup-20260904T204438`.

### Delivered locally

- Additive SourceObservation/provider-state/coverage/calibration fields with schema version retained at `1.1.0`.
- Native-fetch adapters for GDELT discovery-only, HKSAR ISD bilingual RSS, Federal Register Public Inspection, SEC EDGAR and HKMA; unavailable/date-only/incomplete sources remain unknown.
- Absolute-error P95 calibration gate with 30-sample minimum; no calibration is claimed until the independent cohort exists.
- Language interval overlap produces `release_order=indeterminate`; pairing and source-state gates remain conservative.
- Existing 180-minute, BUY/taker, fixed-point, P99/200, D1–D6 and herding veto are unchanged.
- Market Channel trigger-only primitives, read-only `/trades` hydration and canonical reconcile helpers; no private channel, wallet identity from stream, signing or trading.
- Bounded process-local `PAYMENT-IDENTIFIER` replay/conflict/race handling and shared legacy/v1 preflight boundary; 402 terms unchanged.
- GUI/CLI/APP recorded-only state presentation, free explicit unattributed detail, keyboard/responsive/200% zoom/reduced-motion acceptance.

### Verification handoff

`npm test` passed 25 files/76 tests; `npm run typecheck`, `npm run lint`, controlled `npx next build --webpack`, `npm run verify:offline` and Playwright 12/12 passed. Default Turbopack hit the host sandbox CSS worker `listen EPERM`; do not treat that environment failure as a source failure. Final clean-room `/private/tmp/alibi-cluster-language-v02-clean-room-final-f4QJp7` passed `npm ci --ignore-scripts`, typecheck, lint, 76 tests, Webpack build and recorded replay.

Screenshots are at:

- `/Users/a0000/polymarket/artifacts/verification/screenshots/cluster-language-desktop.png`
- `/Users/a0000/polymarket/artifacts/verification/screenshots/cluster-language-mobile.png`
- `/Users/a0000/polymarket/artifacts/verification/screenshots/cluster-language-200-percent.png`

Source preflight details and response hashes are at `/Users/a0000/polymarket/artifacts/verification/cluster-language-source-preflight.json`. Iran replay remains `CASE_NOT_REPRODUCED`; the required nine-artifact package was not created.

### Safe resume and rollback

Before any further work, recheck the protected hashes listed in `VERIFICATION.md` and inspect the current file matrix. To roll back only this execution, restore the exact pre-change files from the timestamped backup and remove only the explicitly recorded new files (`src/analysis/source-calibration.ts`, the five new evidence/payment/test files and the preflight artifact); do not use `git reset`, `git checkout` or workspace-wide deletion. After rollback, rerun typecheck, targeted contract/API tests, 402 smoke, recorded replay and clean-room smoke.

### Remaining gates

Do not mark `RUNNABLE_DEMO_COMPLETE` or `FULLY_LIVE_VERIFIED`. Live GDELT/Federal availability, 30-sample timestamp calibration, a real recorded bilingual pair/cluster, Anthropic attribution, payment settlement, database runtime, public MCP and Extension publication remain unverified. Any request to add dependencies, durable idempotency, migrations, new routes, public release or real funds requires one aggregated Change Control request.

## UI-I18N-GLOSSARY-001 v0.2 execution handoff — 2026-09-05

Approval recorded: `APPROVE: PLAN-UI-I18N-GLOSSARY-001 v0.2`.

Workstream A passed its gate with the existing BUY-only cluster rules intact. SELL remains context only and is excluded from candidate membership, D1–D6, herding and the formal alert gate. D4 remains conservative: the UI maps `first_trade_ratio` to `Thin-History Ratio` only when a trusted payload includes value and coverage; missing or unverifiable fields render unavailable/insufficient evidence, with no browser recomputation.

Workstream B completed the approved UI-only scope: `zh-CN`/`en`, default Chinese, `alibi_locale` SSR cookie, synchronized metadata/lang, centralized Glossary with zero pending definitions, accessible TermHelp, client-side Audit Markdown localization, responsive/keyboard/200% zoom/reduced-motion handling, and synthetic-data isolation. Legacy `/summary`, `/attribution`, `/audit` calls remain unchanged; no `/api/v1` adapter or API/payment change was added.

Verification: 28 Vitest files/82 tests passed; 15/15 serial Playwright tests passed; typecheck, lint, `next build --webpack`, recorded replay and local read-only API/x402 smoke passed. The standalone TermHelp `.tsx` unit file is excluded by the existing Vitest include and was covered by browser tests. Default Turbopack remains a host `listen EPERM` limitation. Screenshot and hash evidence is under `/Users/a0000/polymarket/artifacts/verification/ui-i18n-glossary-001/`.

Protected hashes remain unchanged. No payment, signing, chain transaction, migration, dependency installation/upgrade, live attribution, database change or public release occurred. Generated Next metadata may be refreshed by the framework; it is not an intentional product change.

Status: local `RUNNABLE_DEMO_COMPLETE`; overall platform remains `PARTIALLY_VERIFIED`, not `FULLY_LIVE_VERIFIED`.

## UI-I18N-GLOSSARY-001 v0.3 — paused handoff — 2026-09-05T02:48:12-07:00

The approved Plan v0.3 execution is intentionally paused at the user's request. Treat this section as the current handoff checkpoint. Do not resume automatically, and do not treat older sections in this file that describe a completed UI run as evidence for the current hashes below.

### Authorization and scope

- Approved execution: `EXECUTE: PLAN-UI-I18N-GLOSSARY-001 v0.3`.
- Plan SHA-256: `ce88cf933f6939a614fb697a1cb66c07f1741fafc1e0d2495599d59b51bfe4f1`.
- Only the v0.3 allowlist remains in scope. The protected v0.7 Spec, existing Cluster CR/Plan, API routes/contracts, BUY-only analysis, D4 data pipeline, x402/payment, dependencies, fixtures, database, migration, environment files, MCP, Extension, ERC-8004, WebSocket, RAG and Desktop launcher remain out of scope.
- No payment, signature, chain transaction, migration, live attribution, paid external call or public release occurred.

### Saved state

No Git repository exists. The earlier pre-change temp directory was not present when this checkpoint was resumed; a recoverable current-state snapshot is now at `/private/tmp/alibi-ui-i18n-glossary-v0.3-paused-20260905-025200`. The “Before SHA-256” values below are recorded baseline values, not a currently available pre-change manifest. Do not use `git reset`, `git checkout`, workspace-wide deletion, or broad cleanup.

Intentional current source changes are limited to:

- `app/page-client.tsx` — `f5489103bcbcdb70c02a68c2986ea1cecd8834ecee87193bfae43f7118328e95`
- `app/globals.css` — `27cccc84e7c50ce63e1b7bff1b11a206ef71efc2291f11a729d38a0b72d0ba74`
- `src/ui/glossary.ts` — `521bc87301ab9bd625ac6bbf283296726f90bdd9c6bec52e04beac3a5733a1ce`
- `src/ui/term-help.tsx` — `0d839bb5d4a73b6f31d0c4ae44294928f26e9784340a3f586dfc530dcd0a6578`
- `src/reports/markdown.ts` — `6c94e7d685f67930b1bdad5e84a013f80ce250d0e29de00e3028d6eb81dd1160`
- `artifacts/verification/ui-i18n-glossary-001/glossary-coverage.json` — `ad31d69d6c7f3d3806ab0d6d4e47b30ca14f2020794da0efa424236d9d0d6791`

These allowlisted files were unchanged during this checkpoint: `app/layout.tsx`, `app/page.tsx`, `src/ui/i18n.ts`, `tests/unit/i18n.test.ts`, `tests/unit/glossary.test.ts`, `tests/unit/markdown.test.ts`, `tests/unit/term-help.test.tsx`, `tests/e2e/app.spec.ts`, and `tests/e2e/i18n-glossary.spec.ts`.

### Verification already completed

- Typecheck PASS; lint PASS.
- Full Vitest PASS: 28 files / 82 tests; `artifacts/verification/vitest-junit.xml` was generated by the test runner.
- Targeted Vitest PASS: 7 files / 18 tests.
- Webpack production build PASS. Default Turbopack remains blocked by host sandbox `listen EPERM`.
- The temporary Webpack dev server was stopped; port 3000 was confirmed empty.
- Static Glossary mapping is complete: `GLOSSARY_COVERAGE=100%`, `UNMAPPED_TERMS=0`, `DUPLICATE_TERM_IDS=0`, `PENDING_DEFINITION=0`. This is not DOM verification.

### Remaining work on resume

Resume only when the user requests it. First re-check the backup and hashes, then run the remaining approved verification: recorded replay, API/402 read-only smoke, Playwright E2E, keyboard/TermHelp interaction, desktop/mobile/200% screenshots, reduced-motion checks, Secret scan, protected-file hash check, clean-room verification, and Desktop launcher page verification. Use the project's local Webpack command when the Turbopack sandbox issue recurs:

```text
PATH="/Users/a0000/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Applications/ChatGPT.app/Contents/Resources/cua_node/bin:$PATH" ./node_modules/.bin/next dev --webpack --hostname 127.0.0.1
```

Do not run any payment, signing, chain, migration, live attribution, paid external call or public release. If a check requires a forbidden file, new dependency, API/algorithm/data-model/payment/database change, or unsafe privilege, stop and consolidate the issue into one Change Request.

### Current gates and status

`A-GATE=STATIC_PASS_NOT_FINAL_VERIFIED`; `B-GATE=IMPLEMENTED_NOT_E2E_VERIFIED`; `V-GATE=PAUSED_PENDING`; `RUNNABLE_DEMO_COMPLETE=NOT_MARKED`; `FULLY_LIVE_VERIFIED=NOT_MARKED`. Overall project status remains `PARTIALLY_VERIFIED`.

## FAST-TRACK-LOCAL-DEMO + A2A amendment handoff — 2026-09-05/06

### Current checkpoint

- Working directory: `/Users/a0000/polymarket`
- Branch: `feature/wallet-discovery`
- HEAD: `81bfa49c0ec5cf9b723fd7a3a50984e680b04876`
- Local server: stopped; `127.0.0.1:3000` is free; no Next process remains.
- Worktree: intentionally dirty from earlier approved work. No reset, checkout overwrite, clean, stash, rebase, merge, push or commit was performed in this continuation.
- Product state: `LOCAL_DEMO_READY=YES`, `RUNNABLE_DEMO_COMPLETE=YES`, overall `PARTIALLY_VERIFIED`, `FULLY_LIVE_VERIFIED=NO`.

### Completed A2A scope

The approved `AMENDMENT-A2A-FIRST-LOCAL-DEMO v0.1` is implemented as a local recorded-only surface. `POST /api/v1/screen` accepts a bounded public wallet list and intentionally returns unavailable metrics when the snapshot cannot support thresholds. `GET /api/v1/a2a/capabilities` reports the actual eight MCP tools, honest recorded-only/not-verified boundaries and ERC-8004 not-registered status. `scripts/demo-a2a-client.ts` exercises the capabilities, leaderboard, wallet metrics/lead-rate and 20-address screen without payment or signing. The A2A Console displays the actual request, recorded audit trace, machine response JSON, copy/export controls and REST/MCP views.

### Task-touched files and final SHA-256

```text
c89ea8161610676f0fd77e51efffe50a6c8908e243cc6bc261eeec25241b978d  app/page-client.tsx
909fe8497495676f08b9db022ae5088344c3e867527b676314bfdb8e4203d549  app/globals.css
3481f029003ed3568e1b26d8ee0de044e4ecb69b5ed5db25b03f75fb32a092ce  src/ui/i18n.ts
ec309262cad838d650759ac4b9e61168859b9e7333d39218f1ab9a5b974b18e9  src/ui/glossary.ts
43acb3e61312b6df47088acdda32389a2631210f453ba65a07ebd4b3b0e6b987  app/api/v1/screen/route.ts
f1d3c8401193de2207dfa614178be01cfa2025e09395e1bdf7fab3e819df646c  app/api/v1/a2a/capabilities/route.ts
0980ecaf854f1659f9f6496bd09dd049e32cf1710a50d17e37d2707ed3f7b4ba  scripts/demo-a2a-client.ts
1ad01ced7a0975a29a5fb5053f1e3ce111c41af7d4fec1347004f32392786f2d  tests/e2e/local-demo-fasttrack.spec.ts
fc3fb34c318d50d7475dbf9d5cf0b1774b05cba21969aa13ed182f7f8065b349  tests/e2e/app.spec.ts
a60cba2c87a5fbbce4d7424e3a172e5b35b5e8f52a2ee928f66d556740061ba7  tests/unit/a2a-local.test.ts
5b0d4a06a3999c1289aecc172d2b774764e75080eab933b5c37537998d9d28d3  LOCAL-DEMO-RUNBOOK.md
991533ef001df068a084a333a9fa511eb6856a1b28bd7829682d2abb2d0c79e1  artifacts/verification/local-demo-fast-track/glossary-coverage.json
115fe01a607c7dad4abc9048fa13426c29260476ae46b48edac51517f8b3546f  artifacts/verification/local-demo-fast-track/api-smoke.json
247cc0dbd468e8a8dc955fda520863bc1dc13107cfeb279175d9317c4d5707d1  artifacts/verification/local-demo-fast-track/a2a-client.json
42937b7c3bd1c12a510cfa458f2f3b3fa3e0e4c6c7fcce2dceecc8a0280b68df  artifacts/verification/local-demo-fast-track/clean-room.json
6b702af6517a939ff07a14d37c5842ec7bd260cdf3ed8836a54a37623b68238d  artifacts/verification/local-demo-fast-track/protected-hashes.txt
679aca13209ec39c31e0360043699b6a40c9634a623003f11331663abff43f0f  artifacts/verification/local-demo-fast-track/secret-scan.txt
```

The new route directories and artifact screenshots are also task output. Existing unrelated dirty files, generated Next metadata, and earlier governance/report history were preserved and are not to be cleaned automatically.

### Verification summary

- `npm test`: 39 files / 250 tests passed.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `next build --webpack`: PASS.
- Recorded offline replay: PASS for market, wallet-a and wallet-b.
- Cluster fixture integrity: CLEAN; Iran blind replay remains `CASE_NOT_REPRODUCED` with nine required artifacts absent.
- Playwright: 24/24 passed sequentially, including accessibility, i18n, TermHelp, recorded API, A2A Console, mobile, desktop and 200% screenshots.
- Production build smoke: home 200, health 200, capabilities 200, screen 200; payment settlement not attempted.
- Glossary gate: 101/101, 100%, unmapped 0, duplicate IDs 0, pending definitions 0.

### Safe resume / demo commands

```text
cd /Users/a0000/polymarket
export PATH="/Users/a0000/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Applications/ChatGPT.app/Contents/Resources/cua_node/bin:$PATH"
./node_modules/.bin/next dev --webpack --hostname 127.0.0.1
./node_modules/.bin/tsx scripts/demo-a2a-client.ts
```

Do not use `npm run setup-and-demo` because it installs dependencies. Do not run payment, signing, chain, migration, live attribution, paid external calls, public release, or broad cleanup. If future work needs a new dependency, API/data-model/algorithm/payment/database change, or missing external credential, consolidate it into one Change Request.

## UI TermHelp polish handoff — 2026-09-05

- Changed only the TermHelp presentation layer in `app/globals.css` and added a regression assertion in `tests/e2e/i18n-glossary.spec.ts`.
- The visible `?` icon is now compact; the wrapper has reserved spacing and `flex: 0 0 auto`, and the button has `padding: 0`. No API, algorithm, payment, fixture, database or dependency changes were made for this polish.
- Verification: 40 Vitest files / 277 tests passed; 25/25 Playwright tests passed sequentially; typecheck and lint passed. `127.0.0.1:3000` is free after server cleanup.
- The working tree remains intentionally dirty with earlier user-approved work. Do not use reset, clean, checkout overwrite or broad staging to erase unrelated changes. The GitHub sync must use an explicit reviewed file list and must exclude `artifacts/agent-runs/`, secrets, caches and generated dependency directories.
