# Add NWC regtest wallet environment

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

maintenance

## Dependencies

Depends on:
- None

Blocks:
- 0007-add-nwc-regtest-warikan-e2e

## Summary

Add a reproducible local regtest wallet environment for exercising NWC invoice
creation and payment settlement.

## Rationale

Real wallet behavior needs integration coverage that does not depend on
external infrastructure or mainnet funds. A local regtest setup should provide
an NWC-compatible receiving wallet, payer wallets or payment helpers, and
deterministic connection details for the app and E2E harness.

## Plan

- Choose the regtest stack, wallet topology, and NWC service.
- Add start, stop, status, and reset commands.
- Document relay, wallet connection strings, ports, credentials, and generated
  local artifacts without committing secrets.
- Add health checks that prove the NWC wallet and payer wallets are ready before
  tests run.
- Route NWC regtest failures through `docs/review-harness.md`.
