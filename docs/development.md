# Development

## Quality Gates

```sh
deno task lint:strict
deno task test:all
deno task test:all:docker
```

`deno task test:all` is the local quality gate: Deno source lint, repository
lints, script tests, unit tests, integration tests, TypeScript checks, UI smoke
tests, and production build. `deno task test:all:docker` runs the NWC regtest
E2E gate for the multi-participant split-payment flow.

GitHub Actions uses the same Deno commands:

- `deno task ci` for the local quality gate.
- `deno task test:e2e:regtest` for the regtest split-payment E2E gate.
- `deno task build` for static client artifact verification and GitHub Pages
  deployment.

Install the repository git hooks with `deno task setup:hooks`. The pre-commit hook
runs the strict lint gate.

## Implementation Map

- `src/App.tsx`: Ionic React routing and tab layout.
- `src/pages`: page-level wallet, payment, and contact screens.
- `src/components/templates`: screen-level UI composition.
- `src/components/atoms`: shared small UI primitives.
- `src/services`: currency and invoice domain helpers.
- `tests/e2e/nwc_regtest_warikan.test.ts`: regtest E2E coverage for the
  NWC-backed split-payment flow.
- `docs/nwc-wallet-connection.md`: NWC-only wallet connection design.

## Harness

- `scripts/test-all.sh`: single local and Docker-backed test runner.
- `scripts/check-no-local-paths.ts`: repository text lint for developer-local
  paths.
- `scripts/lint-types.ts`: repository lint for broad TypeScript escape hatches.
- `scripts/lint-no-dynamic-import.ts`: repository lint that keeps the module
  graph statically visible.
- `tests`: Deno-first test layout and NWC test helpers.
- `docs/review-harness.md`: where recurring review findings should be routed.

## README And Package Metadata Changes

- Keep `deno.json` tasks, compatibility package scripts, CI workflow commands,
  and README examples
  equivalent.
- Run `deno task test:scripts` after changing repository scripts.
- Run `deno task build` after changing Vite, TypeScript, package metadata, or
  deploy behavior.
- Run `deno task test:e2e:regtest` after changing NWC connector, regtest, or
  split-payment completion behavior.
- Run `deno task lint:strict` before sending changes to CI.
