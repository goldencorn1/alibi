# Verification report

## Platform v0.7 execution log

- Exact approval `ALIBI-PLATFORM-BUNDLE-005 v0.7` matched and activation record preserved in `artifacts/verification/alibi-platform-bundle-005-activation-v07.json`.
- P02–P07 implementation checkpoint: PASS for contracts, deterministic analysis/ranking modules, local RAG contract/fallback, WebSocket replay state, and PostgreSQL migration files.
- Approved direct dependencies are installed at exact locked versions for `@huggingface/transformers@3.7.0`, MCP server/client `2.0.0`, `pg@8.16.3`, `hardhat@3.0.0`, and `@openzeppelin/contracts@5.4.0`.
- Local embedding artifact download and hash-before-ingestion are complete; no external embedding API or `EMBEDDING_API_KEY` is used.
- The locked q4 model files are now downloaded and hash-verified before ingestion; local smoke returned `local-onnx`, `recorded`, 384 dimensions. Manifest: `artifacts/rag/model-manifest.json`.
- The active v0.2 Spec/Plan headers were finalized only after approval; current hashes are recorded in the v0.7 activation artifact.

Date: 2026-09-04 (Asia/Shanghai)  
Final status: **PARTIALLY VERIFIED**

Resume audit: the approved local verification path was re-run after handoff. `AGENT-OBS-BUNDLE-001 v0.2` was atomically activated before product implementation; no later Spec or Plan changes were made.

## Passed in this workspace

| Check | Result | Evidence |
|---|---|---|
| TypeScript | PASS | `npm run typecheck` |
| Lint | PASS | `npm run lint` |
| Unit/contract/integration | PASS | `npm test`: 19 files, 41 tests |
| Production build | PASS | `npm run build` |
| Browser E2E | PASS | `npm run test:e2e`: 2 tests |
| Recorded replay | PASS | `npm run verify:offline`: market + Wallet A + Wallet B |
| Live verification gate | PARTIAL (expected) | `npm run verify:live`: all three public read-only analyses loaded; command remains non-zero until Anthropic/x402 prerequisites exist |
| Live public selection | PASS | `artifacts/verification/demo-selection.json`: 3 markets, 2 wallets |
| Live-to-recorded capture | PASS | `fixtures/recorded/manifest.json` and three fixture files |
| Free Summary | PASS | local `POST /summary` returned 200 with `data_status=recorded` |
| Unpaid Detail boundary | PASS | local `POST /attribution` returned 402 and `PAYMENT-REQUIRED` header |
| Coverage gate | PASS | recorded wallet outputs were 1.88% and 0.01%; both returned `insufficient_evidence` and null lead rate |
| UI state mapping | PASS | loading, error, insufficient, unattributed, payment-required and success are API/fixture-driven; mapping tests and E2E cover the path |
| Agent Console visual flow | PASS | `output/playwright/change-agent-obs-001/agent-console-browser.json`; real browser evidence covers loading, recorded Summary, 4 platform Agent cards, 9 Worker rows, payment-required, `payment=blocked`, redacted challenge status and both export endpoints |
| Audit report contract | PASS | append-only JSONL, runtime event validation, JSON/Markdown rebuild, redaction fault tests and `GET /audit` integration tests |
| Atomic change activation | PASS | `artifacts/verification/agent-obs-bundle-activation.json`; Change→Spec→Plan→DoD tracking and target SHA-256 verification passed |
| Clean-room reinstall/build | PASS | `output/verification/clean-room-v07`: fresh `npm ci` (558 packages), typecheck, lint, 19 files/41 tests and production build |
| Clean-room service/browser | PASS | isolated port 3010, recorded Summary, audit report, 4 platform Agent cards, 9 Worker Console rows, payment `blocked`, JSON/Markdown export; evidence under `output/verification/clean-room-v07/output/playwright/change-agent-obs-001/clean-room/` |
| Sensitive artifact scan | PASS | 106 JSON/JSONL/Markdown files, 636 credential/header/JWT pattern checks, 0 hits; no secret-shaped content in generated audit/browser artifacts |

## v0.7 local platform checks

| Check | Result | Evidence |
|---|---|---|
| Platform contracts and orchestrator | PASS | `src/agents/*`, `src/analysis/*`, `src/rankings/*`; recorded orchestrator integration test |
| Local RAG | PASS | locked model manifest, official q4 hashes, local ONNX smoke; no embedding API key or remote model access |
| WebSocket replay | PASS | deduplication, reconnect marker, stale detection and recorded status tests |
| PostgreSQL/pgvector path | PARTIAL | fixed compose and transactional up/down migration files exist; Docker Linux daemon unavailable, migration not executed |
| Solidity | PASS (compile/local chain) / NOT DEPLOYED | Hardhat 3.0.0, solc 0.8.24, OpenZeppelin 5.4.0; compile plus local Anchor/Subscription/TestUSDC smoke in `artifacts/verification/contracts-local-chain.json` |
| ERC-8004 | PASS (schema/preflight) / NOT REGISTERED | one root identity schema, fixed registries, owner/client gates and `validation=not_enabled` |
| MCP | PASS (local) | Node 24/TS 6, exact MCP 2.0.0 packages, eight tools, stdio construction and `/mcp` route |
| Chrome extension | PASS (local package) | MV3 unpacked artifact plus `artifacts/extension/alibi-extension.zip`; local Summary call only |
| API v1 | PASS | health, summary, protected attribution, agent-run, wallet report, rankings, subscription and ERC-8004 status routes; all route smoke statuses recorded in `artifacts/verification/platform-v07-final.json` |
| Agent Console | PASS | four high-level Agent cards, nine Worker rows, polling, recorded labels, payment boundary and export links; root and clean-room browser evidence |

## Current recorded observations

- Market replay: 3 markets, 18,599 normalized price points, 98 repricing windows, 98 `unattributed` windows.
- Wallet A replay: 5 markets, 1,832 normalized price points, 10,000 public trades, coverage 1.88%, `insufficient_evidence`.
- Wallet B replay: 3 markets, 1,100 normalized price points, 10,000 public trades, coverage 0.01%, `insufficient_evidence`.

These are recorded public-data observations, not live results at request time and not a claim about the wallets or their owners.

## Remaining blockers

1. `ANTHROPIC_API_KEY` is unavailable. The adapter, schema, timeout, bounded two-attempt retry, budget check, error mapping and synthetic contract tests are implemented, but live Anthropic attribution and its cost/response cannot be verified. No alternate LLM provider was added.
2. `ALIBI_PAYMENT_ADDRESS`, `BASE_SEPOLIA_RPC_URL` and `BUYER_AGENT_PRIVATE_KEY` are unavailable. The server x402 path, local buyer policy, Web payment helper and 402 fault tests are implemented, but real Base Sepolia verify/settle, Web unlock, Agent unlock and receipt hashes are not verified.
3. Wallet coverage is below the approved 40% threshold for both selected public wallets; the app correctly withholds lead-rate/capability conclusions. This is a data limitation, not a threshold relaxation.
4. No live evidence provider was selected under the approved scope. Current real-data windows therefore remain conservatively unattributed.
5. `DATABASE_URL` is unavailable and the local Docker Linux daemon is not running; PostgreSQL runtime/migration verification remains pending.
6. Public MCP endpoint and Chrome extension ID are unavailable; local MCP/zip verification passes, but public reachability/store identity is not verified.

## Agent observation implementation

- Nine logical Worker IDs are fixed in `src/contracts/index.ts`; the deterministic in-process Audit & Report Agent is implemented in `src/observability/audit-agent.ts`, with the pure `src/reports/assembler.ts` facade shared by v1 report responses.
- Event validation and secret-shaped text rejection are implemented in `src/observability/events.ts`. Reports contain digests and relative artifact paths, never raw input, prompt, response, full headers or payment signatures.
- `POST /summary` creates a run and returns `meta.run_id`; `POST /attribution` reuses the run when `x-alibi-run-id` is supplied. `GET /audit` only reads the local report artifacts.
- The page uses 1.5-second polling and stops after `completed`, `partial` or `failed`; a later Detail/payment request explicitly restarts polling for the same run.
- The browser artifact uses Wallet A in `recorded` mode. It is a visual/product verification artifact, not live attribution, paid Detail success or a real x402 settlement.
- `RUNNABLE_DEMO_COMPLETE` is not claimed until every v0.7 local gate, including database runtime, is verified; the complete clean-room check now passes. Current result remains `PARTIALLY VERIFIED` because the database runtime and live external gates are unavailable.

## Final local evidence index

- Approved Spec SHA-256: `9F4457D73D7DF8E8B4D147E66EBB23AD4111AC6BF39005D5EDE609D093324592`。
- Approved Plan SHA-256: `69BB66129F6F469909DA789646218FFAEDCDE80B5F5847F6C5B2A1CE52C4B1DD`。
- Current Change Request SHA-256: `2776BEC2B53BEDAF84C0AA1A7BEF0C56BDCC54CFFA6379B9328087E3AF2BC3E8`；activation-time SHA remains recorded in the bundle manifest.
- Machine-readable summary: `artifacts/verification/agent-obs-bundle-activation.json` and `artifacts/verification/agent-obs-final.json`。

Until blockers 1 and 2 are resolved and the complete live acceptance is rerun, the project must not be marked `COMPLETE`.

## CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2 execution result — 2026-09-04/05

Approval recorded:

`EXECUTE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1`

The approved CR v0.2 and Plan v0.1 were executed within their file matrix. `SPEC-ALIBI-PLATFORM.md v0.7` was not modified and remains hash `6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c`. The project state remains **PARTIALLY VERIFIED**; neither `RUNNABLE_DEMO_COMPLETE` nor `FULLY_LIVE_VERIFIED` is claimed.

### Actual modified files

Production and contract files:

- `src/contracts/index.ts`
- `src/analysis/source-calibration.ts` (new)
- `src/analysis/cluster-language.ts`
- `src/data/evidence.ts`
- `src/engine/analyze.ts`
- `src/api/platform.ts`
- `src/report/build.ts`
- `src/ui/state.ts`
- `src/adapters/evidence/aggregator-discovery.ts`
- `src/adapters/evidence/hong-kong.ts`
- `src/adapters/evidence/hksar-isd.ts` (new)
- `src/adapters/evidence/federal-register.ts` (new)
- `src/adapters/evidence/sec-edgar.ts` (new)
- `src/adapters/evidence/hkma.ts` (new)
- `src/adapters/evidence/pairing.ts`
- `src/adapters/evidence/revisions.ts`
- `src/adapters/polymarket/market-ws.ts`
- `src/adapters/polymarket/ws-state.ts`
- `src/adapters/polymarket/rest-backfill.ts`
- `src/data/adapters.ts`
- `src/payment/idempotency.ts` (new)
- `app/attribution/route.ts`
- `app/api/v1/attribution/route.ts`
- `app/page.tsx`

Tests and verification artifact:

- `tests/unit/source-calibration.test.ts` (new)
- `tests/unit/evidence-time.test.ts`
- `tests/unit/cluster-language.test.ts`
- `tests/integration/payment-idempotency.test.ts` (new)
- `tests/integration/api.test.ts`
- `tests/integration/audit.test.ts`
- `tests/websocket/market-ws.test.ts`
- `tests/e2e/accessibility.spec.ts` (new)
- `artifacts/verification/cluster-language-source-preflight.json` (new)
- `artifacts/extension/alibi-extension.zip` (local package verification artifact)
- `artifacts/extension/unpacked/BUILD-METADATA.json`
- `artifacts/extension/unpacked/background.js`
- `artifacts/extension/unpacked/content.js`
- `artifacts/extension/unpacked/manifest.json`

Documentation:

- `DATA-SOURCES.md`
- `VERIFICATION.md`
- `HANDOFF.md`
- `CHANGELOG.md`

No package manifest, lockfile, v0.7 Spec, v0.7 Plan, `next.config.ts`, environment file, database, migration, existing recorded fixture, MCP production source, Extension production source or ERC-8004 source was modified.

Generated or refreshed verification artifacts also include `artifacts/verification/verify-recorded.json`, `artifacts/verification/vitest-junit.xml`, the Playwright report and the three screenshot files listed below. Next.js/TypeScript generated metadata (`next-env.d.ts`, `tsconfig.tsbuildinfo`) may be refreshed by the build and is not an intentional feature change.

### Executed checks

| Check | Result | Evidence |
|---|---|---|
| TypeScript | PASS | `npm run typecheck` |
| Lint | PASS | `npm run lint` |
| Full Vitest | PASS | 25 files, 76 tests |
| Production build | PASS via controlled path | `npx next build --webpack`; Next 16.3.4, route inventory unchanged |
| Default Turbopack build | ENVIRONMENT GAP | `npm run build` hit host sandbox CSS worker `listen EPERM`; no source error; Webpack path passed |
| Playwright | PASS | 12/12 tests, including desktop/mobile/200% zoom, keyboard and reduced-motion assertions |
| Recorded replay | PASS | `npm run verify:offline`; market, Wallet A, Wallet B all `data_status=recorded` |
| Iran blind replay | CASE_NOT_REPRODUCED | 9 required artifacts absent; no synthetic substitute created |
| API/x402 402 smoke | PASS | legacy and v1 unpaid boundary retain HTTP 402, x402 V2, exact 0.01 USDC, Base Sepolia and `PAYMENT-REQUIRED` |
| Unattributed free detail | PASS | recorded windows with no verified evidence return Detail with `paid_access.access=free_unattributed` and no payment challenge |
| Payment identifier | PASS | same-request replay, conflicting fingerprint fail-closed, concurrent coalescing, sensitive response headers excluded |
| Secret scan | PASS | recorded fixture verifier: 4 files, 0 findings; no payment signature/private key in audit report assertions |
| MCP | PASS | local stdio construction, eight tools, `/mcp` non-public |
| Extension packaging | PASS | local archive `artifacts/extension/alibi-extension.zip`, `public_release=false`; SHA-256 `c6d1d1d012e17351627a90487b8763430536a8992f113ff133edb75a8aac75ab` |
| Clean-room install | PASS | `/private/tmp/alibi-cluster-language-v02-clean-room-final-f4QJp7`; `npm ci --ignore-scripts`, 563 packages added, 4 npm audit high findings recorded, no root lockfile change |
| Clean-room type/lint/test/build/replay | PASS | final clean-room: 25 files/76 tests, Webpack build, recorded verification passed |

### Screenshots

- `/Users/a0000/polymarket/artifacts/verification/screenshots/cluster-language-desktop.png` — SHA-256 `ce2bfecdef98464b35768a4113828f805a70f0e7ef1798f50403a245e6f7194b`
- `/Users/a0000/polymarket/artifacts/verification/screenshots/cluster-language-mobile.png` — SHA-256 `bf4bc1e27b3d5ace52596ad72774bcbd46c43b5e9f14366e6356f9d5502ec3d5`
- `/Users/a0000/polymarket/artifacts/verification/screenshots/cluster-language-200-percent.png` — SHA-256 `5e10cc4d458d449d28de2b82de66253ddff7a3dc0df85fbe9b4bdd2c34a0fa6a`

### Source and time calibration result

HKSAR English/Traditional Chinese RSS, HKMA English, SEC EDGAR and Federal Register were probed with bounded public read-only requests. HKSAR and HKMA/SEC response shapes were observed; the Federal Register returned an official temporary-unavailability message; GDELT timed out. The complete redacted result and response hashes are in `artifacts/verification/cluster-language-source-preflight.json`. The implementation preserves GDELT `seendate` only as `first_seen_at`, keeps provider coverage dynamic, and emits no timestamp safety bound in this run because every calibration cohort has fewer than 30 independent reference samples. Absolute-error P95, not the median, is the only accepted safety bound.

### Definition of Done mapping

- P0/P1 adapters, provider state, raw/UTC timestamps, coverage and discovery-only boundary: implemented and unit-tested; live shape observations recorded; full historical coverage and calibration remain unverified.
- Language interval overlap: implemented as `release_order=indeterminate`; pairing, date-only and unknown coverage remain conservative.
- Cluster rules: 180-minute BUY/taker, nearest-rank P99/200, D1–D6 and herding veto retained and regression-tested; contradictory coverage cannot pass formal alert.
- Market pipeline: trigger-only Market Channel primitives, a read-only Data API `/trades` hydration helper, bounded pagination and canonical reconcile helpers are implemented and covered by a stubbed adapter test; a live stream and live hydration run were not performed.
- API/payment: legacy and v1 boundaries use bounded idempotency; x402 terms are unchanged; no payment or settlement occurred.
- UI: GUI/CLI/APP stays recorded-only, session count starts at 0, no fake ticker/metric/synthetic user output; keyboard, responsive, 200% zoom, reduced-motion and visible status coverage passed.
- Iran: approved blind process returns `CASE_NOT_REPRODUCED` because the required package is absent.

### External and remaining blockers

- GDELT was unavailable during this preflight; Federal Register Public Inspection was temporarily unavailable; no `not_found` or formal alert was inferred from either.
- No 30-sample independent calibration cohort, real recorded bilingual pair, or real recorded cluster was available for the final artifact; time/source conclusions remain unknown or recorded-only.
- Anthropic credentials, payment address/RPC/buyer credentials, live settlement, database runtime, public MCP endpoint and Extension publication remain unverified under the existing v0.7 gates.
- Default Turbopack remains host-sandbox blocked; controlled Webpack build passes.
- `npm ci` reported four high-severity audit findings in the existing dependency tree. No dependency update or `npm audit fix` was attempted because dependency changes are outside scope.

### Integrity and cleanup

Protected hashes after execution: `SPEC-ALIBI-PLATFORM.md` `6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c`, `PLAN-ALIBI-PLATFORM.md` `0c362b5e567f3051997b874da1f3f4e5e70839e3b62bebbe5dd9cdc9862eceaf`, `package.json` `9b44171d4053e1f1986e095ccab519c84fc86bfdac7455c471b8e82ec992d9b0`, `package-lock.json` `ab2f2883e03dc5563d4175d217748509a9eead740f56446961ba3239032d17b8`, `next.config.ts` `1717de44afb15015a1faaa3fb97746d9716e164f2d5587a721ba8cc21e840536`. No payment, chain transaction, migration or public release occurred. Playwright/local build processes were stopped by their runners; the clean-room remains isolated under `/private/tmp` and did not write the project root.

### Multi-agent audit ledger

| 子智能体任务 | 状态 | 核心发现 | 主 Codex 是否复核 |
|---|---|---|---|
| Source/Calibration Auditor | complete | P0/P1 availability, dynamic coverage and 30-sample absolute-error P95 gate; no safe calibration cohort | yes; source preflight and adapter smoke independently checked |
| Contract/Cluster/Language Auditor | complete | additive SourceObservation, conservative source gate, pairing and overlap→`indeterminate`; six dimensions/herding thresholds retained | yes; targeted and full tests passed |
| Market/API/Payment Auditor | complete | Market Channel must remain trigger-only; Data API supplies wallet hydration; x402 boundary/idempotency risks identified | yes; helper, API tests and MCP/x402 checks rerun |
| UI/Platform/Security Auditor | complete | recorded-only UI, state/accessibility gaps, no permission/payment/public-release expansion | yes; Playwright, Secret scan and local Extension package rerun |

No unresolved conclusion conflict changed the implementation. The only material caution was the v1 resource-path observation; the approved Plan requires shared logical payment protection, so the existing legacy/v1 routes were preserved without adding an alias or changing x402 terms. Subagents performed read-only work only; all workspace edits and final conflict resolution were performed by the main Codex. No unverified live provider, calibration, payment, chain, database or public endpoint is represented as passed.

## Re-run commands

```powershell
npm ci
npm run verify
npm run test:e2e
npm run verify:offline
```

After approved credentials are safely configured, use `npm run verify:live`, then rerun `npm run capture-recorded` only after successful live reads and x402 verification. Never paste secrets into the terminal transcript or chat.
## Cluster/language evidence verification checkpoint

Scope: CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1.  
Implementation status: local deterministic core and report/UI wiring implemented; live source hydration, real recorded cluster selection and final clean-room acceptance remain pending. Overall project state remains PARTIALLY VERIFIED.

The required verification classes are tracked by the implementation plan:

1. 180-minute UTC left-open/right-closed boundaries.
2. BUY-only candidate selection and SELL exclusion.
3. Decimal notional, P99 nearest rank, 7-day lookback, future lookahead exclusion and 200-row baseline gate.
4. D1 same-side ratio including stable YES tie behavior.
5. D2 R7 IQR/time concentration and unknown coverage.
6. D3 profile_age_days floor, missing/late profile and 80% coverage.
7. D4 prior history, pagination/dedup and incomplete-not-zero behavior.
8. D5 dominant outcome, logit clipping and population standard deviation.
9. D6 prior-market no-trade meaning and coverage.
10. Composite evaluable/pass gate and per-dimension reasons.
11. Herding true/false/unknown, stable ties and veto.
12. Formal alert versus cluster_observation/restricted/insufficient_baseline.
13. Source cutoff, connector health and found/not_found/unknown.
14. GIA/HKMA connector, date-only and polling uncertainty.
15. Source tiers, aggregator discovery-only and CourtListener degradation.
16. Official-ID/cross-link pairing and pairing_unverified.
17. Language gaps, release order and all four wallet relations.
18. Revision chain with alert_id, revision and supersedes_revision.
19. RTDS trigger, REST hydration, dedup, reconnect, 15-second fallback and reconcile.
20. Summary/Attribution compatibility, x402 invariants, UI wording, synthetic exclusion, recorded provenance, manifest/hash, E2E, secret scan, clean-room, rollback and reporting.

Current executed local checks after the feature changes:

- TypeScript: PASS.
- Vitest: PASS, 23 files and 55 tests.
- Lint and build: pending final run after documentation and remaining adapter assertions.
- Playwright, recorded replay, 402 smoke, screenshots and clean-room verification: pending final run.
- No live external connector was called during the current implementation turn.
- No synthetic cluster or synthetic language evidence was added.

The final report must record actual counts and paths rather than reuse historical v0.7 counts. Live-provider failure must remain PARTIALLY VERIFIED.

## CR-CLUSTER-LANGUAGE-EVIDENCE-001 final execution record — 2026-09-04

Plan approval received:

`APPROVE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1`

The approved implementation was executed as an additive, evidence-only change. No Spec, package manifest, lockfile, next.config, environment file, database, migration, payment term, v1 route, MCP source, Extension source, ERC-8004 source or existing recorded fixture was intentionally changed.

### Actual source/document changes

Changed source files:

- `src/contracts/index.ts`
- `src/analysis/decimal.ts`
- `src/analysis/statistics.ts`
- `src/analysis/time-window.ts`
- `src/analysis/cluster-language.ts`
- `src/data/evidence.ts`
- `src/data/fixtures.ts`
- `src/engine/analyze.ts`
- `src/observability/audit-agent.ts` (required schema consumer for the approved 1.1.0 audit output)
- `src/adapters/polymarket/market-ws.ts`
- `src/adapters/polymarket/ws-state.ts`
- `src/adapters/polymarket/rest-backfill.ts`
- `src/adapters/evidence/hong-kong.ts`
- `src/adapters/evidence/courtlistener.ts`
- `src/adapters/evidence/aggregator-discovery.ts`
- `src/adapters/evidence/pairing.ts`
- `src/adapters/evidence/revisions.ts`
- `src/agents/contracts.ts`
- `src/agents/orchestrator.ts`
- `src/agents/evidence.ts`
- `src/agents/quality-risk.ts`
- `src/report/build.ts`
- `app/page.tsx`
- `app/globals.css`

Changed tests/scripts:

- `tests/contract/contracts.test.ts`
- `tests/integration/api.test.ts`
- `tests/integration/cluster-language.test.ts`
- `tests/unit/cluster-language.test.ts`
- `tests/unit/decimal.test.ts`
- `tests/unit/evidence-time.test.ts`
- `tests/websocket/market-ws.test.ts`
- `tests/e2e/app.spec.ts`
- `tests/e2e/cluster-language.spec.ts`
- `scripts/replay-cluster-language.ts`
- `scripts/verify-cluster-language.ts`

Changed documentation:

- `DATA-SOURCES.md`
- `VERIFICATION.md`
- `CHANGELOG.md`
- `HANDOFF.md`

Verification generated or refreshed artifacts include `artifacts/verification/verify-recorded.json`, `artifacts/verification/vitest-junit.xml`, the Playwright report, the three screenshots below, and the local extension package. Next.js refreshed generated `next-env.d.ts` and TypeScript refreshed `tsconfig.tsbuildinfo`; these are generated build metadata, not intentional feature files.

### Executed results

| Check | Result | Evidence |
|---|---|---|
| Typecheck | PASS | `npm run typecheck` |
| Lint | PASS | `npm run lint` |
| Full Vitest | PASS | 23 files, 60 tests |
| Production build | PASS | `next build --webpack`, 17 static pages, route inventory unchanged |
| Default Turbopack build | ENVIRONMENT GAP | `npm run build` hit sandbox `listen EPERM`; the same path was retried with escalation; webpack build passed |
| Playwright | PASS | 10/10 tests |
| Recorded replay | PASS | market, Wallet A, Wallet B; `artifacts/verification/verify-recorded.json` |
| Iran replay | CASE_NOT_REPRODUCED | all 9 required Iran artifacts are absent; no fixture was created |
| API 402 smoke | PASS | legacy `/attribution`: HTTP 402, x402 V2 header, Base Sepolia, exact 0.01 USDC; no payment sent |
| Secret scan | PASS | recursive recorded JSON/NDJSON scan, 4 files, 0 findings |
| Clean-room | PASS | `/private/tmp/alibi-cluster-language-clean-room.tM2pox`; locked `npm ci --ignore-scripts`, typecheck, 23/60 tests, Webpack build |
| MCP | PASS | local stdio construction, eight tools, `/mcp` non-public |
| Extension | PASS | local unpacked package and `public_release=false` archive |
| ERC-8004 | PRECHECK PASS | preflight only; owner/client absent, no registration or transaction |
| Rollback rehearsal | NOT RUN | no Git repository and no destructive command was used; protected hashes are recorded, but a pre-change source backup was not captured in this execution turn |

Screenshots:

- `/Users/a0000/polymarket/artifacts/verification/screenshots/cluster-language-desktop.png` — SHA-256 `020470ac4d9252add9d55daae2b8e2effdaa349990bef311fe8dfea245108c7a`
- `/Users/a0000/polymarket/artifacts/verification/screenshots/cluster-language-mobile.png` — SHA-256 `c948c6aac4788a10a562b5d63b4d63f5fdce55c2c5073fb0cbc43191b5b2ad98`
- `/Users/a0000/polymarket/artifacts/verification/screenshots/cluster-language-200-percent.png` — SHA-256 `c04b0b8d52a7fba77c8e68e2323583a9673d36aa4a89cefce740a50379573ae1`

Protected hash verification after execution:

- `SPEC-ALIBI-PLATFORM.md`: `6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c`
- `package.json`: `9b44171d4053e1f1986e095ccab519c84fc86bfdac7455c471b8e82ec992d9b0`
- `package-lock.json`: `ab2f2883e03dc5563d4175d217748509a9eead740f56446961ba3239032d17b8`
- `next.config.ts`: `1717de44afb15015a1faaa3fb97746d9716e164f2d5587a721ba8cc21e840536`

External network/cost: no Polymarket/GIA/HKMA/CourtListener/Anthropic call was made; clean-room `npm ci` accessed the package registry, with no paid call or recorded project dependency change; no payment, chain transaction or production write occurred. The root project remains `PARTIALLY VERIFIED`, not `COMPLETE`, because live attribution, Base Sepolia settlement, database runtime and a reproducible real cluster/language artifact are not established.

## PLAN-UI-I18N-GLOSSARY-001 v0.2 execution — 2026-09-05

The exact approval `APPROVE: PLAN-UI-I18N-GLOSSARY-001 v0.2` was recorded and executed. Workstream A passed first: the existing BUY-only cluster implementation remains aligned with the approved rule. BUY YES and BUY NO are the only candidate entries; SELL is context only and remains excluded from candidate membership, D1–D6, herding and the formal gate. The existing SELL-exclusion regression passed. D4 remains conservative: `first_trade_ratio` is shown as `Thin-History Ratio` only when a trusted payload supplies value and coverage; otherwise the UI shows unavailable/insufficient evidence and never recomputes in the browser.

### Gates and verification

| Gate | Result | Evidence |
|---|---|---|
| A-GATE | PASS | Existing cluster unit/regression suite; no analysis, contract, normalize, engine or API file changed |
| B-GATE | PASS | Locale, glossary, TermHelp, Audit Markdown, SSR cookie/metadata, keyboard, mobile, 200% zoom and reduced-motion E2E |
| V-GATE | PASS WITH HOST LIMITATION | 82 unit tests, 15/15 serial Playwright tests, typecheck, lint, Webpack build, recorded replay, API smoke, Secret scan and protected hashes |

`npm test` passed 28 test files / 82 tests. The standalone `tests/unit/term-help.test.tsx` is not discovered by the protected repository Vitest include (`tests/**/*.test.ts`); browser E2E coverage for the same interaction passed, and no forbidden test-config change was made. The default Turbopack build still hits the host sandbox `listen EPERM`; `next build --webpack` passed with 17/17 static pages.

### Actual modified files and final hashes

The intentional source/test change set is the approved allowlist subset. The five preliminary files had recorded pre-execution hashes in the approved Plan; the remaining files did not have a separately persisted pre-execution hash in the workspace, so their final hashes are recorded without inventing a before value.

| File | Pre-execution SHA-256 when recorded | Final SHA-256 |
|---|---|---|
| `app/layout.tsx` | not persisted | `cd25db040b0474bffc5dac7eb71a836ced90e573caf42cb1e6f55ed6687eee4d` |
| `app/page.tsx` | not persisted | `50e0ba7b98f2bde768b7f866a99a87a6b9307615922a372d5a87a00ad2451c61` |
| `app/page-client.tsx` | `45f32ff7402738550a7e25c6080d6f4d88cfe4471a346603f83f031d922d2bb8` | `b61a252e5d462ab8b874c5877f16198c1843b74ca7a8013bc8f93cf487f44fa2` |
| `app/globals.css` | not persisted | `a035ed8cb4ab9697526dc4de439a4d9d97b0dbfbf370b2bec0fb7fa3b47ca41b` |
| `src/ui/i18n.ts` | `09a0bc8ad206d8875b368655e966d1106f5ce545a5dcdbe7080b169930177280` | `28b4403e2fdf0086ff277a49f5e427e9ac86fb500dfbc176bb4cf9016d20b00a` |
| `src/ui/glossary.ts` | `7d833e2d0b56331daece62c19b8a0a4378a30f020c5d8594396ae219c66b5874` | `0069fb61e79e7e366cc31ade50d533bda132f14f11853e795be5816dc66b22a4` |
| `src/ui/term-help.tsx` | `b08b12ab566fd5619dd07ca05b82c1e7ef3f7476171a341c7dce8def3620248e` | `e4192f4457c5d289968d34d337d09dbb6c2ed80826d6714c6fd0f1e319ccf963` |
| `src/reports/markdown.ts` | `5fd05c37d4e7b1ab7749bc309ba7246ec0120195485061b36a5f2cecc332a7b2` | unchanged |
| `tests/unit/i18n.test.ts` | not persisted | `0b68867ddba5ad1bea66af7e98ca7c5eef0256f59aaf3e80f2978e0f3a5c36f9` |
| `tests/unit/glossary.test.ts` | not persisted | `265becc297de61dcb968bdb85562e81587f4379c562e25bfbc1f80fc9a784b89` |
| `tests/unit/markdown.test.ts` | not persisted | `0e48e3798cda09f180c76b70893c51aafdde22bc705dc2521c184d6b532beca7` |
| `tests/unit/term-help.test.tsx` | not persisted | `f408f2582ca3306def9f43ac38bd192c8996d9b70b9a2a1c711b4299c708d0dc` |
| `tests/e2e/app.spec.ts` | not persisted | `541520d44665b40f8d43ff43ae0d6734e9f5691484b9a7cc982ceff8bb251661` |
| `tests/e2e/accessibility.spec.ts` | not persisted | `0cd93ab9a2ba4d4414d37418639f4be00b8a2aa8eff5f6d7686161367a80bfaf` |
| `tests/e2e/cluster-language.spec.ts` | not persisted | `05fa3c88a4e99679e1124e5db725df38bb1c2a8a1e7d1a835e2236921042dfef` |
| `tests/e2e/i18n-glossary.spec.ts` | not persisted | `5b0cfa5d95e1254af2075f897a800c008fc14eda7dcad5a0e0930a686b070c2c` |

The generated `.next/`, `next-env.d.ts` and `tsconfig.tsbuildinfo` metadata was refreshed by Next.js/TypeScript and is not an intentional feature-file change. The complete artifact hash manifest is `artifacts/verification/ui-i18n-glossary-001/file-hashes.txt`.

### UI and protected-contract acceptance

- `zh-CN` is the SSR default; `alibi_locale` persists only `zh-CN`/`en`, updates React state and `<html lang>` without refresh or refetch, and localizes title/description without translating `Alibi`.
- TermHelp uses a real button with transient hover/focus and pinned click/touch behavior; Escape, outside click and repeat click close it; one pinned term and the same `term_id` survive locale changes.
- Recorded Summary and Audit JSON/Markdown retain English contract field names, raw evidence titles/URLs/hash/statuses and explicit recorded labeling. Synthetic payloads are rejected from every user-facing panel.
- Screenshots: `artifacts/verification/ui-i18n-glossary-001/cluster-language-desktop.png`, `cluster-language-mobile.png`, `cluster-language-200-percent.png`, and `en-mobile-200.png`; complete hashes are in `artifacts/verification/ui-i18n-glossary-001/execution-summary.md`.
- Protected Spec, approved Plans/CRs, `package.json`, `package-lock.json` and `next.config.ts` hashes remain unchanged. No API, x402, fixture, database, migration, MCP, Extension, ERC-8004, WebSocket, RAG or payment file was modified.
- Local `/health` returned 200 in recorded mode. Recorded `/summary` returned 200 with `meta.data_status=recorded`; an unknown recorded input returned conservative 503 `upstream_unavailable`. Canonical and legacy Attribution returned unpaid HTTP 402 with `data_status=recorded` and a parseable x402 V2 exact challenge on Base Sepolia (`eip155:84532`, 0.01 USDC); no payment, signature, settlement or chain access was attempted. `/api/summary` and `/api/attribution` remain 404, confirming no unapproved adapter was added.

### Final status

Local recorded bilingual Demo: `RUNNABLE_DEMO_COMPLETE`.

Overall platform: `PARTIALLY_VERIFIED`; `FULLY_LIVE_VERIFIED` is not claimed. Live attribution, external source completeness, payment settlement, database runtime and public endpoint verification remain outside this execution evidence.

## UI-I18N-GLOSSARY-001 v0.3 execution pause checkpoint — 2026-09-05

The user requested an immediate pause after the approved `PLAN-UI-I18N-GLOSSARY-001 v0.3` execution began. This checkpoint records the saved state and supersedes any earlier UI execution summary that claims final E2E, screenshot, clean-room, or `RUNNABLE_DEMO_COMPLETE` acceptance for the current code state.

### State at pause

| Gate | State | Meaning |
|---|---|---|
| A-GATE | `STATIC_PASS_NOT_FINAL_VERIFIED` | BUY-only and D4 protected implementation was not modified; existing checks passed, but the final independent UI gate is not closed here |
| B-GATE | `IMPLEMENTED_NOT_E2E_VERIFIED` | UI/i18n/Glossary/TermHelp/Markdown wiring is present; browser, visual and accessibility verification remains pending |
| V-GATE | `PAUSED_PENDING` | User pause requested before remaining verification |
| `GLOSSARY_COVERAGE` | `100%` static mapping | `UNMAPPED_TERMS=0`, `DUPLICATE_TERM_IDS=0`, `PENDING_DEFINITION=0`; DOM TermHelp verification is false |
| `RUNNABLE_DEMO_COMPLETE` | `NOT_MARKED` | Final local acceptance was not claimed |
| `FULLY_LIVE_VERIFIED` | `NOT_MARKED` | Never permitted by this execution |

### Completed before pause

- Verified the v0.3 Plan SHA-256: `ce88cf933f6939a614fb697a1cb66c07f1741fafc1e0d2495599d59b51bfe4f1`.
- Confirmed `NO_GIT_REPOSITORY`. The earlier pre-change temp directory was not present when this checkpoint was resumed; a recoverable current-state snapshot was created at `/private/tmp/alibi-ui-i18n-glossary-v0.3-paused-20260905-025200`.
- Added the centralized typed Glossary inventory, context-specific Worker metric terms, BUY-only `same_side_ratio` wording, conservative D4 wording, and policy/status terms.
- Added TermHelp keyboard/pinned/outside behavior and per-term test IDs; wired the bilingual recorded UI and client-side Audit Markdown renderer within the approved allowlist.
- `npm run typecheck`: PASS; targeted Vitest: PASS, 7 files / 18 tests; full Vitest: PASS, 28 files / 82 tests.
- `npm run lint`: PASS; `next build --webpack`: PASS. The default Turbopack path remains a host sandbox `listen EPERM` limitation.
- The temporary Webpack dev server was stopped with Control-C; port 3000 is empty at this checkpoint.

### Not run after this code state

Playwright E2E, desktop/mobile/200% screenshots, recorded replay, API/402 smoke, final Secret scan, final clean-room verification, and Desktop launcher page verification remain pending. No payment, signature, chain transaction, migration, live attribution, paid external call, or public release was executed.

### Intentional source changes and hashes

| File | Before SHA-256 | Current SHA-256 |
|---|---|---|
| `app/page-client.tsx` | `b61a252e5d462ab8b874c5877f16198c1843b74ca7a8013bc8f93cf487f44fa2` | `f5489103bcbcdb70c02a68c2986ea1cecd8834ecee87193bfae43f7118328e95` |
| `app/globals.css` | `a035ed8cb4ab9697526dc4de439a4d9d97b0dbfbf370b2bec0fb7fa3b47ca41b` | `27cccc84e7c50ce63e1b7bff1b11a206ef71efc2291f11a729d38a0b72d0ba74` |
| `src/ui/glossary.ts` | `0069fb61e79e7e366cc31ade50d533bda132f14f11853e795be5816dc66b22a4` | `521bc87301ab9bd625ac6bbf283296726f90bdd9c6bec52e04beac3a5733a1ce` |
| `src/ui/term-help.tsx` | `e4192f4457c5d289968d34d337d09dbb6c2ed80826d6714c6fd0f1e319ccf963` | `0d839bb5d4a73b6f31d0c4ae44294928f26e9784340a3f586dfc530dcd0a6578` |
| `src/reports/markdown.ts` | `5fd05c37d4e7b1ab7749bc309ba7246ec0120195485061b36a5f2cecc332a7b2` | `6c94e7d685f67930b1bdad5e84a013f80ce250d0e29de00e3028d6eb81dd1160` |
| `artifacts/verification/ui-i18n-glossary-001/glossary-coverage.json` | `530933964904c4c1f0cc2baf697b2a074829cb1ca12015565fa6ea5f7dcd962c` | `ad31d69d6c7f3d3806ab0d6d4e47b30ca14f2020794da0efa424236d9d0d6791` |

`app/layout.tsx`, `app/page.tsx`, `src/ui/i18n.ts`, all allowlisted test files, and all protected files were unchanged relative to the recorded baseline hashes. The coverage artifact records static 100% glossary mapping with `dom_termhelp_verified=false`; it is not final visual or browser acceptance evidence. Because the pre-change temp directory was unavailable, the “Before SHA-256” values above are recorded baseline values, not a currently available backup manifest.

## WALLET-DISCOVERY-RANKING-001 v0.2 — Phase 0 resume verification — 2026-09-05T08:56:45-0700

Executed under `APPROVE: PLAN-WALLET-DISCOVERY-RANKING-001 v0.2` plus `APPROVE: WUDP-WALLET-DISCOVERY-001 OPTION C` and the caller's `GITHUB-BOOTSTRAP-AND-WORKTREE: COMPLETE` report. All checks in this section are read-only. The Git repository, the baseline commit, the tag, the remote, and the second worktree were created externally by the upload-side agent; this execution only inspected them.

### Task 0.3 — CR integrity comparison (Plan v0.2 §1.2)

| Item | Value |
|---|---|
| Command | `sha256sum CR-WALLET-DISCOVERY-RANKING-001-v0.2-candidate.md` |
| Hash fixed in approved Plan v0.2 §1 | `b9de021549ccc8f690591946b1c9f81a66761105efd231a021353a465d87a335` |
| Hash measured at execution time | `b9de021549ccc8f690591946b1c9f81a66761105efd231a021353a465d87a335` |
| Result | **MATCH** — comparison satisfied, `CR_INTEGRITY_MISMATCH` not raised |

The approved hash was compared, never rewritten. Measured twice in total (2026-09-05T08:27:53-0700 during Plan authoring, and at this resume); both agree.

### Protected and governance artifact hashes

| File | Expected | Measured | Result |
|---|---|---|---|
| `SPEC-ALIBI-PLATFORM.md` | `6066b9888b6e914e0068c693dd7acec444f4302c7633b9e2f39e443a91c1328c` | same | MATCH |
| `PLAN-ALIBI-PLATFORM.md` | `0c362b5e567f3051997b874da1f3f4e5e70839e3b62bebbe5dd9cdc9862eceaf` | same | MATCH |
| `PLAN-WALLET-DISCOVERY-RANKING-001-v0.1-candidate.md` | `8fd239976c1c318fc6a491a9a36c04496155fb9b3a218375962054a95b42292d` | same | MATCH (historical unapproved version, unchanged) |
| `PLAN-WALLET-DISCOVERY-RANKING-001-v0.2-candidate.md` | `7c5e62509108ebf8a4dda59bdd7b88ef4ae68d621380be54546562bdc071e915` | same | MATCH (approved plan under execution) |

### UI v0.3 six files — still at the paused checkpoint

All six match the v0.3 pause-checkpoint hashes recorded in the preceding section, byte for byte. The external Git bootstrap did not alter their content; no EOL normalization occurred (`.gitattributes` is absent).

`V-GATE=PAUSED_PENDING` is retained. `A-GATE=STATIC_PASS_NOT_FINAL_VERIFIED`, `B-GATE=IMPLEMENTED_NOT_E2E_VERIFIED`, `RUNNABLE_DEMO_COMPLETE=NOT_MARKED`, `FULLY_LIVE_VERIFIED=NOT_MARKED` are all unchanged. The existence of baseline commit `81bfa49c` does not constitute functional verification of these files, and must not be cited as such.

### Git topology (read-only)

| Item | Measured |
|---|---|
| `.git` | directory, present |
| `git rev-parse --is-inside-work-tree` | `true` |
| `git branch --show-current` | `feature/wallet-discovery` |
| `git rev-parse HEAD` | `81bfa49c0ec5cf9b723fd7a3a50984e680b04876` |
| `git status --porcelain` | empty (0 bytes) — clean |
| `git remote -v` | `origin https://github.com/goldencorn1/alibi.git` (fetch and push) |
| Branches | `* feature/wallet-discovery`, `+ main`, `remotes/origin/main` |
| Baseline commit parents | none (root commit) |
| Tracked file count | 993 |

Worktrees: this workspace at `feature/wallet-discovery` @ `81bfa49`; `/Users/a0000/polymarket-release` at `main` @ `81bfa49`. Both worktrees share the same baseline commit, matching the caller's report. `/Users/a0000/polymarket-release` was not read, written, or modified by this execution.

`git worktree list` marks the release worktree `prunable`, with reason `gitdir file points to non-existent location`. Cause established: `.git/worktrees/polymarket-release/gitdir` points to `/Users/a0000/polymarket-release/.git`, which lies outside this execution sandbox's mount boundary and is therefore unreachable from inside it. This is a sandbox visibility artifact, not host-side repository corruption. **`git worktree prune` must never be run from this sandbox** — it would deregister a healthy release worktree. Recorded as a standing prohibition.

### L0 reporting difference — baseline commit and tag annotation markers

Per the caller's instruction 7, recorded as an `L0 reporting difference` and not remediated. No `--amend`, no `git tag -f`, no force push, and no pause.

| Object | Text | `PARTIALLY_VERIFIED` | `V-GATE=PAUSED_PENDING` |
|---|---|---|---|
| Commit `81bfa49c` | `chore: publish Alibi development snapshot` | absent | absent |
| Tag `alibi-dev-snapshot-v0.1` (annotated) | `Alibi development snapshot v0.1 — PARTIALLY_VERIFIED` | present | absent |

Authoritative status is therefore established by this document, `DECISION-LOG.md`, and the caller's amendment, not by Git metadata: the project remains `PARTIALLY_VERIFIED`, and UI v0.3 remains `V-GATE=PAUSED_PENDING`. Anyone reading commit `81bfa49c` or tag `alibi-dev-snapshot-v0.1` in isolation must not infer that the snapshot is verified or that the UI v0.3 changes inside it passed verification.

### Secret scan — independent read-only recheck

The caller reported `Secret scan: PASS`. Independently rechecked rather than accepted on report.

- Tracked env files: `.env.example`, `.env.macos.example`, `.env.buyer.macos.example`. Every key was classified by value shape; all sensitive-named keys (`ANTHROPIC_API_KEY`, `BUYER_AGENT_PRIVATE_KEY`, `ALIBI_PAYMENT_ADDRESS`, `BASE_SEPOLIA_RPC_URL`, `DATABASE_URL`, `ERC8004_*`, `ALIBI_SUBSCRIPTION_CONTRACT_ADDRESS`) hold empty values. Remaining values are non-secret config (model name, facilitator URL, network id, localhost URL, data mode, cost cap). No value was echoed into this record.
- `.env.local` is **not tracked** (covered by `.gitignore`), so it was not published to the remote.
- Broad pattern scan across all 993 tracked files for 64-hex private keys, `sk-ant-*`, `hf_*`, `gh[pousr]_*`, and `AKIA*`: the only hits were 45 occurrences (16 unique) of 64-hex strings inside `artifacts/contracts/build-info/solc-0_8_24-3baa30324bc8e5ed353bb6eb9afdb2649ab66831.output.json`. Each unique value was inspected in context: 9 are solc `keccak256` source-metadata hashes for OpenZeppelin 5.4.0 and project contracts, 7 are `PUSH32` constants in disassembled bytecode (event topics). No private key, mnemonic, or API token.

Result: **PASS**, on independent evidence.

### Known and accepted, not remediated this round

The ONNX model file (~51.91 MB) is tracked and was pushed successfully. Per the caller's instruction 8, Git LFS migration, deletion, and re-download are all out of scope for this round and do not trigger a pause.

### Rollback mode change

Plan v0.2 §11.1 recorded the workspace as non-Git, which selected the §11.3 per-file timestamped backup mode. Now that the repository exists, §11.2 Git mode applies, with baseline commit `81bfa49c` as the anchor and `feature/wallet-discovery` as the only branch that may receive development commits. `main` must not be pushed to directly. `git reset --hard`, `git clean -f`, `git checkout .`, `git branch -D`, force push, and `git worktree prune` remain prohibited.

Important caveat on the anchor: baseline commit `81bfa49c` **contains** the unverified UI v0.3 changes. Restoring to `81bfa49c` therefore returns the tree to a state that is clean but not verified. It is a provenance anchor, not a known-good state.

### Phase 0 task 0.2 — pre-change manifest for the §10 allowlist — 2026-09-05T09:08:18-0700

Task 0.2 as written assumes §11.3 (non-Git), which required timestamped backup copies of every allowlisted file. §11.2 Git mode now applies, so the disposition is recorded explicitly here rather than silently skipped.

**Timestamped backup copies were not created.** The rationale is evidence-based, not assumed: for `APPROVAL-LOG.md` — the only allowlisted file modified so far whose pre-change hash was independently captured *before* the edit — the baseline blob in commit `81bfa49c` is byte-identical to that recorded pre-change value `667ab20bfc426be7bd94668de9d9ab13ec16148bf5933bc5e289762a42c12a89`. The baseline commit therefore demonstrably preserves pre-change content and serves the backup intent of task 0.2. Restores must use the §11.2 explicit single-file form (`git checkout 81bfa49c -- <path>`), never a worktree-level reset.

Command: `git show 81bfa49c:<path> | sha256sum` for baseline blobs; `sha256sum` / `stat` on the worktree.

| File | Baseline blob SHA-256 (`81bfa49c`) | Worktree vs baseline | Size | Perms | Index mode |
|---|---|---|---|---|---|
| `APPROVAL-LOG.md` | `667ab20bfc426be7bd94668de9d9ab13ec16148bf5933bc5e289762a42c12a89` | DIFFERS (task 0.5) | 5268 | 600 | 100644 |
| `DECISION-LOG.md` | `c49def041eb0078a50f4ac2c80cf30610582adbd175b3757e389e2bd31f704ac` | DIFFERS (this phase) | 15229 | 600 | 100644 |
| `VERIFICATION.md` | `c2e1d095cfcd11227251ee550a8ff1760fe6b29adc81c2faf8c8a1f56402a525` | DIFFERS (this phase) | 45162 | 600 | 100644 |
| `HANDOFF.md` | `526023280c57a99e57aa78306a795dd35d4309544b4bf9a06971f372ddd71847` | SAME | 25694 | 600 | 100644 |
| `CHANGELOG.md` | `dfc9d5d89733f8b05aefe1b2cd3dd65639a1bdccda1935f104c79af08b0c85bb` | SAME | 11971 | 600 | 100644 |
| `src/contracts/index.ts` | `a4dc5bcabed57b1c5a3a273ed18dca8edfd56468502a3dc3fe48c045ff64a5a2` | SAME | 17629 | 600 | 100644 |
| `src/data/adapters.ts` | `ee5f95bebece9a6e1a76de12e092216fafea3204829e5de1bae9e4a3ac795f2d` | SAME | 9535 | 600 | 100644 |
| `src/adapters/polymarket/market-ws.ts` | `16d41c7f744d0b3f254460266ae6025644e94e58ece0a174363a2bb5bf371e10` | SAME | 2848 | 600 | 100644 |
| `src/rankings/ranker.ts` | `6170137fef46d42091e2266098aa170f774b0c2f0d2aeab091201b8c8c2c9dbb` | SAME | 1006 | 600 | 100644 |
| `src/rankings/replay.ts` | `1671f84905eb99242308bfd538b4f721a8b8a324a882cf544dc9c9383850024e` | SAME | 955 | 600 | 100644 |
| `app/mcp/route.ts` | `ff5a8bf506f0eef82d3e0ac242fe49d1edcaaf80ad0a8c3f3a3a028a668569bb` | SAME | 520 | 600 | 100644 |
| `app/page.tsx` | `50e0ba7b98f2bde768b7f866a99a87a6b9307615922a372d5a87a00ad2451c61` | SAME | 372 | 600 | 100644 |
| `app/page-client.tsx` | `f5489103bcbcdb70c02a68c2986ea1cecd8834ecee87193bfae43f7118328e95` | SAME | 24618 | 600 | 100644 |
| `app/globals.css` | `27cccc84e7c50ce63e1b7bff1b11a206ef71efc2291f11a729d38a0b72d0ba74` | SAME | 3294 | 600 | 100644 |
| `src/ui/i18n.ts` | `28b4403e2fdf0086ff277a49f5e427e9ac86fb500dfbc176bb4cf9016d20b00a` | SAME | 13426 | 600 | 100644 |
| `src/ui/glossary.ts` | `521bc87301ab9bd625ac6bbf283296726f90bdd9c6bec52e04beac3a5733a1ce` | SAME | 38887 | 600 | 100644 |
| `src/ui/term-help.tsx` | `0d839bb5d4a73b6f31d0c4ae44294928f26e9784340a3f586dfc530dcd0a6578` | SAME | 5422 | 600 | 100644 |
| `src/reports/markdown.ts` | `6c94e7d685f67930b1bdad5e84a013f80ce250d0e29de00e3028d6eb81dd1160` | SAME | 3298 | 600 | 100644 |

The three DIFFERS rows are this session's governance writes only (Phase 0 tasks 0.4/0.5 and this record). No source, UI, contract, adapter, or route file has been modified: all 13 code files match the baseline byte-for-byte, which independently re-confirms the UI v0.3 six-file freeze.

**Permissions caveat.** Worktree files are mode `600`; Git records `100644` and this sandbox's `umask` is `0022`. A `git checkout`-based restore would therefore recreate files as `644`, not `600` — Git does not carry the owner-only bit. This is recorded so that any future rollback re-applies `chmod 600` to restored files rather than assuming permissions round-trip. No permissions were changed by this task.

New paths from §10.1, all confirmed absent, recorded as the "does not exist" pre-change state task 0.2 requires: `src/wallet-discovery/`, `app/api/v1/wallets/[address]/metrics/route.ts`, `app/api/v1/wallets/[address]/lead-rate/route.ts`, `app/api/v1/assess/`, `app/api/v1/screen/`, `app/api/v1/market-screen/`, `app/api/v1/evidence/`, `artifacts/verification/wallet-discovery-001/`. The parent `app/api/v1/wallets/[address]/` exists and currently holds only `report/route.ts`. Per §11.2 item 4, new files are rolled back by moving them to a timestamped quarantine directory, never by direct deletion.

Phase 0 status: tasks 0.1, 0.2, 0.3, 0.4, 0.5 all complete. `CR_INTEGRITY_MISMATCH` not raised. No L2 condition encountered. Phase 1 read-only live preflight may begin.

## Phase 1 read-only live preflight — tasks 1.1–1.5 (2026-09-05T09:54:44-0700)

Plan v0.2 §5.2 requires per endpoint: request URL with all query parameters, HTTP status, response sample, `retrieved_at`, measured pagination boundaries, response field inventory with nullability observations, and rate-limit observations. §5.3 requires that where measurement disagrees with documentation, **the measured value governs** and the difference is flagged.

All probes were unauthenticated public GET reads. No order, cancel, balance-approval, or trade-authentication endpoint was called. No credential was sent. No payment was made. Budget spent this phase: **USD 0.00**.

Base URLs as declared in `src/data/adapters.ts`: `GAMMA = https://gamma-api.polymarket.com`, `CLOB = https://clob.polymarket.com`, `DATA = https://data-api.polymarket.com`.

Probe subject wallet: `0xfe787d2da716d60e8acff57fb87eb13cd4d10319`. Probe subject market asset id: `20034320828941406477428503987987941126058692556545069105232308570920834101449`. One wallet and one market is a sample of one; every distribution below describes that sample, not the platform.

Artifacts: `artifacts/verification/wallet-discovery-001/`, 151 files / 5.1 MB, 33 distinct probes. Naming: `<name>.{url.txt,headers.txt,body.json,err.txt}`. Every probe retains its exact request URL, full response headers, and body.

### 1.0 Three instrumentation defects found and corrected before any conclusion was accepted

These are recorded first because each one initially produced a wrong reading, and the corrected method is a precondition for trusting everything below.

1. **CONNECT-proxy status line.** This sandbox reaches the network through a CONNECT proxy, so every `.headers.txt` begins with `HTTP/1.1 200 Connection established` — the proxy's own response. `head -1` therefore reported HTTP 200 for all 29 probes in the first pass, including the ones that actually failed. Correct extraction is `grep -aoE '^HTTP/[0-9.]+ [0-9]{3}'` taking the **last** match. True origin statuses: 24× `HTTP/2 200`, 5× `HTTP/2 400`. That same bad pass also reported "429 lines = 0" and "rate-limit headers = 0", which would have been an unsound basis for any throttling conclusion.
2. **Four probes had bodies but no retained headers.** `lb-off1500`, `lb-off2000`, `lb-off5000`, `lb-off10000` had `.body.json` but no `.headers.txt`, so their HTTP status was never persisted and could not be asserted. They were re-probed (all `200`, `ssl_verify_result=0`). The re-probe **overwrote the original bodies**, so every leaderboard-offset conclusion below was re-derived from the new bytes rather than carried forward from the earlier numbers.
3. **Apparent `/trades` ordering inversion was a stale cache, not inconsistent data.** `tr-o10000` returned `2026-08-15T23:55:39Z`, newer than the 16:20 snapshot's index-9999 row (`23:06:34Z`), which inverts DESC order. A back-to-back bulk snapshot plus single-row offset reads showed `bulk[0] = 16:51:57Z` while a `limit=1` head read taken 14 s **later** returned `16:48:03Z`. Root cause: `tr-head2` was `cf-cache-status: HIT` with `age: 67` and `last-modified: 16:51:02` — a stale copy. `tr-snap2`, `tr-o9999b`, `tr-o5000b` were EXPIRED/MISS/MISS (fresh) and were strictly DESC. Data consistency is not in question; **per-URL cache freshness is**.

**Retracted from a prior session, restated so it is not re-derived:** a `grep -rliE '429|...'` across probe bodies matched 15 files, but the match was the substring `429` inside the float `"vol":3122297.4296160014`. There was no HTTP 429. Substring noise is not an HTTP finding.

### 1.1 Transport and provenance caveats that apply to every row below

- **Synthesized DNS.** This sandbox resolves every hostname into `198.18.0.0/15`. An HTTP 200 alone is therefore **not** evidence of having reached real Polymarket infrastructure. The discriminator is TLS chain validation: `ssl_verify_result=0` on every 200 above, which is consistent with a valid certificate for the requested host. This is stated as the basis for trusting the responses, not as a claim that the transparent proxy was bypassed.
- **Cloudflare per-URL caching.** Every response carried `server: cloudflare` and a `cf-ray` ending `-SIN`, plus a `cf-cache-status`. Two reads of the same URL seconds apart can return different freshness. Consequence for the contract: **`as_of` must be derived from `date` / `last-modified` / `age`, never assumed to equal request time.** Measured `cache-control: max-age` and observed `age`:

  | Endpoint | `max-age` | Max observed `age` |
  |---|---|---|
  | `/v1/leaderboard` | 1800 | **1150 s** — materially staler than the others |
  | `/activity` | 15 | low |
  | `/closed-positions` | 300 | low |
  | `/trades` | 300 | 67 (the stale `HIT` above) |
  | `prices-history` | 90 | low |
  | any `400` response | absent | n/a, `cf-cache-status: BYPASS` |

- **Rate limits: `UNKNOWN`.** Zero matches for `retry-after|x-ratelimit|ratelimit-` across all retained headers, and no `429` was ever returned. This means the limits were **not observed**, not that they are absent. Probes were paced at ~2 s apart, so no limit was approached. Phase 2 must not assume unlimited throughput.

### 1.2 Measured vs documented pagination (§5.3 — measured governs)

| Endpoint | Parameter | Documented | Measured | Behaviour on excess |
|---|---|---|---|---|
| `/v1/leaderboard` | `limit` | 1–50 | `51` → 200 returning 50 rows, byte-identical to `limit=50` (11932 B); `0` → 200 returning 0 rows (2 B) | **silent clamp** |
| `/v1/leaderboard` | `offset` | 0–1000 | **not enforced**: 1001 → rank 1002; 1500 / 2000 / 5000 / 10000 → ranks 1501–1550, 2001–2050, 5001–5050, 10001–10050. All 200, all PnL-DESC, zero overlap with page 1 | documented cap does not exist |
| `/activity` | `limit` | ≤ 500 | 501 and 1000 both return 500 | **silent clamp** |
| `/activity` | `offset` | ≤ 5000 | 5001 → **HTTP 400** `{"error":"max historical activity offset of 5000 exceeded"}` (`cache-control` absent, `cf-cache-status: BYPASS`) | **hard-enforced** |
| `/closed-positions` | `limit` | ≤ 50 | `l50` and `l51` byte-identical (37168 B) | **silent clamp** |
| `/closed-positions` | `offset` | ≤ 100000 | honoured and genuine: overlap(`l50`,`o40`) = 10/50, overlap(`l50`,`o90`) = 0; `o100000` and `o100001` both 200 returning `[]` | honoured, empty past the end |
| `/trades` | `limit` | ≤ 10000 | `l10000` and `l10001` byte-identical, same SHA-256 `4226579dbe…69268d` | **silent clamp** |
| `/trades` | `offset` | ≤ 10000 | **inclusive at 10000** (200, 1 row); 10001 → **HTTP 400** `{"error":"max historical trades offset of 10000 exceeded"}` (BYPASS) | **hard-enforced, bound inclusive** |

Two consequences Phase 2 must encode rather than infer: silent clamping means a full-enumeration loop **cannot** use "returned fewer rows than requested" as its only termination signal on the clamping endpoints; and `offset=5000` on `/trades` maps to bulk index **4999**, i.e. offset is one-shifted relative to zero-based bulk indexing, while `offset=9999` matched `bulk[9999]` exactly.

### 1.3 Window feasibility — the finding that changes Phase 2's data path

`/trades` at `limit=10000` returns rows spanning `2026-08-15T23:06:34Z → 2026-09-05T16:20:06Z` = 1 790 012 s = **20.72 days**, and the offset ceiling is hard at 10000. Therefore for this wallet:

- **7-day window: computable.**
- **90-day window: NOT computable** from this endpoint. This is a contract-level limitation, not a transient failure.

`/activity` is worse: 500 rows span 2400 s = 40.0 min at 12.5 rows/min, and with the hard 5000 offset cap the endpoint exposes at most ~5500 rows ≈ **7.33 hours** of this wallet's history. A 90-day window would require ~1.6 M rows. This **invalidates the assumption that `/activity` can feed `realized_pnl_7d`, `total_trades`, or `flip_rate`**, and is why `/trades` — which is not among the four endpoints named in Plan §5.1 — was probed and must be added to the Phase 2 adapter surface.

**All 10000 `/trades` rows are `side=BUY`; zero SELL.** Exits are therefore invisible as sells on this endpoint, and **`flip_rate` cannot be derived from `side`**. Phase 2 must either source exits elsewhere or return `flip_rate` as null with `data_status` and a limitation. It must not be filled with 0.

### 1.4 Field inventories and nullability

- **`/trades`** (10000 rows): 19 fields. Always empty across all rows: `bio`, `profileImage`, `profileImageOptimized`. `size` is mixed int/float. `outcomeIndex: 999` count is **0** here.
- **`/activity`** (500 rows): timestamps are 10-digit epoch **seconds**. Type distribution TRADE 409 / REDEEM 74 / MERGE 17. `side` and `asset` are empty in exactly MERGE(17) + REDEEM(74) = 91 rows and present in all 409 TRADE rows — the emptiness is **structural, not missing data**, so cluster logic must filter `type == "TRADE"` before reading `side`. **No `createdAt` field**, so `account_age_days` is not obtainable here.
- **`outcomeIndex: 999` sentinel.** By type: TRADE {999:1, 0:239, 1:169}, REDEEM {999:5, 1:36, 0:33}, MERGE {999:17}. It occurs in 1 genuine TRADE row, so it must map to **`unavailable`**, never to 0.
- **`/closed-positions`** (50 rows): 17 fields, zero empty values. **The sort key is `realizedPnl` DESC, not `timestamp`** — page 1 interleaves 2026-05-19 through 2026-08-28. A 7-day window therefore requires **full enumeration with no early stop**; stopping when a row falls outside the window would silently drop qualifying rows. `realizedPnl` unit proven to be **decimal USDC**, not raw 6-decimal integers, via `pnl ≈ totalBought * (curPrice - avgPrice)` — ratios 0.9982, 0.9570, 0.7993, 0.9999, 0.9996, 1.0000, 0.9850, 1.0000. `curPrice` set {1:48, 0:2}, i.e. resolved markets.
- **`/v1/leaderboard`** (50 rows): 8 fields — `rank` (a **string**, not a number), `proxyWallet`, `userName`, `xUsername`, `verifiedBadge`, `vol`, `pnl`, `profileImage`. **No age field**, so `account_age_days` is not obtainable from the leaderboard either.

Cross-endpoint consequence: no probed endpoint exposes a profile creation timestamp. `account_age_days` / `Profile Age` remains dependent on the public-profile `createdAt` source named in the approved contract and is **not** derivable from the four endpoints measured here.

### 1.5 `prices-history` (task 1.4)

Shape: `{"history":[{"t":…,"p":…}]}`; all `p` float. Error bodies verbatim:

```
{"error":"invalid filters: minimum 'fidelity' for '1m' range is 10"}
{"error":"invalid filters: the 'interval' value is unknown. Known values: '1m', '1w', '1d', '6h', '1h'"}
{"error":"invalid filters: the 'market' (asset id) is mandatory"}
```

`ph-max`: 253 points spanning 1.74 d with **non-uniform** steps (121 s, 576–584 s, …). `ph-fid` (`interval=1d&fidelity=1`): 1441 points spanning 1.00 d with a step of **0** — duplicate timestamps present. Repricing-window logic must not assume a uniform grid or unique timestamps.

### 1.6 Large-body evidence chain

`/trades` bodies exceed 7 MB each. To keep the artifact directory proportionate, each was hashed **before** compression, the `zcat | sha256sum` roundtrip was verified to match, and only then was the original removed. `artifacts/verification/wallet-discovery-001/large-body-hashes.txt`:

```
4226579dbe2213c876cbcf4039afc603dfc109acd61af2a51a444da85269268d  tr-l10000.body.json  bytes=7695133  (uncompressed original, hashed before gzip)
4226579dbe2213c876cbcf4039afc603dfc109acd61af2a51a444da85269268d  tr-l10001.body.json  bytes=7695133  (uncompressed original, hashed before gzip)
abb27a5e231fed0f69a8e6129e077aacf4f3e64c0a907358066b100556a966eb  tr-snap2.body.json  bytes=7694985  (uncompressed original, hashed before gzip; second snapshot 2026-09-05T16:51:52Z)
```

Retained: `tr-l10000.body.json.gz`, `tr-l10001.body.json.gz` (1130796 B each), `tr-snap2.body.json.gz`. Deletion of the originals required `mcp__cowork__allow_cowork_file_delete`; the hash chain above is what makes the compressed copies admissible.

### 1.7 Per-endpoint `data_status` from measurement

| Endpoint | Status | Supports which approved outputs | Hard limitation measured here |
|---|---|---|---|
| `/v1/leaderboard` | `live` | Wallet Discovery candidate set | `age` up to 1150 s; `rank` is a string; no age field; documented offset cap absent |
| `/activity` | `live` | short-horizon cluster context only | ~7.33 h maximum reach — cannot support 7 d or 90 d |
| `/trades` | `live` | 7 d metrics | 20.72 d ceiling → **90 d not computable**; BUY-only → `flip_rate` not derivable from `side` |
| `/closed-positions` | `live` | `realized_pnl_7d`, `win_rate` | PnL-DESC sort forces full enumeration; unit is decimal USDC |
| `prices-history` | `live` | repricing windows | non-uniform steps; duplicate timestamps at `fidelity=1` |
| profile `createdAt` source | `UNKNOWN` | `account_age_days` / `Profile Age` | not exposed by any endpoint probed here |

### 1.8 What this phase did not do

No build, typecheck, lint, or test was run this session. The "28 Vitest files / 82 tests / 15/15 Playwright" baseline is quoted from `HANDOFF.md` and was **not** re-measured. Nothing was committed to Git this session. `/Users/a0000/polymarket-release` and the `/private/tmp` snapshot remain **unverifiable** from this sandbox — they lie outside the mount boundary, and a failed `ls` proves only sandbox invisibility, never host-side absence. UI v0.3 remains `V-GATE=PAUSED_PENDING`; nothing in Phase 1 changes that.

Phase 1 status: tasks 1.1–1.5 complete. No `CR_INTEGRITY_MISMATCH`. No secret, funds, or unrecoverable-error condition. Two findings must be carried into Phase 2 as contract changes rather than implementation details: the 90-day window is not computable from the measured endpoints, and `/trades` must join the adapter surface with full official pagination replacing the current single-page 90-day path.

---

## Crash recovery verification — `ALIBI-EXECUTOR-CRASH-RECOVERY-AND-BUNDLE v1.0`

A previous execution window (Codex) crashed after writing a Bundle candidate. This section is written by the successor window. **Every check below is read-only.** No product code, dependency, lockfile, migration, or Git commit was touched.

### R.1 Crash-scene state (read-only)

| Item | Measured |
|---|---|
| Working directory | `/Users/a0000/polymarket` (mounted in this sandbox at `/sessions/pensive-eloquent-tesla/mnt/polymarket`) |
| Branch | `feature/wallet-discovery` ✓ expected |
| HEAD | `81bfa49c0ec5cf9b723fd7a3a50984e680b04876` (root commit, unchanged) |
| Remote | `origin https://github.com/goldencorn1/alibi.git` (fetch + push) ✓ expected |
| `git status --short` | 3 modified (`APPROVAL-LOG.md`, `DECISION-LOG.md`, `VERIFICATION.md`), 2 untracked dirs, 1 untracked file |
| `git diff --stat` | 3 files, +317 / −6 — governance documents only, **zero code files** |
| Worktrees | this workspace @ `81bfa49`; `polymarket-control` @ `81bfa49` (detached, prunable); `polymarket-release` @ `5d0d3b4` `docs/github-showcase-v1` (prunable) |
| Ports 3000 / 3100 | no listeners |
| Node / Next / Playwright / Vitest processes | none |

Both `prunable` markers are the known sandbox mount-boundary artifact, not host-side corruption. **`git worktree prune` was not run and must never be run from this sandbox** — the standing prohibition is reaffirmed, not weakened.

The unclean working tree is **legitimate leftover progress, not an error**: the three governance edits carry timestamps 08:56–09:54 from approved Plan v0.2 Phase 0/1 writes, and the Bundle candidate was written at 11:45. No `reset`, `checkout` overwrite, `stash`, `clean`, `rebase`, or force push was performed. No file of unknown origin was deleted.

### R.2 Residual files

| Path | Size | Files | SHA-256 / note | Modified |
|---|---|---|---|---|
| `CHANGE-BUNDLE-…-001-v0.1-candidate.md` (pre-continuation) | 33127 B, 372 lines | 1 | `a7293319 5c6534b3 8dace6f9 98adf49d edacf8a5 f7ad17a4 a32ad0bf 7852ce36` | 2026-09-05 11:45:11 −0700 |
| `artifacts/verification/crash-recovery-consolidated-001/recovery-manifest.json` | 352 KB | 1 | `inventory_sha256 = fe17e807…7b2208ee`, `captured_at 2026-09-05T18:48:06Z` | — |
| `artifacts/verification/wallet-discovery-001/` | 5.1 MB | 151 | Phase 1 probe bodies / headers / URLs / `large-body-hashes.txt` | 2026-09-05 09:54 −0700 |

### R.3 Attachment provenance — recomputed this round, historical values not substituted

| Attachment | Bytes | Measured SHA-256 | Historical | Result |
|---|---|---|---|---|
| `Alibi 输入输出全清单.md` (202 lines) | 9502 | `cd3e763a44c25a7bb333892278ffb901366c24c1d5097d4d21115df42520f828` | same | **MATCH** |
| `alibi-landing-20260904.html` | 39743 | `5c4820990a40e536612e220dad33c64c37980f33f87ad4caf812c6a5f905823b` | same | **MATCH** |
| `alibi-pitch.html` | 137398 | `b6126546119b18abe14198c9dc2f407bb2eeb9b6dcf0e361d7825d1ea79d2876` | same | **MATCH** |
| `alibi-trust-agent.zip` | 202494 | `8f5913b330c90c3c354cea2f710d70842d9b3063da7143fa6c1449a8e9916397` | none on record | new record |

All four are **independent uploads, not ZIP members**, permissions `-r--------`. Filename `alibi-pitch.html` differs from the earlier instruction's `alibi-pitch(3).html`; bytes and hash match the historical pitch value, so this is the same content under a different filename. Recorded, **not treated as blocking**.

Consequently the `ATTACHMENT_MISSING` finding of 2026-09-05T09:54:44-0700 has lost its premise. That finding was correct when written — the three documents genuinely are absent from the ZIP, and at that time only the ZIP had been uploaded. Its text is **retained verbatim**; `DECISION-LOG.md` carries the supersede note.

### R.4 ZIP independent recomputation

Extracted read-only to `/tmp/zrec/ex`; the upload was not modified and **no byte was copied into the product tree**.

| Item | Measured | Historical record | Result |
|---|---|---|---|
| ZIP bytes / SHA-256 | 202494 / `8f5913b3…9916397` | same | MATCH |
| Central-directory entries | 162 | 162 | MATCH |
| Extracted files | 98 | 98 | MATCH |
| Directory entries | 64 (`find -type d` = 65, incl. extraction root) | 64 | MATCH |
| 98 + 64 | 162 ✓ arithmetic closes | — | consistent |
| Extracted total bytes | 684239 | 684239 (`DECISION-LOG.md:103`) | MATCH |
| Top-level directory | single `web-ui-review` | same | MATCH |
| Inventory hash | `fe17e807e6318ef2d9a46afcbc6f8e1d95224e6e72e6936261d24a5f7b2208ee` | `recovery-manifest.json` `inventory_sha256` | **MATCH, character for character** |

The inventory hash was reproduced independently under the algorithm the manifest states for itself (`sha256` + two spaces + decimal bytes + two spaces + archive-relative path + LF, LC_ALL=C sorted, 98 lines). This is cryptographic evidence that the pre-crash artifacts were not tampered with, and it is **the basis on which Phase 1 evidence is reused instead of re-probed**.

`HISTORICAL_SIZE_RECORD_MISMATCH` remains **RESOLVED** on measurement: 684239 is the extracted total, 162 is files + directory entries, and the ZIP file itself is 202494 bytes. Three different quantities, no contradiction.

`/tmp/zv002-inventory.txt` (recorded in Bundle §0.3 as `3efb8d4e…6bfdc9f`, 98 lines) was a crash-window temporary file, now gone with `/tmp`, and its line format was never recorded — so it **cannot be recomputed**. Logged as `FORMAT_UNRECORDED_NOT_MISMATCH`; the 98-line file count agrees with this round. Not presented as a contradiction, and not presented as verified.

### R.5 Phase 1 reuse — zero supplemental probes

All Phase 1 conclusions in Bundle §14 are carried from §1.0–1.8 above and the 151 artifacts. **No network request was made this round.** No artifact was missing, corrupt, or hash-inconsistent, so the precondition permitting supplemental probes never arose. No order, cancellation, authenticated trade, private User Channel, payment, or on-chain operation occurred. External spend **USD 0.00**.

### R.6 What this round did not do

No build, typecheck, lint, or test was run — the "28 Vitest files / 82 tests / 15/15 Playwright" figure remains a `HANDOFF.md` quotation, **not re-measured**. Present and confirmed as available for the execution phase: `vitest.config.ts`, `playwright.config.ts`, `eslint.config.mjs`, 33 test files, and an `npm run verify` script chaining typecheck → lint → test → build. Nothing was committed. `/Users/a0000/polymarket-release` and `/Users/a0000/polymarket-control` were neither read nor written. UI v0.3 remains `V-GATE=PAUSED_PENDING`; `A-GATE`, `B-GATE`, `RUNNABLE_DEMO_COMPLETE`, and `FULLY_LIVE_VERIFIED` are unchanged. Nothing in this recovery constitutes functional verification of any code.

Recovery status: **complete**. The Bundle candidate was continued in place (§13–§21 appended, §0–§12 unaltered), so no `-recovered` duplicate was created.

## FAST-TRACK-LOCAL-DEMO + AMENDMENT-A2A-FIRST-LOCAL-DEMO — 2026-09-05/06

This section records the approved continuation and its additive local A2A demo surface. The existing v0.7 Spec, approved Plans/CRs, BUY-only cluster behavior, x402 V2 payment boundary, fixtures, database, MCP/Extension/ERC-8004/WebSocket/RAG surfaces and Desktop launcher were not replaced. No payment, signature, chain transaction, migration, live attribution, paid external call, push or merge occurred.

### A2A implementation verified

- Added local recorded `POST /api/v1/screen` with 1–50 public addresses. It returns `data_status=recorded`, `metric_status=unavailable`, null lead-rate/coverage/eligibility when the snapshot lacks trusted wallet metrics, and never performs browser-side calculation.
- Added `GET /api/v1/a2a/capabilities`. It reports the actual eight-tool local MCP catalog, recorded-only and unavailable/not-verified boundaries, x402 terms, and `erc8004.registration_status=not_registered`.
- Added `scripts/demo-a2a-client.ts`; it calls capabilities, leaderboard, one wallet metrics/lead-rate pair and a 20-address recorded screen. It only decodes public x402 challenge fields if encountered and never settles them.
- Added an A2A Console showing the actual caller request, recorded execution trace, machine-readable response JSON, copy/export actions, REST/MCP view, responsive state and explicit payment `not_performed` status.

### Verification evidence

| Check | Result |
|---|---|
| Glossary coverage | `101/101`, `GLOSSARY_COVERAGE=100%`, `UNMAPPED_TERMS=0`, `DUPLICATE_TERM_IDS=0`, `PENDING_DEFINITION=0` |
| Vitest | **39 files / 250 tests passed** |
| Typecheck | PASS |
| Lint | PASS |
| Webpack production build | PASS; includes `/api/v1/screen` and `/api/v1/a2a/capabilities` |
| Playwright | **24/24 passed** with one worker; existing accessibility, app, cluster/language, i18n, wallet, A2A and screenshot checks included |
| Recorded offline replay | PASS for `market`, `wallet-a`, `wallet-b` |
| Fixture integrity / Secret scan | CLEAN; 6 scanned fixture files, no findings; no secret values output |
| Production localhost smoke | PASS: home 200, `/health` 200, capabilities 200, recorded `/screen` 200 |
| External spend | USD 0.00 |

The full E2E result is the sequential `24/24` run. A prior parallel dev-HMR run had one flaky DOM detachment; its selector was corrected and the stable sequential rerun passed. Dev logs also showed transient HMR/audit stream errors; the production-build smoke was clean, so this remains a development-environment observation rather than a live guarantee.

### Screenshot evidence

Recorded screenshots are under `/Users/a0000/polymarket/artifacts/verification/local-demo-fast-track/screenshots/`:

- `zh-CN-desktop.png`, `zh-CN-mobile.png`, `zh-CN-200-percent.png`
- `en-desktop.png`, `en-mobile.png`, `en-200-percent.png`
- `zh-CN-a2a-desktop.png`, `zh-CN-a2a-mobile.png`, `zh-CN-a2a-200-percent.png`
- `en-a2a-desktop.png`, `en-a2a-mobile.png`, `en-a2a-200-percent.png`

### Final status

`LOCAL_DEMO_READY=YES`

`LOCAL_API_VERIFIED=YES`

`LIVE_SOURCE_STATUS=UNVERIFIED`

`X402_CHALLENGE_VERIFIED=YES` (contract/integration only)

`X402_SETTLEMENT_PENDING=YES`

`LANGUAGE_CALIBRATION_PENDING=YES`

`ERC8004_REGISTERED=NO`

`PRODUCTION_READY=NO`

`FULLY_LIVE_VERIFIED=NO`

Iran blind replay remains `CASE_NOT_REPRODUCED` because its nine required artifacts are absent. Database runtime, live upstream freshness, Anthropic attribution, real x402 facilitator verification/settlement, public MCP/Extension endpoints and public release remain unverified. A fresh `npm ci` clean-room was not run because this approved execution forbids dependency installation; source-only clean-room evidence is in `artifacts/verification/local-demo-fast-track/clean-room.json`.

## UI TermHelp visual polish checkpoint — 2026-09-05

The visible TermHelp `?` control was reduced from the previous 1.5rem box, browser-default button padding was removed, and the wrapper now reserves explicit inline space and cannot be flex-shrunk. This addresses oversized icons and label crowding without changing glossary state, locale behavior, API requests or analysis behavior.

Verification after the change:

- `vitest`: 40 files / 277 tests passed.
- Playwright: 25/25 passed sequentially with one worker, including TermHelp focus/pin/Escape/outside-click, the new compact-layout assertion, mobile, 200% zoom, keyboard, reduced-motion, recorded A2A and bilingual screenshots.
- Typecheck and lint: PASS.
- Port cleanup: local Next server stopped; `127.0.0.1:3000` free; no project Node/Next/Playwright process remains.
- External side effects: no payment, signing, chain transaction, migration, dependency installation, paid call, push or merge was performed by the verification itself.

Overall status remains `PARTIALLY_VERIFIED`; `RUNNABLE_DEMO_COMPLETE=YES` for the local recorded demo and `FULLY_LIVE_VERIFIED=NO`.
