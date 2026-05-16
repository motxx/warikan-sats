# Fold wallet into split flow

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

Remove the standalone `Wallet` tab/page from the first-run experience and fold
the necessary wallet concept into the split collection flow as a connection
state.

## Rationale

The app's current value is not generic wallet management. First-look QA showed
hard-coded balance and history data that made the app feel like a fake wallet.
Users only need to understand that they are connecting their receiving wallet
so the app can create split-collection invoices.

## Plan

- Remove the `Wallet` tab from primary navigation.
- Redirect the root route to the split collection screen.
- Keep wallet connection status inside the split flow, not as a separate fake
  wallet dashboard.
- Delete or quarantine hard-coded wallet balance/history sample data.
- Add a UI test that first load lands on the split collection flow.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/App.tsx`
- `src/App.test.tsx`
- `src/components/templates/Payment/InvoiceGenerator.tsx`
- `src/components/templates/WalletOverviewTemplate.tsx`
- `src/components/templates/WalletOverview/InvoicesList.tsx`
- `src/components/templates/WalletOverview/InvoicesList/ContactListItem.tsx`
- `src/components/templates/WalletOverview/InvoicesList/Item/AmountChange.tsx`
- `src/components/templates/WalletOverview/WalletBalance.tsx`
- `src/pages/WalletOverviewPage.tsx`
- `scripts/check-deno-deploy-static.ts`

Verified with:

- `deno task test:ui`
- `deno task test:scripts`
- `deno task lint:strict`
- `deno task test:deploy:deno`
- `Cypress mobile first-run smoke`

Harness update:

- `src/App.test.tsx` now verifies root redirects to `/payment` and no wallet
  tab is exposed.
- `scripts/check-deno-deploy-static.ts` now validates `/payment` as the static
  app route.

Review residuals:

- None

Follow-up:

- None
