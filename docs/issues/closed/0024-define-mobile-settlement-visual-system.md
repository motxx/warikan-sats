# Define mobile settlement visual system

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

design

## Dependencies

Depends on:
- None

Blocks:
- 0025-redesign-split-input-as-receipt-panel
- 0026-redesign-wallet-state-and-primary-actions
- 0027-redesign-payment-collection-progress

## Summary

Define a cohesive visual direction for the smartphone-first split settlement UI.
The app should feel like a practical checkout and collection tool, not a generic
dark Ionic form.

## Rationale

Current UI uses mostly default dark Ionic colors, plain white text, and generic
button styling. Before polishing individual screens, the app needs a small set
of reusable design decisions for background, surfaces, type scale, accents,
button treatment, and status colors.

## Plan

- Set app-level colors for a warm settlement-focused interface.
- Define reusable surface, border, and text treatments in existing components.
- Keep the design restrained and mobile-first.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/theme/variables.css`
- `src/components/templates/PaymentTemplate.tsx`
- `src/components/atoms/buttons/PrimaryButton.tsx`
- `src/components/atoms/inputs/NumberInput.tsx`
- `src/components/atoms/inputs/TextInput.tsx`

Verified with:

- `deno task lint:strict`
- `deno task test:ui`
- `deno task test:unit`
- `deno task build`
- `./node_modules/.bin/cypress run --spec cypress/e2e/test.cy.ts`

Harness update:

- `src/App.test.tsx` and `cypress/e2e/test.cy.ts` updated for the new visual entry point.

Review residuals:

- None

Follow-up:

- None
