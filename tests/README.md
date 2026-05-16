# Tests

The test harness is Deno-first.

## Layout

- `tests/unit`: Deno unit tests for pure logic, state machines, and protocol
  adapters.
- `tests/integration`: Deno integration tests that may compose multiple local
  modules but do not require the regtest wallet stack.
- `tests/helpers`: shared fakes and test utilities.
- `src/**/*.test.tsx`: existing UI smoke tests that still run through Vitest
  under `deno task test:ui`.

## Commands

```sh
deno task test:unit
deno task test:integration
deno task test:ui
deno task test:e2e:regtest
deno task test:all
```

`test:e2e:regtest` is a named placeholder until
`docs/issues/pending/0006-add-nwc-regtest-wallet-environment.md` and
`docs/issues/pending/0007-add-nwc-regtest-warikan-e2e.md` are implemented.

## NWC Tests

Connector tests should use `tests/helpers/fake_nwc_wallet.ts` unless a test is
explicitly part of the regtest E2E harness. Unit tests must not require a live
wallet, relay, or internet access.
