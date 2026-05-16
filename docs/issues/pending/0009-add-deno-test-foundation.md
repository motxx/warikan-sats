# Add Deno test foundation

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

maintenance

## Dependencies

Depends on:
- 0003-migrate-from-yarn-to-deno-client-distribution

Blocks:
- 0010-add-deno-ci-workflow
- 0008-implement-nwc-wallet-connector
- 0005-add-sequential-split-invoice-ui
- 0007-add-nwc-regtest-warikan-e2e

## Summary

Create the Deno-native test foundation that later NWC connector, invoice UI,
and regtest E2E tests will use.

## Rationale

After the project moves away from Yarn-centered tooling, feature issues should
not each invent their own test conventions. The repository needs a common
layout, command set, mock strategy, and CI routing for Deno unit, integration,
and E2E tests before the NWC and split-payment work starts.

## Plan

- Define test directories, naming conventions, and Deno task entrypoints.
- Decide how UI or DOM-oriented tests should run under Deno.
- Add shared fakes or helpers for NWC connector tests without requiring a live
  wallet.
- Separate unit, integration, and regtest E2E commands in the harness.
- Document expected CI routing and update `docs/review-harness.md` so each test
  class has a clear owner.
- Document how existing Vitest or Cypress coverage should be migrated or
  retired.
