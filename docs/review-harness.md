# Review Harness

This document maps recurring review concerns to the automated harness that
should catch them next time. When a finding repeats, prefer extending a script,
test, or issue over relying on human memory.

## Commands

| Command | Owner |
| --- | --- |
| `deno task lint:strict` | Deno source lint, local path leaks, unsafe type escapes, and dynamic imports. |
| `deno task test:unit` | Deno unit tests for pure logic, state machines, and connector helpers. |
| `deno task test:integration` | Deno integration tests that do not require the NWC regtest wallet stack. |
| `deno task test:ui` | Existing React DOM smoke tests through Vitest while UI tests are migrated. |
| `deno task test:e2e:nwc-fake` | Fake/file-backed NWC flow coverage for multi-participant split-payment completion. |
| `deno task test:e2e:regtest` | Real Docker Bitcoin and Lightning regtest smoke payment coverage. |
| `deno task test:all` | Local quality gate: repository lints, script tests, unit tests, integration tests, TypeScript checks, UI smoke tests, and production build. |
| `deno task test:all:docker` | Docker Lightning regtest gate. Runs `deno task test:e2e:regtest`. |
| `deno task ci` | CI entrypoint for the full local gate. |

## Routing

| Review concern | Harness update |
| --- | --- |
| Type-system bypass such as `any`, `as any`, or `as unknown as` | Extend `scripts/lint-types.ts` and `scripts/lint-types.test.ts`. |
| Dynamic import drift | Extend `scripts/lint-no-dynamic-import.ts` and its tests. |
| Developer-local paths in tracked text | Extend `scripts/check-no-local-paths.ts` and its tests. |
| Browser or fake NWC workflow regression | Extend `tests/e2e/nwc_regtest_warikan.test.ts` or add browser automation when UI-level coverage is needed. |
| Real Bitcoin or Lightning regtest regression | Extend `docker-compose.lightning-regtest.yml`, `scripts/lightning-regtest.ts`, and the `deno task test:e2e:regtest` smoke path. |
| NWC wallet connector regression | Extend `src/services/nwc.ts` and `tests/unit/nwc_connector.test.ts`. |
| NWC mainnet relay, encryption, or timeout regression | Extend `src/services/nwcNostrTransport.ts`, `tests/unit/nwc_nostr_transport.test.ts`, and `docs/nwc-mainnet-smoke-test.md`. |
| Fake NWC wallet environment drift | Extend `scripts/nwc-regtest.ts`, `tests/integration/nwc_regtest_environment.test.ts`, and `docs/nwc-regtest-environment.md`. |
| NWC connection design drift | Update `docs/nwc-wallet-connection.md` and dependent issue acceptance criteria. |
| Deno test harness drift | Update `tests/README.md`, `deno.json`, and `scripts/test-all.sh` together. |
| Package-manager, CI command, deploy, or README command drift | Update `package.json`, `deno.json`, `.github/workflows/gh-pages.yml`, `docs/development.md`, and README examples in the same change. |

## Residual Review

After the harness passes, human review should focus on decisions that cannot be
reduced to deterministic checks yet: product scope, security risk acceptance,
public vocabulary, dependency policy, and browser workflow expectations.
