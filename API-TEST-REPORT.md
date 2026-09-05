# API Test Report — DEMO-API-READINESS-001 v0.1

验证时间：2026-09-05 UTC  
服务：`http://127.0.0.1:3000`  
模式：请求使用 `recorded`；没有付款、签名、链上交易或付费外部调用。

## 结果摘要

| 类别 | 结果 |
|---|---|
| Route inventory | PASS；由实际 `app/**/route.ts` 生成 |
| recorded Summary | PASS；legacy 与 v1 均返回 200、`data_status=recorded` |
| Valid recorded Detail | PASS；当前样本为免费 `unattributed` 200 |
| Unpaid Detail challenge | PASS；402 与 `PAYMENT-REQUIRED` 存在 |
| `/api/*` legacy aliases | EXPECTED 404；项目没有这些 route，不新增 adapter |
| malformed/unsupported Summary | PASS；结构化 400，无 stack |
| Audit JSON/Markdown | PASS；200，recorded，当前 partial |
| Secret/stack exposure | PASS；本次响应未发现 secret、凭据或内部堆栈 |
| x402 configured verify/settle | NOT VERIFIED；payTo/RPC/buyer/facilitator 真实资源不齐，不付款 |

## 实际 route inventory 与实测

| Method | Path | 实测结果 |
|---|---|---|
| POST/GET | `/summary` | POST 200；recorded Summary |
| POST | `/attribution` | valid recorded 200 free_unattributed；empty 402 |
| GET | `/audit` | 200 JSON/Markdown（要求合法 `run_id`） |
| GET | `/health` | 200，fixture_status.recorded=true、synthetic=false |
| POST/GET | `/api/v1/summary` | POST/GET 200，recorded Summary |
| POST | `/api/v1/attribution` | valid recorded 200 free_unattributed；empty 402 |
| GET | `/api/v1/health` | 200，v1 capabilities/config safe subset |
| POST | `/api/summary` | 404；不存在 |
| POST | `/api/attribution` | 404；不存在 |

实际 app route inventory 还包含 `/api/v1/agents/runs/[runId]`、`/api/v1/attribution`、`/api/v1/erc8004/status`、`/api/v1/rankings`、`/api/v1/subscription/*`、`/api/v1/wallets/[address]/report`、`/mcp` 及首页；本次不对受保护或需要特定资源的其它 route 伪造成功结果。

## Summary evidence

使用 recorded wallet 形状请求 legacy 与 v1：

- HTTP 200；`meta.data_status=recorded`；
- `meta.coverage_rate=0.0188`；
- `wallet_metrics.status=insufficient_evidence`；
- `meta.run_id` 由服务生成；
- response disclaimer 明确不构成投资建议/因果结论；
- 未发现 `synthetic` 窗口或私密字段。

GET `/api/v1/summary?input=<wallet>&mode=recorded` 也返回 HTTP 200 和 `data_status=recorded`。

## Attribution boundary evidence

有效 recorded wallet 的 `/attribution` 与 `/api/v1/attribution` 都走同一类边界。由于当前所有可见窗口没有 verified attribution，按现有产品策略返回 HTTP 200 的 `free_unattributed` Detail；它不代表已付费。

空 JSON、`x-alibi-mode: recorded`：

- HTTP 402；
- envelope `error.code=payment_required`；
- envelope `error.data_status=recorded`；
- `retryable=true`；
- `PAYMENT-REQUIRED` header 可解析。

同样请求 v1 attribution：HTTP 402、`data_status=recorded`、header 存在。

Header 解码后的手工 challenge 字段：

| 字段 | legacy `/attribution` | v1 `/api/v1/attribution` |
|---|---|---|
| x402Version | 2 | 2 |
| scheme | exact | exact |
| network | `eip155:84532` | `eip155:84532` |
| asset | Base Sepolia USDC（项目固定地址） | 同左 |
| amount | `10000` atomic = `0.01 USDC` | 同左 |
| maxTimeoutSeconds | 120 | 120 |
| resource | 当前请求 URL | 当前请求 URL |
| payTo | 当前未配置，challenge 使用 zero-address fallback | 同左 |

该 header 是未配置支付时的 manual fallback challenge。真实 facilitator verify/settle 与正式 payTo 尚未验证，不能标记 settlement complete。

## Invalid and unavailable behavior

- malformed Summary：HTTP 400，`invalid_input`，`data_status=recorded`，无内部 stack。
- unsupported Summary mode `sandbox`：HTTP 400，提示 mode 必须为 live 或 recorded。
- empty/missing-input Detail：当前未配置 x402 fallback 会先给 402；这是需要后续 Change Request 明确的输入校验顺序问题。
- body `mode=live`、没有 `x-alibi-mode` 的 Detail challenge：当前 envelope 仍为 `recorded`；只有 header `x-alibi-mode: live` 才会返回 live。该 mode-source 不一致是需要后续修复/contract 决策的缺陷。
- 上游不可用时，服务保留 unknown/unavailable，不把失败生成成虚假 recorded response。

## Audit and safety

`GET /audit?run_id=<run_id>&format=json` 与 `format=markdown` 均 HTTP 200。当前报告为 `partial`，包含 recorded data status、worker/event counts、零外部成本和限制项；run ID 位于 `meta.run_id`。

本次 response/body/header 检查未发现 `PAYMENT-REQUIRED` 内容被写入业务数据、私钥、API key、payment signature 或内部错误 stack。测试代码中的 synthetic payload 仅用于阻断路径的自动化测试，不进入用户 Demo。

## Code defects recorded without modification

生成合并 Change Request 候选：`CR-DEMO-API-READINESS-001 v0.1 candidate`，范围仅包括：

1. 统一 attribution 的 body/header mode 解析，避免在 402 前出现不一致的 `data_status`；
2. 明确 legacy 与 v1 的 configured x402 resource policy，并校准 payment policy 与 Web helper 的 route parity；
3. 明确 malformed/unsupported Detail 在未配置支付时应先返回 canonical 400 还是保留 challenge 优先顺序；
4. 增加 direct route integration tests，覆盖两条 attribution 路径、402 challenge/release、insufficient payment rejection 和 payment-identifier parity。

候选不包含依赖、路由、数据库、支付、链上交易或产品行为扩展。本报告只记录，不实施。

