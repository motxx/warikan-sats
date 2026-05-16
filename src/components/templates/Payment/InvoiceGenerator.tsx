import React from "react";
import { GenerateInvoiceButton } from "./InvoiceGenerator/GenerateInvoiceButton";
import {
  InvoiceInputForm,
  type InvoiceInputValue,
} from "./InvoiceGenerator/InvoiceInputForm";
import { InvoiceQRCodeOutput } from "./InvoiceGenerator/InvoiceQRCodeOutput";
import {
  type NwcConnectionStatus,
  nwcConnectionStatusMessage,
} from "../../../services/nwc";
import { createMainnetNwcConnector } from "../../../services/nwcMainnet";
import {
  confirmActiveSplitInvoice,
  createSplitInvoiceSequence,
  getActiveSplitInvoice,
  retryActiveSplitInvoice,
  type SplitInvoiceClient,
  type SplitInvoiceSequence,
} from "../../../services/splitInvoiceSequence";

type Props = {
  walletConnector?: WalletConnectionClient;
};

export interface WalletConnectionClient extends SplitInvoiceClient {
  connect(connectionString: string): Promise<NwcConnectionStatus>;
  restore(): Promise<NwcConnectionStatus>;
  disconnect(): Promise<void>;
}

export const EmptyInvoiceData =
  "EMPTY00u1pj5fxaspp5dcqac89l07nhx3l6j7f5yhhhrsukzmt5433jt42kkaj3kcpp9kaqdqcu2d2rc56583f4g0zn2s79x4pcqzzsxqyz5vqsp5wtssdh7adu4q60pkxapqqnnep5ravsgcwxcmw664ggfslkllkvds9qyyssq9pl8npevwmpk8tz800sxeq2rt3quaxpvk89yt36zlnx0rudj7cy3jgmkr3du0l5whz32fgswm0tzzcf6tacg4lhh46tsg6asy4664acpfpr3p3";

export const InvoiceGenerator: React.FC<Props> = ({ walletConnector }) => {
  const [input, setInput] = React.useState<InvoiceInputValue>({
    amount: 0,
    participantCount: 1,
    notes: "",
  });
  const [connectionString, setConnectionString] = React.useState("");
  const [walletStatus, setWalletStatus] = React.useState<NwcConnectionStatus>(
    "checking",
  );
  const [walletMessage, setWalletMessage] = React.useState(
    nwcConnectionStatusMessage("checking"),
  );
  const [sequence, setSequence] = React.useState<SplitInvoiceSequence | null>(
    null,
  );
  const [status, setStatus] = React.useState("");

  const client = React.useMemo<WalletConnectionClient>(
    () => walletConnector ?? createMainnetNwcConnector(),
    [walletConnector],
  );

  React.useEffect(() => {
    let cancelled = false;

    const restoreWallet = async () => {
      const restoredStatus = await client.restore();
      if (cancelled) return;
      setWalletStatus(restoredStatus);
      setWalletMessage(nwcConnectionStatusMessage(restoredStatus));
    };

    restoreWallet().catch(() => {
      if (cancelled) return;
      setWalletStatus("error");
      setWalletMessage(nwcConnectionStatusMessage("error"));
    });

    return () => {
      cancelled = true;
    };
  }, [client]);

  const activeInvoice = sequence ? getActiveSplitInvoice(sequence) : null;
  const invoiceData = activeInvoice?.invoice ?? EmptyInvoiceData;

  const connectWallet = async () => {
    const submitted = connectionString.trim();
    setConnectionString("");
    setSequence(null);
    setStatus("");

    if (!submitted) {
      setWalletStatus("missing");
      setWalletMessage(nwcConnectionStatusMessage("missing"));
      return;
    }

    setWalletStatus("checking");
    setWalletMessage(nwcConnectionStatusMessage("checking"));
    const connectedStatus = await client.connect(submitted);
    setWalletStatus(connectedStatus);
    setWalletMessage(nwcConnectionStatusMessage(connectedStatus));
  };

  const disconnectWallet = async () => {
    await client.disconnect();
    setConnectionString("");
    setSequence(null);
    setStatus("");
    setWalletStatus("missing");
    setWalletMessage(nwcConnectionStatusMessage("missing"));
  };

  const startSplit = async () => {
    if (walletStatus !== "ready") {
      setStatus(nwcConnectionStatusMessage(walletStatus));
      return;
    }

    setStatus("Creating invoices");
    setSequence(null);
    try {
      const created = await createSplitInvoiceSequence({
        amountMsats: input.amount * 1_000,
        participantCount: input.participantCount,
        note: input.notes,
      }, client);
      setSequence(created);
      setStatus("Waiting for payment");
    } catch (error) {
      setStatus(paymentErrorMessage(error));
    }
  };

  const checkPayment = async () => {
    if (!sequence) return;
    setStatus("Checking payment");
    const updated = await confirmActiveSplitInvoice(sequence, client);
    setSequence(updated);
    setStatus(statusForSequence(updated));
  };

  const retry = async () => {
    if (!sequence) return;
    const updated = await retryActiveSplitInvoice(sequence, client);
    setSequence(updated);
    setStatus(statusForSequence(updated));
  };

  return (
    <div className="flex flex-col place-items-center gap-5 w-full">
      <section className="w-full grid grid-cols-1 gap-3 text-white">
        <label
          className="text-xs font-semibold"
          htmlFor="nwc-connection-string"
        >
          Nostr Wallet Connect
        </label>
        <textarea
          id="nwc-connection-string"
          aria-label="Nostr Wallet Connect connection string"
          className="min-h-[5rem] w-full resize-y rounded border border-white/30 bg-transparent p-3 text-xs text-white placeholder:text-white/50"
          value={connectionString}
          onChange={(event) => setConnectionString(event.target.value)}
          placeholder="nostr+walletconnect://..."
          spellCheck={false}
        />
        <div className="grid grid-cols-2 gap-2">
          <GenerateInvoiceButton
            label="CONNECT WALLET"
            disabled={walletStatus === "checking"}
            onGenerate={connectWallet}
          />
          <GenerateInvoiceButton
            label="DISCONNECT"
            disabled={walletStatus === "checking" || walletStatus === "missing"}
            onGenerate={disconnectWallet}
          />
        </div>
        <div className="min-h-[1.25rem] text-xs" role="status">
          {walletMessage}
        </div>
      </section>
      <InvoiceInputForm onChange={setInput} />
      <div className="w-full pt-[5%] pb-[5%]">
        <GenerateInvoiceButton
          disabled={walletStatus !== "ready" || input.amount <= 0 ||
            sequence?.status === "checking"}
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
            <div className="w-4/5">
              <GenerateInvoiceButton
                label="CHECK PAYMENT"
                disabled={sequence?.status === "checking"}
                onGenerate={checkPayment}
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

function paymentErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(
    /nostr\+walletconnect:\/\/\S+/g,
    "[wallet connection]",
  );
}
