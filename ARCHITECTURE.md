# Architecture

```text
Input Parser
  -> read-only Gamma / CLOB / Data adapters + public Market WebSocket replay
  -> normalizer + data_status
  -> single Investigation Orchestrator
       -> Evidence Agent (deterministic admission)
       -> Attribution Agent (Anthropic boundary only)
       -> Quality & Risk Agent (coverage/final-state)
       -> Audit & Report Agent (read-only event aggregation)
  -> deterministic repricing / DEES / wallet ranking / local RAG
  -> Summary / Detail / v1 API reports
  -> single-page UI, four-agent Console and x402 Detail boundary
```

## Boundaries

- `src/input` accepts only approved Polymarket market/event/profile URLs and valid EVM addresses.
- `src/data` owns public GET calls, bounded retry, timeout, status metadata, normalizers and replay loading.
- `src/engine/repricing.ts` owns the fixed 60-minute / `>=0.08` rule. It does not call an LLM.
- `src/engine/attribution.ts` validates URL, published time and restrictions before calling the Anthropic adapter. It never permits the provider to invent URLs.
- `src/engine/wallet.ts` performs only timestamp/market/token alignment and `size × price_change` estimates. A coverage rate below `0.40` returns `insufficient_evidence` and a null lead rate.
- `src/report` projects the same analysis bundle into a free Summary or paid Detail without leaking Detail evidence into Summary.
- `src/payment` contains the x402 server configuration, manual unconfigured 402 fallback and buyer-side terms policy. It never handles a private key on the server.
- `src/ui/state.ts` is the tested mapping from API outcomes to the six approved UI states; `app/page.tsx` remains the only product page.
- `src/observability/events.ts` validates the append-only event contract, input digest, bounded cost and redaction rules. It rejects unsafe event content before persistence.
- `src/observability/audit-agent.ts` is the deterministic in-process Audit & Report Agent. It observes the nine logical Worker event sources, rebuilds reports from JSONL and never calls an LLM or changes business results.
- `src/agents/orchestrator.ts` is the only platform coordinator. The four platform Agent modules are logical deterministic modules; only the existing Attribution provider may call Anthropic.
- `src/analysis` contains deterministic time, repricing, DEES, coverage, risk and final-state projections. `src/rankings` applies the 90-day eligibility gate and recorded replay checkpoint.
- `src/rag` uses the locked local q4 MiniLM model only. `src/rag/keyword-fallback.ts` is an explicit `rag_degraded` path and never reports vector similarity.
- `src/adapters/polymarket` treats WebSocket events as public market data only, deduplicates and marks stale streams; REST backfill is the bounded fallback. User/private channels are not implemented.
- `mcp` exposes eight read-only tools over stdio/Streamable HTTP. `extension` is MV3 with minimum permissions and local Summary calls only.
- `contracts/`, `hardhat.config.ts` and `ops/postgres/` define local Solidity/PostgreSQL paths. Chain writes are separately gated to Base Sepolia `84532`; missing RPC/wallets leaves these flows unavailable.
- `app/audit/route.ts` is a read-only JSON/Markdown report projection. It accepts only a UUID-shaped `run_id` and does not trigger external requests.

## Data state propagation

`live`, `recorded`, `synthetic` and `cached` are explicit types. A recorded fixture keeps its original source URL, retrieval time, HTTP status and limitations but its payload is marked `recorded`. The application never promotes a failed live request to synthetic or presents a synthetic response as a real observation.

## Anthropic boundary

Anthropic receives a bounded window/evidence JSON input and must return the explicit attribution schema. Deterministic code controls the window, timestamp relation, coverage and lead-rate calculations. Missing credentials, timeout, 429/5xx, budget exhaustion or invalid JSON produce an unverified `unattributed` outcome. No other LLM provider is configured.

## Payment boundary

`POST /summary` and `GET /health` are free. The legacy and v1 attribution routes are protected resources, fixed to x402 `exact`, Base Sepolia `eip155:84532`, testnet USDC and `$0.01`; v1 reuses the same wrapper. The Next adapter may consume the JSON body while extracting payment, so the UI/buyer repeats the public input in `x-alibi-input`; the JSON request contract remains supported for the unprotected path and API clients.

## Observability boundary

`POST /summary` creates the run and returns an optional `meta.run_id`; a subsequent Detail request may reuse that run through the public `x-alibi-run-id` correlation header. The Audit & Report Agent stores only event metadata: sequence, logical Worker, status, timestamps, data status, digest, relative artifact path, counts, coverage, retry, cost and policy flags. It does not store raw input, prompts, model responses, API keys, private keys or payment signatures. Recorded payment-required runs remain labeled `recorded`; a real live attribution or settlement is not inferred from the audit stream.
