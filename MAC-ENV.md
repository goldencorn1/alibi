# macOS 环境变量矩阵

本表由源代码中的 `process.env.*` 引用和 Playwright 配置扫描得到。除明确标记为“代码未使用”的兼容检查项外，不增加变量。Secret 只在本机进程作用域使用，绝不写入日志或前端 bundle。

| 变量 | 用途 | 必需/可选 | Secret | 作用域 | 默认值 | 缺失影响 |
|---|---|---|---|---|---|---|
| `APP_BASE_URL` | buyer 脚本、注册文档、Playwright base URL | recorded 可选 | 否 | Server/Buyer/Test | `http://127.0.0.1:3000`（Mac 模板为 `http://localhost:3000`） | 使用本地默认地址 |
| `ALIBI_DATA_MODE` | 选择 `recorded` 或明确的 `live` 读取模式 | recorded 必需 | 否 | Server | `recorded` | 使用 recorded 默认；live 不会被静默启用 |
| `MAX_EXTERNAL_API_COST_USD` | 外部调用预算上限 | recorded 可选 | 否 | Server | 代码预算逻辑默认值；Mac 模板为 `0` | 使用代码默认预算；live 预算不足会被拒绝 |
| `DATABASE_URL` | PostgreSQL 运行时可用性标记/数据库连接配置 | recorded 可选 | 连接凭据可能敏感 | Server | 无 | 健康接口显示 `unavailable`，不阻塞 recorded |
| `ANTHROPIC_API_KEY` | Attribution Provider 的 Anthropic API 认证 | recorded 不需；live 必需 | 是 | Server only | 空 | live attribution 保持未验证；不得用 synthetic 代替 |
| `ANTHROPIC_MODEL` | Anthropic 模型名 | live 可选 | 否 | Server only | `claude-haiku-4-5-20251001` | 使用代码默认模型 |
| `X402_FACILITATOR_URL` | x402 facilitator 地址 | recorded 可选；live payment 必需 | 否（可能受服务端策略保护） | Server | `https://x402.org/facilitator` | Detail 保持受控 402/未配置状态 |
| `X402_NETWORK` | x402 网络标识 | recorded 可选；live payment 必需 | 否 | Server/Buyer | `eip155:84532` | 不满足网络门禁，禁止真实支付 |
| `ALIBI_PAYMENT_ADDRESS` | 收款地址、ERC-8004 owner 关系 | recorded 可选；live 必需 | 否（公开地址） | Server/Buyer | 空/零地址 fallback | payment 未配置；ERC-8004 owner 不可用 |
| `BASE_SEPOLIA_RPC_URL` | Base Sepolia 只读/交易 RPC | recorded 不需；live 必需 | 否，除非供应商另有认证 | Server/Buyer | 空 | live chain 验证不可用 |
| `BUYER_AGENT_PRIVATE_KEY` | buyer signer 的本地测试网私钥 | recorded 不需；live buyer 必需 | 是 | Buyer Agent only | 空 | buyer verify/settle 不执行 |
| `LOCAL_CHAIN_RPC_URL` | Hardhat 本地链 smoke RPC | 可选 | 否 | Local Solidity Test | `http://127.0.0.1:8545` | 使用本地默认；没有本地链则 smoke 失败 |
| `ALIBI_MODEL_PATH` | 本地 Transformers.js 模型根目录 | recorded 可选 | 否 | Server only | `./models` | 模型加载失败时显式 `rag_degraded` fallback |
| `ALIBI_SUBSCRIPTION_CONTRACT_ADDRESS` | 已部署订阅合约的状态/prepare 展示 | live/合约检查可选 | 否 | Server | 空 | Subscription 状态为 `not_enabled` |
| `ERC8004_CLIENT_ADDRESS` | 非 owner 的真实客户端地址关系 | live ERC-8004 可选 | 否（公开地址） | Server only | 空 | Reputation 计划不可执行 |
| `ERC8004_AGENT_ID` | 根身份的 ERC-8004 agent id | live ERC-8004 可选 | 否 | Server only | 空 | Reputation 计划不可执行 |
| `CI` | Playwright 禁止 focused test、重试策略 | Test 可选 | 否 | Test | 未设置 | 使用本地测试策略 |

## 安全和未接入变量

- `EMBEDDING_API_KEY`：`NOT_REQUIRED`；源代码不读取、不调用外部 embedding API。
- `BASE_SEPOLIA_USDC_ADDRESS`：当前代码没有读取；USDC 合约地址由现有代码常量/契约边界管理，不得在 `.env` 中假装可配置。
- `BUYER_AGENT_ADDRESS`：当前 buyer 脚本没有读取；仅在 `.env.buyer.macos.example` 留空作人工记录占位，不能当成运行配置。
- `ERC8004_VALIDATION_REGISTRY`：本轮不需要；Validation 固定为 `not_enabled`。
- `MCP_PUBLIC_ENDPOINT`、Chrome Extension ID、新闻 API 变量：当前代码未读取，且本包不做公共发布或新供应商接入。
- 不存在任何 `NEXT_PUBLIC_*` Secret 配置；Secret 变量不得暴露到浏览器。
