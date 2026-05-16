# Redesign wallet state and primary actions

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

design

## Dependencies

Depends on:
- 0024-define-mobile-settlement-visual-system

Blocks:
- None

## Summary

Make wallet connection state and primary actions feel like a clear mobile flow.
Users should immediately know whether they need to connect a wallet, create
invoices, or wait for payment. User-facing UI copy should be in English.

## Rationale

The app now relies on status text and generic button labels such as `START
SPLIT`, `CHECK PAYMENT`, and `DISCONNECT`. A smartphone checkout flow should use
clear English action copy, visible status badges, and consistent
primary/secondary button hierarchy.

## Plan

- Replace generic button copy with task-specific English copy.
- Add clearer connected, checking, and error status presentation.
- Keep Bitcoin Connect as the only wallet connection entry point.
- Update UI and E2E assertions for the new action labels.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/components/templates/Payment/InvoiceGenerator.tsx`
- `src/components/templates/Payment/InvoiceGenerator/GenerateInvoiceButton.tsx`
- `src/components/atoms/buttons/PrimaryButton.tsx`
- `src/components/templates/Payment/InvoiceGenerator.test.tsx`
- `cypress/e2e/test.cy.ts`

Verified with:

- `deno task lint:strict`
- `deno task test:ui`
- `deno task test:unit`
- `deno task build`
- `./node_modules/.bin/cypress run --spec cypress/e2e/test.cy.ts`

Harness update:

- UI tests and Cypress smoke assertions updated for the new English action labels.

Review residuals:

- None

Follow-up:

- None
