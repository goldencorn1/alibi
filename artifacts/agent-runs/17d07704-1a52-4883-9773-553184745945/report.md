# Alibi Audit & Report

- run_id: 17d07704-1a52-4883-9773-553184745945
- status: partial
- data_status: recorded
- workers: 9
- events: 17
- duration_ms: 103
- cost_usd: 0.0000

| Worker | Status | Data status | Duration ms | Sources | Coverage | Retry | Cost USD | Policy flags |
|---|---|---:|---:|---:|---:|---:|---:|---|
| input | ok | recorded | 3 | 1 | — | 0 | — | recorded_replay |
| market-data | ok | recorded | 30 | 9 | — | 0 | — | recorded_replay |
| repricing | ok | recorded | 61 | 98 | — | 0 | — | — |
| evidence | insufficient | recorded | 3 | 0 | — | 0 | — | no_verified_evidence, unattributed |
| attribution | insufficient | recorded | 4 | 98 | — | 0 | — | unattributed, no_verified_evidence, credentials_missing |
| wallet-analysis | skipped | recorded | 0 | — | — | 0 | — | not_requested |
| policy-verification | ok | recorded | 1 | 98 | — | 0 | — | unattributed |
| report | ok | recorded | 1 | 3 | — | 0 | — | — |
| payment | skipped | recorded | 0 | — | — | 0 | — | not_requested |

## Limitations

- Audit & Report Agent 只汇总事件，不修改业务结果。
- Anthropic 凭据缺失；live attribution 未验证。
- 没有足够的可验证来源；窗口保持 Unattributed。

不构成投资建议；不提供买卖方向；不指控任何主体。时间上的先后关系不等于因果、内幕交易或确定的信息优势。
