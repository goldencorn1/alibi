# Alibi Audit & Report

- run_id: 80cccf8d-2d30-4e51-8005-80a49258ef40
- status: failed
- data_status: recorded
- workers: 9
- events: 4
- duration_ms: 2
- cost_usd: 0.0000

| Worker | Status | Data status | Duration ms | Sources | Coverage | Retry | Cost USD | Policy flags |
|---|---|---:|---:|---:|---:|---:|---:|---|
| input | ok | recorded | 1 | 1 | — | 0 | — | recorded_replay |
| market-data | failed | recorded | 1 | — | — | 0 | — | recorded_replay |
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
