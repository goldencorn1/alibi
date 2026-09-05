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
