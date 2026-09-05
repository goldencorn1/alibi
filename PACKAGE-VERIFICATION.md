# Package verification

Package target: `Alibi-Mac-Migration-v0.7-20260904-<timestamp>.zip`

## Windows-side staging checks

- Source directory exists and was not reset or overwritten.
- Source is not a Git repository; Git bundle: `NOT_AVAILABLE`.
- `npm ci`: passed in staging; 558 locked packages installed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed — 19 files, 41 tests.
- `npm run build`: passed — Next.js routes compiled.
- `npm run verify:offline`: passed — market, Wallet A and Wallet B recorded presets.
- `npm run test:e2e`: passed — 2 browser tests.
- `npm run mcp:verify`: passed — 8 local read-only tools, public endpoint false.
- `npm run package-extension`: passed in Windows staging; the staged source additionally uses macOS `ditto` when `process.platform === "darwin"`.
- `npm run contracts:compile`: passed — Solidity 0.8.24.
- `npm run contracts:smoke`: passed on local Hardhat chain `31337`; `external_chain_transactions=0`.
- Local embedding smoke: passed — `local-onnx`, `recorded`, 384 dimensions.
- Model file lengths and SHA-256 values: passed against `artifacts/rag/model-manifest.json`.
- macOS shell syntax: passed with Bash parser; all five scripts are LF.

## Security/package checks

- No `.env`, `.env.local`, private-key file, certificate, browser profile, Docker volume or Windows native dependency is included.
- No `node_modules`, `.next`, `output`, `cache`, `test-results`, coverage or logs are included in the final package.
- Intentional secret-shaped strings remain only in redaction tests; they are synthetic test literals, not credentials.
- No external paid call, Base Sepolia transaction, x402 settlement, ERC-8004 registration or public release was performed.

## Status

`WINDOWS_PACKAGE_VERIFIED`

`MAC_EXECUTION_PENDING`

`LIVE_EXTERNAL_VERIFICATION_PENDING`

The package being valid does not prove that the Mac runtime or live external resources are verified. Follow `MAC-SETUP.md` on the target Mac.
