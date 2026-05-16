# Development

## Quality Gates

```sh
deno task lint:strict
deno task test:all
deno task test:all:docker
```

`deno task test:all` is the local quality gate: Deno source lint, repository lints, script tests,
TypeScript checks, unit tests, and production build. `deno task test:all:docker` is
reserved for Docker-backed browser or integration coverage; until that harness
is implemented it reports the tracked pending issue and exits successfully.

Install the repository git hooks with `deno task setup:hooks`. The pre-commit hook
runs the strict lint gate.

## Implementation Map

- `src/App.tsx`: Ionic React routing and tab layout.
- `src/pages`: page-level wallet, payment, and contact screens.
- `src/components/templates`: screen-level UI composition.
- `src/components/atoms`: shared small UI primitives.
- `src/services`: currency and invoice domain helpers.
- `docs/issues/pending/0007-add-nwc-regtest-warikan-e2e.md`: planned browser
  E2E coverage for the NWC-backed split-payment flow.

## Harness

- `scripts/test-all.sh`: single local and Docker-backed test runner.
- `scripts/check-no-local-paths.ts`: repository text lint for developer-local
  paths.
- `scripts/lint-types.ts`: repository lint for broad TypeScript escape hatches.
- `scripts/lint-no-dynamic-import.ts`: repository lint that keeps the module
  graph statically visible.
- `docs/review-harness.md`: where recurring review findings should be routed.

## README And Package Metadata Changes

- Keep `deno.json` tasks, compatibility package scripts, CI workflow commands,
  and README examples
  equivalent.
- Run `deno task test:scripts` after changing repository scripts.
- Run `deno task build` after changing Vite, TypeScript, package metadata, or deploy
  behavior.
- Run `deno task lint:strict` before sending changes to CI.
