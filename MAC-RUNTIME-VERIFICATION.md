# Alibi macOS Runtime Verification

Protocol: `Alibi macOS Runtime Verification Protocol v1.0`

Final status: `MAC_PARTIALLY_VERIFIED`

Live boundary: `LIVE_EXTERNAL_VERIFICATION_PENDING`

The v0.7 snapshot was verified in `recorded` mode with `MAX_EXTERNAL_API_COST_USD=0`. No Anthropic, NewsAPI.ai, GDELT, x402 settlement, Base Sepolia transaction, ERC-8004 registration, public deployment, MCP publication, or Chrome Store publication was performed.

## Environment

| Item | Result |
|---|---|
| macOS | 14.6.2 |
| Architecture | `arm64` |
| Shell | `/bin/zsh` |
| Git | 2.50.1 |
| Node used | 24.19.0 (engines-compatible) |
| npm used | 11.17.0 |
| Protocol target | Node 24.16.0 / npm 11.15.0 — `BLOCKED` for exact-match verification |
| Docker | missing — `MAC_DB_PENDING` |
| Free disk | approximately 416 GiB |

The default shell did not have system `node`/`npm` on PATH. The existing local runtime was used without installing a global version manager or modifying system Node. The exact target toolchain remains an operator follow-up.

## Environment matrix

Only status values are recorded; no environment values or secrets are included.

| Variable | Status | Required | Scope | Used this round |
|---|---|---|---|---|
| `APP_BASE_URL` | present | optional | server/buyer/test | yes, localhost |
| `ALIBI_DATA_MODE` | present | recorded required | server | yes, forced `recorded` |
| `MAX_EXTERNAL_API_COST_USD` | present | optional | server | yes, forced zero |
| `ANTHROPIC_API_KEY` | empty | live only | server | no |
| `ANTHROPIC_MODEL` | present | live optional | server | no |
| `X402_FACILITATOR_URL` | present | live payment | server | no |
| `X402_NETWORK` | present | live payment | server/buyer | no |
| `ALIBI_PAYMENT_ADDRESS` | empty | live payment | server/buyer | no |
| `BASE_SEPOLIA_RPC_URL` | empty | live chain | server/buyer | no |
| `BUYER_AGENT_PRIVATE_KEY` | missing | live buyer | buyer-agent only | no |
| `DATABASE_URL` | empty | optional | server | no |
| `ALIBI_MODEL_PATH` | present | recorded optional | server | yes |
| `LOCAL_CHAIN_RPC_URL` | present | optional | local Solidity test | yes, localhost |
| `ALIBI_SUBSCRIPTION_CONTRACT_ADDRESS` | empty | optional | server | no |
| `ERC8004_CLIENT_ADDRESS` | empty | optional | server | no |
| `ERC8004_AGENT_ID` | empty | optional | server | no |
| `CI` | missing | optional | test | no |

## Verification results

| Stage/check | Status | Evidence |
|---|---|---|
| Migration SHA-256 manifest | `PASS` | 195/195 checksum entries matched; 194 Manifest payload files |
| Package exclusions | `PASS` | Archive had no `.env.local`, `node_modules`, `.next`, or Windows native binaries |
| macOS preflight | `PASS` | Supported `arm64`; required project files present; LF shell scripts |
| Exact target Node/npm versions | `BLOCKED` | Compatible Node/npm used, but not exact protocol target |
| Lockfile integrity | `PASS` | `package-lock.json` hash unchanged |
| `npm ci` | `PASS` | 563 packages installed; no lockfile change |
| ONNX model verification | `PASS` | Fixed revision/files/hashes; 384 dimensions; mean pooling; normalize; remote models disabled |
| Typecheck | `PASS` | `npm run typecheck` |
| Lint | `PASS` | `npm run lint` |
| Unit/integration tests | `PASS` | 19 files, 41 tests |
| Build | `PASS` | Next.js production build completed |
| Recorded replay | `PASS` | market, Wallet A, Wallet B |
| Playwright E2E | `PASS` | 2 tests passed on arm64 Chromium 151.0.7922.34 |
| MCP contract verification | `PASS` | 8 local read-only tools; public endpoint false |
| Chrome extension packaging | `PASS` | local unpacked output; public release false |
| Solidity compile | `PASS` | solc 0.8.24 |
| Local Hardhat smoke | `PASS` | chain 31337; anchor/subscription readback passed; external transactions 0 |
| ERC-8004 preflight | `PASS` | unavailable without owner/client configuration; preflight only; no secrets read |
| PostgreSQL/pgvector runtime | `BLOCKED` | Docker unavailable; `MAC_DB_PENDING`; no migration executed |
| Secret scan | `PASS` | Verification artifacts clean; no secrets echoed or loaded into browser |
| Service cleanup | `PASS` | Next/Hardhat stopped; ports 3000/8545 free; no matching service PIDs |

## Local API and UI

- `/health`, `/api/v1/health`, `/api/v1/summary`, ranking replay, subscription status and ERC-8004 status returned expected local responses.
- Unauthenticated Attribution/Detail returned HTTP 402 with the expected Base Sepolia exact-payment boundary; no payment was attempted.
- The UI verified home, recorded label, loading, Wallet A `insufficient`, Market `[Unattributed]`, payment-required, 9-worker Agent Console, report assembly, and JSON/Markdown downloads.
- Browser console contained only the expected 402 response message; there were no page errors or failed requests.

## Findings retained without source changes

1. Next.js automatically rewrote `next-env.d.ts` during dev/build to reference `.next/dev/types`; the package version was restored after verification. Final Manifest checks passed.
2. In recorded mode, the existing unpaid Attribution 402 envelope reports `data_status=live`. The existing ERC-8004 registration document also contains live service labels while the outer status is recorded. This is a compatibility/data-status consistency finding, not changed during a verification-only run.
3. `npm ci` reported four high-severity audit findings and pending native install scripts. `npm audit fix`, dependency changes, and script approval were not authorized and were not performed.

## Evidence artifacts

- `artifacts/verification/mac-runtime/final.json`
- `artifacts/verification/mac-runtime/audit-export.json`
- `artifacts/verification/mac-runtime/audit-export.md`
- `artifacts/verification/mac-runtime/screenshots/01-home.png`
- `artifacts/verification/mac-runtime/screenshots/02-loading.png`
- `artifacts/verification/mac-runtime/screenshots/03-summary-insufficient.png`
- `artifacts/verification/mac-runtime/screenshots/04-summary-unattributed.png`
- `artifacts/verification/mac-runtime/screenshots/05-payment-required.png`
- `artifacts/verification/mac-runtime/screenshots/06-agent-console-expanded.png`

## Startup command

With a compatible Node 24.x/npm 11.x already on PATH:

```bash
cd "$ALIBI_PROJECT_ROOT"
ALIBI_DATA_MODE=recorded MAX_EXTERNAL_API_COST_USD=0 npm run dev
```
