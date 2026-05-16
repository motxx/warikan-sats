# Complete NWC connection flow

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

feature

## Dependencies

Depends on:
- None

Blocks:
- None

## Summary

Finish the user-facing Nostr Wallet Connect flow so the deployed static app can
connect to a user-provided NWC wallet, create split-payment invoices through
that wallet, and verify settlement through NWC.

## Rationale

The NWC connector and mainnet relay transport exist, but the payment screen
still uses local mock invoice generation and a manual paid marker. The app
needs a complete vertical slice from connection string entry through real NWC
`make_invoice` and `lookup_invoice`, with tests and documented smoke
verification.

## Plan

- Add a wallet connection UI for entering, validating, storing, and clearing a
  `nostr+walletconnect://` connection string without logging or displaying the
  secret after submission.
- Wire the payment invoice generator to `createMainnetNwcConnector()` when a
  wallet is connected, replacing local mock invoice generation for the real
  user flow.
- Preserve a deterministic fake connector path for automated tests, avoiding
  real mainnet credentials in test fixtures.
- Add focused unit or UI tests for connect success, invalid connection strings,
  missing capabilities, invoice creation, settlement lookup, disconnect, and
  no-secret rendering.
- Update `docs/nwc-mainnet-smoke-test.md` with the exact manual verification
  flow for a maintainer-owned NWC wallet.
- Verify with `deno task lint:strict`, `deno task test:ui`,
  `deno task test:e2e:nwc-fake`, `deno task test:deploy:deno`, and a manual
  NWC smoke test when wallet credentials are available.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/services/nwc.ts`
- `src/components/templates/Payment/InvoiceGenerator.tsx`
- `src/components/templates/PaymentTemplate.tsx`
- `src/components/atoms/inputs/NumberInput.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceInputForm/WarikanArgsInput.tsx`
- `src/components/templates/Payment/InvoiceGenerator.test.tsx`
- `tests/unit/nwc_connector.test.ts`
- `src/setupTests.ts`
- `docs/nwc-mainnet-smoke-test.md`

Verified with:

- `deno task test:unit`
- `deno task lint:strict`
- `deno task test:ui`
- `deno task test:e2e:nwc-fake`
- `deno task test:deploy:deno`

Harness update:

- Added UI tests for wallet connect success, invalid and unsupported
  connections, NWC invoice creation, settlement lookup, disconnect, and
  no-secret rendering.
- Added connector unit coverage for restoring stored NWC connections and
  clearing stored unsupported connections.

Review residuals:

- Manual mainnet NWC smoke test not run; requires maintainer-owned wallet
  credentials.

Follow-up:

- None
