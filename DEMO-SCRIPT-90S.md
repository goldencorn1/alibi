# 90-second demo script

This script uses the current `recorded` preset so it remains repeatable without network access. It must say `recorded` on screen and must not present synthetic values as real or promise attribution.

| Time | Action | Narration / expected state |
|---|---|---|
| 0–10s | Open `http://127.0.0.1:3000/` | “Alibi is read-only. It does not provide investment advice, buy/sell direction or accusations.” |
| 10–20s | Click `Market timeline` | The input is a selected Polymarket market; mode stays `recorded replay`. |
| 20–35s | Click `Analyze` | Free Summary returns the recorded status, market count and repricing count. |
| 35–43s | Point to the `[Unattributed]` card | Explain that missing verifiable evidence is a valid result; time order is not causality. |
| 43–52s | Point to `Agent Console` | Show the four high-level Agents (evidence, attribution, quality-risk, audit-report), the nine logical Workers, `recorded` data status, insufficient/blocked flags, event count and the limitation that the console only observes. |
| 52–60s | Click `Wallet A`, then `Analyze` | Coverage gate shows insufficient data and withholds the lead-rate/capability conclusion; the Console follows the new run. |
| 60–68s | Click `Request Detail` | HTTP 402 / Payment required shows 0.01 USDC, Base Sepolia and exact scheme; the Console changes payment to `blocked` without showing the full challenge. |
| 68–78s | Click `Export JSON` or `Export Markdown` | Download the current audit report; exports read the report and do not trigger a new analysis. |
| 78–90s | Run `npm run verify:offline` | Show that all three recorded presets replay without external calls and retain recorded labels and limitations. |

The current run has recorded public-data observations, but no live Anthropic attribution and no real Base Sepolia receipt. Those remain final human-acceptance items.

Optional local platform checks after the main run: `npm run mcp:verify`, `npm run package-extension`, `npx hardhat compile`, `npm run contracts:smoke` with a local Hardhat node, and the local ONNX smoke. These are local verification outputs; none imply a live Anthropic call, a payment settlement, ERC-8004 capability validation, or public release.
