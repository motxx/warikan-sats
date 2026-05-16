# Lightning Regtest Containers

The real regtest smoke harness starts Docker containers for:

- Bitcoin Core in `regtest` mode.
- Core Lightning receiver node.
- Core Lightning payer node.

The harness mines regtest blocks, funds the payer node, opens a channel to the
receiver node, creates a Lightning invoice on the receiver, pays it from the
payer, and asserts that the invoice reaches the paid state.

## Commands

```sh
deno task regtest:lightning:start
deno task regtest:lightning:health
deno task regtest:lightning:status
deno task regtest:lightning:smoke
deno task regtest:lightning:stop
deno task regtest:lightning:reset
```

`deno task test:e2e:regtest` runs the smoke test and stops containers in a
finally block. `deno task test:all:docker` delegates to that same smoke path.

## Scope

This harness proves real Lightning invoice settlement on regtest. It is not an
NWC bridge. The fake NWC harness remains available as `deno task
test:e2e:nwc-fake` for client contract coverage.
