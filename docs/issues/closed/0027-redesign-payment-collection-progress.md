# Redesign payment collection progress

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

Redesign the QR payment collection state so it clearly shows who should pay,
how much they should pay, and what happens next. User-facing UI copy should be
in English.

## Rationale

The current QR state shows participant number, sats, QR code, and a status
message, but the screen does not strongly communicate progress through the
collection flow. This is the most important moment in the app.

## Plan

- Add a stronger progress treatment for active participant and total count.
- Make the payment amount and QR surface easier to scan on mobile.
- Improve completed and failed states.
- Use English labels and status copy for the collection flow.
- Update tests for progress and action copy.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/components/templates/Payment/InvoiceGenerator.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceQRCodeOutput.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceQRCodeOutput/InvoiceQRCode.tsx`
- `src/components/templates/Payment/InvoiceGenerator.test.tsx`

Verified with:

- `deno task lint:strict`
- `deno task test:ui`
- `deno task test:unit`
- `deno task build`
- `./node_modules/.bin/cypress run --spec cypress/e2e/test.cy.ts`

Harness update:

- `src/components/templates/Payment/InvoiceGenerator.test.tsx` updated for the payment progress copy.

Review residuals:

- None

Follow-up:

- None
