# Alibi Audit & Report

- run_id: 50a235fc-eb22-4468-b022-d11e4a813a33
- status: running
- data_status: live
- workers: 9
- events: 2
- duration_ms: 4
- cost_usd: 0.0000

| Worker | Status | Data status | Duration ms | Sources | Coverage | Retry | Cost USD | Policy flags |
|---|---|---:|---:|---:|---:|---:|---:|---|
| input | running | synthetic | — | — | — | 0 | — | — |
| market-data | running | synthetic | — | — | — | 0 | — | — |
| repricing | running | synthetic | — | — | — | 0 | — | — |
| evidence | running | synthetic | — | — | — | 0 | — | — |
| attribution | running | synthetic | — | — | — | 0 | — | — |
| wallet-analysis | running | synthetic | — | — | — | 0 | — | — |
| policy-verification | running | synthetic | — | — | — | 0 | — | — |
| report | running | synthetic | — | — | — | 0 | — | — |
| payment | blocked | live | 4 | — | — | 0 | — | payment_required |

## Limitations

- Audit & Report Agent 只汇总事件，不修改业务结果。
- Detail 需要 x402 payment；未支付时不展示付费结果。

不构成投资建议；不提供买卖方向；不指控任何主体。时间上的先后关系不等于因果、内幕交易或确定的信息优势。
