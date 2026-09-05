# Alibi Complete Runnable Demo

> Development Snapshot — PARTIALLY_VERIFIED

Alibi 是一个只读的 Polymarket Trust Agent Demo：它读取公开市场价格和公开交易时间线，使用确定性规则识别重定价窗口，并把可验证证据、coverage gate、限制和 `unattributed` 结果分开呈现。

它不构成投资建议，不提供买卖方向，不指控任何主体；时间上的先后关系不等于因果、内幕交易或确定的信息优势。

## Platform v0.7

v0.7 保留单一 Investigation Orchestrator，并把确定性管线映射为 Evidence、Attribution、Quality & Risk 和 Audit & Report 四类逻辑 Agent；不引入多 LLM Agent 框架。Console 显示四类高层 Agent 及九个底层 Worker，Audit & Report Agent 只监听并汇总 append-only JSONL 事件。

本地 RAG 固定使用 `onnx-community/all-MiniLM-L6-v2-ONNX`、revision `aff7a1dc4e8a1ea593e6ea21e95c22ef0a25966f`、384 维 mean pooling + normalize，Transformers.js `3.7.0`，远程模型关闭。模型文件先验 hash 在 `artifacts/rag/model-manifest.json`；加载失败只允许 `rag_degraded` keyword fallback。不会读取 `EMBEDDING_API_KEY` 或调用外部 embedding API。

## Quick start

要求 Node.js `>=20.9 <27`。

```powershell
npm ci
npm run verify
npm run demo
```

打开 `http://127.0.0.1:3000/`。默认 UI 选择 `recorded`，因此不依赖外部服务或凭据。`npm run setup-and-demo` 是新环境的一条安装并启动命令。

## Modes and fixtures

- `recorded`：使用 `fixtures/recorded/manifest.json` 及脱敏回放；不会被标为 live。
- `live`：只读调用 Gamma、CLOB 和 Data API；没有可用上游时返回结构化错误，不静默切换 synthetic。
- `synthetic`：仅存在于 `fixtures/synthetic` 和测试/故障注入，不是演示调查数据。

重新筛选公开候选并录制回放：

```powershell
npm run select-demo
npm run capture-recorded
npm run verify:offline
```

`capture-recorded` 只有在相应 live 读取成功后才写入 fixture；来源 URL、HTTP 状态、检索时间和限制保留在 manifest 中。

## API

| Method | Path | Purpose |
|---|---|---|
| POST | `/summary` | 免费摘要，body 为 `{ input, mode }` |
| POST | `/attribution` | 0.01 USDC、Base Sepolia、x402 exact 保护的 Detail |
| GET | `/health` | 本地状态和 fixture 状态；不调用付费服务 |
| GET/POST | `/api/v1/summary` | v1 recorded/live-labeled Summary |
| POST | `/api/v1/attribution` | v1 Detail；未满足 x402 时返回 402 |
| GET | `/api/v1/wallets/<address>/report` | 90-day wallet report and coverage |
| GET | `/api/v1/rankings?address=<address>` | deterministic recorded ranking replay |
| GET | `/api/v1/agents/runs/<runId>` | audit JSON/Markdown export |
| GET | `/api/v1/health`, `/api/v1/subscription/*`, `/api/v1/erc8004/status` | v1 capability/status contracts |

本地 MCP 使用 `npm run mcp:verify` 验证 stdio server；`npm run package-extension` 生成 unpacked MV3 与 `artifacts/extension/alibi-extension.zip`。扩展仅读取 Polymarket URL 并调用本地 Summary API，不读取钱包/凭据、不签名、不支付、不交易。

Detail 请求在未配置正式收款地址时仍返回 HTTP 402 和脱敏 challenge-shaped header，供本地 contract 测试；正式 verify/settle 需要安全配置 x402 资源。

## Agent Console and audit reports

每次从 `/summary` 开始的分析都会生成一个 `run_id`，并在 `artifacts/agent-runs/<run_id>/` 写入 append-only `events.jsonl` 以及可重建的 `report.json` / `report.md`。现有 `/` 单页会轮询 `GET /audit?run_id=<run_id>`，显示九个逻辑 Worker 的状态、duration、data status、source count、coverage、retry、cost 和 policy flags；Console 只观察和汇总，不修改分析结果。

Console 的 `Export JSON` 和 `Export Markdown` 链接只读取当前报告，不会重新分析。支付区域只显示金额、网络和脱敏的 challenge 状态；不要在页面或日志中输入私钥、完整 payment header 或 payment signature。

## Approved credentials

只在本地安全环境中配置 `.env.local` 或进程环境，不要在聊天中粘贴私钥或 API key：

`ANTHROPIC_API_KEY`、`ANTHROPIC_MODEL`、`X402_FACILITATOR_URL`、`X402_NETWORK`、`ALIBI_PAYMENT_ADDRESS`、`BASE_SEPOLIA_RPC_URL`、`BUYER_AGENT_PRIVATE_KEY`、`APP_BASE_URL`、`ALIBI_DATA_MODE`、`MAX_EXTERNAL_API_COST_USD`。

Anthropic adapter 已实现超时、有限重试、JSON contract、证据 ID allowlist、预算控制和 `unattributed` 降级；当前 key 缺失，live attribution 仍未验证。x402 买方脚本只接受 Base Sepolia exact 条款，私钥只在本地 signer 进程读取。

ERC-8004 只允许一个 `Alibi Evidence Agent` 根身份；IdentityRegistry 与 ReputationRegistry 固定为批准地址，owner 必须等于 `ALIBI_PAYMENT_ADDRESS`，client 必须不同，`agentWallet` 初始为 owner，validation 固定 `not_enabled`。本地 Solidity 使用 Hardhat `3.0.0`、solc `0.8.24` 和 OpenZeppelin `5.4.0`；PostgreSQL 使用 `pgvector/pgvector:0.8.6-pg16`，迁移只在本地数据库可用时执行。

## Verification snapshot

当前状态是 `PARTIALLY VERIFIED`，不是 `COMPLETE`。已经通过的本地证据包括 typecheck、lint、19 个测试文件/41 个 Vitest contract/unit/integration tests、production build、2 个 Playwright E2E、Agent Console 的真实浏览器视觉验收、3 个 recorded presets、完整 v1 API smoke、市场免费 Summary 和未付款 Detail 的 HTTP 402；v0.7 新增模块还通过本地 ONNX 384 维推理、MCP 八工具构造、Solidity 编译与本地链 Subscription/Anchor smoke、MV3 zip 内容检查和 clean-room 重装验收。

仍阻塞完整验收：`ANTHROPIC_API_KEY` 缺失，无法验证 live Anthropic attribution；`ALIBI_PAYMENT_ADDRESS`、`BASE_SEPOLIA_RPC_URL` 和买方测试凭据缺失，无法完成真实 Base Sepolia Web/Agent verify/settle 和 receipt 验证。详见 [VERIFICATION.md](VERIFICATION.md)。

更多边界与数据说明： [ARCHITECTURE.md](ARCHITECTURE.md)、[DATA-SOURCES.md](DATA-SOURCES.md)、[SECURITY.md](SECURITY.md)、[DEMO-SCRIPT-90S.md](DEMO-SCRIPT-90S.md)。
