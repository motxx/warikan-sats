# Redesign split input as receipt panel

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

Redesign the split amount input so it reads like a compact receipt or settlement
panel: total amount, participant count, per-person amount, and note should feel
like one coherent workflow. User-facing UI copy should be in English.

## Rationale

The current fields are functional but sparse. The per-person result is the most
important value and should be visually emphasized, while the input controls
should remain easy to tap on a phone.

## Plan

- Group total and participant inputs into a receipt-like surface.
- Make per-person amount the visual center of the form.
- Keep note entry secondary but accessible.
- Use English labels and helper copy in the form.
- Update tests for any label or copy changes.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/components/templates/Payment/InvoiceGenerator/InvoiceInputForm.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceInputForm/WarikanArgsInput.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceInputForm/ResultBalance.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceInputForm/AddNotes.tsx`
- `src/components/templates/Payment/InvoiceGenerator.test.tsx`

Verified with:

- `deno task lint:strict`
- `deno task test:ui`
- `deno task test:unit`
- `deno task build`
- `./node_modules/.bin/cypress run --spec cypress/e2e/test.cy.ts`

Harness update:

- `src/components/templates/Payment/InvoiceGenerator.test.tsx` updated for the English receipt-style form labels.

Review residuals:

- None

Follow-up:

- None
