# NWC Regtest Environment

The local NWC regtest environment is a deterministic, file-backed wallet
harness for connector and split-payment tests. It does not talk to mainnet,
does not require an operator backend, and does not hold funds. Its job is to
give the client and E2E tests stable NWC-shaped wallet behavior before the
browser flow is exercised by `docs/issues/pending/0007-add-nwc-regtest-warikan-e2e.md`.

## Stack

- A fake receiving NWC wallet with `make_invoice`, `lookup_invoice`, and
  `get_balance` capabilities.
- Three payer helpers with `pay_invoice`, `lookup_invoice`, and `get_balance`
  capabilities.
- A deterministic relay URL, `ws://127.0.0.1:39735`, and NWC service URL,
  `http://127.0.0.1:39736`, reserved for the local harness.
- Generated state in `.local/nwc-regtest/state.json`. The `.local/` directory
  is gitignored.

## Commands

```sh
deno task regtest:nwc:start
deno task regtest:nwc:health
deno task regtest:nwc:status
deno task regtest:nwc:reset
deno task regtest:nwc:stop
```

`start` creates the state file and prints the receiving wallet connection
string. `health` fails if the receiver, payer helpers, or required capabilities
are missing. `reset` clears invoices and restores deterministic wallet state.
`stop` removes the generated local state.

For manual harness checks, the script also supports:

```sh
deno run --allow-read --allow-write scripts/nwc-regtest.ts invoice 42000 "participant 1"
deno run --allow-read --allow-write scripts/nwc-regtest.ts settle regtest-payment-hash-1
```

## Artifacts

The only generated artifact is `.local/nwc-regtest/state.json`. It contains
deterministic test wallet labels, balances, capabilities, connection details,
and fake invoice state. Do not commit this file. If a future real regtest stack
adds credentials or node data, keep them under `.local/nwc-regtest/` or another
ignored path.

## Review Routing

Failures in start, stop, status, reset, or health belong to this environment
and should update this document, `scripts/nwc-regtest.ts`, or
`tests/integration/nwc_regtest_environment.test.ts`. Full browser split-payment
failures belong to issue `0007`.
