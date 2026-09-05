# Data sources

## Approved read-only sources

| Source | Endpoint used | Normalized fields | State |
|---|---|---|---|
| Gamma | `https://gamma-api.polymarket.com/markets` and `/events` | market id, slug, question/title, CLOB token IDs | `live` or `recorded` |
| CLOB | `https://clob.polymarket.com/prices-history` | token, timestamp, price, sampling fidelity | `live` or `recorded` |
| Data API | `https://data-api.polymarket.com/trades` | wallet, condition/market, asset, timestamp, side, outcome, price, size, transaction hash when present | `live` or `recorded` |
| Evidence | approved public pages/curated metadata only | URL, title, published/retrieved time, source level, restriction and time relation | only when verified |

The current CLOB implementation requests `interval=1m&fidelity=10` for market selection and six bounded `interval=1h&fidelity=1` slices for the 90-day wallet window. The live API rejected the previous `fidelity=1` 1m filter and rejected a single 90-day start/end range; those responses are preserved as diagnostics and the adapter uses bounded retries and slices.

## Current recorded selection

`artifacts/verification/demo-selection.json` records three public markets and two public wallet addresses selected deterministically from the high-volume Gamma list and Data API trades. The recorded market fixture contains three markets, normalized price histories and 98 observed repricing windows; every current window is explicitly `unattributed` because no verified evidence/Anthropic live attribution is available. Wallet fixtures retain the public trade data required for the coverage gate but do not infer identity.

## Evidence limitations

No formal news API provider was added. Search snippets and LLM-generated URLs are never accepted as evidence. Evidence with missing/invalid `published_at`, missing retrieval time or missing usage restriction is rejected. A source published after a price move is classified as an after-the-fact time relation and cannot support an information-first claim.

Public endpoint terms, rate limits and availability can change. Every report carries source status, retrieval time and limitations; recorded data is not a current real-time investigation.
## Cluster/language evidence sources — CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1

The feature uses only approved public read-only connectors:

| Connector | Endpoint | Role | Constraint |
|---|---|---|---|
| Hong Kong Government English RSS | https://www.info.gov.hk/gia/rss/general_en.xml | primary, English | publication timestamp must be preserved |
| Hong Kong Government Traditional Chinese RSS | https://www.info.gov.hk/gia/rss/general_zh.xml | primary, zh-Hant | publication timestamp must be preserved |
| Hong Kong Press Release Search | https://api.data.gov.hk/v1/pressrelease/search | discovery/backfill | updates about every 15 minutes; date mainly supports discovery |
| HKMA English | https://api.hkma.gov.hk/public/press-releases?lang=en | primary, English | list date alone cannot prove minute ordering |
| HKMA Traditional Chinese | https://api.hkma.gov.hk/public/press-releases?lang=tc | primary, zh-Hant | list date alone cannot prove minute ordering |

GDELT and aggregators are discovery-only. They cannot establish source_state=not_found or a verified bilingual pair. NewsAPI.ai and new paid providers are not permitted. CourtListener is optional and provider_unavailable must degrade to unknown.

Every language source records URL, publisher, title, language, source tier, official release ID, original/translation marker, published/first-seen/retrieved timestamps, timestamp type and precision, uncertainty, SHA-256 content hash and connector status. The evidence cutoff is the evaluation time; sources published after the cutoff are excluded and may only create a later revision.

A date-only timestamp cannot establish local_first or english_first. A source connector failure or incomplete coverage is source_state=unknown, never not_found. Recorded artifacts must retain retrieval metadata and hashes; synthetic data is test-only and never a user-demo source.

## CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2 execution record

The approved execution used bounded, read-only public preflight requests on 2026-09-04 local time. The machine-readable redacted record is `artifacts/verification/cluster-language-source-preflight.json`.

| Provider | Observed result | Safe state | Timestamp/cutoff decision |
|---|---|---|---|
| GDELT DOC 2.0 | DNS/connection timeout within 12 seconds | unavailable/unknown | discovery-only; `seendate` is never `published_at` |
| HKSAR ISD English RSS | HTTP 200, 386725 bytes | shape validated | RSS `pubDate` parsed as second precision; no P95 until 30 independent samples |
| HKSAR ISD Traditional Chinese RSS | HTTP 200, 301485 bytes | shape validated | RSS `pubDate` parsed as second precision; no P95 until 30 independent samples |
| Federal Register Public Inspection | HTTP 200, 229 bytes; official response said list temporarily unavailable | unknown | no `not_found`, no formal alert, no substitution with ordinary publication |
| HKMA English | HTTP 200, 17668 bytes; `result.records[].date` observed | unknown for minute order | date-only remains non-directional |
| SEC EDGAR submissions | HTTP 200, 164121 bytes | P1 shape validated | `acceptanceDateTime`/`filingDate` kept distinct |

No paid provider, Anthropic call, payment, chain transaction or private endpoint was used. Calibration remains explicit `sample_count=0` in this run; the implementation requires at least 30 independent samples and absolute-error P95 before producing a safety uncertainty. Provider coverage is dynamic and records requested/actual coverage, pagination and unknown reasons; it does not assume a fixed 60-day evidence window.

The approved Market Channel path is trigger-only. `hydrateMarketChannelTrigger` performs bounded, public Data API `/trades` hydration for the trigger's condition/token and time range, then applies the canonical trade deduplication/reconcile key. The helper is covered by a local stubbed adapter test; no live stream subscription or live hydration was performed in this execution.
