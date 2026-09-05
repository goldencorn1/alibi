# Alibi Audit & Report

- run_id: d9dc1641-6461-47c4-9828-e45436d947fd
- status: failed
- data_status: live
- workers: 9
- events: 4
- duration_ms: 3015
- cost_usd: 0.0000

| Worker | Status | Data status | Duration ms | Sources | Coverage | Retry | Cost USD | Policy flags |
|---|---|---:|---:|---:|---:|---:|---:|---|
| input | ok | live | 0 | 1 | — | 0 | — | — |
| market-data | failed | live | 3015 | 1 | — | 2 | — | — |
| repricing | running | synthetic | — | — | — | 0 | — | — |
| evidence | running | synthetic | — | — | — | 0 | — | — |
| attribution | running | synthetic | — | — | — | 0 | — | — |
| wallet-analysis | running | synthetic | — | — | — | 0 | — | — |
| policy-verification | running | synthetic | — | — | — | 0 | — | — |
| report | running | synthetic | — | — | — | 0 | — | — |
| payment | running | synthetic | — | — | — | 0 | — | — |

## Limitations

- Audit & Report Agent 只汇总事件，不修改业务结果。

不构成投资建议；不提供买卖方向；不指控任何主体。时间上的先后关系不等于因果、内幕交易或确定的信息优势。
