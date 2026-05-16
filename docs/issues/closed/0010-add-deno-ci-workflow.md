# Add Deno CI workflow

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

maintenance

## Dependencies

Depends on:
- 0003-migrate-from-yarn-to-deno-client-distribution
- 0009-add-deno-test-foundation

Blocks:
- 0007-add-nwc-regtest-warikan-e2e

## Summary

Replace the current Yarn-oriented GitHub Actions flow with a Deno-native CI
workflow that runs after the Deno client distribution and test foundation are
in place.

## Rationale

The repository currently deploys through a GitHub Pages workflow that installs
Yarn dependencies and runs `yarn ci`. After the project moves to Deno-native
tooling, CI should install Deno, run the Deno quality gate, preserve static
client build verification, and expose a separate path for future NWC regtest
E2E coverage.

## Plan

- Add or update the GitHub Actions workflow to set up Deno.
- Run the Deno local quality gate from `0003`.
- Run the Deno unit and integration test entrypoints from `0009`.
- Keep static client build or deploy verification aligned with the new
  backend-free distribution model.
- Add a separate job or documented placeholder for NWC regtest E2E once `0006`
  and `0007` are ready.
- Update `docs/development.md`, `docs/review-harness.md`, and README command
  examples so local and CI commands stay equivalent.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `.github/workflows/gh-pages.yml`
- `README.md`
- `docs/development.md`
- `docs/review-harness.md`

Verified with:

- `deno task lint:paths`
- `deno task test:all:docker`
- `deno task build`

Harness update:

- CI now runs `deno task ci`, `deno task test:e2e:regtest`, and `deno task
  build` through Deno setup jobs.

Review residuals:

- `actionlint` was not available in the local environment, so workflow syntax
  will be finally checked by GitHub Actions after push.

Follow-up:

- None
