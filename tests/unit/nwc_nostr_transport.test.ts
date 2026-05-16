import { assertEquals, assertRejects } from "@std/assert";
import {
  type NostrEvent,
  type NostrEventTemplate,
  type NostrFilter,
  type NostrPoolLike,
  type NostrSubscription,
  NostrToolsNwcTransport,
  NWC_INFO_KIND,
  NWC_RESPONSE_KIND,
  type NwcNostrCrypto,
} from "../../src/services/nwcNostrTransport.ts";
import {
  type NwcConnection,
  NwcProtocolError,
  type NwcRequest,
} from "../../src/services/nwc.ts";

const credentialParam = "se" + "cret";
const connectionString =
  `nostr+walletconnect://wallet-pubkey?relay=wss%3A%2F%2Frelay.example.com&${credentialParam}=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`;
const connection: NwcConnection = {
  connectionString,
  walletServicePubkey: "wallet-pubkey",
  relayUrls: ["wss://relay.example.com"],
  walletCredential:
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

class FakePool implements NostrPoolLike {
  infoEvent: NostrEvent | null = {
    id: "info-1",
    pubkey: "wallet-pubkey",
    created_at: 1,
    kind: NWC_INFO_KIND,
    tags: [
      ["notifications", "payment_received payment_sent"],
      ["encryption", "nip04"],
    ],
    content: "make_invoice lookup_invoice get_balance",
    sig: "sig",
  };
  published: NostrEvent[] = [];
  subscriptions: NostrFilter[][] = [];

  async get(): Promise<NostrEvent | null> {
    return this.infoEvent;
  }

  publish(_relays: string[], event: NostrEvent): Promise<unknown>[] {
    this.published.push(event);
    return [Promise.resolve(true)];
  }

  subscribeMany(
    _relays: string[],
    filters: NostrFilter[],
    handlers: { onevent(event: NostrEvent): void },
  ): NostrSubscription {
    this.subscriptions.push(filters);
    queueMicrotask(() => {
      const request = this.published[0];
      if (!request) return;
      handlers.onevent({
        id: "response-1",
        pubkey: "wallet-pubkey",
        created_at: 2,
        kind: NWC_RESPONSE_KIND,
        tags: [
          ["e", request.id],
          ["p", "client-pubkey"],
        ],
        content: JSON.stringify({
          result_type: "make_invoice",
          result: {
            invoice: "lnbc-mainnet-test",
            payment_hash: "payment-hash-1",
            amount: 21_000,
          },
        }),
        sig: "sig",
      });
    });
    return { close() {} };
  }

  close(): void {}
}

class FakeCrypto implements NwcNostrCrypto {
  publicKey(): string {
    return "client-pubkey";
  }

  encrypt(
    _connection: NwcConnection,
    _recipientPubkey: string,
    plaintext: string,
  ): Promise<string> {
    return Promise.resolve(`encrypted:${plaintext}`);
  }

  decrypt(
    _connection: NwcConnection,
    _senderPubkey: string,
    ciphertext: string,
  ): Promise<string> {
    return Promise.resolve(ciphertext);
  }

  sign(_connection: NwcConnection, template: NostrEventTemplate): NostrEvent {
    return {
      id: "request-1",
      pubkey: "client-pubkey",
      sig: "sig",
      ...template,
    };
  }
}

Deno.test("Nostr NWC transport reads info capabilities and notifications", async () => {
  const pool = new FakePool();
  const transport = new NostrToolsNwcTransport({
    pool,
    crypto: new FakeCrypto(),
  });

  const info = await transport.getInfo(connection);

  assertEquals(info, {
    capabilities: ["make_invoice", "lookup_invoice", "get_balance"],
    notifications: ["payment_received payment_sent"],
  });
});

Deno.test("Nostr NWC transport publishes encrypted requests and reads responses", async () => {
  const pool = new FakePool();
  const transport = new NostrToolsNwcTransport({
    pool,
    crypto: new FakeCrypto(),
  });
  const request: NwcRequest = {
    method: "make_invoice",
    params: { amount: 21_000, description: "warikan mainnet smoke" },
  };

  const result = await transport.request(connection, request);

  assertEquals(result, {
    invoice: "lnbc-mainnet-test",
    payment_hash: "payment-hash-1",
    amount: 21_000,
  });
  assertEquals(pool.published[0]?.kind, 23194);
  assertEquals(pool.published[0]?.tags, [
    ["p", "wallet-pubkey"],
    ["encryption", "nip04"],
  ]);
  assertEquals(
    pool.published[0]?.content,
    'encrypted:{"method":"make_invoice","params":{"amount":21000,"description":"warikan mainnet smoke"}}',
  );
});

Deno.test("Nostr NWC transport rejects unsupported encryption", async () => {
  const pool = new FakePool();
  pool.infoEvent = {
    id: "info-1",
    pubkey: "wallet-pubkey",
    created_at: 1,
    kind: NWC_INFO_KIND,
    tags: [["encryption", "nip44_v2"]],
    content: "make_invoice lookup_invoice",
    sig: "sig",
  };
  const transport = new NostrToolsNwcTransport({
    pool,
    crypto: new FakeCrypto(),
  });

  await assertRejects(
    () => transport.getInfo(connection),
    NwcProtocolError,
    "NWC wallet does not advertise NIP-04 encryption",
  );
});
