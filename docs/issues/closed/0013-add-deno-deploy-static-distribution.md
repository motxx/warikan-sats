# Add Deno Deploy static distribution

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

maintenance

## Dependencies

Depends on:
- 0003-migrate-from-yarn-to-deno-client-distribution
- 0010-add-deno-ci-workflow

Blocks:
- None

## Summary

Prepare the client-only application for Deno Deploy static hosting without
introducing an operator-owned backend.

## Rationale

The product direction is client plus user Lightning wallet only. Deno Deploy is
acceptable only as static hosting: it must not add server-side invoice creation,
wallet credentials, databases, or operator-owned payment state. The current
Vite build is still fixed to the GitHub Pages subpath, so a Deno Deploy root
deployment would serve incorrect asset paths unless the base path can be
configured per target.

## Plan

- Add a Deno Deploy build task that emits a root-path static bundle.
- Keep the GitHub Pages build path available until production cutover is a
  human-owned deploy decision.
- Document Deno Deploy static setup, including the no-backend constraints.
- Update development and review harness docs so deploy-target changes run the
  correct verification.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `vite.config.ts`
- `deno.json`
- `package.json`
- `.github/workflows/gh-pages.yml`
- `scripts/check-deno-deploy-static.ts`
- `docs/deno-deploy-static.md`
- `README.md`
- `docs/development.md`
- `docs/review-harness.md`

Verified with:

- `deno task test:deploy:deno`
- `deno task lint:paths`
- `deno task lint:strict`
- `deno task test:all`
- `deno task build:github-pages`

Harness update:

- Added `deno task test:deploy:deno` and a CI job that validates the Deno
  Deploy root-path static artifact without adding a server runtime.

Review residuals:

- Deno Deploy app creation, org/app selection, and production cutover remain
  maintainer-owned external service setup, documented in
  `docs/deno-deploy-static.md`.

Follow-up:

- None
