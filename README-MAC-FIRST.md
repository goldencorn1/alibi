# Alibi macOS Migration — quickest path

## Five commands

```bash
cd ~/Projects/alibi
cp .env.macos.example .env.local
npm ci
npm run verify:offline
npm run dev
```

Open <http://localhost:3000/>. The default is `recorded`; no Anthropic key, wallet, x402 payment, database, or public endpoint is needed for the local Demo.

Expected time: about 5–15 minutes after Node/npm are installed. Keep at least 1.5 GB free for the unpacked source, the bundled model/fixtures, npm dependencies, and Next build caches. The archive itself is verified separately by the package report.

Current status: `WINDOWS_PACKAGE_VERIFIED`; `MAC_EXECUTION_PENDING`; `LIVE_EXTERNAL_VERIFICATION_PENDING`. The source snapshot remains `PARTIALLY VERIFIED`, not `COMPLETE`.

For the full setup, environment matrix, model hash check, PostgreSQL steps, Chrome extension, MCP, Solidity, troubleshooting, and rollback, read `MAC-SETUP.md`, `MAC-ENV.md`, and `MAC-HANDOFF.md`.
