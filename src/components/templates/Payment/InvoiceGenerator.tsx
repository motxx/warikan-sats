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
import {
  type BitcoinConnectClient,
  createBitcoinConnectNwcClient,
} from "../../../services/bitcoinConnect";

type Props = {
  walletConnector?: WalletConnectionClient;
  bitcoinConnectClient?: BitcoinConnectClient;
};

export interface WalletConnectionClient extends SplitInvoiceClient {
  connect(connectionString: string): Promise<NwcConnectionStatus>;
  restore(): Promise<NwcConnectionStatus>;
  disconnect(): Promise<void>;
}

export const InvoiceGenerator: React.FC<Props> = ({
  walletConnector,
  bitcoinConnectClient,
}) => {
  const [input, setInput] = React.useState<InvoiceInputValue>({
    amount: 0,
    participantCount: 1,
    notes: "",
  });
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
  const bitcoinConnect = React.useMemo<BitcoinConnectClient>(
    () => bitcoinConnectClient ?? createBitcoinConnectNwcClient(),
    [bitcoinConnectClient],
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
  const isWalletReady = walletStatus === "ready";
  const walletStatusLabel = isWalletReady
    ? "Ready"
    : walletStatus === "checking"
    ? "Checking"
    : "Needs wallet";
  const progressPercent = activeInvoice && sequence
    ? Math.round(
      (activeInvoice.participantIndex / sequence.participantCount) *
        100,
    )
    : sequence?.status === "completed"
    ? 100
    : 0;

  const connectWithBitcoinConnect = async () => {
    setSequence(null);
    setStatus("");
    setWalletStatus("checking");
    setWalletMessage(nwcConnectionStatusMessage("checking"));

    try {
      const connectedStatus = await client.connect(
        await bitcoinConnect.connect(),
      );
      setWalletStatus(connectedStatus);
      setWalletMessage(nwcConnectionStatusMessage(connectedStatus));
    } catch (error) {
      setWalletStatus("error");
      setWalletMessage(paymentErrorMessage(error));
    }
  };

  const disconnectWallet = async () => {
    await client.disconnect();
    await bitcoinConnect.disconnect();
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
    <div className="flex w-full flex-col items-stretch gap-5 pb-4">
      <header className="w-full">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#a05a00]">
          Warikan Sats
        </div>
        <h1 className="m-0 mt-2 text-[2rem] font-extrabold leading-tight text-[#1e231f]">
          Split in sats
        </h1>
        <p className="mt-2 text-[0.98rem] leading-6 text-[#5c675d]">
          Create one Lightning invoice per person and collect payments in order.
        </p>
      </header>
      <section className="grid w-full grid-cols-1 gap-3 rounded-[20px] border border-[#d7e1d4] bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-bold text-[#1e231f]">
                Wallet
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-bold ${
                  isWalletReady
                    ? "bg-[#dff5df] text-[#166534]"
                    : walletStatus === "checking"
                    ? "bg-[#eef2e8] text-[#52612f]"
                    : "bg-[#f8d7ce] text-[#9a3412]"
                }`}
              >
                {walletStatusLabel}
              </span>
            </div>
            <div
              className="mt-2 min-h-[1.25rem] text-sm leading-5 text-[#5c675d]"
              role="status"
            >
              {walletMessage}
            </div>
          </div>
          {isWalletReady
            ? (
              <div className="w-28 shrink-0">
                <GenerateInvoiceButton
                  label="Disconnect"
                  onGenerate={disconnectWallet}
                  variant="secondary"
                />
              </div>
            )
            : null}
        </div>
        {isWalletReady ? null : (
          <GenerateInvoiceButton
            label="Connect wallet"
            disabled={walletStatus === "checking"}
            onGenerate={connectWithBitcoinConnect}
          />
        )}
      </section>
      {isWalletReady
        ? (
          <>
            <InvoiceInputForm onChange={setInput} />
            <div className="w-full">
              <GenerateInvoiceButton
                disabled={input.amount <= 0 || sequence?.status === "checking"}
                onGenerate={startSplit}
              />
            </div>
          </>
        )
        : null}
      <div className="grid w-full grid-cols-1 place-items-center gap-3">
        {sequence && activeInvoice
          ? (
            <div className="w-full rounded-[20px] border border-[#d7e1d4] bg-white p-4 text-center">
              <div className="flex items-center justify-between gap-3 text-left">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#a05a00]">
                    Collecting payment
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-[#1e231f]">
                    Person {activeInvoice.participantIndex} of{" "}
                    {sequence.participantCount}
                  </div>
                </div>
                <div className="rounded-full bg-[#1e231f] px-3 py-1 text-xs font-bold text-white">
                  {activeInvoice.participantIndex}/{sequence.participantCount}
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#d7e1d4]">
                <div
                  className="h-full rounded-full bg-[#0f766e]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-4 text-3xl font-extrabold leading-none text-[#1e231f]">
                {activeInvoice.amountMsats / 1_000} sats
              </div>
              <div className="mt-1 text-sm text-[#5c675d]">
                Show this invoice to the person paying now.
              </div>
            </div>
          )
          : null}
        {activeInvoice
          ? <InvoiceQRCodeOutput invoiceData={activeInvoice.invoice} />
          : null}
        <div className="min-h-[1.5rem] text-center text-sm font-medium leading-5 text-[#354036]">
          {sequence?.status === "completed" ? "All paid" : status}
        </div>
        {activeInvoice && sequence?.status !== "completed"
          ? (
            <div className="w-full">
              <GenerateInvoiceButton
                label="Check payment"
                disabled={sequence?.status === "checking"}
                onGenerate={checkPayment}
              />
            </div>
          )
          : null}
        {sequence?.status === "failed"
          ? (
            <div className="w-full">
              <GenerateInvoiceButton label="Retry invoice" onGenerate={retry} />
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
