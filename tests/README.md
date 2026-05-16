# Tests

The test harness is Deno-first.

## Layout

- `tests/unit`: Deno unit tests for pure logic, state machines, and protocol
  adapters.
- `tests/integration`: Deno integration tests that may compose multiple local
  modules but do not require the regtest wallet stack.
- `tests/e2e`: Deno end-to-end tests that start the local NWC regtest wallet
  environment and complete user workflows through the client service contracts.
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

`test:e2e:regtest` starts the local NWC regtest wallet environment in a
temporary directory and completes a multi-participant split-payment flow.

## NWC Tests

Connector tests should use `tests/helpers/fake_nwc_wallet.ts` unless a test is
explicitly part of the regtest E2E harness. Unit tests must not require a live
wallet, relay, or internet access.
