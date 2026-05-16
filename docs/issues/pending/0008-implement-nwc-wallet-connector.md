# Implement NWC wallet connector

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

feature

## Dependencies

Depends on:
- 0004-design-nwc-wallet-connection
- 0009-add-deno-test-foundation

Blocks:
- 0005-add-sequential-split-invoice-ui
- 0007-add-nwc-regtest-warikan-e2e

## Summary

Implement Nostr Wallet Connect as the only supported wallet integration for
Warikan Sats. The client should use a user's NWC connection to request invoices,
check settlement, and read balance data without any operator-run backend.

## Rationale

NWC matches the target architecture better than wallet deep links, Lightning
Address, LNURL-pay, or direct Lightning node REST APIs because the app needs
both invoice creation and reliable payment-status lookup from the browser.
Keeping the integration NWC-only reduces product and test surface area while
preserving the client-plus-user-wallet deployment model.

## Plan

- Add an NWC connection setup flow for a user-provided connection string.
- Validate required wallet capabilities before enabling split-payment creation.
- Implement typed methods for creating invoices, checking invoice status, and
  reading balance data.
- Store connection data only in the client according to the rules documented by
  `0004`.
- Add focused tests for invalid connection strings, missing permissions,
  invoice creation failures, and settlement polling.
- Update `docs/review-harness.md` with where NWC connector regressions should
  be routed.
