#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  printf 'Node.js and npm are required; see MAC-SETUP.md\n' >&2
  exit 1
fi

printf 'Installing locked dependencies with npm ci...\n'
npm ci
printf 'BOOTSTRAP=PASSED\n'
