import React from "react";
import { GenerateInvoiceButton } from "./InvoiceGenerator/GenerateInvoiceButton";
import {
  InvoiceInputForm,
  type InvoiceInputValue,
} from "./InvoiceGenerator/InvoiceInputForm";
import { InvoiceQRCodeOutput } from "./InvoiceGenerator/InvoiceQRCodeOutput";
import { generateInvoice } from "../../../services/invoice";
import {
  confirmActiveSplitInvoice,
  createSplitInvoiceSequence,
  getActiveSplitInvoice,
  retryActiveSplitInvoice,
  type SplitInvoiceClient,
  type SplitInvoiceSequence,
} from "../../../services/splitInvoiceSequence";

type Props = {};
export const EmptyInvoiceData =
  "EMPTY00u1pj5fxaspp5dcqac89l07nhx3l6j7f5yhhhrsukzmt5433jt42kkaj3kcpp9kaqdqcu2d2rc56583f4g0zn2s79x4pcqzzsxqyz5vqsp5wtssdh7adu4q60pkxapqqnnep5ravsgcwxcmw664ggfslkllkvds9qyyssq9pl8npevwmpk8tz800sxeq2rt3quaxpvk89yt36zlnx0rudj7cy3jgmkr3du0l5whz32fgswm0tzzcf6tacg4lhh46tsg6asy4664acpfpr3p3";

export const InvoiceGenerator: React.FC<Props> = ({}) => {
  const [input, setInput] = React.useState<InvoiceInputValue>({
    amount: 0,
    participantCount: 1,
    notes: "",
  });
  const [sequence, setSequence] = React.useState<SplitInvoiceSequence | null>(
    null,
  );
  const [status, setStatus] = React.useState("");
  const paidHashes = React.useRef(new Set<string>());
  const nextInvoiceId = React.useRef(1);

  const client = React.useMemo<SplitInvoiceClient>(() => ({
    createInvoice: (invoiceInput) => {
      const id = nextInvoiceId.current++;
      return Promise.resolve({
        invoice: `${generateInvoice(BigInt(invoiceInput.amountMsats))}_p${id}`,
        paymentHash: `local-payment-hash-${id}`,
        amountMsats: invoiceInput.amountMsats,
      });
    },
    lookupInvoice: (lookupInput) =>
      Promise.resolve({
        state: lookupInput.paymentHash &&
            paidHashes.current.has(lookupInput.paymentHash)
          ? "settled"
          : "pending",
        settledAt: lookupInput.paymentHash &&
            paidHashes.current.has(lookupInput.paymentHash)
          ? Math.floor(Date.now() / 1000)
          : undefined,
      }),
  }), []);

  const activeInvoice = sequence ? getActiveSplitInvoice(sequence) : null;
  const invoiceData = activeInvoice?.invoice ?? EmptyInvoiceData;

  const startSplit = async () => {
    setStatus("Creating invoices");
    setSequence(null);
    paidHashes.current.clear();
    nextInvoiceId.current = 1;
    try {
      const created = await createSplitInvoiceSequence({
        amountMsats: input.amount * 1_000,
        participantCount: input.participantCount,
        note: input.notes,
      }, client);
      setSequence(created);
      setStatus("Waiting for payment");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  };

  const checkPayment = async () => {
    if (!sequence) return;
    setStatus("Checking payment");
    const updated = await confirmActiveSplitInvoice(sequence, client);
    setSequence(updated);
    setStatus(statusForSequence(updated));
  };

  const markPaid = async () => {
    if (!activeInvoice) return;
    paidHashes.current.add(activeInvoice.paymentHash);
    await checkPayment();
  };

  const retry = async () => {
    if (!sequence) return;
    const updated = await retryActiveSplitInvoice(sequence, client);
    setSequence(updated);
    setStatus(statusForSequence(updated));
  };

  return (
    <div className="flex flex-col place-items-center gap-5 w-full">
      <InvoiceInputForm onChange={setInput} />
      <div className="w-full pt-[5%] pb-[5%]">
        <GenerateInvoiceButton
          disabled={input.amount <= 0 || sequence?.status === "checking"}
          onGenerate={startSplit}
        />
      </div>
      <div className="grid grid-cols-1 place-items-center gap-3 w-full">
        {sequence && activeInvoice
          ? (
            <div className="text-center text-white text-sm font-semibold">
              Participant {activeInvoice.participantIndex} of{" "}
              {sequence.participantCount}
              <div className="text-xs font-normal">
                {activeInvoice.amountMsats / 1_000} sats
              </div>
            </div>
          )
          : null}
        <InvoiceQRCodeOutput
          invoiceData={invoiceData}
          muted={!activeInvoice || sequence?.status === "completed"}
        />
        <div className="min-h-[1.5rem] text-xs text-white text-center">
          {sequence?.status === "completed" ? "All paid" : status}
        </div>
        {activeInvoice && sequence?.status !== "completed"
          ? (
            <div className="grid grid-cols-2 gap-2 w-4/5">
              <GenerateInvoiceButton
                label="CHECK PAYMENT"
                disabled={sequence?.status === "checking"}
                onGenerate={checkPayment}
              />
              <GenerateInvoiceButton
                label="MARK PAID"
                disabled={sequence?.status === "checking"}
                onGenerate={markPaid}
              />
            </div>
          )
          : null}
        {sequence?.status === "failed"
          ? (
            <div className="w-4/5">
              <GenerateInvoiceButton label="RETRY" onGenerate={retry} />
            </div>
          )
          : null}
      </div>
    </div>
  );
};

function statusForSequence(sequence: SplitInvoiceSequence): string {
  if (sequence.status === "completed") return "All paid";
  if (sequence.status === "failed") return sequence.error ?? "Payment failed";
  return "Waiting for payment";
}
