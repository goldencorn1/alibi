#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

printf 'Starting recorded Demo at http://localhost:3000/\n'
printf 'Stop with Ctrl-C. No payment, chain transaction, ERC-8004 registration, or public publish is performed.\n'
npm run dev
