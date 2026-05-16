# Hide empty invoice QR placeholder

Created: 2026-05-16
Model: GPT-5 Codex

## Priority

design

## Dependencies

Depends on:
- None

Blocks:
- None

## Summary

Do not show the blurred placeholder QR before an invoice exists. Replace it
with a clear empty state or hide the QR area until a split invoice is created.

## Rationale

First-look QA showed a blurred QR below `START SPLIT` even before invoice
generation. This can read as partially generated payment data and makes the
initial payment screen feel confusing.

## Plan

- Update `InvoiceGenerator` or `InvoiceQRCodeOutput` so empty invoice data does
  not render as a blurred QR by default.
- Keep real generated invoices visible and scannable.
- Add a focused UI test for the pre-invoice empty state.

Completed: 2026-05-16

## Resolution

Implemented by updating:

- `src/components/templates/Payment/InvoiceGenerator.tsx`
- `src/components/templates/Payment/InvoiceGenerator/InvoiceQRCodeOutput.tsx`
- `src/components/templates/Payment/InvoiceGenerator.test.tsx`

Verified with:

- `deno task test:ui`
- `deno task lint:strict`
- `deno task test:deploy:deno`
- `Cypress mobile first-run smoke`

Harness update:

- `src/components/templates/Payment/InvoiceGenerator.test.tsx` now asserts no
  QR canvas renders before a split is created.

Review residuals:

- None

Follow-up:

- None
