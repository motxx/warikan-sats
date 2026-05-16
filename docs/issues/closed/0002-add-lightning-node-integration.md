# Add Lightning node integration

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

design

## Dependencies

Depends on:
- None

Blocks:
- None

## Summary

Define and implement how Warikan Sats should connect to a Lightning node for
invoice creation, payment status, and wallet balance data.

## Rationale

The current app can generate split-payment invoice UI, but Lightning node
connectivity needs an explicit design decision before implementation. The work
should identify the target node API, credential handling, runtime environment,
and test harness so payment-related behavior is not mocked indefinitely.

## Plan

- Choose the supported Lightning backend and API boundary.
- Document required configuration and secret-handling rules.
- Replace hard-coded or mocked invoice and balance behavior with a typed service
  boundary.
- Add focused tests for invoice creation and payment-status failure modes.
- Route browser or node-backed integration coverage through
  `docs/review-harness.md`.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `docs/issues/pending/0004-design-nwc-wallet-connection.md`

Verified with:

- `corepack yarn run lint:paths`

Harness update:

- None - duplicate issue consolidation only.

Review residuals:

- Lightning node implementation remains tracked by
  `docs/issues/pending/0004-design-nwc-wallet-connection.md`, which now
  targets direct client-to-user-wallet operation through Nostr Wallet Connect
  without an operator backend.

Follow-up:

- None
