# Alibi macOS 交接手册

## 快照信息

- Windows 来源：`E:\gpt plus\HK JKS`
- 打包目标：macOS Apple Silicon 或 Intel
- 打包时间：2026-09-04（staging 时间戳见 `MIGRATION-MANIFEST.json`）
- 当前批准基线：`SPEC-ALIBI-PLATFORM.md v0.7`、`PLAN-ALIBI-PLATFORM.md v0.7`、`ALIBI-PLATFORM-BUNDLE-005 v0.7`
- 源目录不是 Git 仓库，因此没有 Git bundle；文件快照由 Manifest 和 SHA-256 保护
- 当前产品状态：`PARTIALLY VERIFIED`，不得改写为 `COMPLETE`

本包迁移的是当前快照，不改变产品 API、新闻 API、数据模型、依赖白名单或架构。产品 API 和新闻 API 仍待组长确认，当前实现按原样保留。

## 已包含模块

- Next.js 单页 Web Demo、Summary/Detail API、六类 UI 状态和 Agent Console
- 单一 Investigation Orchestrator、九个逻辑 Worker、Audit & Report 事件与 JSON/Markdown 报告
- Polymarket recorded replay、REST/WebSocket 适配器、repricing、evidence、coverage、wallet 和 90-day ranking
- Anthropic adapter（仅 Attribution 可调用；缺 key 时不得把 synthetic 当 live）
- 本地 ONNX embedding、RAG vector store 和显式 `rag_degraded` fallback
- PostgreSQL 16 + pgvector schema/migration 文件
- MCP Server、工具契约、Next `/mcp` 路由和 Chrome MV3 扩展源码
- Solidity `AlibiSubscription`、`AlibiEvidenceAnchor`、`TestUSDC`、Hardhat 测试/部署脚本
- ERC-8004 Identity/Reputation 本地计划与状态契约
- 脱敏 recorded fixtures、本地 embedding 模型和模型 Manifest

## 从解压到 Demo

```bash
mkdir -p ~/Projects/alibi
cd ~/Projects/alibi
unzip ~/Downloads/Alibi-Mac-Migration-v0.7-*.zip
cp .env.macos.example .env.local
npm ci
npm run verify:offline
npm run dev
```

浏览器打开 <http://localhost:3000/>。推荐路径：选择 `recorded` → 点击 `Market timeline` → `Analyze` → 查看 Summary → 查看 Agent Console、Worker 状态和 JSON/Markdown 导出 → 可选点击 Detail 观察未配置支付时的 402 边界 → 再分别运行 `Wallet A`、`Wallet B`。

data status 必须按页面显示区分：`recorded` 是脱敏回放，`live` 只表示明确成功的公开只读来源，`synthetic` 仅允许出现在测试/故障注入，不能作为用户 Demo 调查结果。`unattributed`、`insufficient_evidence` 和 `payment_required` 都是有效的安全边界状态。

## 外部流程与待决事项

- Anthropic live attribution：等待真实 `ANTHROPIC_API_KEY`，在凭据补齐前保持未验证。
- x402 Web/Agent verify/settle：等待批准的 Base Sepolia RPC、收款地址、facilitator 和买方测试凭据；不使用真实资金。
- ERC-8004 live Identity + 非 owner client Reputation：等待 owner/client 钱包和测试网资源；只允许一个 `Alibi Evidence Agent` 根身份，注册成功不等于能力验证。
- PostgreSQL runtime：等待 Mac Docker Desktop 或本地 PostgreSQL；数据库不可用时保持 `database_status: unavailable`。
- 产品 API、新闻 API：等待组长确认，本包不新增供应商、不改变契约。
- MCP public endpoint、Chrome Store、公共域名：本包只做本地验证，不公开发布。

## macOS 数据库

仅在本地 Docker 中执行，recorded Demo 不依赖数据库：

```bash
docker compose -f ops/postgres/docker-compose.yml up -d
export DATABASE_URL='postgresql://alibi:alibi-local-only@127.0.0.1:5432/alibi'
psql "$DATABASE_URL" -f db/migrations/001_platform_core.sql
```

回滚同一数据库：

```bash
psql "$DATABASE_URL" -f db/migrations/001_platform_core.down.sql
```

执行前必须确认 URL 指向本地容器，不得在生产或未知数据库运行；迁移不会由包内脚本自动执行。

## Chrome Extension 与 MCP

扩展：

```bash
npm run package-extension
```

在 Chrome 打开 `chrome://extensions` → Developer mode → Load unpacked → 选择 `artifacts/extension/unpacked`。扩展只做本地只读 Summary 调用，不读取钱包、不签名、不支付、不交易。

MCP 本地契约检查：

```bash
npm run mcp:verify
npx tsx mcp/stdio.ts
```

第二条命令是 stdio server，保持终端运行并由本地 MCP 客户端连接；Next `/mcp` 路由随 Demo 服务提供。公共 MCP endpoint 不在本包内发布。

## 故障排查

- 页面打不开：确认 `npm run dev` 仍在运行，并访问 `http://localhost:3000/health`。
- Node 版本错误：使用 Node `24.16.0`、npm `11.15.0`，或满足 `>=20.9 <27` 的兼容版本。
- embedding fallback：确认项目根目录、`models/` 完整、`ALIBI_MODEL_PATH=./models`，并运行 `bash scripts/macos/verify-model.sh`。
- `npm ci` 失败：确认 Node 版本和网络，使用 lockfile，禁止手工改版本或运行会改 lockfile 的 `npm install`。
- Playwright 无浏览器：按 `npx playwright install chromium` 安装本地浏览器后重跑 E2E；不把浏览器用户数据加入迁移包。
- 数据库不可用：继续 recorded Demo；健康接口必须显示 unavailable，不得伪装为已启用。

## 回滚

应用回滚：停止 Mac 上的 Next 进程，删除 Mac 上新解压的项目目录，再从原 ZIP 重新解压；不要改动 Windows 源目录。数据库回滚仅使用本地 down migration。链上、支付、ERC-8004 和公共发布均不由迁移脚本执行，因此没有自动外部回滚动作。

## 验收边界

Mac 完成 `npm ci`、typecheck、lint、unit/integration、build、recorded replay、模型 hash 和浏览器流程后，可记录 `RUNNABLE_DEMO_COMPLETE`。在 Anthropic live、Base Sepolia x402、必要 gas/test USDC、PostgreSQL runtime 或公开发布资源未验证前，整体仍为 `LIVE_PARTIALLY_VERIFIED`；只有全部硬条件完成后才可评估 `FULLY_LIVE_VERIFIED`。
