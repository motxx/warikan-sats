# Add Bitcoin Connect primary wallet flow

Created: 2026-05-16
Model: Codex

## Priority

feature

## Dependencies

Depends on:
- None

Blocks:
- None

## Summary

Make Bitcoin Connect the primary NWC connection path for the mobile split
collection page, while keeping manual `nostr+walletconnect://` paste as a
fallback.

## Rationale

The page is intended to be opened on smartphones. Copying and pasting a full
NWC connection string is a poor first-run mobile experience. Bitcoin Connect is
listed in the NWC docs as a wallet connection library and can launch an NWC
connection flow from the app.

## Plan

- Add Bitcoin Connect as a narrowly wrapped dependency.
- Request only the NWC invoice permissions this app needs.
- Add a primary wallet connection button and move manual NWC paste behind a
  fallback control.
- Keep existing NWC invoice creation and lookup behavior unchanged.
- Cover the new connection path with UI tests.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `package.json`
- `deno.lock`
- `src/services/bitcoinConnect.ts`
- `src/components/templates/Payment/InvoiceGenerator.tsx`
- `src/components/templates/Payment/InvoiceGenerator.test.tsx`
- `cypress/e2e/test.cy.ts`

Verified with:

- `deno task check`
- `deno task lint:strict`
- `deno task test:ui`
- `deno task test:unit`
- `deno task test:e2e:nwc-fake`
- `deno task test:scripts`
- `deno task test:deploy:deno`
- `./node_modules/.bin/cypress run --spec cypress/e2e/test.cy.ts`

Harness update:

- `src/components/templates/Payment/InvoiceGenerator.test.tsx` covers the
  Bitcoin Connect primary path and manual NWC fallback.
- `cypress/e2e/test.cy.ts` verifies the phone viewport connection surface and
  hidden manual paste field.

Review residuals:

- Production build still emits the existing Vite large chunk warning. Bitcoin
  Connect is dynamically imported after the connect tap so it is not part of
  the initial split-flow interaction.

Follow-up:

- None
