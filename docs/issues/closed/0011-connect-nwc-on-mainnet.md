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

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `package.json`
- `deno.lock`
- `src/services/nwc.ts`
- `src/services/nwcMainnet.ts`
- `src/services/nwcNostrTransport.ts`
- `tests/unit/nwc_connector.test.ts`
- `tests/unit/nwc_nostr_transport.test.ts`
- `docs/nwc-wallet-connection.md`
- `docs/nwc-mainnet-smoke-test.md`
- `docs/review-harness.md`

Verified with:

- `deno task lint:strict`
- `deno task test:unit`
- `deno task check`
- `deno task build`

Harness update:

- Added `tests/unit/nwc_nostr_transport.test.ts` for info-event parsing,
  request publishing, response parsing, and unsupported encryption handling.
- Regtest E2E remains the automated no-backend regression gate for split
  payment completion.

Review residuals:

- Real mainnet wallet behavior requires a maintainer-run smoke test with a
  wallet-created NWC URI, documented in `docs/nwc-mainnet-smoke-test.md`.

Follow-up:

- None
