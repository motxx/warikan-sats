#!/usr/bin/env bash
# Unified quality harness for warikan-sats.

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

package_script() {
  local script="$1"
  if command -v yarn >/dev/null 2>&1; then
    yarn run "$script"
  elif command -v corepack >/dev/null 2>&1; then
    corepack yarn run "$script"
  else
    npm run "$script"
  fi
}

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
  run_check "repository lints" package_script lint:strict
  run_check "script tests" package_script test:scripts
  run_check "type check" package_script check
  run_check "unit tests" package_script test.unit
  run_check "production build" package_script build
}

run_docker() {
  step "Docker quality gate"
  echo "Docker-backed browser E2E is not implemented yet; see docs/issues/pending/0001-add-browser-e2e-harness.md"
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
