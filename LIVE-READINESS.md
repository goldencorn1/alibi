# Live Readiness — DEMO-API-READINESS-001 v0.1

验证结论：本地 recorded 演示可用；本地 API 合同验证为通过但带边界缺陷记录；公开只读上游为部分可用；x402 仅完成 challenge 预检；语言校准仍待完成。项目状态保持 `PARTIALLY_VERIFIED`。

## Required final states

| 状态 | 本次结果 | 解释 |
|---|---|---|
| `RECORDED_DEMO_READY` | YES | recorded empty/insufficient/unattributed 演示可运行；没有 positive cluster/language claim |
| `LOCAL_API_VERIFIED` | PARTIAL/PASS | 实际存在的 summary/detail/health/audit 路径已 smoke；`/api/*` 缺失 alias 是预期 404；configured x402 verify/settle 尚未验证 |
| `LIVE_SOURCE_STATUS` | PARTIAL | HKSAR RSS、Federal Register、Polymarket 公开端点有实测；GDELT unknown；Federal official list unavailable；Data API 首次 TLS/连接失败后有限重试成功 |
| `X402_CHALLENGE_VERIFIED` | YES | manual fallback challenge 可解码；未验证真实 facilitator、payTo、RPC、buyer 或 settlement |
| `X402_SETTLEMENT_PENDING` | YES | 没有签名、付款、receipt 或链上写入 |
| `LANGUAGE_CALIBRATION_PENDING` | YES | 校准样本数为 0；无确定性 live language-first 结论 |

## Environment and resources

Runtime：Node `24.19.0`、npm `11.17.0`；项目依赖已安装且 protected package files 未改动。`.env.local` 仅做存在性检查，不记录值：

| 资源 | 当前状态 | 影响 |
|---|---|---|
| `ANTHROPIC_API_KEY` | 缺失 | 不能验证 live attribution/LLM cost |
| `ALIBI_PAYMENT_ADDRESS` | 缺失 | challenge 使用 zero-address fallback，不可结算 |
| `BASE_SEPOLIA_RPC_URL` / `LOCAL_CHAIN_RPC_URL` | 前者缺失；后者存在 | 不能做 Base Sepolia receipt/余额核验 |
| `BUYER_AGENT_PRIVATE_KEY` | 缺失 | 不得运行真实 buyer payment |
| `DATABASE_URL` | 缺失 | DB runtime/migration 未执行 |
| `X402_FACILITATOR_URL`、`X402_NETWORK` | `.env.local` 有配置项；真实 verify 未调用 | 仍需无 secret 的 endpoint/config 检查后人工批准 |
| `COURTLISTENER_API_TOKEN`、`POLYMARKET_API_KEY` | 缺失 | 本次只用无需 key 的公开端点；没有替代付费 provider |
| Docker Desktop daemon | 不可用 | PostgreSQL 16/pgvector 运行态未验证 |
| public MCP / Chrome Store ID | 缺失 | 只验证本地实现/包，不验证公共发布 |

下一步只需在安全 secret store 配置名称对应的资源；不要在聊天中粘贴私钥或 API key。当前不需要新依赖，不需要主网资源。

## Public read-only source preflight

记录时间：2026-09-05 UTC；均为有限 GET，未付费。

| Provider | HTTP/耗时 | 实际结构与时间 | 安全状态 |
|---|---|---|---|
| HKSAR English RSS | 200 / 8.578s | XML RSS；title/guid/link/description/pubDate；100 items；`pubDate` RFC822，秒精度，约 2026-09-02 至 2026-09-05 UTC | shape validated；可按 retrieved/hash 生成 sanitized recorded，但不是 verified bilingual calibration |
| HKSAR Traditional Chinese RSS | 200 / 9.971s | 同 RSS 结构；100 items；秒精度，约 2026-09-02 至 2026-09-05 UTC | shape validated；同上 |
| GDELT DOC 2.0 | timeout / 12.003s | 无响应 body | unknown/unavailable；`seendate` 永不当作 `published_at` |
| Federal Register Public Inspection | 200 / 3.681s | JSON `results`；`filed_at`/`pdf_updated_at` 为秒级，`publication_date` 为 date-only；官方表示 list 暂时 unavailable | unknown；不转成 not_found，不生成正式时间先手 |
| Polymarket Gamma `/markets?limit=1` | 200 / 3.384s | array；conditionId/slug/question/clobTokenIds/createdAt/updatedAt/prices 等 | public read-only page healthy |
| Polymarket Data API `/trades` | retry 200 / 2.416s | array；proxyWallet/side/asset/conditionId/size/price/timestamp/title/slug/outcome/transactionHash | transient first failure recovered；记录 unknown/retry metadata，不夸大为稳定故障 |
| Polymarket CLOB `/prices-history` | 200 / 3.926s | `{history}`；`t` Unix seconds、`p` price；61 records | public read-only page healthy |

GDELT 未提供可记录时间戳；Federal Register 在官方不可用窗口；语言校准仍为 `sample_count=0`。任何缺失/不确定时间都保持 unknown/indeterminate。

采样响应未见 `Retry-After` 或 `X-RateLimit-*` header；HKSAR 返回 rolling 100-item feed/cache hint，Federal Register 返回官方维护窗口，GDELT 和 Polymarket 的连接/限流行为只能按本次 bounded probe 记录，不能外推为稳定 SLA。

## Known issues and merged Change Request

本次发现两项同一类 API boundary/control issue：

- attribution 的请求 mode 目前以 `x-alibi-mode` header 为主，body `mode=live` 在未带 header 时不会决定 402 envelope 的 `data_status`；
- 未配置支付时，Detail 的 manual 402 可能在 malformed input 被 canonical 400 处理前返回；另有 legacy/v1 configured resource policy 需直接 route 测试确认。

不在本次 Verification 内修复，也不扩大文件范围。合并候选为 `CR-DEMO-API-READINESS-001 v0.1 candidate`，唯一后续批准口令：

`APPROVE: CR-DEMO-API-READINESS-001 v0.1`

该口令未在本轮执行；它只作为后续 Change Control/testnet preflight 的批准入口。
