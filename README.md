# warikan-sats

## Overview

"Warikan" is a Japanese term that refers to splitting the cost of a meal or activity equally among a group of people.
With this "warikan" app, you can equally split the Fiat amount and issue invoices in BTC (sats).

## Development

```sh
deno task lint:strict
deno task test:all
deno task test:e2e:regtest
```

CI runs the same Deno local quality gate with `deno task ci`, runs the NWC
regtest E2E gate separately, and builds the static client from `dist` for
GitHub Pages.

Issues are tracked in `docs/issues`. See `docs/issues/README.md` for the
file-based workflow and `docs/review-harness.md` for how review findings should
be routed into automated checks.

## LICENSE

MIT
