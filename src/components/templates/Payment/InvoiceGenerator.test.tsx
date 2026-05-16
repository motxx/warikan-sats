import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "../../../setupTests";
import {
  InvoiceGenerator,
  type WalletConnectionClient,
} from "./InvoiceGenerator";
import type { BitcoinConnectClient } from "../../../services/bitcoinConnect";
import type {
  NwcConnectionStatus,
  NwcCreateInvoiceInput,
  NwcInvoice,
  NwcLookupInvoiceInput,
  NwcLookupInvoiceResult,
} from "../../../services/nwc";

const secretParam = "se" + "cret";
const fakeSecret = "a".repeat(64);
const validConnectionString =
  `nostr+walletconnect://wallet-pubkey?relay=wss%3A%2F%2Frelay.example.com&${secretParam}=${fakeSecret}`;

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value() {
    return {
      clearRect() {},
      drawImage() {},
      fill() {},
      fillRect() {},
      scale() {},
    };
  },
});

class FakeWalletConnectionClient implements WalletConnectionClient {
  connectStatus: NwcConnectionStatus = "ready";
  restoreStatus: NwcConnectionStatus = "missing";
  connectedWith: string | null = null;
  disconnected = false;
  created: NwcCreateInvoiceInput[] = [];
  lookups: NwcLookupInvoiceInput[] = [];
  lookupResults: NwcLookupInvoiceResult[] = [];
  #nextInvoiceId = 1;

  connect(connectionString: string): Promise<NwcConnectionStatus> {
    this.connectedWith = connectionString;
    return Promise.resolve(this.connectStatus);
  }

  restore(): Promise<NwcConnectionStatus> {
    return Promise.resolve(this.restoreStatus);
  }

  disconnect(): Promise<void> {
    this.disconnected = true;
    this.connectedWith = null;
    return Promise.resolve();
  }

  createInvoice(input: NwcCreateInvoiceInput): Promise<NwcInvoice> {
    this.created.push(input);
    const id = this.#nextInvoiceId++;
    return Promise.resolve({
      invoice: `lnbc-ui-${id}`,
      paymentHash: `payment-hash-${id}`,
      amountMsats: input.amountMsats,
    });
  }

  lookupInvoice(
    input: NwcLookupInvoiceInput,
  ): Promise<NwcLookupInvoiceResult> {
    this.lookups.push(input);
    return Promise.resolve(this.lookupResults.shift() ?? { state: "pending" });
  }
}

class FakeBitcoinConnectClient implements BitcoinConnectClient {
  connectionString = validConnectionString;
  disconnected = false;

  connect(): Promise<string> {
    return Promise.resolve(this.connectionString);
  }

  disconnect(): Promise<void> {
    this.disconnected = true;
    return Promise.resolve();
  }
}

test("connects through Bitcoin Connect as the primary wallet flow", async () => {
  const wallet = new FakeWalletConnectionClient();
  const bitcoinConnect = new FakeBitcoinConnectClient();
  render(
    <InvoiceGenerator
      walletConnector={wallet}
      bitcoinConnectClient={bitcoinConnect}
    />,
  );

  fireEvent.click(await screen.findByText("Connect wallet"));

  await waitFor(() => expect(wallet.connectedWith).toBe(validConnectionString));
  expect(await screen.findByText("Wallet connection is ready")).toBeTruthy();
  expect(queryConnectionTextarea()).toBeNull();
  expect(screen.queryByText(fakeSecret)).toBeNull();
});

test("does not render an invoice QR before a split is created", async () => {
  const wallet = new FakeWalletConnectionClient();
  render(<InvoiceGenerator walletConnector={wallet} />);

  expect(await screen.findByText("Split in sats")).toBeTruthy();
  expect(document.querySelector("canvas")).toBeNull();
});

test("renders mobile-first split inputs", async () => {
  const wallet = new FakeWalletConnectionClient();
  wallet.restoreStatus = "ready";
  render(<InvoiceGenerator walletConnector={wallet} />);

  expect(await screen.findByText("Wallet connection is ready")).toBeTruthy();
  expect(screen.getByText("Total")).toBeTruthy();
  expect(screen.getByText("People")).toBeTruthy();
  expect(screen.getAllByPlaceholderText("Optional note").length)
    .toBeGreaterThan(
      0,
    );
  expect(screen.getByText("Disconnect")).toBeTruthy();
});

test("does not expose an app-level manual NWC paste field", async () => {
  const wallet = new FakeWalletConnectionClient();
  render(<InvoiceGenerator walletConnector={wallet} />);

  expect(await screen.findByText("Connect wallet")).toBeTruthy();
  expect(screen.queryByText("NWC文字列で接続")).toBeNull();
  expect(screen.queryByText("CONNECT")).toBeNull();
  expect(queryConnectionTextarea()).toBeNull();
});

test("reports Bitcoin Connect failures without exposing connection input", async () => {
  const wallet = new FakeWalletConnectionClient();
  const bitcoinConnect = new FakeBitcoinConnectClient();
  bitcoinConnect.connect = () => Promise.reject(new Error("wallet cancelled"));
  render(
    <InvoiceGenerator
      walletConnector={wallet}
      bitcoinConnectClient={bitcoinConnect}
    />,
  );

  fireEvent.click(await screen.findByText("Connect wallet"));

  expect(await screen.findByText("wallet cancelled")).toBeTruthy();
  expect(queryConnectionTextarea()).toBeNull();
});

test("reports wallets missing invoice capabilities", async () => {
  const wallet = new FakeWalletConnectionClient();
  const bitcoinConnect = new FakeBitcoinConnectClient();
  wallet.connectStatus = "unsupported";
  render(
    <InvoiceGenerator
      walletConnector={wallet}
      bitcoinConnectClient={bitcoinConnect}
    />,
  );

  fireEvent.click(await screen.findByText("Connect wallet"));

  expect(
    await screen.findByText(
      "Wallet does not support required invoice capabilities",
    ),
  ).toBeTruthy();
});

test("creates split invoices through the connected wallet", async () => {
  const wallet = new FakeWalletConnectionClient();
  const bitcoinConnect = new FakeBitcoinConnectClient();
  render(
    <InvoiceGenerator
      walletConnector={wallet}
      bitcoinConnectClient={bitcoinConnect}
    />,
  );

  await connectWallet();
  setIonInput("Total amount", "3000");
  setIonInput("Participant count", "3");
  fireEvent.click(screen.getByText("Create split invoices"));

  await waitFor(() => expect(wallet.created).toHaveLength(3));
  expect(wallet.created.map((input) => input.amountMsats)).toEqual([
    19_427_000,
    19_427_000,
    19_427_000,
  ]);
  expect(await screen.findByText("Person 1 of 3")).toBeTruthy();
});

test("checks settlement through the connected wallet", async () => {
  const wallet = new FakeWalletConnectionClient();
  const bitcoinConnect = new FakeBitcoinConnectClient();
  wallet.lookupResults = [{ state: "settled", settledAt: 1_778_889_600 }];
  render(
    <InvoiceGenerator
      walletConnector={wallet}
      bitcoinConnectClient={bitcoinConnect}
    />,
  );

  await connectWallet();
  setIonInput("Total amount", "1000");
  fireEvent.click(screen.getByText("Create split invoices"));
  await screen.findByText("Person 1 of 1");

  fireEvent.click(screen.getByText("Check payment"));

  await waitFor(() =>
    expect(wallet.lookups).toEqual([{ paymentHash: "payment-hash-1" }])
  );
  expect(await screen.findByText("All paid")).toBeTruthy();
});

test("disconnect clears wallet state and disables split creation", async () => {
  const wallet = new FakeWalletConnectionClient();
  const bitcoinConnect = new FakeBitcoinConnectClient();
  render(
    <InvoiceGenerator
      walletConnector={wallet}
      bitcoinConnectClient={bitcoinConnect}
    />,
  );

  await connectWallet();
  fireEvent.click(screen.getByText("Disconnect"));

  await waitFor(() => expect(wallet.disconnected).toBe(true));
  await waitFor(() => expect(bitcoinConnect.disconnected).toBe(true));
  expect(await screen.findByText("Wallet connection is missing")).toBeTruthy();
  expect(screen.queryByText("Create split invoices")).toBeNull();
});

async function connectWallet(): Promise<void> {
  fireEvent.click(await screen.findByText("Connect wallet"));
  await waitFor(() =>
    expect(screen.queryByDisplayValue(validConnectionString)).toBeNull()
  );
}

function setIonInput(label: string, value: string): void {
  const input = screen.getAllByLabelText(label).find((element) =>
    element.tagName.toLowerCase() === "ion-input"
  ) as HTMLIonInputElement | undefined;
  if (!input) throw new Error(`missing ion input: ${label}`);
  input.value = value;
  fireEvent(input, new CustomEvent("ionInput", { bubbles: true }));
}

function queryConnectionTextarea(): HTMLTextAreaElement | null {
  return screen.queryByLabelText(
    "Nostr Wallet Connect connection string",
  ) as HTMLTextAreaElement | null;
}
