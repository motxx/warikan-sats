import { finalizeEvent, getPublicKey, nip04, SimplePool } from "nostr-tools";
import {
  type NwcConnection,
  type NwcErrorCode,
  type NwcInfo,
  NwcProtocolError,
  type NwcRequest,
  type NwcTransport,
} from "./nwc.ts";

export const NWC_INFO_KIND = 13194;
export const NWC_REQUEST_KIND = 23194;
export const NWC_RESPONSE_KIND = 23195;

export interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
}

export interface NostrEventTemplate {
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
}

export interface NostrFilter {
  ids?: string[];
  kinds?: number[];
  authors?: string[];
  "#e"?: string[];
  "#p"?: string[];
}

export interface NostrSubscription {
  close(): void;
}

export interface NostrPoolLike {
  get(relays: string[], filter: NostrFilter): Promise<NostrEvent | null>;
  publish(relays: string[], event: NostrEvent): Promise<unknown>[];
  subscribeMany(
    relays: string[],
    filters: NostrFilter[],
    handlers: { onevent(event: NostrEvent): void },
  ): NostrSubscription;
  close(relays?: string[]): void;
}

export interface NwcNostrCrypto {
  publicKey(connection: NwcConnection): string;
  encrypt(
    connection: NwcConnection,
    recipientPubkey: string,
    plaintext: string,
  ): Promise<string>;
  decrypt(
    connection: NwcConnection,
    senderPubkey: string,
    ciphertext: string,
  ): Promise<string>;
  sign(connection: NwcConnection, template: NostrEventTemplate): NostrEvent;
}

export interface NostrToolsNwcTransportOptions {
  pool?: NostrPoolLike;
  crypto?: NwcNostrCrypto;
  timeoutMs?: number;
  now?: () => number;
}

interface NwcResponseEnvelope<Result> {
  result_type?: string;
  result?: Result;
  error?: {
    code?: string;
    message?: string;
  };
}

export class NostrToolsNwcCrypto implements NwcNostrCrypto {
  publicKey(connection: NwcConnection): string {
    return getPublicKey(hexToBytes(connection.walletCredential));
  }

  async encrypt(
    connection: NwcConnection,
    recipientPubkey: string,
    plaintext: string,
  ): Promise<string> {
    return await nip04.encrypt(
      hexToBytes(connection.walletCredential),
      recipientPubkey,
      plaintext,
    );
  }

  async decrypt(
    connection: NwcConnection,
    senderPubkey: string,
    ciphertext: string,
  ): Promise<string> {
    return await nip04.decrypt(
      hexToBytes(connection.walletCredential),
      senderPubkey,
      ciphertext,
    );
  }

  sign(connection: NwcConnection, template: NostrEventTemplate): NostrEvent {
    return finalizeEvent(
      template,
      hexToBytes(connection.walletCredential),
    ) as NostrEvent;
  }
}

export class NostrToolsNwcTransport implements NwcTransport {
  private readonly pool: NostrPoolLike;
  private readonly crypto: NwcNostrCrypto;
  private readonly timeoutMs: number;
  private readonly now: () => number;

  constructor(options: NostrToolsNwcTransportOptions = {}) {
    this.pool = options.pool ?? new SimplePool() as NostrPoolLike;
    this.crypto = options.crypto ?? new NostrToolsNwcCrypto();
    this.timeoutMs = options.timeoutMs ?? 15_000;
    this.now = options.now ?? (() => Math.floor(Date.now() / 1000));
  }

  async getInfo(connection: NwcConnection): Promise<NwcInfo> {
    const event = await withTimeout(
      this.pool.get(connection.relayUrls, {
        kinds: [NWC_INFO_KIND],
        authors: [connection.walletServicePubkey],
      }),
      this.timeoutMs,
    );
    if (!event) {
      throw new NwcProtocolError("RELAY_UNREACHABLE", "NWC info not found");
    }

    ensureNip04Supported(event);
    return {
      capabilities: event.content.split(/\s+/).filter(Boolean),
      notifications: tagValues(event, "notifications"),
    };
  }

  async request<Result>(
    connection: NwcConnection,
    request: NwcRequest,
  ): Promise<Result> {
    const clientPubkey = this.crypto.publicKey(connection);
    const content = await this.crypto.encrypt(
      connection,
      connection.walletServicePubkey,
      JSON.stringify({
        method: request.method,
        params: request.params,
      }),
    );
    const event = this.crypto.sign(connection, {
      kind: NWC_REQUEST_KIND,
      created_at: this.now(),
      tags: [
        ["p", connection.walletServicePubkey],
        ["encryption", "nip04"],
      ],
      content,
    });

    const response = waitForResponse(
      this.pool,
      connection,
      event.id,
      clientPubkey,
      this.timeoutMs,
    );
    await publishToAnyRelay(this.pool, connection.relayUrls, event);
    const responseEvent = await response;
    const plaintext = await this.crypto.decrypt(
      connection,
      responseEvent.pubkey,
      responseEvent.content,
    );
    return parseNwcResponse<Result>(plaintext, request.method);
  }

  close(): void {
    this.pool.close();
  }
}

function ensureNip04Supported(event: NostrEvent): void {
  const encryption = tagValues(event, "encryption");
  if (encryption.length === 0) return;
  if (encryption.some((value) => value.split(/\s+/).includes("nip04"))) return;
  throw new NwcProtocolError(
    "UNSUPPORTED_ENCRYPTION",
    "NWC wallet does not advertise NIP-04 encryption",
  );
}

function tagValues(event: NostrEvent, tagName: string): string[] {
  return event.tags
    .filter((tag) => tag[0] === tagName)
    .map((tag) => tag[1])
    .filter((value): value is string => Boolean(value));
}

async function publishToAnyRelay(
  pool: NostrPoolLike,
  relayUrls: string[],
  event: NostrEvent,
): Promise<void> {
  try {
    await Promise.any(pool.publish(relayUrls, event));
  } catch {
    throw new NwcProtocolError(
      "RELAY_UNREACHABLE",
      "NWC request could not be published",
    );
  }
}

function waitForResponse(
  pool: NostrPoolLike,
  connection: NwcConnection,
  requestId: string,
  clientPubkey: string,
  timeoutMs: number,
): Promise<NostrEvent> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      subscription.close();
      reject(new NwcProtocolError("TIMEOUT", "NWC wallet response timed out"));
    }, timeoutMs);
    const subscription = pool.subscribeMany(
      connection.relayUrls,
      [{
        kinds: [NWC_RESPONSE_KIND],
        authors: [connection.walletServicePubkey],
        "#e": [requestId],
        "#p": [clientPubkey],
      }],
      {
        onevent(event) {
          clearTimeout(timer);
          subscription.close();
          resolve(event);
        },
      },
    );
  });
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_resolve, reject) => {
    timer = globalThis.setTimeout(() => {
      reject(new NwcProtocolError("TIMEOUT", "NWC wallet response timed out"));
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function parseNwcResponse<Result>(
  plaintext: string,
  method: string,
): Result {
  const envelope = JSON.parse(plaintext) as NwcResponseEnvelope<Result>;
  if (envelope.error) {
    throw new NwcProtocolError(
      mapNwcErrorCode(envelope.error.code),
      envelope.error.message ?? envelope.error.code ?? "NWC request failed",
    );
  }
  if (envelope.result_type && envelope.result_type !== method) {
    throw new NwcProtocolError("UNKNOWN", "NWC response type mismatch");
  }
  if (envelope.result === undefined) {
    throw new NwcProtocolError("UNKNOWN", "NWC response result missing");
  }
  return envelope.result;
}

function mapNwcErrorCode(code: string | undefined): NwcErrorCode {
  switch (code) {
    case "UNAUTHORIZED":
    case "RESTRICTED":
    case "NOT_IMPLEMENTED":
    case "UNSUPPORTED_ENCRYPTION":
    case "RATE_LIMITED":
    case "NOT_FOUND":
      return code;
    default:
      return "UNKNOWN";
  }
}

function hexToBytes(hex: string): Uint8Array {
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new NwcProtocolError(
      "UNAUTHORIZED",
      "NWC credential must be a 32-byte hex key",
    );
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
