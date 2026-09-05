# Alibi Audit & Report

- run_id: 09532677-dd85-4f24-aee3-60d7064735cb
- status: partial
- data_status: recorded
- workers: 9
- events: 19
- duration_ms: 141
- cost_usd: 0.0000

| Worker | Status | Data status | Duration ms | Sources | Coverage | Retry | Cost USD | Policy flags |
|---|---|---:|---:|---:|---:|---:|---:|---|
| input | ok | recorded | 1 | 1 | — | 0 | — | recorded_replay |
| market-data | ok | recorded | 15 | 31 | — | 0 | — | recorded_replay |
| repricing | ok | recorded | 58 | 294 | — | 0 | — | — |
| evidence | insufficient | recorded | 0 | 0 | — | 0 | — | no_verified_evidence, unattributed |
| attribution | insufficient | recorded | 1 | 294 | — | 0 | — | unattributed, no_verified_evidence, credentials_missing |
| wallet-analysis | insufficient | recorded | 64 | 10000 | 1.88% | 0 | — | coverage_below_gate |
| policy-verification | ok | recorded | 0 | 294 | 1.88% | 0 | — | unattributed, coverage_below_gate |
| report | ok | recorded | 1 | 5 | — | 0 | — | — |
| payment | blocked | recorded | 1 | — | — | 0 | — | not_requested, recorded_replay, payment_required |

## Limitations

- Audit & Report Agent 只汇总事件，不修改业务结果。
- Anthropic 凭据缺失；live attribution 未验证。
- Coverage 低于 40%；不输出钱包能力或先手率结论。
- 没有足够的可验证来源；窗口保持 Unattributed。
- Detail 需要 x402 payment；未支付时不展示付费结果。

不构成投资建议；不提供买卖方向；不指控任何主体。时间上的先后关系不等于因果、内幕交易或确定的信息优势。
