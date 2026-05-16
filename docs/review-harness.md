# Review Harness

This document maps recurring review concerns to the automated harness that
should catch them next time. When a finding repeats, prefer extending a script,
test, or issue over relying on human memory.

## Commands

| Command | Owner |
| --- | --- |
| `deno task lint:strict` | Deno source lint, local path leaks, unsafe type escapes, and dynamic imports. |
| `deno task test:all` | Local quality gate: repository lints, script tests, TypeScript checks, unit tests, and production build. |
| `deno task test:all:docker` | Docker-backed gate. This currently reports the tracked pending NWC regtest E2E issue and exits successfully. |
| `deno task ci` | CI entrypoint for the full local gate. |

## Routing

| Review concern | Harness update |
| --- | --- |
| Type-system bypass such as `any`, `as any`, or `as unknown as` | Extend `scripts/lint-types.ts` and `scripts/lint-types.test.ts`. |
| Dynamic import drift | Extend `scripts/lint-no-dynamic-import.ts` and its tests. |
| Developer-local paths in tracked text | Extend `scripts/check-no-local-paths.ts` and its tests. |
| Browser workflow regression | Resolve or extend `docs/issues/pending/0007-add-nwc-regtest-warikan-e2e.md`. |
| NWC wallet connector regression | Extend `docs/issues/pending/0008-implement-nwc-wallet-connector.md` and its focused tests. |
| Package-manager, CI command, or README command drift | Update `package.json`, CI workflow, and README examples in the same change. |

## Residual Review

After the harness passes, human review should focus on decisions that cannot be
reduced to deterministic checks yet: product scope, security risk acceptance,
public vocabulary, dependency policy, and browser workflow expectations.
