# Alibi Audit & Report

- run_id: be20767f-35c0-42f2-8aec-042963d255a7
- status: failed
- data_status: recorded
- workers: 9
- events: 6
- duration_ms: 17
- cost_usd: 0.0000

| Worker | Status | Data status | Duration ms | Sources | Coverage | Retry | Cost USD | Policy flags |
|---|---|---:|---:|---:|---:|---:|---:|---|
| input | ok | recorded | 11 | 1 | — | 0 | — | recorded_replay |
| market-data | failed | recorded | 2 | — | — | 0 | — | recorded_replay |
| repricing | running | synthetic | — | — | — | 0 | — | — |
| evidence | running | synthetic | — | — | — | 0 | — | — |
| attribution | running | synthetic | — | — | — | 0 | — | — |
| wallet-analysis | running | synthetic | — | — | — | 0 | — | — |
| policy-verification | running | synthetic | — | — | — | 0 | — | — |
| report | running | synthetic | — | — | — | 0 | — | — |
| payment | blocked | recorded | 4 | — | — | 0 | — | recorded_replay, payment_required |

## Limitations

- Audit & Report Agent 只汇总事件，不修改业务结果。
- Detail 需要 x402 payment；未支付时不展示付费结果。

不构成投资建议；不提供买卖方向；不指控任何主体。时间上的先后关系不等于因果、内幕交易或确定的信息优势。
