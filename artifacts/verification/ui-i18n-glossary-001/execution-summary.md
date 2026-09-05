# UI-I18N-GLOSSARY-001 execution evidence

Date: 2026-09-05

## Gates

- A-GATE: PASS — existing BUY-only cluster behavior and D4 unavailable policy were independently rechecked; no analysis or contract file changed.
- B-GATE: PASS — `zh-CN`/`en`, SSR cookie locale, metadata/lang, centralized Glossary, TermHelp, Audit Markdown renderer, and UI-only integration passed targeted tests and browser checks.
- V-GATE: PASS WITH ENVIRONMENT LIMITATION — typecheck, lint, unit suite, Webpack build, recorded replay, API smoke, 15 Playwright tests, Secret scan, and protected-hash verification passed. Default Turbopack build remains a host sandbox `listen EPERM`; Webpack build passed.

## Test results

- `npm test`: 28 test files, 82 tests passed.
- TermHelp interaction: browser coverage passed; the standalone `.tsx` unit file is not discovered by the repository's fixed `tests/**/*.test.ts` Vitest include and was not made discoverable by changing forbidden config.
- Playwright serial run: 15/15 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `next build --webpack`: passed; 17/17 static pages generated.
- `npm run verify:offline`: passed; market, Wallet A, and Wallet B all returned `recorded`.

## Local API evidence

- `/health`: HTTP 200; service `alibi`; recorded fixture available; synthetic false; external calls false.
- Recorded preset `/summary`: HTTP 200; response `meta.data_status=recorded`.
- Unknown recorded input `/api/v1/summary` and `/summary`: HTTP 503, `upstream_unavailable`, `data_status=recorded`.
- Unknown recorded input `/api/v1/attribution` and `/attribution`: HTTP 402, `payment_required`, `data_status=recorded`; `PAYMENT-REQUIRED` decoded as x402 V2, exact, Base Sepolia `eip155:84532`, amount `10000` atomic units (0.01 USDC), resource-bound, with `payTo` present. No signature or payment was sent.
- `/api/summary` and `/api/attribution`: HTTP 404; no unapproved adapter was added.

## Screenshot hashes

| Artifact | SHA-256 |
|---|---|
| `cluster-language-desktop.png` | `26adcd99d089c9b97a52907f6ec7483bb5910fd5f2969170e3bb22cf3cfd910b` |
| `cluster-language-mobile.png` | `2d884661e6111218c76d709e13dc4969bd56ede9aa2036a33ffd3d2efb1cb5e8` |
| `cluster-language-200-percent.png` | `84d52be1ece5744f533d38484223c2b7418b81e65bc35594d11f14195e004c23` |
| `en-mobile-200.png` | `0837a907bb1bbfde9ac19b675c54a6f0a65ec4666ecc4a7b1968df38c2684bfe` |

The complete artifact paths are under `/Users/a0000/polymarket/artifacts/verification/ui-i18n-glossary-001/`.

## Safety

No product dependency, API, x402 configuration, fixture, database, migration, Spec, approved Plan, payment, signature, chain transaction, or live attribution call was changed or executed. Synthetic responses were used only in isolated negative E2E mocks and were blocked from user-facing panels.
