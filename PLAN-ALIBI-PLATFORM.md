# Alibi Complete Agent Platform Execution Plan — v0.2 active (v0.7 revision)

Version: v0.2 revision `v0.7`  
Status: ACTIVE  
Change package: `ALIBI-PLATFORM-BUNDLE-005 v0.7`  
Spec input: `SPEC-ALIBI-PLATFORM.md v0.7 final revision candidate`  
Source protocol: `V25.0`; V25 supersedes V22 and V24.  
Activation approval: `APPROVE: ALIBI-PLATFORM-BUNDLE-005 v0.7`

## 1. Revision binding and execution boundary

This Plan incorporates the complete normative content of `PLAN-ALIBI-PLATFORM.md v0.2 revision v0.6` and adds the exact v0.7 amendments below. The v0.6 source hash is:

`A752ED23A3092185523F508DE4C38D6D6C865D8574A1C74F15E1BD0A41AA8F98`

The exact approval command activated this Plan. All v0.5 and v0.6 candidates remain preserved; protected Complete Demo documents remain unchanged.

## 2. Locked local embedding execution

Use only:

| Field | Value |
|---|---|
| model | `onnx-community/all-MiniLM-L6-v2-ONNX` |
| revision | `aff7a1dc4e8a1ea593e6ea21e95c22ef0a25966f` |
| task | `feature-extraction` |
| dimensions | `384` |
| pooling | `mean` |
| normalize | `true` |
| runtime | `@huggingface/transformers@3.7.0` |
| license | Apache-2.0 |
| remote models | disabled with `allowRemoteModels=false` |
| external embedding API | prohibited |
| `EMBEDDING_API_KEY` | `NOT_REQUIRED` and must not be read |

Approved files only:

| File | Estimated size | Pre-known SHA-256 |
|---|---:|---|
| `onnx/model_q4.onnx` | 69.7 kB | `e4dcb918111189b7686147e309379832fce83d4ecbf17c395961749b5788c786` |
| `onnx/model_q4.onnx_data` | 54.4 MB | `56fb7a55115e900196115a74e399beb45c2f41ae00b99525d46fb52935c4ee2a` |
| `config.json` | 794 B | generated after download |
| `tokenizer.json` | 534 kB | generated after download |
| `tokenizer_config.json` | 1.46 kB | generated after download |
| `special_tokens_map.json` | 695 B | generated after download |
| `vocab.txt` | 232 kB | generated after download |
| `README.md` | 1.97 kB | generated after download |
| `.gitattributes` | 1.76 kB | generated after download |

Expected selected download is approximately 55 MB; reserve at least 120 MB. Approval applies only to the exact model ID, revision, and file list. Since draft mode does not download model files, every local artifact SHA-256 must be generated after download and before first ingestion. Any mismatch stops and enters Change Control. No model replacement is permitted. Load failure uses keyword fallback marked `rag_degraded`.

## 3. Local RUNNABLE_DEMO_COMPLETE gate

The old recorded Demo alone is insufficient. The following must all be locally implemented and verified before the local status is `RUNNABLE_DEMO_COMPLETE`:

- full time-evidence chain;
- Multi-Agent Orchestrator;
- Evidence Agent;
- Attribution Agent with `provider_unavailable` when Anthropic is absent;
- Quality & Risk Agent;
- read-only Audit & Report Agent;
- Agent Console;
- all `/api/v1` contracts;
- PostgreSQL 16 and pgvector local path;
- fixed local embedding model and vector RAG;
- keyword fallback marked `rag_degraded`;
- 90-day wallet universe, ranking contract, and recorded replay;
- Polymarket WebSocket recorded replay, reconnect/stale/REST fallback tests;
- Solidity compile and local chain tests;
- local subscription contract flow;
- x402 402 plus synthetic/recorded contract flow;
- ERC-8004 registration schema, local Identity/Reputation tests, `validation_not_enabled`;
- local stdio or Streamable HTTP MCP server and eight tool contract tests;
- MV3 unpacked extension, zip, and Chrome-to-local-Alibi API E2E;
- Web UI, clean-room install/build/test/start/demo, and complete documentation.

External credentials can block only live external verification. Synthetic data never enters the user Demo. Recorded Demo output must display `recorded`.

## 4. Complete exact file change matrix

### 4.1 Platform and Multi-Agent

| Action | File | Task |
|---|---|---|
| modify | `package.json` | P03 |
| modify | `package-lock.json` | P03 |
| create | `src/agents/contracts.ts` | P02 |
| create | `src/agents/orchestrator.ts` | P03 |
| create | `src/agents/evidence.ts` | P08 |
| create | `src/agents/attribution.ts` | P10 |
| create | `src/agents/quality-risk.ts` | P11 |
| create | `src/agents/audit-report.ts` | P13 |
| modify | `src/observability/events.ts` | P13 |
| modify | `src/observability/audit-agent.ts` | P13 |
| create | `src/reports/assembler.ts` | P13 |

### 4.2 Deterministic Analysis

| Action | File | Task |
|---|---|---|
| create | `src/analysis/repricing.ts` | P09 |
| create | `src/analysis/dees.ts` | P09 |
| create | `src/analysis/coverage.ts` | P11 |
| create | `src/analysis/risk.ts` | P11 |
| create | `src/analysis/final-state.ts` | P12 |
| create | `src/analysis/time.ts` | P09 |
| create | `src/analysis/normalization.ts` | P05/P09 |

### 4.3 Rankings

| Action | File | Task |
|---|---|---|
| create | `src/rankings/universe.ts` | P09 |
| create | `src/rankings/checkpoint.ts` | P09 |
| create | `src/rankings/eligibility.ts` | P11 |
| create | `src/rankings/ranker.ts` | P11 |
| create | `src/rankings/replay.ts` | P22 |

### 4.4 API

| Action | File | Task |
|---|---|---|
| create | `app/api/v1/health/route.ts` | P14 |
| create | `app/api/v1/summary/route.ts` | P14 |
| create | `app/api/v1/attribution/route.ts` | P14 |
| create | `app/api/v1/wallets/[address]/report/route.ts` | P14 |
| create | `app/api/v1/rankings/route.ts` | P14 |
| create | `app/api/v1/agents/runs/[runId]/route.ts` | P14 |
| create | `app/api/v1/subscription/status/route.ts` | P15 |
| create | `app/api/v1/subscription/prepare/route.ts` | P15/P17 |
| create | `app/api/v1/subscription/verify/route.ts` | P15/P17 |
| create | `app/api/v1/erc8004/status/route.ts` | P18 |
| preserve | `app/summary/route.ts` | P14 |
| preserve | `app/attribution/route.ts` | P14/P15 |
| preserve | `app/health/route.ts` | P14 |
| preserve | `app/audit/route.ts` | P13/P14 |

### 4.5 ERC-8004

| Action | File | Task |
|---|---|---|
| create | `app/.well-known/agent-registration.json/route.ts` | P18 |
| create | `src/erc8004/registry-config.ts` | P18 |
| create | `src/erc8004/registration-schema.ts` | P18 |
| create | `src/erc8004/identity.ts` | P18 |
| create | `src/erc8004/wallet.ts` | P18 |
| create | `src/erc8004/reputation.ts` | P18 |
| create | `src/erc8004/status.ts` | P18 |
| create | `scripts/erc8004-preflight.ts` | P18 |
| create | `scripts/erc8004-register.ts` | P18 |
| create | `scripts/erc8004-feedback-smoke.ts` | P18 |
| create | `tests/erc8004/*` | P18 |

The only permitted identity is `Alibi Evidence Agent`. Owner equals `ALIBI_PAYMENT_ADDRESS`; client is different; `agentWallet` starts as owner; `setAgentWallet` is not called. Validation remains `not_enabled`, with no custom Registry.

### 4.6 Solidity

| Action | File | Task |
|---|---|---|
| create | `hardhat.config.ts` | P16 |
| create | `contracts/AlibiSubscription.sol` | P16 |
| create | `contracts/AlibiEvidenceAnchor.sol` | P16 |
| create | `scripts/deploy-contracts.ts` | P16 |
| create | `test/contracts/*` | P16 |
| create | `artifacts/contracts/deployment-manifest.json` | P16/P26 |

Exact compiler is Solidity `0.8.24`, OpenZeppelin `5.4.0`, Hardhat `3.0.0`, Base Sepolia only. Deployment is gated external activity, never Stage 0.

### 4.7 MCP

| Action | File | Task |
|---|---|---|
| create | `mcp/server.ts` | P19 |
| create | `mcp/tools/*` | P19 |
| create | `mcp/transports/*` | P19 |
| create | `tests/mcp/*` | P19 |
| create | `scripts/mcp-client-verification.ts` | P19 |

Packages remain exactly `@modelcontextprotocol/server@2.0.0` and `@modelcontextprotocol/client@2.0.0`. Registry/peer preflight is required before installation. If registry, peer, Node 24, or TypeScript 6 checks fail, do not substitute a version; block only MCP and continue independent work.

### 4.8 Chrome Extension

| Action | File | Task |
|---|---|---|
| create | `extension/manifest.json` | P20 |
| create | `extension/background.ts` | P20 |
| create | `extension/content.ts` | P20 |
| create | `extension/popup/*` | P20 |
| create | `extension/options/*` | P20 |
| create | `scripts/package-extension.ts` | P20 |
| create | `tests/extension/*` | P20 |
| generated artifact | `artifacts/extension/alibi-extension.zip` | P20/P25 |

The extension has minimum permissions, reads only Polymarket market/profile URLs, calls the local/public Summary API, and cannot sign, pay, trade, cancel, bridge, or read credentials.

### 4.9 RAG and Database

| Action | File | Task |
|---|---|---|
| create | `ops/postgres/docker-compose.yml` | P04 |
| create | `db/migrations/001_platform_core.sql` | P04 |
| create | `db/migrations/001_platform_core.down.sql` | P04 |
| create | `src/rag/local-embedding.ts` | P07 |
| create | `src/rag/vector-store.ts` | P07 |
| create | `src/rag/keyword-fallback.ts` | P07 |
| create | `tests/rag/*` | P07 |
| create | `artifacts/rag/model-manifest.json` | P07/P23 |

The fixed image is `pgvector/pgvector:0.8.6-pg16`. Migration is additive, transactional, idempotent, local-only, and not executed in draft mode. The approved model is the q4 file list and fixed HF revision in the v0.7 Spec. Every downloaded model artifact is hashed before ingestion.

### 4.10 Polymarket WebSocket

| Action | File | Task |
|---|---|---|
| create | `src/adapters/polymarket/market-ws.ts` | P06 |
| create | `src/adapters/polymarket/ws-state.ts` | P06 |
| create | `src/adapters/polymarket/rest-backfill.ts` | P06 |
| create | `tests/websocket/*` | P06/P23 |

Public Market WebSocket only; heartbeat, reconnect, stale detection, event deduplication, order checks, REST fallback, and recorded replay are required. Private/user channels are prohibited.

### 4.11 Generated, protected, and migration paths

| Type | Path | Task/boundary |
|---|---|---|
| generated artifact | `artifacts/verification/*` | P23/P25/P26 |
| generated artifact | `output/playwright/*` | P21/P23/P25 |
| generated artifact | JSON/Markdown Agent reports | P13/P21/P23 |
| generated artifact | ABI/bytecode/deployment manifest | P16/P26 |
| create/modify | platform documentation set | P24/P27 |
| migrate | PostgreSQL `001_platform_core` | P04, after approval only |
| protected/do-not-touch | existing `SPEC-COMPLETE-DEMO.md` | P00/P01 |
| protected/do-not-touch | existing `PLAN-COMPLETE-DEMO.md` | P00/P01 |
| protected/do-not-touch | `alibi-pitch.html` and `alibi-pitch_1.html` | P00 |
| protected/do-not-touch | user files and existing modifications | all tasks |

## 5. Chain write whitelist

No Base Sepolia resources means no chain task runs; local tasks continue. Chain ID is exactly `84532`.

| Transaction | Maximum |
|---|---:|
| Test USDC approve | 1 |
| subscription subscribe | 1 |
| Evidence Anchor | 1 |
| ERC-8004 `register(agentURI)` | 1 |
| non-owner Reputation | 1 |
| Validation | 0 |
| `setAgentWallet` | 0 |
| mainnet transaction | 0 |

Global cap: 5 transactions per execution, 500,000 gas per transaction, 1,500,000 cumulative gas. Owner and payment address must be the same approved test EOA; client must be different. No private key is displayed or stored.

## 6. Status and publication boundary

`RUNNABLE_DEMO_COMPLETE` requires every local capability in Section 3. Missing Anthropic, Base Sepolia wallet, or public domain may produce explicit unavailable/recorded states but cannot excuse missing local modules. `LIVE_PARTIALLY_VERIFIED` requires at least one real external flow and one remaining live blocker. `FULLY_LIVE_VERIFIED` requires every V25 real external flow, public MCP reachability, and unpacked extension verification; Chrome Web Store publication is not required.

After approval, local MCP, local Web, unpacked extension, Chrome zip, local contract chain, and approved Base Sepolia test transactions may run when resource gates pass. Public deployment, MCP Registry publication, Chrome Web Store publication, mainnet, real funds, and ERC-8004 Validation remain held for final human acceptance.

## 7. Final verification and rollback

Run registry/peer preflight before MCP install; model file hash verification before ingestion; image digest capture before migration; schema/typecheck/lint/unit/contract/integration/fault/E2E/clean-room checks before any live gate. A failed check blocks only the dependent surface where safe and never triggers an unapproved substitution.

If atomic activation or implementation validation fails, stop, preserve diagnostics, restore the hash-verified pre-change documents/code and old fixture/report path, and rerun the current recorded Demo. Database rollback uses only the verified `001_platform_core.down.sql`; never use destructive Git commands or delete user files. Public release remains a final human-acceptance boundary.

