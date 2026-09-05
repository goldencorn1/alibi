#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

failures=0
run_check() {
  label="$1"
  shift
  printf 'BEGIN:%s\n' "$label"
  if "$@"; then
    printf 'PASS:%s\n' "$label"
  else
    printf 'FAIL:%s\n' "$label"
    failures=1
  fi
}

run_check typecheck npm run typecheck
run_check lint npm run lint
run_check unit-and-integration npm test
run_check build npm run build
run_check recorded-replay npm run verify:offline
run_check e2e npm run test:e2e
run_check mcp npm run mcp:verify
run_check extension npm run package-extension
run_check solidity-compile npm run contracts:compile
run_check model bash scripts/macos/verify-model.sh

if [[ "$failures" -ne 0 ]]; then
  printf 'VERIFY=PARTIAL_OR_FAILED\n'
  exit 1
fi
printf 'VERIFY=PASSED\n'
