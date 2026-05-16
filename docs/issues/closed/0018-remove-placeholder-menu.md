# Remove placeholder menu

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

Remove the hamburger menu affordance unless it has real user-facing actions
that support the guided split collection flow.

## Rationale

First-look QA showed `Menu Content` and `This is the menu content.` after
opening the hamburger menu. Since the product is being narrowed to split
collection, a generic menu is unnecessary until there is a concrete settings or
help action.

## Plan

- Remove placeholder menu content and the hamburger trigger from active pages.
- Delete unused menu components when no routes need them.
- Add a UI check that prevents placeholder menu copy from shipping.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/App.tsx`
- `src/pages/PaymentPage.tsx`
- `src/components/templates/Common/Header.tsx`
- `src/components/templates/Common/Menu.tsx`
- `src/App.test.tsx`

Verified with:

- `deno task test:ui`
- `deno task lint:strict`
- `deno task test:deploy:deno`
- `Cypress mobile first-run smoke`

Harness update:

- `src/App.test.tsx` now verifies placeholder menu copy is not exposed.

Review residuals:

- None

Follow-up:

- None
