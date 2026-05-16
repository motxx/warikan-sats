# Migrate from Yarn to Deno client distribution

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

maintenance

## Dependencies

Depends on:
- None

Blocks:
- 0004-design-nwc-wallet-connection
- 0009-add-deno-test-foundation
- 0010-add-deno-ci-workflow
- 0007-add-nwc-regtest-warikan-e2e

## Summary

Remove the Yarn-centered application and harness flow, and make the project
buildable and testable with Deno-native commands while preserving a
client-only deployment model.

## Rationale

The current repository is a Vite/Ionic app with Yarn-based scripts and GitHub
Pages deployment. The target architecture is client plus user-managed Lightning
wallet, with no operator-run backend. Deno should become the supported local
tooling and harness runtime, but deployment must remain compatible with static
client distribution or another backend-free hosting model.

## Plan

- Decide the Deno-based client build and local harness shape.
- Replace Yarn scripts with Deno tasks and update the local quality gate.
- Update CI and deployment documentation for backend-free client hosting.
- Preserve or replace the current browser UI build path deliberately.
- Add a static client smoke check to `docs/review-harness.md`.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `deno.json`
- `package.json`
- `scripts/test-all.sh`
- `scripts/git-hooks/pre-commit`
- `scripts/check-no-local-paths.ts`
- `scripts/lint-types.ts`
- `scripts/lint-no-dynamic-import.ts`
- `README.md`
- `docs/development.md`
- `docs/review-harness.md`
- `docs/issues/README.md`
- `skills/make-issues/SKILL.md`
- `skills/resolve-issues/SKILL.md`

Verified with:

- `deno task lint:strict`
- `deno task test:all`
- `deno task test:all:docker`

Harness update:

- `deno.json` and `scripts/test-all.sh` now make Deno tasks the local quality
  gate.

Review residuals:

- GitHub Actions is still Yarn-oriented and remains tracked by
  `docs/issues/pending/0010-add-deno-ci-workflow.md`.

Follow-up:

- None
