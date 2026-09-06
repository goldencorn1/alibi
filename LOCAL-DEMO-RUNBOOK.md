# Alibi Local Recorded Demo Runbook

Status: `LOCAL_DEMO_READY=YES` · `FULLY_LIVE_VERIFIED=NO`

This runbook is for the local, read-only recorded demo. It does not install dependencies, call paid services, sign payment payloads, submit trades, or access a mainnet wallet.

## Start and stop

```bash
cd /Users/a0000/polymarket
export PATH="/Users/a0000/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Applications/ChatGPT.app/Contents/Resources/cua_node/bin:$PATH"
./node_modules/.bin/next dev --webpack --hostname 127.0.0.1
```

Open <http://127.0.0.1:3000>. The server is healthy when `GET /health` returns HTTP 200 and reports `fixture_status.recorded=true`, `fixture_status.synthetic=false`, and `external_calls=false`.

Stop with `Control+C`. Do not use `npm run setup-and-demo`: it runs `npm ci`.

## 90-second A2A demo

1. Open the home page and point out `recorded` and the flow: Caller Agent → Alibi API / MCP → Wallet Discovery → Evidence / Repricing → Attribution → Quality & Risk → machine-readable result.
2. In A2A Console, leave the recorded wallet list and policy fields unchanged. The request uses 20 public addresses from the recorded leaderboard snapshot.
3. Click `Run Agent Request`. Show the actual request timestamp, HTTP JSON headers, screen result, and audit trace.
4. Explain that `data_status=recorded`, `metric_status=unavailable`, and `eligible=null` are deliberate: this snapshot has no trusted wallet-level lead-rate or coverage payload, so the browser does not calculate or fill values.
5. Switch to MCP view and show only the eight tools in the local catalog. `not_verified` means not ready for a live claim; unregistered capabilities are not presented as ready.
6. Copy the machine-readable response JSON if needed. The payment line says `settlement=not_performed`.
7. Scroll to the recorded leaderboard, then open one of the two captured detail presets to show the existing Summary, evidence timeline, cluster/language states and explicit unavailable/insufficient limits.

## 3–5 minute complete demo

1. Start the server and confirm `/health`.
2. Show the A2A Console request and run it once. Keep the response marked `recorded`.
3. Show the 4 platform Agents and 9 logical Workers in Agent Console after running the legacy Summary query. Each visible technical label has a keyboard-accessible `?` explanation.
4. Show the three GUI / CLI / APP panels. The CLI panel mirrors the recorded API payload; it is not a synthetic CLI result.
5. Use Wallet Discovery to show 20 recorded public leaderboard rows. Source PnL and source volume remain separate from unavailable Alibi-derived wallet metrics.
6. Open Wallet A or Wallet B from the recorded detail presets. The legacy `/summary`, `/attribution`, and `/audit` calls remain the demo path.
7. Show the Summary result, time evidence chain, cluster dimensions, BUY-only conservative interpretation, language-window `indeterminate`/empty state, and D4 unavailable state when the trusted payload lacks value or coverage.
8. Click `Request Detail` only to show the existing x402 V2 challenge boundary. Do not paste a private key or payment signature. In the recorded fixtures, an unattributed result is free; no settlement is performed.
9. Change language between 中文 and EN. The current page state is retained, the locale cookie is the only persisted preference, and original evidence titles, URLs, quotes, hashes and API field names are unchanged.
10. Use keyboard focus on a `?`, press Enter/Space to pin, press Escape or click outside to close, and repeat at mobile and 200% zoom.

## Read-only API examples

```bash
curl -fsS http://127.0.0.1:3000/health
curl -fsS http://127.0.0.1:3000/api/v1/a2a/capabilities
curl -fsS http://127.0.0.1:3000/api/v1/leaderboard
curl -fsS http://127.0.0.1:3000/api/v1/wallet/0xfe787d2da716d60e8acff57fb87eb13cd4d10319/metrics
curl -fsS http://127.0.0.1:3000/api/v1/wallet/0xfe787d2da716d60e8acff57fb87eb13cd4d10319/lead-rate
curl -fsS -X POST http://127.0.0.1:3000/api/v1/screen \
  -H 'content-type: application/json' \
  --data '{"wallets":["0xfe787d2da716d60e8acff57fb87eb13cd4d10319","0x1111111111111111111111111111111111111111"],"window":"30d","max_lead_rate":0.5,"min_coverage":0.4,"my_delay":0,"my_size_usd":1000,"min_retained_return":0.1,"mode":"recorded"}'
curl -fsS -X POST http://127.0.0.1:3000/summary \
  -H 'content-type: application/json' \
  --data '{"input":"https://polymarket.com/event/will-there-be-no-change-in-fed-interest-rates-after-the-september-2026-meeting-615","mode":"recorded"}'
curl -fsS -X POST http://127.0.0.1:3000/attribution \
  -H 'content-type: application/json' \
  --data '{"input":"https://polymarket.com/event/will-there-be-no-change-in-fed-interest-rates-after-the-september-2026-meeting-615","mode":"recorded"}'
```

Expected states: `/health`, capabilities, leaderboard, wallet metrics, lead-rate and `/screen` return HTTP 200 with recorded provenance; Summary returns HTTP 200 with recorded data; recorded unattributed Detail is free and returns HTTP 200. A billable Detail path may return HTTP 402 with the existing x402 V2 challenge, but this runbook never settles it.

## A2A CLI client

With the server running:

```bash
cd /Users/a0000/polymarket
export PATH="/Users/a0000/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Applications/ChatGPT.app/Contents/Resources/cua_node/bin:$PATH"
./node_modules/.bin/tsx scripts/demo-a2a-client.ts
```

The client calls capabilities, leaderboard, one wallet's metrics and lead-rate, and a 20-address recorded `/screen`. If a tested endpoint returns `PAYMENT-REQUIRED`, it decodes only public challenge fields and reports `settlement=not_performed`; it never signs or pays.

## Failure fallback

If a live or upstream call is unavailable, switch the UI to the recorded mode and use the captured leaderboard and wallet presets. Say that the result is a recorded snapshot and show the captured-at/source fields. Do not replace a missing value with `0`, `live`, a synthetic ticker, an invented CLI result, or a made-up coverage/lead-rate metric.

## Safe product language

You may say:

- “This is a local recorded replay with explicit provenance and limitations.”
- “The API exposes a machine-readable recorded result; unavailable metrics remain unavailable.”
- “The timestamp order is evidence context, not proof of causality, identity, coordination, language ability, insider information, or trading success.”
- “The payment challenge is observable, but no payment or settlement was performed.”

Do not say:

- that a wallet owner has a particular identity, language ability, insider access, intent, or coordinated behavior;
- that a cluster is proof of manipulation or copying;
- that a lead rate is an investment probability or buy/sell signal;
- that recorded, unavailable, synthetic, not-verified, or not-registered capability states are live;
- that ERC-8004 is registered, x402 is settled, or the product is production-ready.

## Cleanup

Press `Control+C`, then verify the local process has stopped before closing the terminal. No payment, signing, chain transaction, migration, external paid call, public release, push, or merge is part of this demo.
