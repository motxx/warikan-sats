# Deno Deploy Static Hosting

Warikan Sats may be hosted on Deno Deploy as a static single-page application.
This does not change the runtime architecture: the app remains client-only and
must not introduce an operator-run backend.

## Architecture Boundary

Allowed:

- Static files generated into `dist`.
- Browser-side NWC connections supplied by the user.
- Browser-side access to user-selected NWC relays and wallets.
- SPA fallback to `index.html`.

Not allowed:

- Server entrypoints, API routes, or SSR handlers.
- Operator-owned invoice creation or wallet credentials.
- Deno KV, databases, queues, cron jobs, or payment state managed by the
  operator.
- Logging or forwarding NWC connection strings, secrets, invoices, preimages,
  or wallet metadata to an operator service.

## Build

Use the Deno Deploy build task for root-path static hosting:

```sh
deno task build:deno-deploy
```

The task sets `VITE_BASE_PATH=/`, runs the normal TypeScript and Vite build, and
copies `dist/index.html` to `dist/404.html` for static SPA fallback
compatibility.

Validate the deployment artifact with:

```sh
deno task test:deploy:deno
```

This check rebuilds the root-path artifact and verifies that the generated HTML
and JavaScript do not contain the legacy `/warikan-sats/` subpath.

## Deno Deploy App Settings

Use the current Deno Deploy product, not Deno Deploy Classic. Classic is a
legacy product and is scheduled for shutdown by Deno.

Create the app as a static site:

```sh
deno deploy create \
  --org <org> \
  --app <app> \
  --source github \
  --owner <github-owner> \
  --repo <github-repo> \
  --runtime-mode static \
  --static-dir dist \
  --single-page-app \
  --build-command "deno task build:deno-deploy" \
  --build-timeout 10 \
  --build-memory-limit 2048 \
  --region global
```

If configuring through the dashboard, use equivalent settings:

- Runtime mode: static.
- Build command: `deno task build:deno-deploy`.
- Static directory: `dist`.
- Single-page app fallback: enabled.
- Server entrypoint: none.
