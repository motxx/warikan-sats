export type FakeNwcInvoiceState = "pending" | "settled" | "expired" | "failed";

export interface FakeNwcInvoice {
  invoice: string;
  paymentHash: string;
  amountMsats: number;
  description: string;
  state: FakeNwcInvoiceState;
  settledAt?: number;
}

export class FakeNwcWallet {
  readonly capabilities: Set<string>;
  #invoices = new Map<string, FakeNwcInvoice>();
  #nextInvoiceId = 1;

  constructor(capabilities: Iterable<string> = [
    "make_invoice",
    "lookup_invoice",
    "get_balance",
  ]) {
    this.capabilities = new Set(capabilities);
  }

  requireCapabilities(required: Iterable<string>): void {
    const missing = [...required].filter((capability) =>
      !this.capabilities.has(capability)
    );
    if (missing.length > 0) {
      throw new Error(`missing NWC capabilities: ${missing.join(",")}`);
    }
  }

  createInvoice(input: {
    amountMsats: number;
    description: string;
  }): FakeNwcInvoice {
    this.requireCapabilities(["make_invoice"]);
    const id = this.#nextInvoiceId++;
    const paymentHash = `fake-payment-hash-${id}`;
    const invoice: FakeNwcInvoice = {
      invoice: `lnbc-fake-${id}`,
      paymentHash,
      amountMsats: input.amountMsats,
      description: input.description,
      state: "pending",
    };
    this.#invoices.set(paymentHash, invoice);
    return invoice;
  }

  settleInvoice(paymentHash: string, settledAt = 1_700_000_000): void {
    const invoice = this.#invoices.get(paymentHash);
    if (!invoice) {
      throw new Error(`unknown fake invoice: ${paymentHash}`);
    }
    invoice.state = "settled";
    invoice.settledAt = settledAt;
  }

  lookupInvoice(paymentHash: string): FakeNwcInvoice {
    this.requireCapabilities(["lookup_invoice"]);
    const invoice = this.#invoices.get(paymentHash);
    if (!invoice) {
      throw new Error(`unknown fake invoice: ${paymentHash}`);
    }
    return { ...invoice };
  }
}
