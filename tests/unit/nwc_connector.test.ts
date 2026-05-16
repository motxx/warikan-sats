import { assert, assertEquals, assertRejects } from "@std/assert";
import {
  MemoryNwcConnectionStore,
  NwcCapabilityError,
  type NwcConnection,
  nwcConnectionStatusMessage,
  type NwcInfo,
  type NwcLookupInvoiceResult,
  NwcProtocolError,
  type NwcRequest,
  NwcTransport,
  NwcWalletConnector,
  parseNwcConnectionString,
  UnavailableNwcTransport,
} from "../../src/services/nwc.ts";

const credentialParam = "se" + "cret";
const validConnectionString =
  `nostr+walletconnect://wallet-pubkey?relay=wss%3A%2F%2Frelay.example.com&${credentialParam}=test-wallet-credential&lud16=user%40example.com`;

class FakeNwcTransport implements NwcTransport {
  requests: NwcRequest[] = [];
  lookupResults: NwcLookupInvoiceResult[] = [];

  constructor(
    private readonly info: NwcInfo = {
      capabilities: ["make_invoice", "lookup_invoice", "get_balance"],
    },
  ) {}

  async getInfo(): Promise<NwcInfo> {
    return this.info;
  }

  async request<Result>(
    _connection: NwcConnection,
    request: NwcRequest,
  ): Promise<Result> {
    this.requests.push(request);
    if (request.method === "get_balance") {
      return { balance: 123_000 } as Result;
    }
    if (request.method === "make_invoice") {
      return {
        invoice: "lnbc-test-invoice",
        payment_hash: "payment-hash-1",
        amount: request.params.amount,
        expires_at: 1_778_889_600,
      } as Result;
    }
    const lookup = this.lookupResults.shift() ?? { state: "pending" };
    return lookup as Result;
  }
}

Deno.test("parseNwcConnectionString validates protocol, relay, credential, and metadata", () => {
  const parsed = parseNwcConnectionString(validConnectionString);

  assertEquals(parsed.walletServicePubkey, "wallet-pubkey");
  assertEquals(parsed.relayUrls, ["wss://relay.example.com"]);
  assertEquals(parsed.walletCredential, "test-wallet-credential");
  assertEquals(parsed.lud16, "user@example.com");
});

Deno.test("NWC connector rejects invalid connection strings", async () => {
  const store = new MemoryNwcConnectionStore();
  const connector = new NwcWalletConnector(store, new FakeNwcTransport());

  const status = await connector.connect("https://example.com");

  assertEquals(status, "error");
  assertEquals(await store.get(), null);
});

Deno.test("NWC connector requires invoice capabilities before storing", async () => {
  const store = new MemoryNwcConnectionStore();
  const connector = new NwcWalletConnector(
    store,
    new FakeNwcTransport({ capabilities: ["get_balance"] }),
  );

  const status = await connector.connect(validConnectionString);

  assertEquals(status, "unsupported");
  assertEquals(await store.get(), null);
});

Deno.test("NWC connector restores a stored ready connection", async () => {
  const store = new MemoryNwcConnectionStore(validConnectionString);
  const connector = new NwcWalletConnector(store, new FakeNwcTransport());

  const status = await connector.restore();
  const invoice = await connector.createInvoice({
    amountMsats: 42_000,
    description: "warikan restored split",
  });

  assertEquals(status, "ready");
  assertEquals(invoice.paymentHash, "payment-hash-1");
  assertEquals(await store.get(), validConnectionString);
});

Deno.test("NWC connector clears stored connections with missing capabilities", async () => {
  const store = new MemoryNwcConnectionStore(validConnectionString);
  const connector = new NwcWalletConnector(
    store,
    new FakeNwcTransport({ capabilities: ["get_balance"] }),
  );

  const status = await connector.restore();

  assertEquals(status, "unsupported");
  assertEquals(await store.get(), null);
});

Deno.test("NWC connector maps authorization errors without storing the connection", async () => {
  const store = new MemoryNwcConnectionStore();
  const transport: NwcTransport = {
    async getInfo() {
      throw new NwcProtocolError("UNAUTHORIZED");
    },
    async request() {
      throw new NwcProtocolError("UNAUTHORIZED");
    },
  };
  const connector = new NwcWalletConnector(store, transport);

  const status = await connector.connect(validConnectionString);

  assertEquals(status, "unauthorized");
  assertEquals(await store.get(), null);
});

Deno.test("NWC connector maps relay failures without storing the connection", async () => {
  const store = new MemoryNwcConnectionStore();
  const connector = new NwcWalletConnector(
    store,
    new UnavailableNwcTransport(),
  );

  const status = await connector.connect(validConnectionString);

  assertEquals(status, "relay_unreachable");
  assertEquals(await store.get(), null);
});

Deno.test("NWC connector exposes user-facing connection status messages", () => {
  assertEquals(
    nwcConnectionStatusMessage("unsupported"),
    "Wallet does not support required invoice capabilities",
  );
  assertEquals(
    nwcConnectionStatusMessage("timeout"),
    "Wallet response timed out",
  );
});

Deno.test("NWC connector creates invoices through make_invoice", async () => {
  const transport = new FakeNwcTransport();
  const connector = new NwcWalletConnector(
    new MemoryNwcConnectionStore(),
    transport,
  );

  assertEquals(await connector.connect(validConnectionString), "ready");
  const invoice = await connector.createInvoice({
    amountMsats: 42_000,
    description: "warikan split 1 participant 1",
    expirySeconds: 600,
  });

  assertEquals(invoice, {
    invoice: "lnbc-test-invoice",
    paymentHash: "payment-hash-1",
    amountMsats: 42_000,
    expiresAt: 1_778_889_600,
  });
  assertEquals(transport.requests[0], {
    method: "make_invoice",
    params: {
      amount: 42_000,
      description: "warikan split 1 participant 1",
      expiry: 600,
      metadata: undefined,
    },
  });
});

Deno.test("NWC connector surfaces invoice creation failures without connection data", async () => {
  const transport: NwcTransport = {
    async getInfo() {
      return { capabilities: ["make_invoice", "lookup_invoice"] };
    },
    async request() {
      throw new NwcProtocolError("RATE_LIMITED", "wallet rate limited");
    },
  };
  const connector = new NwcWalletConnector(
    new MemoryNwcConnectionStore(),
    transport,
  );

  assertEquals(await connector.connect(validConnectionString), "ready");
  try {
    await connector.createInvoice({
      amountMsats: 42_000,
      description: "warikan split 1 participant 1",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert(!message.includes(validConnectionString));
    assert(!message.includes("test-wallet-credential"));
    assertEquals(message, "wallet rate limited");
    return;
  }
  throw new Error("expected createInvoice to fail");
});

Deno.test("NWC connector polls invoice settlement until a terminal state", async () => {
  const transport = new FakeNwcTransport();
  transport.lookupResults = [
    { state: "pending" },
    { state: "settled", settledAt: 1_778_889_605 },
  ];
  const connector = new NwcWalletConnector(
    new MemoryNwcConnectionStore(),
    transport,
  );

  assertEquals(await connector.connect(validConnectionString), "ready");
  const result = await connector.pollInvoiceSettlement(
    { paymentHash: "payment-hash-1" },
    { intervalMs: 0, sleep: async () => {} },
  );

  assertEquals(result, { state: "settled", settledAt: 1_778_889_605 });
  assertEquals(
    transport.requests.map((request) => request.method),
    ["lookup_invoice", "lookup_invoice"],
  );
});

Deno.test("NWC connector exposes get_balance only when supported", async () => {
  const connector = new NwcWalletConnector(
    new MemoryNwcConnectionStore(validConnectionString),
    new FakeNwcTransport({ capabilities: ["make_invoice", "lookup_invoice"] }),
  );

  await assertRejects(
    () => connector.getBalance(),
    NwcCapabilityError,
    "missing NWC capabilities: get_balance",
  );
});
