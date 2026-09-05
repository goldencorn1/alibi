# Security and scope

Alibi is read-only. It does not expose order, cancel, relayer, bridge, signing or mainnet-funds endpoints. It does not connect an end-user wallet, custody funds, infer wallet identity, or provide buy/sell direction.

## Secrets

- `ANTHROPIC_API_KEY` is read only in the server-side provider adapter and is never sent to the browser.
- `BUYER_AGENT_PRIVATE_KEY` is read only by the local buyer scripts. It is not imported by Next route code, fixtures, logs or browser bundles.
- RPC URLs are treated as sensitive configuration; query credentials must be redacted from artifacts.
- The UI accepts only a one-time payment payload, never a private key. Current unconfigured mode cannot settle a payment.
- Cost ledger entries contain provider, purpose, request count, estimated cost and cumulative cost, not prompts, evidence text, secrets or signatures.

## Payment safety

Before signing, the buyer policy requires x402 `exact`, Base Sepolia `eip155:84532`, the approved testnet USDC contract, exactly `10000` atomic units, the configured `payTo` and `/attribution`. An unset or zero `payTo` is rejected. Mainnet or mismatched requirements are rejected without signing.

## Analytical safety

Price windows, time relations, coverage and estimated returns are deterministic. Anthropic is limited to supplied evidence IDs and cannot create source URLs. A missing source yields `[Unattributed]`; coverage below 40% yields `insufficient_evidence`. Confidence is not causal probability, and temporal sequence is not proof of causality, insider trading or information advantage.

## Artifact hygiene

Recorded fixtures are generated only from successful public reads and are status-converted to `recorded`; profile names, bios and avatars are not collected. Test and verification artifacts must be scanned for private-key patterns, API key names/values, RPC query tokens, payment signatures and disallowed trading endpoints before delivery.

## Platform v0.7 controls

- Local RAG is pinned to the approved q4 model/revision, with `allowRemoteModels=false`; model artifacts are hashed before ingestion. `EMBEDDING_API_KEY` is not read.
- The Orchestrator is single-process. Evidence, quality/risk, ranking, policy and report assembly are deterministic. Attribution is the only LLM boundary and its output is allowlisted against supplied evidence IDs.
- Agent Console and MCP expose status, digests, counts and relative artifacts only. They do not expose raw prompts/responses, request headers, credentials, private keys or payment signatures.
- ERC-8004 has one root identity only. Identity registration is not capability validation; validation is `not_enabled`. The client wallet must differ from owner/payment.
- Chain writes are restricted to Base Sepolia chain ID `84532`, five approved transaction classes with a global maximum of five transactions, 500,000 gas per transaction and 1,500,000 cumulative gas. Mainnet, real funds, Validation and `setAgentWallet` are disabled.
- The MV3 extension is read-only and cannot sign, pay, trade, cancel, bridge, or read credentials. Public MCP and Chrome Web Store publication remain final human-acceptance boundaries.
