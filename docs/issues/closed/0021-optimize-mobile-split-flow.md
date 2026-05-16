# Optimize mobile split flow

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

The split collection page is expected to be opened from a smartphone, so the
main form should be optimized for narrow screens and touch input first.

## Rationale

The current flow is functional, but it still carries desktop-like spacing and
side-by-side inputs that can feel cramped on mobile. The page should keep the
primary wallet connection and split inputs legible, reachable, and stable on
small screens.

## Plan

- Adjust the payment shell for mobile safe areas and narrow viewport sizing.
- Stack split inputs and actions on small screens with touch-sized controls.
- Use mobile-friendly input attributes and text sizing that avoids iOS zoom.
- Add focused UI coverage for the mobile-first structure.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/components/templates/PaymentTemplate.tsx`
- `src/components/templates/Payment/InvoiceGenerator.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceInputForm.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceInputForm/WarikanArgsInput.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceInputForm/AddNotes.tsx`
- `src/components/atoms/buttons/PrimaryButton.tsx`
- `src/components/atoms/inputs/NumberInput.tsx`
- `src/components/atoms/inputs/TextInput.tsx`
- `src/App.test.tsx`
- `src/components/templates/Payment/InvoiceGenerator.test.tsx`
- `cypress/e2e/test.cy.ts`

Verified with:

- `deno task lint:paths`
- `deno task test:ui`
- `deno task lint:strict`
- `./node_modules/.bin/cypress run --spec cypress/e2e/test.cy.ts`

Harness update:

- `src/components/templates/Payment/InvoiceGenerator.test.tsx` now covers the
  mobile-first split input state.
- `cypress/e2e/test.cy.ts` now opens the app in a phone viewport.

Review residuals:

- None

Follow-up:

- None
