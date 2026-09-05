# Alibi Project Status

**Status:** `PARTIALLY_VERIFIED`
**Snapshot:** development / read-only
**Last documented verification:** 2026-09-05

## What is locally verified

- Recorded Summary and conservative attribution states;
- deterministic repricing, coverage, language-state, and risk rules;
- four platform Agent cards and nine logical Worker rows;
- local MCP construction and eight read-only tools;
- local x402 V2 HTTP 402 challenge shape;
- local ONNX RAG path and explicit keyword fallback;
- Chrome MV3 package checks;
- Solidity compile and local-chain smoke;
- typecheck, lint, Vitest, Playwright, recorded replay, and clean-room evidence recorded in `VERIFICATION.md`.

## What remains outside the claim

- Live Anthropic attribution and its cost/response;
- real Base Sepolia x402 verify/settle, receipt, and paid unlock;
- runtime PostgreSQL/pgvector verification;
- public MCP reachability and Chrome Web Store identity;
- reproducible real cluster/language evidence under live source conditions;
- completed wallet-discovery/ranking capability.

The repository must not be labeled `COMPLETE`, `RUNNABLE_DEMO_COMPLETE`, or `FULLY_LIVE_VERIFIED` based on this showcase documentation alone.

## Safety posture

The project is read-only. It does not custody funds, accept private keys in the UI, sign transactions, place or cancel orders, copy trades, or provide investment direction. `recorded`, `live`, `cached`, and `synthetic` remain separate data states; synthetic data is test-only.

See [VERIFICATION.md](../VERIFICATION.md), [SECURITY.md](../SECURITY.md), and [LIVE-READINESS.md](../LIVE-READINESS.md) for the detailed evidence and remaining blockers.
