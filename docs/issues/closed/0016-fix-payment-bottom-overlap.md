# Fix payment bottom overlap

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

bug

## Dependencies

Depends on:
- None

Blocks:
- None

## Summary

Fix the `Invoice` screen layout so the `START SPLIT` action and generated
invoice area are not clipped, hidden, or covered by the bottom tab bar on
mobile and desktop viewports.

## Rationale

First-look QA showed `START SPLIT` sitting too close to the bottom navigation.
At desktop test size it was treated as covered by the Ionic scroll container,
and on mobile it visually crowds the tab bar.

## Plan

- Audit `PaymentTemplate` and `InvoiceGenerator` vertical sizing, scroll, and
  bottom padding.
- Ensure primary actions remain fully visible above `IonTabBar`.
- Add or update a UI/E2E check that catches bottom-tab overlap on mobile.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/App.tsx`
- `src/pages/PaymentPage.tsx`
- `src/components/templates/PaymentTemplate.tsx`
- `src/components/templates/Payment/InvoiceGenerator.tsx`
- `src/App.test.tsx`
- `src/components/templates/Payment/InvoiceGenerator.test.tsx`

Verified with:

- `deno task test:ui`
- `deno task lint:strict`
- `deno task test:deploy:deno`
- `Cypress mobile first-run smoke`

Harness update:

- `src/App.test.tsx` now verifies first load reaches the split collection flow.
- `src/components/templates/Payment/InvoiceGenerator.test.tsx` covers the
  updated single-flow rendering.

Review residuals:

- None

Follow-up:

- None
