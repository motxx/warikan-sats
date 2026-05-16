# Use real Lightning regtest containers

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

bug

## Dependencies

Depends on:
- 0007-add-nwc-regtest-warikan-e2e

Blocks:
- None

## Summary

Replace the misleading fake-only regtest E2E path with a harness that starts
real Bitcoin and Lightning regtest containers and proves invoice payment
settlement across Lightning nodes.

## Rationale

The current `regtest` naming implies a real Bitcoin/Lightning regtest network,
but the implemented path is a deterministic file-backed fake NWC wallet. That
is useful for protocol-shaped client tests, but it does not prove that invoices
can be created and paid on a real Lightning regtest network.

## Plan

- Add Docker Compose services for Bitcoin Core regtest and two Core Lightning
  nodes.
- Add start, stop, status, reset, health, and smoke commands for the real
  Lightning regtest stack.
- Wire `deno task test:e2e:regtest` and `deno task test:all:docker` to the real
  Lightning smoke test.
- Keep fake NWC tests explicitly documented as fake/file-backed coverage.
- Update review-harness and development docs so future regtest claims are
  routed to the real container harness.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `docker-compose.lightning-regtest.yml`
- `scripts/lightning-regtest.ts`
- `deno.json`
- `package.json`
- `.github/workflows/gh-pages.yml`
- `scripts/test-all.sh`
- `docs/lightning-regtest-containers.md`
- `docs/development.md`
- `docs/review-harness.md`
- `docs/nwc-regtest-environment.md`
- `tests/README.md`

Verified with:

- `deno task lint:strict`
- `deno task test:scripts`
- `deno task test:e2e:nwc-fake`
- `deno task test:e2e:regtest`
- `deno task test:all:docker`
- `deno task test:all`

Harness update:

- `deno task test:e2e:regtest` now starts real Bitcoin Core and Core
  Lightning regtest containers, mines blocks, funds a payer node, opens a
  channel, creates a Lightning invoice, pays it, and verifies paid settlement.

Review residuals:

- None

Follow-up:

- None
