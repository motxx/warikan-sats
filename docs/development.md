# Development

## Quality Gates

```sh
yarn lint:strict
yarn test:all
yarn test:all:docker
```

`yarn test:all` is the local quality gate: repository lints, script tests,
TypeScript checks, unit tests, and production build. `yarn test:all:docker` is
reserved for Docker-backed browser or integration coverage; until that harness
is implemented it reports the tracked pending issue and exits successfully.

Install the repository git hooks with `yarn setup:hooks`. The pre-commit hook
runs the strict lint gate.

## Implementation Map

- `src/App.tsx`: Ionic React routing and tab layout.
- `src/pages`: page-level wallet, payment, and contact screens.
- `src/components/templates`: screen-level UI composition.
- `src/components/atoms`: shared small UI primitives.
- `src/services`: currency and invoice domain helpers.
- `cypress`: browser E2E scaffolding.

## Harness

- `scripts/test-all.sh`: single local and Docker-backed test runner.
- `scripts/check-no-local-paths.mjs`: repository text lint for developer-local
  paths.
- `scripts/lint-types.mjs`: repository lint for broad TypeScript escape hatches.
- `scripts/lint-no-dynamic-import.mjs`: repository lint that keeps the module
  graph statically visible.
- `docs/review-harness.md`: where recurring review findings should be routed.

## README And Package Metadata Changes

- Keep `package.json` scripts, CI workflow commands, and README examples
  equivalent.
- Run `yarn test:scripts` after changing repository scripts.
- Run `yarn build` after changing Vite, TypeScript, package metadata, or deploy
  behavior.
- Run `yarn lint:strict` before sending changes to CI.
