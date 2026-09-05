#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

failures=0
check_command() {
  if command -v "$1" >/dev/null 2>&1; then
    printf '%s=available\n' "$1"
  else
    printf '%s=missing\n' "$1"
    failures=1
  fi
}

check_command node
check_command npm
check_command bash

if command -v node >/dev/null 2>&1; then
  node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exitCode = major < 20 || (major === 20 && minor < 9) || major >= 27 ? 1 : 0' \
    && printf 'node_engine=compatible\n' \
    || { printf 'node_engine=incompatible (required >=20.9 <27; target 24.16.0)\n'; failures=1; }
  printf 'node_version=%s\n' "$(node --version)"
fi
if command -v npm >/dev/null 2>&1; then
  printf 'npm_version=%s (target 11.15.0)\n' "$(npm --version)"
fi

case "$(uname -m)" in
  arm64|x86_64) printf 'mac_arch=%s supported\n' "$(uname -m)" ;;
  *) printf 'mac_arch=%s unsupported\n' "$(uname -m)"; failures=1 ;;
esac

for required in package.json package-lock.json app/page.tsx src/agents/orchestrator.ts fixtures/recorded/manifest.json models/onnx-community/all-MiniLM-L6-v2-ONNX/onnx/model_q4.onnx db/migrations/001_platform_core.sql; do
  if [[ -f "$required" ]]; then printf 'file:%s=present\n' "$required"; else printf 'file:%s=missing\n' "$required"; failures=1; fi
done

if [[ -f .env.local ]]; then
  printf 'env_file=.env.local present (values not inspected)\n'
else
  printf 'env_file=.env.local missing; run: cp .env.macos.example .env.local\n'
fi

if [[ -d node_modules ]]; then printf 'dependencies=node_modules present\n'; else printf 'dependencies=node_modules missing; run: npm ci\n'; fi
if [[ -d .next ]]; then printf 'build_cache=.next present\n'; else printf 'build_cache=.next absent\n'; fi

if [[ "$failures" -ne 0 ]]; then
  printf 'PREFLIGHT=FAILED\n'
  exit 1
fi
printf 'PREFLIGHT=PASSED\n'
