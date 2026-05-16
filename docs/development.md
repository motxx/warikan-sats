# Development

## Quality Gates

```sh
deno task lint:strict
deno task test:all
deno task test:all:docker
```

`deno task test:all` is the local quality gate: Deno source lint, repository
lints, script tests, unit tests, integration tests, TypeScript checks, UI smoke
tests, and production build. `deno task test:all:docker` starts real Bitcoin
Core and Core Lightning regtest containers and completes a Lightning invoice
payment smoke test.

GitHub Actions uses the same Deno commands:

- `deno task ci` for the local quality gate.
- `deno task test:e2e:regtest` for the real Lightning regtest smoke gate.
- `deno task build:github-pages` for the current GitHub Pages artifact.
- `deno task test:deploy:deno` for the Deno Deploy static artifact.

Install the repository git hooks with `deno task setup:hooks`. The pre-commit hook
runs the strict lint gate.

## Implementation Map

- `src/App.tsx`: Ionic React routing and tab layout.
- `src/pages`: page-level wallet, payment, and contact screens.
- `src/components/templates`: screen-level UI composition.
- `src/components/atoms`: shared small UI primitives.
- `src/services`: currency and invoice domain helpers.
- `docker-compose.lightning-regtest.yml`: real Bitcoin and Core Lightning
  regtest stack.
- `docs/deno-deploy-static.md`: static Deno Deploy setup and no-backend
  boundary.
- `scripts/lightning-regtest.ts`: Docker Lightning regtest control and smoke
  test harness.
- `tests/e2e/nwc_regtest_warikan.test.ts`: fake/file-backed NWC flow coverage
  for the NWC-shaped client contract.
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
- Run `deno task test:deploy:deno` after changing Vite base path, static
  deploy behavior, or Deno Deploy documentation.
- Run `deno task test:e2e:nwc-fake` after changing NWC connector or
  split-payment sequence behavior.
- Run `deno task test:e2e:regtest` after changing Docker, Bitcoin, Lightning,
  or real regtest payment behavior.
- Run `deno task lint:strict` before sending changes to CI.
