#!/usr/bin/env bash
# Unified Deno quality harness for warikan-sats.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

MODE="${1:---local}"
FAILED=0

if [ -t 1 ]; then
  GREEN='\033[0;32m'; RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'
else
  GREEN=''; RED=''; BOLD=''; NC=''
fi

step() { printf '\n%s=== %s ===%s\n' "$BOLD" "$1" "$NC"; }
pass() { printf '  %sPASS%s %s\n' "$GREEN" "$NC" "$1"; }
fail() { printf '  %sFAIL%s %s\n' "$RED" "$NC" "$1"; FAILED=1; }

run_check() {
  local name="$1"; shift
  if "$@" 2>&1; then
    pass "$name"
  else
    fail "$name"
  fi
}

run_local() {
  step "Local quality gate"
  run_check "repository lints" deno task lint:strict
  run_check "script tests" deno task test:scripts
  run_check "unit tests" deno task test:unit
  run_check "integration tests" deno task test:integration
  run_check "type check" deno task check
  run_check "ui smoke tests" deno task test:ui
  run_check "production build" deno task build
}

run_docker() {
  step "Regtest E2E gate"
  run_check "NWC regtest split-payment E2E" deno task test:e2e:regtest
}

case "$MODE" in
  --local)
    run_local
    ;;
  --docker)
    run_docker
    ;;
  --ci|full|--full)
    run_local
    if [ "$FAILED" = "0" ]; then
      run_docker
    fi
    ;;
  *)
    echo "Usage: $0 [--local|--docker|--ci|--full]" >&2
    exit 2
    ;;
esac

echo ""
if [ "$FAILED" = "0" ]; then
  printf '%s%s%s\n' "$GREEN" "All requested checks passed." "$NC"
  exit 0
fi

printf '%s%s%s\n' "$RED" "Some checks failed." "$NC"
exit 1
