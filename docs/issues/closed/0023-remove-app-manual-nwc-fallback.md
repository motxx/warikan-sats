# Remove app manual NWC fallback

Created: 2026-05-16
Model: Codex

## Priority

design

## Dependencies

Depends on:
- None

Blocks:
- None

## Summary

Remove the app-owned manual `nostr+walletconnect://` paste fallback from the
split collection screen.

## Rationale

Bitcoin Connect already includes a Generic NWC URL path. Keeping a second NWC
URL input in the app creates two places to paste the same credential and makes
the wallet connection flow harder to understand.

## Plan

- Remove the app-level NWC textarea, fallback toggle, and manual connect path.
- Keep Bitcoin Connect as the only visible wallet connection action.
- Keep the existing NWC connector behind Bitcoin Connect for invoice creation
  and lookup.
- Update UI and Cypress tests to assert that app-level NWC paste is absent.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/components/templates/Payment/InvoiceGenerator.tsx`
- `src/components/templates/Payment/InvoiceGenerator.test.tsx`
- `cypress/e2e/test.cy.ts`

Verified with:

- `deno task lint:strict`
- `deno task test:ui`
- `deno task test:unit`
- `deno task test:e2e:nwc-fake`
- `deno task test:deploy:deno`
- `./node_modules/.bin/cypress run --spec cypress/e2e/test.cy.ts`

Harness update:

- `src/components/templates/Payment/InvoiceGenerator.test.tsx` now asserts no
  app-level manual NWC input is exposed.
- `cypress/e2e/test.cy.ts` now verifies the phone viewport has only the
  Bitcoin Connect wallet action.

Review residuals:

- None

Follow-up:

- None
