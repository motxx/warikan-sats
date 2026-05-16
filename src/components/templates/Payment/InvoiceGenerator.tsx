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
  const [showManualConnection, setShowManualConnection] = React.useState(false);

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

  const connectWithBitcoinConnect = async () => {
    setConnectionString("");
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
      setShowManualConnection(connectedStatus !== "ready");
    } catch (error) {
      setWalletStatus("error");
      setWalletMessage(paymentErrorMessage(error));
    }
  };

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
    await bitcoinConnect.disconnect();
    setConnectionString("");
    setSequence(null);
    setStatus("");
    setShowManualConnection(false);
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
      <header className="w-full text-white">
        <h1 className="m-0 text-[1.75rem] font-bold leading-tight">
          割り勘回収
        </h1>
        <p className="mt-2 text-[0.95rem] leading-6 text-white/75">
          受け取り用ウォレットをつなぎ、参加者ごとの請求を順番に確認します。
        </p>
      </header>
      <section className="grid w-full grid-cols-1 gap-3 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Nostr Wallet Connect</div>
            <div
              className="mt-1 min-h-[1.25rem] text-sm leading-5"
              role="status"
            >
              {walletMessage}
            </div>
          </div>
          {isWalletReady
            ? (
              <div className="w-32 shrink-0">
                <GenerateInvoiceButton
                  label="DISCONNECT"
                  onGenerate={disconnectWallet}
                />
              </div>
            )
            : null}
        </div>
        {isWalletReady ? null : (
          <>
            <GenerateInvoiceButton
              label="ウォレットを接続"
              disabled={walletStatus === "checking"}
              onGenerate={connectWithBitcoinConnect}
            />
            <button
              type="button"
              className="min-h-11 rounded-lg border border-white/25 px-3 text-sm font-semibold text-white"
              onClick={() => setShowManualConnection((visible) => !visible)}
            >
              NWC文字列で接続
            </button>
            {showManualConnection
              ? (
                <>
                  <label className="sr-only" htmlFor="nwc-connection-string">
                    Nostr Wallet Connect
                  </label>
                  <textarea
                    id="nwc-connection-string"
                    aria-label="Nostr Wallet Connect connection string"
                    className="min-h-[4.5rem] w-full resize-y rounded-lg border border-white/30 bg-transparent p-3 text-base leading-5 text-white placeholder:text-white/50"
                    value={connectionString}
                    onChange={(event) =>
                      setConnectionString(event.target.value)}
                    placeholder="nostr+walletconnect://..."
                    spellCheck={false}
                  />
                  <GenerateInvoiceButton
                    label="CONNECT"
                    disabled={walletStatus === "checking"}
                    onGenerate={connectWallet}
                  />
                </>
              )
              : null}
          </>
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
            <div className="text-center text-sm font-semibold text-white">
              Participant {activeInvoice.participantIndex} of{" "}
              {sequence.participantCount}
              <div className="text-xs font-normal">
                {activeInvoice.amountMsats / 1_000} sats
              </div>
            </div>
          )
          : null}
        {activeInvoice
          ? <InvoiceQRCodeOutput invoiceData={activeInvoice.invoice} />
          : null}
        <div className="min-h-[1.5rem] text-center text-sm leading-5 text-white">
          {sequence?.status === "completed" ? "All paid" : status}
        </div>
        {activeInvoice && sequence?.status !== "completed"
          ? (
            <div className="w-full">
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
            <div className="w-full">
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
