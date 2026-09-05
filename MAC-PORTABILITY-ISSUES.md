# macOS portability issues

## Resolved in staging

- Added POSIX shell entry points that run through `bash` and use repository-relative paths.
- Added an explicit model verification script using Node's cross-platform path and crypto APIs.
- Added Apple Silicon/Intel, Docker, Chrome unpacked-extension and local database instructions.
- Excluded Windows `node_modules`, `.next`, test caches and generated verification trees.

## Recorded, not changed

- `HANDOFF.md` contains Windows path examples for historical handoff context.
- Hardhat generated build-info in the source snapshot contains Windows source paths; generated build-info is excluded from the Mac package.
- `tests/unit/observability.test.ts` contains Windows-path and private-key-shaped strings as intentional redaction assertions; it is not a runtime path or credential.
- The source directory has no Git metadata, so history cannot be transferred as a Git bundle.

## Pending Mac verification

- Native Node/npm and `@huggingface/transformers` execution on both `arm64` and `x86_64`.
- Docker image pull and PostgreSQL/pgvector runtime on the selected Mac architecture.
- Playwright Chromium installation and visual/E2E replay on Mac.
- Any live external API, x402, Base Sepolia, ERC-8004 or public endpoint verification.
