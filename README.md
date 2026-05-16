# warikan-sats

## Overview

"Warikan" is a Japanese term that refers to splitting the cost of a meal or activity equally among a group of people.
With this "warikan" app, you can equally split the Fiat amount and issue invoices in BTC (sats).

## Development

### Run Locally

This project uses Deno tasks. Install Deno, then start the Vite development
server:

```sh
deno task dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173/
```

The app is designed for smartphone-sized screens. To test it from a phone on
the same network, bind the dev server to your local network interface:

```sh
deno task dev --host 0.0.0.0
```

Then open `http://<your-computer-lan-ip>:5173/` from the phone.

To check the production build locally:

```sh
deno task build
deno task preview
```

### Quality Checks

```sh
deno task lint:strict
deno task test:all
deno task test:e2e:regtest
```

CI runs the same Deno local quality gate with `deno task ci`, runs the NWC
regtest E2E gate separately, and verifies the Deno Deploy static hosting
artifact.

Issues are tracked in `docs/issues`. See `docs/issues/README.md` for the
file-based workflow and `docs/review-harness.md` for how review findings should
be routed into automated checks.

Deno Deploy is the production static hosting target. See
`docs/deno-deploy-static.md` for the no-backend deployment boundary and setup
commands.

## LICENSE

MIT
