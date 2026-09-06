# Changelog

## 1.2.0-candidate — 2026-09-04

- Approved `CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2` with the exact command `APPROVE: CR-CLUSTER-LANGUAGE-EVIDENCE-001 v0.2` at `2026-09-04T20:29:53-0700` (America/Los_Angeles); the approved v0.7 Spec remains unchanged.
- Generated `PLAN-CLUSTER-LANGUAGE-EVIDENCE-001-v0.1-candidate.md`; this is a planning artifact only and is waiting for the independent Plan approval gate.
- No product code, dependency, lockfile, migration, database, environment file, payment call, paid service call, or chain transaction was executed in this step.

## 1.2.0-execution — 2026-09-04

- Recorded execution authorization `EXECUTE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1` at `2026-09-04T20:41:28-0700` (America/Los_Angeles); execution is limited to the approved CR v0.2 and Plan v0.1 file matrix.
- The v0.7 Spec and v0.7 Plan remain protected. No dependency installation, migration, paid service call, payment, or chain transaction is authorized by this record.

## 0.7.0 — 2026-09-04

- Activated `ALIBI-PLATFORM-BUNDLE-005 v0.7` after exact approval; v0.7 locks the local q4 MiniLM embedding model, local platform DoD, ERC-8004 wallet relation, chain limits and MCP package versions.
- Added platform agent contracts, the single Investigation Orchestrator facade, deterministic Evidence/Attribution/Quality-Risk modules and Audit & Report facade.
- Added deterministic time, repricing, DEES, coverage, risk, final-state and 90-day ranking modules.
- Added local-only RAG interfaces with locked model metadata and explicit `rag_degraded` keyword fallback.
- Added Polymarket public WebSocket state/replay/reconnect/stale handling and REST backfill wrapper.
- Added PostgreSQL 16 + pgvector compose and transactional additive migration/rollback SQL; migration is not executed until a local database gate is verified.
- Completed final local regression: 19 test files/41 tests, clean-room `npm ci` with 558 packages, clean-room service/browser replay, local ONNX 384-dimension smoke, API smoke, MCP verification, MV3 packaging, ERC-8004 preflight and Solidity compile. `next.config.ts`, `tsconfig.json` and ESLint now isolate generated verification artifacts from source checks.
- Added the pure Report Assembler facade required by the approved Plan and routed `/api/v1/attribution` through the existing x402 protection when live payment configuration is present; added regression coverage for the v1 unpaid boundary.
- Added a local-only Hardhat contract smoke harness for TestUSDC, AlibiSubscription and AlibiEvidenceAnchor; no public-chain transaction was sent.

## 0.2.0 — 2026-09-04

- Activated `CHANGE-AGENT-OBS-001` through the atomic `AGENT-OBS-BUNDLE-001 v0.2` approval; the approved Spec/Plan hashes and activation record are in `artifacts/verification/agent-obs-bundle-activation.json`.
- Added a deterministic in-process Audit & Report Agent with append-only JSONL event streams, runtime validation, safe input digests, nine logical Worker reports, JSON export and Markdown export.
- Added `GET /audit?run_id=...&format=json|markdown`; Summary and Detail responses carry an optional `meta.run_id` without changing their business contracts.
- Added the interactive single-page Agent Console with polling, terminal-state stop behavior, Worker metrics, policy flags, recorded/synthetic/live labels, limitations and redacted payment status.
- Added observability unit/integration tests, redaction fault tests and real-browser visual evidence under `output/playwright/change-agent-obs-001/`; current suite is 12 files and 25 tests.
- Reinstalled and verified the latest source in an isolated clean-room, including service smoke, browser flow and a zero-hit sensitive-artifact scan.
- Kept missing Anthropic and x402 credentials as explicit external blockers; recorded Console/Report and payment-required demos work without them, while no live attribution or paid settlement is claimed.

## 0.1.0 — 2026-09-04

- Resumed from the E1 handoff and re-ran the approved verification path; local implementation remains reproducible with USD 0 external spend and the expected external credential gates.
- Implemented the approved Next.js/TypeScript single-page demo and stable data/error contracts.
- Added read-only Gamma, CLOB and Data API adapters with timeouts, bounded retries, public source status and CLOB range-aware slicing.
- Added deterministic repricing detection at the approved 60-minute / `>=0.08` threshold.
- Added evidence validation, conservative Anthropic-only attribution adapter, explicit synthetic tests, budget guard and cost ledger.
- Added wallet alignment, estimated-return note and the 40% coverage gate.
- Added free Summary API, x402-protected Detail API, unconfigured 402 fallback and local buyer/Web payment policy helpers.
- Added six-state UI, three selected recorded presets, Vitest contract/unit/integration tests and Playwright E2E tests.
- Selected three public markets and two public wallets, captured sanitized recorded fixtures, and verified offline replay.
- Final verification is `PARTIALLY VERIFIED`: Anthropic live attribution and real Base Sepolia Web/Agent settlement remain unverified because approved credentials/resources are absent.
## 1.1.0 — 2026-09-04

- Added the approved CR-CLUSTER-LANGUAGE-EVIDENCE-001 deterministic contract surface at schema 1.1.0 with optional cluster/language/source coverage fields.
- Added fixed-point arithmetic, deterministic cluster gates, evidence-only language window evaluation, approved-source adapter boundaries, revision metadata and conservative degradation states.
- Extended existing report assembly and the existing GUI/CLI/APP page without adding public routes, v1 adapters, dependencies or payment changes.
- Added recorded, API, WebSocket and deterministic-core regression coverage. Final local acceptance passed with 23 Vitest files/60 tests, 10 Playwright tests, Webpack build, recorded replay, 402 smoke, Secret scan and clean-room verification; the project remains PARTIALLY VERIFIED because live providers, Base Sepolia settlement, database runtime and a real recorded cluster/language artifact are unavailable.

## 1.2.0-execution-result — 2026-09-04/05

- Executed the approved `PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1` after the exact authorization `EXECUTE: PLAN-CLUSTER-LANGUAGE-EVIDENCE-001 v0.1`; the protected v0.7 Spec and Plan hashes remain unchanged.
- Added additive native-fetch evidence adapters, dynamic provider coverage/provenance, 30-sample absolute-error P95 calibration primitives, conservative language interval `indeterminate`, language revisions and Market Channel trigger/Data API hydration and reconcile primitives.
- Added bounded process-local `PAYMENT-IDENTIFIER` replay/conflict/race handling and an explicit free `unattributed` Detail path without changing x402 V2 price, network, asset, payTo, facilitator or HTTP 402 semantics.
- Preserved recorded-only GUI/CLI/APP Demo behavior, added nested synthetic-output guards and passed keyboard, responsive, 200% zoom and reduced-motion browser checks.
- Verification: 25 Vitest files/76 tests, 12/12 Playwright tests, typecheck, lint, Webpack build, recorded replay, MCP, Extension packaging and final clean-room all passed. Default Turbopack remains a host sandbox `listen EPERM` environment gap.
- Public preflight observed HKSAR RSS, HKMA and SEC shapes; GDELT timed out and Federal Register returned an official temporary-unavailability response. No `not_found`, live evidence, payment, chain transaction, migration, dependency change or public release was claimed.
- Iran blind replay remains `CASE_NOT_REPRODUCED` because its nine required artifacts are absent. Final project status remains `PARTIALLY VERIFIED`, not `RUNNABLE_DEMO_COMPLETE` or `FULLY_LIVE_VERIFIED`.
# DEMO-API-READINESS-001 verification — 2026-09-04/05

- Verification-only run; no product source, dependency, lockfile, Spec, Plan, database, migration, payment configuration, signing, or chain transaction was changed.
- Actual local route smoke covered legacy `/summary`, `/attribution`, `/audit`, `/health`; v1 `/api/v1/summary`, `/api/v1/attribution`, `/api/v1/health`; and confirmed `/api/summary` plus `/api/attribution` are absent (404). Recorded Summary returned 200 with `data_status=recorded`; valid recorded Detail was free `unattributed`; missing-input Detail returned 402 with parseable x402 V2 challenge.
- Public read-only preflight covered HKSAR English/Traditional Chinese RSS, GDELT DOC 2.0, Federal Register Public Inspection, Gamma markets, Polymarket Data API trades, and CLOB price history. GDELT remained unknown after timeout; Federal Register remained unknown during the official unavailable window; Data API recovered after one transient connection failure.
- Demo artifacts: `artifacts/verification/demo-api-001/` contains route, upstream, x402, environment, checklist and desktop/mobile/200% screenshots. WebKit device mode was unavailable; Chromium mobile viewport was used without installing a browser.
- Previous approved local baseline remains 25 Vitest files / 76 tests pass; this verification run added route/source/demo smoke evidence but did not alter that baseline. No live payment, Anthropic call, facilitator verify/settle, RPC receipt, or public release was attempted.
- Final state remains `PARTIALLY_VERIFIED`; `RECORDED_DEMO_READY=YES`, `X402_SETTLEMENT_PENDING=YES`, `LANGUAGE_CALIBRATION_PENDING=YES`.
- Merged follow-up candidate for the observed attribution mode/resource/input-order boundary is `CR-DEMO-API-READINESS-001 v0.1 candidate`; no fix was implemented.

## 1.3.0-ui-i18n-glossary-execution — 2026-09-05

- Recorded approval `APPROVE: PLAN-UI-I18N-GLOSSARY-001 v0.2` and executed the two gated workstreams.
- Preserved the approved BUY-only cluster behavior and D4 unavailable/insufficient display policy; no analysis, contract, normalize, engine, API, fixture or data-pipeline file changed.
- Added bilingual `zh-CN`/`en` UI behavior with SSR `alibi_locale` cookie, localized metadata/lang, centralized glossary, accessible TermHelp, and client-side bilingual Audit Markdown rendering.
- Preserved legacy API calls, English JSON/API contract, x402 V2 boundary, payment terms, recorded fixtures, synthetic isolation and all protected platform surfaces.
- Verification passed: 82 unit tests, 15/15 serial Playwright tests, typecheck, lint, Webpack build, recorded replay, API/x402 read-only smoke, Secret scan and protected-hash integrity. Default Turbopack remains a host sandbox `listen EPERM` gap.
- Screenshot/hash evidence is under `artifacts/verification/ui-i18n-glossary-001/`. Local recorded bilingual Demo is `RUNNABLE_DEMO_COMPLETE`; overall platform remains `PARTIALLY_VERIFIED`. No payment, signing, chain transaction, migration, dependency change or live verification occurred.

## 1.3.0-ui-i18n-glossary-paused — 2026-09-05

- User-requested pause recorded for the approved `PLAN-UI-I18N-GLOSSARY-001 v0.3` execution; the Plan SHA-256 is `ce88cf933f6939a614fb697a1cb66c07f1741fafc1e0d2495599d59b51bfe4f1`.
- Saved a recoverable current-state snapshot at `/private/tmp/alibi-ui-i18n-glossary-v0.3-paused-20260905-025200` and recorded the current source hashes in `VERIFICATION.md` and `HANDOFF.md`; the earlier pre-change temp directory was unavailable on resume.
- Completed before pause: centralized typed Glossary, context-specific Worker terms, TermHelp interaction wiring, bilingual recorded UI/Markdown wiring, typecheck, lint, 28 Vitest files/82 tests, and Webpack build.
- Final browser E2E, screenshots, recorded replay, API/402 smoke, clean-room, Secret scan and Desktop launcher page verification remain pending; no final `RUNNABLE_DEMO_COMPLETE` claim is made for this checkpoint.
- Protected platform code, Spec/Plan/CR, API, x402, dependencies, fixtures, database and environment files were not modified. No payment, signing, chain transaction, migration or paid external call occurred.

## 1.4.0-fast-track-local-demo-a2a — 2026-09-05/06

- Executed the approved local recorded demo continuation and additive `AMENDMENT-A2A-FIRST-LOCAL-DEMO v0.1`; overall project status remains `PARTIALLY_VERIFIED`.
- Added the local recorded `POST /api/v1/screen` and `GET /api/v1/a2a/capabilities` surfaces without changing the existing analysis, API, x402, payment, database, fixture or live-provider behavior. Unavailable metrics stay null/unavailable and unimplemented capabilities remain not verified.
- Added `scripts/demo-a2a-client.ts` and an A2A Console with actual local request JSON, recorded audit trace, machine-readable response JSON, copy/export, REST/MCP views and explicit `settlement=not_performed` boundary.
- Preserved the actual eight-tool MCP catalog and reported `erc8004.registration_status=not_registered`; no synthetic result, fake metric, payment, signature, chain transaction, migration, paid external call, push or merge was performed.
- Verification passed: Glossary 101/101 (100%, no unmapped/duplicate/pending), 39 Vitest files/250 tests, typecheck, lint, Webpack build, 24/24 sequential Playwright tests, recorded offline replay, fixture integrity scan and production localhost smoke. Screenshots and API/A2A evidence are under `artifacts/verification/local-demo-fast-track/`.
- Remaining status: `LOCAL_DEMO_READY=YES`, `X402_CHALLENGE_VERIFIED=YES` (contract only), `X402_SETTLEMENT_PENDING=YES`, `LANGUAGE_CALIBRATION_PENDING=YES`, `FULLY_LIVE_VERIFIED=NO`, `PRODUCTION_READY=NO`. Iran blind replay remains `CASE_NOT_REPRODUCED` because its nine required artifacts are absent.

## 1.4.1-ui-term-help-polish — 2026-09-05

- Reduced the visible TermHelp `?` control and added explicit spacing/flex sizing so glossary icons no longer crowd or overlap adjacent labels; keyboard and touch controls remain independent buttons.
- Added a browser regression assertion for compact dimensions, zero browser-default padding, reserved label space and non-shrinking layout.
- Verification after the polish: 40 Vitest files / 277 tests passed, 25/25 sequential Playwright tests passed, including locale, keyboard, mobile, 200% zoom, reduced-motion and A2A scenarios. No API, algorithm, payment, fixture or database behavior changed.
