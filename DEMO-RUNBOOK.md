# Alibi Demo Runbook — DEMO-API-READINESS-001 v0.1

验证日期：2026-09-04（PDT）/ 2026-09-05（UTC）  
当前演示模式：`recorded`  only  
状态：`RECORDED_DEMO_READY`（保守空/不足证据演示，不是 live 结论）

本手册只使用当前项目的 recorded API 和公开只读预检结果。不得把 synthetic、未知、unavailable 或 recorded 结果说成 live；不得展示私钥、凭据、用户身份、因果、内幕、买卖或进场建议。

## 90 秒演示脚本

1. 0–10 秒：在项目目录运行 `npm run dev`，打开 `http://127.0.0.1:3000`。
2. 10–25 秒：选择 `recorded replay`，使用页面已有 recorded wallet preset，点击 Analyze。
3. 25–40 秒：指出页面上的 `recorded API`、coverage 约 `1.88%` 和 `insufficient_evidence`；说明低于 40% coverage 时不输出先手率或能力判断。
4. 40–55 秒：依次展示 GUI、CLI、APP 三面板。三面板都来自同一 recorded API；没有数据的面板显示明确 empty 状态，不生成 ticker 或指标。
5. 55–70 秒：展示交易—信源—重定价时间线、六维集群和 herding veto。当前 recorded 响应没有可验证来源，语言窗口为空/不确定；不得把 `cluster_without_verified_source` 说成语言先手或因果。
6. 70–80 秒：点击 Request Detail。当前有效 recorded wallet 的全部窗口为 `unattributed`，因此按批准规则返回免费 `200`；用下面的空输入 curl 单独展示未付款 `402` challenge，不声称已完成付款。
7. 80–90 秒：展示 Agent Console、`recorded`/`partial` 状态和 JSON/Markdown audit 导出；强调成本为 0、没有真实支付或链上交易。

## 3–5 分钟完整脚本

### 启动与 recorded Summary

```sh
PATH="/Users/a0000/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Applications/ChatGPT.app/Contents/Resources/cua_node/bin:$PATH" npm run dev
```

打开首页，确认数据模式为 `recorded replay`，输入页面提供的 recorded wallet，点击 Analyze。预期 Summary 为 HTTP 200，页面显示 `recorded API · Free Summary`、coverage、market/repricing 数量和受限状态。当前样本覆盖率不足，不能展示 positive lead-rate。

### 时间线、集群和语言证据

说明时间线是 recorded public-data replay。分别指出：

- `documented_language_window` 与 `cluster_without_verified_source` 是两个独立状态；
- 当前语言校准样本数为 0，因此时间窗不能产生确定性先后结论，重叠或缺少校准时为 `indeterminate`/`unknown`；
- 六维结果和 herding veto 是保守门控，不支持身份、协调、语言能力、复制交易或因果推断；
- 当前没有可验证 evidence，所有窗口保持 `unattributed`。

### Detail、x402 和审计

有效 recorded wallet 的 Detail 如果全部是 `unattributed`，预期是 HTTP 200 的 `free_unattributed`；这不代表付费资源已释放。用空输入请求展示真正的 unpaid challenge：预期 HTTP 402、`PAYMENT-REQUIRED` 可解析、`x402Version=2`、`scheme=exact`、Base Sepolia `eip155:84532`、`0.01 USDC`。不签名、不付款、不提交交易。

打开 Agent Console，确认 status/data status/worker rows 及审计导出。JSON 和 Markdown 导出都应保留 `recorded`，当前审计为 `partial` 并列出 Anthropic、coverage 和 verified evidence 限制。

### 可以说与不能说

可以说：“这是一个带明确 `recorded` 标签的公开数据回放”；“当前证据不足”；“语言窗口为 unknown/indeterminate”；“没有 verified attribution，因此该 Detail 为免费 unattributed”。

不能说：“live investigation”“insider”“这几个地址属于同一人/会某种语言”“提前知道消息”“因此导致价格变化”“应该买入/卖出/跟随/复制”。

## 按实际 contract 的 curl 示例

以下输入是公开 recorded fixture 中使用的 wallet 形状；运行时不要输出钱包身份推断。

```sh
BASE=http://127.0.0.1:3000
INPUT=0x674887d1ac838099a48b629dff53f25b7b87ee08

# Legacy Summary：HTTP 200，meta.data_status=recorded
curl -sS -X POST "$BASE/summary" \
  -H 'content-type: application/json' \
  -d "{\"input\":\"$INPUT\",\"mode\":\"recorded\"}" | jq '{kind,meta:{data_status,run_id,coverage_rate},wallet_metrics:{status,coverage_rate}}'

# Canonical v1 Summary：HTTP 200，meta.data_status=recorded
curl -sS -X POST "$BASE/api/v1/summary" \
  -H 'content-type: application/json' \
  -d "{\"input\":\"$INPUT\",\"mode\":\"recorded\"}" | jq '{kind,meta:{data_status,run_id},wallet_metrics:{status,coverage_rate}}'

# Valid recorded Detail：当前样本预期 HTTP 200，paid_access.access=free_unattributed
curl -sS -D /tmp/alibi-detail.headers -o /tmp/alibi-detail.json -w 'HTTP %{http_code}\n' \
  -X POST "$BASE/attribution" -H 'content-type: application/json' \
  -H 'x-alibi-mode: recorded' -d "{\"input\":\"$INPUT\",\"mode\":\"recorded\"}"
jq '{kind,meta:{data_status,run_id},paid_access}' /tmp/alibi-detail.json

# Unpaid/missing-input Detail：HTTP 402，PAYMENT-REQUIRED header present
curl -sS -D /tmp/alibi-402.headers -o /tmp/alibi-402.json -w 'HTTP %{http_code}\n' \
  -X POST "$BASE/attribution" -H 'content-type: application/json' \
  -H 'x-alibi-mode: recorded' -d '{}'
jq '.error | {code,message,data_status,retryable}' /tmp/alibi-402.json
awk 'BEGIN{IGNORECASE=1}/^PAYMENT-REQUIRED:/{print}' /tmp/alibi-402.headers

# Health and audit
curl -sS "$BASE/health" | jq '{status,service,fixture_status,external_calls,config:{mode,hasAnthropicKey,hasPaymentAddress,paymentNetwork,paymentPrice}}'
curl -sS "$BASE/audit?run_id=<RUN_ID>&format=json" | jq '{meta:{data_status,status,worker_count,event_count,total_cost_usd,limitations}}'
```

`/api/summary` 与 `/api/attribution` 当前不存在，预期 HTTP 404；不要将其当作兼容别名，也不要新增 adapter。`/summary`、`/attribution`、`/api/v1/summary`、`/api/v1/attribution` 及 `/audit` 才是本次实际验证的路径。

## 预期状态表

| 操作 | 预期 HTTP | 页面/响应状态 |
|---|---:|---|
| recorded Summary | 200 | success，明确 `recorded` |
| valid recorded Detail，无 verified attribution | 200 | `free_unattributed` |
| missing/empty Detail，无付款 | 402 | `payment_required`，x402 V2 challenge |
| malformed/unsupported Summary | 400 | `error`，结构化 `invalid_input` |
| `/api/summary`、`/api/attribution` | 404 | 不存在；不视为兼容路径 |
| `/health`、`/api/v1/health` | 200 | fixture/config 健康信息，无 secret 值 |
| `/audit` JSON/Markdown | 200 | `recorded`，当前 `partial`，可导出 |
| provider/upstream unavailable | 503 或 API error | 明确 `provider_unavailable`/`upstream_unavailable`，不伪造 recorded |

## 演示失败时的降级

- API 或上游不可用：切换到 recorded replay，展示本目录截图和已保存的机器可读 artifacts；不要现场生成 synthetic 结果。
- 没有浏览器 WebKit：使用 Chromium 的 mobile viewport 截图；本次未安装浏览器。
- 没有实时证据或语言校准：保持 `unknown`/`indeterminate`，展示 empty/insufficient 状态。
- 关闭服务：在运行 `npm run dev` 的终端按 `Ctrl-C`，不要使用破坏性进程清理命令。

## 验证截图

- Desktop 1440×1100：`artifacts/verification/demo-api-001/demo-desktop.png`
- Mobile Chromium viewport 390×1351：`artifacts/verification/demo-api-001/demo-mobile.png`
- CSS zoom 200%，1280×2258：`artifacts/verification/demo-api-001/demo-200-percent.png`

