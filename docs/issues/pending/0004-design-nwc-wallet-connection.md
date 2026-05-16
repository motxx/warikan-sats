# Design NWC wallet connection

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

design

## Dependencies

Depends on:
- 0003-migrate-from-yarn-to-deno-client-distribution

Blocks:
- 0008-implement-nwc-wallet-connector
- 0005-add-sequential-split-invoice-ui
- 0007-add-nwc-regtest-warikan-e2e

## Summary

Design the Nostr Wallet Connect-only path for connecting Warikan Sats from the
client to a user's Lightning wallet for invoice creation, payment-status
checks, and wallet balance data without an operator-run backend.

## Rationale

The app should not rely on mocked invoice behavior for real split payments.
The product architecture is client plus user-managed Lightning wallet only.
The supported connection strategy is Nostr Wallet Connect; WebLN, Lightning
Address, LNURL-pay, and direct node REST APIs are out of scope for now. The
implementation needs a browser-safe strategy for authorization, invoice
creation, payment lookup, error handling, and local configuration. Credentials
must not be sent to or stored by an operator service. This issue absorbs the
broader Lightning node integration design that was originally tracked in
`0002-add-lightning-node-integration`.

## Plan

- Document Nostr Wallet Connect as the only supported wallet connection mode.
- Define the required NWC permissions for invoice creation, payment status, and
  wallet balance reads.
- Document connection-string handling, relay expectations, authorization
  failures, and local storage rules.
- Define the typed client-side connector interface that `0008` will implement.
- Keep node credentials out of tracked files, issue text, logs, and any
  operator-controlled service.
- Identify focused tests for connector configuration, connection failures,
  invoice creation failures, and payment-status polling.
- Route NWC-backed integration coverage through `docs/review-harness.md`.
- Update `docs/development.md` with local configuration guidance.
