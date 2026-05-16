# Remove unused contact surface

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

Remove the `Contact` tab/page and related sample contact data from the primary
app until contacts have a real role in split collection.

## Rationale

The current split collection flow does not use contacts. First-look QA showed
awkward address fragments and duplicate sample contacts, but the larger issue
is product fit: contacts create expectations for recipient selection or social
payment workflows that the app does not support.

## Plan

- Remove the `Contact` tab from primary navigation.
- Remove or disable the `/contact` route if no active flow links to it.
- Delete unused contact sample data and components when they become unreachable.
- Add a UI test proving first-run navigation does not expose contacts.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/App.tsx`
- `src/App.test.tsx`
- `src/components/templates/ContactTemplate.tsx`
- `src/components/templates/Contact/ContactSearch.tsx`
- `src/components/templates/Contact/ContactSearch/AddContact.tsx`
- `src/components/templates/Contact/ContactSearch/ContactList/ContactList.tsx`
- `src/components/templates/Contact/ContactSearch/ContactList/ContactListItem.tsx`
- `src/components/templates/Contact/ContactSearch/ContactSearchInput.tsx`
- `src/pages/ContactPage.tsx`

Verified with:

- `deno task test:ui`
- `deno task lint:strict`
- `deno task test:deploy:deno`
- `Cypress mobile first-run smoke`

Harness update:

- `src/App.test.tsx` now verifies the first-run app does not expose the contact
  surface.

Review residuals:

- None

Follow-up:

- None
