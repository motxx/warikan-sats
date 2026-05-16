# Add NWC regtest Warikan E2E

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

maintenance

## Dependencies

Depends on:
- 0003-migrate-from-yarn-to-deno-client-distribution
- 0009-add-deno-test-foundation
- 0008-implement-nwc-wallet-connector
- 0005-add-sequential-split-invoice-ui
- 0006-add-nwc-regtest-wallet-environment

Blocks:
- 0011-connect-nwc-on-mainnet

## Summary

Write an E2E test that completes a multi-person split payment from the client
against the local NWC regtest wallet environment.

## Rationale

The critical user journey is not just invoice rendering; it is a full split
payment where multiple participants receive their own invoice, pay in sequence,
and the UI reaches an all-paid state. This needs a repeatable E2E harness that
uses an NWC-compatible regtest wallet rather than mocks and proves the app does
not require an operator-run backend.

## Plan

- Start the NWC regtest wallet environment and app under the E2E harness.
- Configure the client with the test NWC wallet connection string.
- Create a split payment for multiple participants.
- Pay each displayed invoice from separate regtest payer wallets or helpers.
- Assert that invoices advance only after settlement.
- Assert that no operator backend is required during the flow.
- Assert the final all-paid state and record failures with useful artifacts.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `deno.json`
- `docs/nwc-regtest-environment.md`
- `docs/review-harness.md`
- `scripts/nwc-regtest.ts`
- `scripts/test-all.sh`
- `tests/README.md`
- `tests/e2e/nwc_regtest_warikan.test.ts`
- `tests/helpers/regtest_nwc_transport.ts`

Verified with:

- `deno task lint:strict`
- `deno task test:scripts`
- `deno task test:integration`
- `deno task test:e2e:regtest`
- `deno task test:all:docker`

Harness update:

- Added `tests/e2e/nwc_regtest_warikan.test.ts` and wired
  `deno task test:e2e:regtest` plus `deno task test:all:docker` to the
  regtest split-payment completion flow.

Review residuals:

- Browser-level automation can be added later if UI DOM interaction needs
  coverage beyond the client service contracts.

Follow-up:

- `0011-connect-nwc-on-mainnet` can now use this regtest harness as the
  no-backend regression gate.
