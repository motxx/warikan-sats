import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "../../../setupTests";
import {
  InvoiceGenerator,
  type WalletConnectionClient,
} from "./InvoiceGenerator";
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

test("connects a wallet and clears the submitted connection secret from the UI", async () => {
  const wallet = new FakeWalletConnectionClient();
  render(<InvoiceGenerator walletConnector={wallet} />);

  await connectWallet(validConnectionString);

  expect(wallet.connectedWith).toBe(validConnectionString);
  expect(await screen.findByText("Wallet connection is ready")).toBeTruthy();
  expect(connectionTextarea().value).toBe("");
  expect(screen.queryByText(fakeSecret)).toBeNull();
});

test("does not render an invoice QR before a split is created", async () => {
  const wallet = new FakeWalletConnectionClient();
  render(<InvoiceGenerator walletConnector={wallet} />);

  expect(await screen.findByText("Split collection")).toBeTruthy();
  expect(document.querySelector("canvas")).toBeNull();
});

test("reports invalid wallet connection strings without retaining the submitted value", async () => {
  const wallet = new FakeWalletConnectionClient();
  wallet.connectStatus = "error";
  render(<InvoiceGenerator walletConnector={wallet} />);

  await connectWallet("not a wallet connection");

  expect(await screen.findByText("Wallet connection failed")).toBeTruthy();
  expect(connectionTextarea().value).toBe("");
});

test("reports wallets missing invoice capabilities", async () => {
  const wallet = new FakeWalletConnectionClient();
  wallet.connectStatus = "unsupported";
  render(<InvoiceGenerator walletConnector={wallet} />);

  await connectWallet(validConnectionString);

  expect(
    await screen.findByText(
      "Wallet does not support required invoice capabilities",
    ),
  ).toBeTruthy();
});

test("creates split invoices through the connected wallet", async () => {
  const wallet = new FakeWalletConnectionClient();
  render(<InvoiceGenerator walletConnector={wallet} />);

  await connectWallet(validConnectionString);
  setIonInput("Total amount", "3000");
  setIonInput("Participant count", "3");
  fireEvent.click(screen.getByText("START SPLIT"));

  await waitFor(() => expect(wallet.created).toHaveLength(3));
  expect(wallet.created.map((input) => input.amountMsats)).toEqual([
    19_427_000,
    19_427_000,
    19_427_000,
  ]);
  expect(await screen.findByText("Participant 1 of 3")).toBeTruthy();
});

test("checks settlement through the connected wallet", async () => {
  const wallet = new FakeWalletConnectionClient();
  wallet.lookupResults = [{ state: "settled", settledAt: 1_778_889_600 }];
  render(<InvoiceGenerator walletConnector={wallet} />);

  await connectWallet(validConnectionString);
  setIonInput("Total amount", "1000");
  fireEvent.click(screen.getByText("START SPLIT"));
  await screen.findByText("Participant 1 of 1");

  fireEvent.click(screen.getByText("CHECK PAYMENT"));

  await waitFor(() =>
    expect(wallet.lookups).toEqual([{ paymentHash: "payment-hash-1" }])
  );
  expect(await screen.findByText("All paid")).toBeTruthy();
});

test("disconnect clears wallet state and disables split creation", async () => {
  const wallet = new FakeWalletConnectionClient();
  render(<InvoiceGenerator walletConnector={wallet} />);

  await connectWallet(validConnectionString);
  fireEvent.click(screen.getByText("DISCONNECT"));

  await waitFor(() => expect(wallet.disconnected).toBe(true));
  expect(await screen.findByText("Wallet connection is missing")).toBeTruthy();
  expect(
    screen.getByText("START SPLIT").closest("ion-button")?.hasAttribute(
      "disabled",
    ),
  ).toBe(true);
});

async function connectWallet(connectionString: string): Promise<void> {
  fireEvent.change(connectionTextarea(), {
    target: { value: connectionString },
  });
  fireEvent.click(screen.getByText("CONNECT WALLET"));
  await waitFor(() => expect(connectionTextarea().value).toBe(""));
}

function setIonInput(label: string, value: string): void {
  const input = screen.getAllByLabelText(label).find((element) =>
    element.tagName.toLowerCase() === "ion-input"
  ) as HTMLIonInputElement | undefined;
  if (!input) throw new Error(`missing ion input: ${label}`);
  input.value = value;
  fireEvent(input, new CustomEvent("ionInput", { bubbles: true }));
}

function connectionTextarea(): HTMLTextAreaElement {
  return screen.getByLabelText(
    "Nostr Wallet Connect connection string",
  ) as HTMLTextAreaElement;
}
