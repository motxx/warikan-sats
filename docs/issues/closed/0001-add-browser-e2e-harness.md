# Add browser E2E harness

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

maintenance

## Dependencies

Depends on:
- None

Blocks:
- None

## Summary

Align the existing Cypress coverage with the current Warikan Sats UI and decide
whether it belongs in the local quality gate, a Docker-backed gate, or both.

## Rationale

The repository already contains Cypress scaffolding, but the smoke test still
targets starter-app text rather than the current wallet, payment, and contact
flows. The new quality harness leaves E2E out of the default local gate until
that coverage is meaningful and repeatable.

## Plan

- Replace the starter Cypress smoke test with current app workflow coverage.
- Add a script that starts the Vite server and runs Cypress against it.
- Decide whether the Docker-backed harness should own browser E2E execution.
- Update `docs/review-harness.md` with the final routing.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `docs/issues/pending/0007-add-nwc-regtest-warikan-e2e.md`

Verified with:

- `corepack yarn run lint:paths`

Harness update:

- None - obsolete generic browser E2E issue was consolidated into the NWC
  regtest E2E issue.

Review residuals:

- E2E coverage remains tracked by
  `docs/issues/pending/0007-add-nwc-regtest-warikan-e2e.md`.

Follow-up:

- None
