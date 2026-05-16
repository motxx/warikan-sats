# Remove GitHub Pages deploy

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

Remove the GitHub Pages deployment path and make Deno Deploy the only supported
static production deployment target.

## Rationale

The app now has a Deno Deploy root-path static distribution. Keeping GitHub
Pages deployment in CI and docs creates duplicated deploy behavior and keeps the
legacy `/warikan-sats/` base path alive longer than needed.

## Plan

- Remove GitHub Pages-specific workflow jobs, permissions, package metadata, and
  build tasks.
- Update Deno Deploy docs, development docs, and README references so Deno
  Deploy is the sole production deploy path.
- Update tests or deploy artifact checks so the remaining root-path static build
  stays covered.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `.github/workflows/ci.yml`
- `.github/workflows/gh-pages.yml`
- `deno.json`
- `package.json`
- `vite.config.ts`
- `src/App.test.tsx`
- `scripts/check-deno-deploy-static.ts`
- `README.md`
- `docs/development.md`
- `docs/deno-deploy-static.md`
- `docs/nwc-mainnet-smoke-test.md`
- `docs/review-harness.md`

Verified with:

- `deno task lint:paths`
- `deno task test:scripts`
- `deno task test:ui`
- `deno task test:deploy:deno`
- `deno task ci`

Harness update:

- `scripts/check-deno-deploy-static.ts` continues to reject legacy subpath
  leakage in the Deno Deploy static artifact.

Review residuals:

- None

Follow-up:

- None
