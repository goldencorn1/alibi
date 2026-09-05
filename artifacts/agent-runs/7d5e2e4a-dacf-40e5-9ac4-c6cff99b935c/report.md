# Alibi Audit & Report

- run_id: 7d5e2e4a-dacf-40e5-9ac4-c6cff99b935c
- status: partial
- data_status: recorded
- workers: 9
- events: 17
- duration_ms: 96
- cost_usd: 0.0000

| Worker | Status | Data status | Duration ms | Sources | Coverage | Retry | Cost USD | Policy flags |
|---|---|---:|---:|---:|---:|---:|---:|---|
| input | ok | recorded | 2 | 1 | — | 0 | — | recorded_replay |
| market-data | ok | recorded | 39 | 9 | — | 0 | — | recorded_replay |
| repricing | ok | recorded | 40 | 98 | — | 0 | — | — |
| evidence | insufficient | recorded | 1 | 0 | — | 0 | — | no_verified_evidence, unattributed |
| attribution | insufficient | recorded | 5 | 98 | — | 0 | — | unattributed, no_verified_evidence, credentials_missing |
| wallet-analysis | skipped | recorded | 0 | — | — | 0 | — | not_requested |
| policy-verification | ok | recorded | 3 | 98 | — | 0 | — | unattributed |
| report | ok | recorded | 6 | 3 | — | 0 | — | — |
| payment | skipped | recorded | 0 | — | — | 0 | — | not_requested |

## Limitations

- Audit & Report Agent 只汇总事件，不修改业务结果。
- Anthropic 凭据缺失；live attribution 未验证。
- 没有足够的可验证来源；窗口保持 Unattributed。

不构成投资建议；不提供买卖方向；不指控任何主体。时间上的先后关系不等于因果、内幕交易或确定的信息优势。
