# Alibi Complete Agent Platform Specification — v0.2 active (v0.7 revision)

Version: v0.2 revision `v0.7`  
Status: ACTIVE  
Change package: `ALIBI-PLATFORM-BUNDLE-005 v0.7`  
Source protocol: `V25.0`; V25 supersedes V22 and V24.  
Activation approval: `APPROVE: ALIBI-PLATFORM-BUNDLE-005 v0.7`

## 1. Revision binding

This document incorporates the complete normative content of `SPEC-ALIBI-PLATFORM.md v0.2 revision v0.6` and adds the exact amendments below. The v0.6 source hash is:

`67F951BDC6551E8BD9B544743556A9E23ED8478CC94BF91B06441A8013C91B00`

The v0.6 candidate remains preserved. This v0.7 revision was activated only after the exact approval command above. The prior approved Complete Demo Spec remains protected.

## 2. v0.6 → v0.7 normative diff

### 2.1 Locked local embedding model

The local embedding selection is no longer pending:

| Field | Locked value |
|---|---|
| model ID | `onnx-community/all-MiniLM-L6-v2-ONNX` |
| Hugging Face revision | `aff7a1dc4e8a1ea593e6ea21e95c22ef0a25966f` |
| task | `feature-extraction` |
| dimensions | `384` |
| pooling | `mean` |
| normalize | `true` |
| runtime | `@huggingface/transformers@3.7.0` |
| license | Apache-2.0, per model card |
| remote loading | prohibited; `allowRemoteModels=false` |
| API key | `EMBEDDING_API_KEY` is not used and is `NOT_REQUIRED` |
| external embedding API | prohibited |

Approved download file list, exactly at the locked revision:

| File | Expected size | Artifact SHA-256 before local download |
|---|---:|---|
| `onnx/model_q4.onnx` | 69.7 kB | `e4dcb918111189b7686147e309379832fce83d4ecbf17c395961749b5788c786` |
| `onnx/model_q4.onnx_data` | 54.4 MB | `56fb7a55115e900196115a74e399beb45c2f41ae00b99525d46fb52935c4ee2a` |
| `config.json` | 794 B | `PENDING_LOCAL_DOWNLOAD_HASH` |
| `tokenizer.json` | 534 kB | `PENDING_LOCAL_DOWNLOAD_HASH` |
| `tokenizer_config.json` | 1.46 kB | `PENDING_LOCAL_DOWNLOAD_HASH` |
| `special_tokens_map.json` | 695 B | `PENDING_LOCAL_DOWNLOAD_HASH` |
| `vocab.txt` | 232 kB | `PENDING_LOCAL_DOWNLOAD_HASH` |
| `README.md` | 1.97 kB | `PENDING_LOCAL_DOWNLOAD_HASH` |
| `.gitattributes` | 1.76 kB | `PENDING_LOCAL_DOWNLOAD_HASH` |

Estimated selected q4 download size is approximately `55 MB`; reserve at least `120 MB` free disk for temporary download, local cache, verification output, and atomic replacement. The model repository's complete set is larger because it contains multiple ONNX variants; only the q4 pair above is approved for this bundle.

The approval applies only to this exact model ID, revision, and file list. Because the files are not downloaded in draft mode, the actual local artifact SHA-256 for every downloaded file must be generated and recorded after download and before first ingestion. Any revision or file-list mismatch stops ingestion and enters Change Control. Approval does not authorize a model replacement. If loading or hashing fails, keyword retrieval is allowed only with `rag_degraded`; no vector result may be claimed.

### 2.2 RUNNABLE_DEMO_COMPLETE is a local platform gate

`RUNNABLE_DEMO_COMPLETE` is not satisfied by replaying only the old recorded Demo. It requires all local capabilities below to be implemented and verified, even when Anthropic, Base Sepolia, buyer wallets, or a public domain are absent:

- complete time-evidence chain;
- one Multi-Agent Orchestrator;
- Evidence Agent;
- Attribution Agent with explicit `provider_unavailable` when Anthropic is absent;
- Quality & Risk Agent;
- read-only Audit & Report Agent;
- Agent Console;
- every `/api/v1` contract;
- PostgreSQL 16 and pgvector local path;
- the fixed local embedding model and local vector RAG;
- keyword fallback with `rag_degraded`;
- 90-day wallet-universe pipeline, ranking contract, and recorded replay;
- Polymarket WebSocket recorded replay plus reconnect/stale/REST-fallback tests;
- Solidity compilation and local-chain tests;
- local subscription contract flow;
- x402 402 and synthetic/recorded contract flows;
- ERC-8004 registration schema, local Identity/Reputation contract tests, and `validation_not_enabled`;
- local stdio or Streamable HTTP MCP server and eight tool contract tests;
- MV3 unpacked extension, zip, and Chrome-to-local-Alibi-API E2E;
- Web UI, clean-room install/build/test/start/demo, and complete documentation.

External credentials may block only real external verification. They may not be used to exclude an unimplemented local module from the local DoD. Synthetic data never enters the user Demo. Recorded data must visibly display `recorded`.

### 2.3 Wallet and ERC-8004 relation

- ERC-8004 owner and `ALIBI_PAYMENT_ADDRESS` must be the same approved Base Sepolia test EOA.
- ERC-8004 client must be a different approved Base Sepolia test address.
- `agentWallet` initially equals owner and is verified by chain read-back.
- This bundle sends no `setAgentWallet` transaction; `setAgentWallet` maximum is `0`.
- If payment address differs from owner, stop and enter Change Control.
- Identity Registry is `0x8004A818BFB912233c491871b3d84c89A494BD9e`.
- Reputation Registry is `0x8004B663056A597Dffe9eCcC1965A193B7388713`.
- Validation is `not_enabled`; no Validation transaction and no custom Registry.

### 2.4 Chain write clarification

No chain resource means no chain task is executed, but independent local tasks continue. The whitelist is unchanged and explicit:

| Transaction | Maximum |
|---|---:|
| Test USDC approve | 1 |
| Subscription subscribe | 1 |
| Evidence Anchor | 1 |
| ERC-8004 Identity `register(agentURI)` | 1 |
| Non-owner Reputation | 1 |
| Validation | 0 |
| `setAgentWallet` | 0 |
| Mainnet transaction | 0 |

The global maximum remains 5 transactions per user-triggered execution, 500,000 gas per transaction, and 1,500,000 cumulative gas.

### 2.5 MCP and external publication

The exact MCP dependencies remain `@modelcontextprotocol/server@2.0.0` and `@modelcontextprotocol/client@2.0.0`. Before installation, registry status, version, license, engines, and peer dependencies must be checked. The preflight returned HTTP 200, exact version `2.0.0`, MIT, Node `>=20`, and no required peer dependencies. After installation, TypeScript 6 typecheck and Node 24 runtime smoke tests are mandatory; failure blocks only MCP implementation and does not authorize a version substitution.

After approval, local MCP, local Web, unpacked extension, Chrome zip, local contract chain, and approved Base Sepolia test transactions may be implemented when resource gates pass. Still prohibited until final human acceptance: public deployment, MCP Registry/directory publication, Chrome Web Store publication, mainnet, real funds, and ERC-8004 Validation.

### 2.6 Final state boundary

- `RUNNABLE_DEMO_COMPLETE`: all local platform modules above pass; external capabilities may be recorded or explicitly unavailable; no public release or Base Sepolia transaction is required.
- `LIVE_PARTIALLY_VERIFIED`: at least one real external flow passes and at least one explicitly listed live gate remains blocked.
- `FULLY_LIVE_VERIFIED`: all V25 real external flows pass, public MCP reachability passes, and the unpacked extension verifies. Chrome Web Store publication is not required.

## 3. v0.7 acceptance locks

| Area | Required condition |
|---|---|
| Model | exact ID/revision/files above; local-only; every downloaded artifact hashed before ingestion |
| Local DoD | all local modules listed in Section 2.2 pass independently of missing credentials |
| ERC-8004 | owner equals payment address; client differs; agentWallet starts as owner; no setAgentWallet |
| Chain writes | exact whitelist, 5/500,000/1,500,000 caps, chain 84532 only |
| MCP | registry preflight before install; no version substitution; post-install Node 24/TS 6 typecheck |
| Publication | local outputs allowed after approval; public outputs held for final human acceptance |

All other v0.6 sections remain normative, including deterministic analysis, evidence admission, DEES, coverage gates, API, UI, subscription/x402, data governance, security, reporting, and rollback.

