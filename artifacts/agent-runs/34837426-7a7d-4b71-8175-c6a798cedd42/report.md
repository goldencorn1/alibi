# Alibi Audit & Report

- run_id: 34837426-7a7d-4b71-8175-c6a798cedd42
- status: partial
- data_status: recorded
- workers: 9
- events: 17
- duration_ms: 278
- cost_usd: 0.0000

| Worker | Status | Data status | Duration ms | Sources | Coverage | Retry | Cost USD | Policy flags |
|---|---|---:|---:|---:|---:|---:|---:|---|
| input | ok | recorded | 3 | 1 | — | 0 | — | recorded_replay |
| market-data | ok | recorded | 19 | 9 | — | 0 | — | recorded_replay |
| repricing | ok | recorded | 110 | 98 | — | 0 | — | — |
| evidence | insufficient | recorded | 14 | 0 | — | 0 | — | no_verified_evidence, unattributed |
| attribution | insufficient | recorded | 53 | 98 | — | 0 | — | unattributed, no_verified_evidence, credentials_missing |
| wallet-analysis | skipped | recorded | 0 | — | — | 0 | — | not_requested |
| policy-verification | ok | recorded | 56 | 98 | — | 0 | — | unattributed |
| report | ok | recorded | 23 | 3 | — | 0 | — | — |
| payment | skipped | recorded | 0 | — | — | 0 | — | not_requested |

## Limitations

- Audit & Report Agent 只汇总事件，不修改业务结果。
- Anthropic 凭据缺失；live attribution 未验证。
- 没有足够的可验证来源；窗口保持 Unattributed。

不构成投资建议；不提供买卖方向；不指控任何主体。时间上的先后关系不等于因果、内幕交易或确定的信息优势。
