# Add sequential split invoice UI

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

feature

## Dependencies

Depends on:
- 0008-implement-nwc-wallet-connector
- 0009-add-deno-test-foundation

Blocks:
- 0007-add-nwc-regtest-warikan-e2e

## Summary

Create one invoice and QR code per participant, then show the next invoice only
after the current participant has paid.

## Rationale

The split-payment flow should represent separate Lightning invoices for each
person instead of one shared invoice. A sequential UI makes the current payer,
amount, QR code, and payment state clear, and gives the app an explicit place
to poll or subscribe for settlement before advancing.

## Plan

- Update the payment form to accept the target participant count.
- Create and store one invoice record per participant for the split amount.
- Render the active participant's invoice and QR code only.
- Advance to the next invoice after payment confirmation.
- Add loading, failure, retry, completed, and all-paid states.
- Add focused unit tests for the invoice sequence state machine.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/services/splitInvoiceSequence.ts`
- `tests/unit/split_invoice_sequence.test.ts`
- `src/components/templates/Payment/InvoiceGenerator.tsx`
- `src/components/templates/Payment/InvoiceGenerator/GenerateInvoiceButton.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceInputForm.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceInputForm/WarikanArgsInput.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceQRCodeOutput.tsx`
- `src/components/atoms/buttons/PrimaryButton.tsx`
- `tsconfig.json`

Verified with:

- `deno task lint:strict`
- `deno task test:unit`
- `deno task check`
- `deno task test:ui`

Harness update:

- Added `tests/unit/split_invoice_sequence.test.ts` to cover per-participant
  invoice creation, pending payment behavior, settlement advancement, retry,
  completed state, and input validation.

Review residuals:

- The UI currently uses a local client for manual payment confirmation. Real
  NWC relay settlement is tracked by `0011-connect-nwc-on-mainnet` and the
  browser regtest flow by `0007-add-nwc-regtest-warikan-e2e`.

Follow-up:

- `0007-add-nwc-regtest-warikan-e2e` should cover completing this flow with
  multiple participants.
