# NWC Mainnet Smoke Test

Automated regression coverage stays on the local regtest harness. Maintainers
can run this smoke test manually when validating a real NWC wallet connection.

## Preconditions

- Use a wallet-created `nostr+walletconnect://` URI scoped to this app.
- Use a wallet balance small enough for a smoke test.
- Do not paste the URI into issues, commits, logs, screenshots, or shared
  documents.
- Disconnect the app after the smoke test if the wallet UI supports revocation
  or connection management.

## Steps

1. Open the static client build or deployed Deno Deploy app.
2. Go to the `Invoice` tab.
3. Paste the wallet-created NWC connection string into the
   `Nostr Wallet Connect` field and select `CONNECT WALLET`.
4. Confirm the field clears and the app reports a ready connection. If it
   reports unsupported
   capabilities, the wallet must advertise `make_invoice` and `lookup_invoice`.
5. Create a two-person split with the smallest practical amount.
6. Confirm the displayed invoice was created by the wallet through
   `make_invoice`.
7. Pay the first displayed invoice from the wallet's normal payment flow.
8. Select `CHECK PAYMENT` and confirm the app advances only after
   `lookup_invoice` reports settlement.
9. Pay the second invoice, select `CHECK PAYMENT`, and confirm the all-paid
   state.
10. Select `DISCONNECT` in the app, then revoke the app-specific wallet
   connection in the wallet when that option is available.

## Failure Routing

- Unsupported capabilities: update `src/services/nwc.ts`,
  `src/services/nwcNostrTransport.ts`, or wallet compatibility notes.
- Relay failures or timeouts: update `src/services/nwcNostrTransport.ts` and
  focused transport tests.
- Split sequence regressions: update
  `tests/e2e/nwc_regtest_warikan.test.ts` first, then add manual notes here
  only for behavior that cannot be automated without mainnet funds.
