# Connect NWC on mainnet

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

feature

## Dependencies

Depends on:
- 0008-implement-nwc-wallet-connector
- 0007-add-nwc-regtest-warikan-e2e

Blocks:
- None

## Summary

Enable Warikan Sats to connect to a user-provided Nostr Wallet Connect wallet
on mainnet after the connector and regtest-backed E2E path are in place.

## Rationale

The app needs a production wallet path for real users, but mainnet should not
be the first place where NWC behavior is proven. The mainnet connection flow
should reuse the client-only NWC architecture, keep connection strings and
wallet credentials out of tracked files and operator services, and make relay
or wallet failures visible enough for users to recover.

## Plan

- Add or verify a production/mainnet NWC connection mode for user-provided
  connection strings.
- Keep all NWC connection data in client-side storage according to the rules
  defined by `0004` and implemented by `0008`.
- Ensure invoice creation, settlement polling, and balance reads use the
  connected mainnet wallet without requiring an operator-run backend.
- Add user-facing error states for unsupported wallet capabilities, relay
  failures, authorization failures, and wallet timeouts.
- Document a maintainer-run mainnet smoke test using placeholder wallet details
  and no committed secrets.
- Update `docs/review-harness.md` with the mainnet smoke-test routing and keep
  automated regression coverage on regtest by default.
