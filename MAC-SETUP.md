# macOS 安装与验证手册

## 1. 硬件与系统差异

- Apple Silicon：`arm64`，优先安装 arm64 原生 Node、Docker Desktop 和 Chrome。
- Intel：`x86_64`，安装对应 Intel 版本。
- 不要混用 Rosetta 下的 Node/npm 与原生依赖；若使用 Rosetta，整套 Node、npm 和终端工具保持同一架构。
- Docker Desktop 的镜像必须支持当前架构；`pgvector/pgvector:0.8.6-pg16` 是项目固定 tag，若本机无法拉取，记录为环境阻塞，不要自行改镜像版本。

检查架构：

```bash
uname -m
node --version
npm --version
```

目标工具链：Node.js `24.16.0`、npm `11.15.0`。项目 engines 允许 Node `>=20.9 <27`，但跨机复现优先使用目标版本。

## 2. 系统工具

安装 Xcode Command Line Tools（会由 macOS 弹出系统确认）：

```bash
xcode-select --install
```

确认 Git：

```bash
git --version
```

若没有 Git，可安装 Xcode CLT 或通过已批准的系统包管理器安装；本快照本身没有 `.git` 历史。

安装 Node 24.16.0/npm 11.15.0 后确认：

```bash
node --version
npm --version
```

## 3. 解压、环境和依赖

```bash
mkdir -p ~/Projects/alibi
cd ~/Projects/alibi
unzip ~/Downloads/Alibi-Mac-Migration-v0.7-*.zip
cp .env.macos.example .env.local
npm ci
```

`.env.local` 只保存在本机，不提交 Git、不上传群聊、不放入浏览器或扩展。环境变量用途和影响见 `MAC-ENV.md`。

## 4. 本地验证顺序

```bash
bash scripts/macos/preflight.sh
bash scripts/macos/verify-model.sh
npm run typecheck
npm run lint
npm test
npm run build
npm run verify:offline
npm run test:e2e
npm run mcp:verify
npm run package-extension
npm run contracts:compile
```

各项独立检查的结果应保留在 Mac 本地 artifacts；不要把 `.env.local`、浏览器 profile 或真实外部响应复制回共享包。

## 5. PostgreSQL 16 + pgvector

需要 Docker Desktop 时：

```bash
docker --version
docker compose -f ops/postgres/docker-compose.yml up -d
docker compose -f ops/postgres/docker-compose.yml ps
export DATABASE_URL='postgresql://alibi:alibi-local-only@127.0.0.1:5432/alibi'
psql "$DATABASE_URL" -f db/migrations/001_platform_core.sql
```

Compose 使用 `pgvector/pgvector:0.8.6-pg16`、本地端口 `127.0.0.1:5432`、数据库 `alibi`、用户 `alibi` 和仅用于本地的示例密码。迁移是显式手动步骤；down 文件用于本地回滚。recorded Demo 在数据库不可用时仍可运行，健康接口必须显示 `database_status: unavailable`。

## 6. Web Demo 与浏览器

```bash
bash scripts/macos/start-demo.sh
```

访问 <http://localhost:3000/>；默认 `recorded`。Summary 免费只读，Detail 未配置 x402 时返回受控 402。页面不能展示 Secret、完整 payment header 或签名。

如需手动运行 E2E：

```bash
npx playwright install chromium
npm run test:e2e
```

## 7. Chrome Extension unpacked

```bash
npm run package-extension
```

Chrome → `chrome://extensions` → Developer mode → Load unpacked → `artifacts/extension/unpacked`。这是本地 unpacked 扩展，不是 Chrome Store 发布；不要配置 Chrome Extension ID，也不要复制钱包扩展数据。

## 8. MCP

契约验证：

```bash
npm run mcp:verify
```

stdio server：

```bash
npx tsx mcp/stdio.ts
```

HTTP route 随 Next 应用提供 `/mcp`，默认本机；不进行公网部署或 MCP Registry 发布。

## 9. Solidity 与本地链

Solidity 固定 `0.8.24`，Hardhat `3.0.0`，OpenZeppelin `5.4.0`：

```bash
npm run contracts:compile
npx hardhat node
```

另开终端运行本地 smoke：

```bash
LOCAL_CHAIN_RPC_URL=http://127.0.0.1:8545 npx tsx scripts/local-chain-smoke.ts
```

这是 chain id `31337` 的本地链；不会发送 Base Sepolia 或主网交易。不要把本地测试账户私钥放进 `.env.local` 或交接包。

## 10. Live 验证边界

live attribution 需要 `ANTHROPIC_API_KEY`；真实 x402 需要 Base Sepolia `84532`、RPC、公开收款地址、facilitator、测试 gas/test USDC 和本地 buyer signer。所有 live 验证均需人工确认网络、地址和交易上限；迁移脚本不会自动支付、注册 ERC-8004、部署合约或公开发布。
