import {
  createRegtestInvoice,
  readRegtestState,
  type RegtestOptions,
} from "../../scripts/nwc-regtest.ts";
import {
  type NwcConnection,
  type NwcInfo,
  NwcProtocolError,
  type NwcRequest,
  type NwcTransport,
} from "../../src/services/nwc.ts";

export class RegtestNwcTransport implements NwcTransport {
  constructor(private readonly options: RegtestOptions = {}) {}

  async getInfo(): Promise<NwcInfo> {
    const state = await readRegtestState(this.options);
    const receiver = state.wallets.find((wallet) => wallet.role === "receiver");
    if (!receiver) throw new NwcProtocolError("NOT_FOUND", "receiver missing");
    return {
      capabilities: receiver.capabilities,
      notifications: ["payment_received"],
    };
  }

  async request<Result>(
    _connection: NwcConnection,
    request: NwcRequest,
  ): Promise<Result> {
    switch (request.method) {
      case "get_balance":
        return await this.getBalance<Result>();
      case "make_invoice":
        return await this.makeInvoice<Result>(request);
      case "lookup_invoice":
        return await this.lookupInvoice<Result>(request);
    }
  }

  private async getBalance<Result>(): Promise<Result> {
    const state = await readRegtestState(this.options);
    const receiver = state.wallets.find((wallet) => wallet.role === "receiver");
    return { balance: receiver?.balanceMsats ?? 0 } as Result;
  }

  private async makeInvoice<Result>(request: NwcRequest): Promise<Result> {
    const amount = Number(request.params.amount);
    const description = String(request.params.description ?? "");
    const invoice = await createRegtestInvoice(
      { amountMsats: amount, description },
      this.options,
    );
    return {
      invoice: invoice.invoice,
      payment_hash: invoice.paymentHash,
      amount: invoice.amountMsats,
    } as Result;
  }

  private async lookupInvoice<Result>(request: NwcRequest): Promise<Result> {
    const paymentHash = String(request.params.payment_hash ?? "");
    const invoiceText = String(request.params.invoice ?? "");
    const state = await readRegtestState(this.options);
    const invoice = state.invoices.find((candidate) =>
      candidate.paymentHash === paymentHash || candidate.invoice === invoiceText
    );
    if (!invoice) throw new NwcProtocolError("NOT_FOUND", "invoice not found");
    return {
      state: invoice.state,
      settled_at: invoice.settledAt,
    } as Result;
  }
}
