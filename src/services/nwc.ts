export type NwcConnectionStatus =
  | "missing"
  | "checking"
  | "ready"
  | "unsupported"
  | "unauthorized"
  | "relay_unreachable"
  | "error";

export type NwcInvoiceState = "pending" | "settled" | "expired" | "failed";

export type NwcErrorCode =
  | "UNAUTHORIZED"
  | "RESTRICTED"
  | "NOT_IMPLEMENTED"
  | "UNSUPPORTED_ENCRYPTION"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "RELAY_UNREACHABLE"
  | "UNKNOWN";

export interface NwcConnection {
  connectionString: string;
  walletServicePubkey: string;
  relayUrls: string[];
  walletCredential: string;
  lud16?: string;
}

export interface NwcInfo {
  capabilities: string[];
  notifications?: string[];
}

export interface NwcBalance {
  balanceMsats: number;
}

export interface NwcInvoice {
  invoice: string;
  paymentHash: string;
  amountMsats: number;
  expiresAt?: number;
}

export interface NwcLookupInvoiceInput {
  invoice?: string;
  paymentHash?: string;
}

export interface NwcLookupInvoiceResult {
  state: NwcInvoiceState;
  settledAt?: number;
  preimage?: string;
}

export interface NwcCreateInvoiceInput {
  amountMsats: number;
  description: string;
  expirySeconds?: number;
  metadata?: Record<string, unknown>;
}

export interface NwcRequest {
  method: "get_balance" | "make_invoice" | "lookup_invoice";
  params: Record<string, unknown>;
}

export interface NwcTransport {
  getInfo(connection: NwcConnection): Promise<NwcInfo>;
  request<Result>(
    connection: NwcConnection,
    request: NwcRequest,
  ): Promise<Result>;
}

export interface NwcConnectionStore {
  get(): Promise<string | null>;
  set(connectionString: string): Promise<void>;
  clear(): Promise<void>;
}

interface NwcMakeInvoiceResponse {
  invoice: string;
  payment_hash?: string;
  paymentHash?: string;
  amount?: number;
  amountMsats?: number;
  expires_at?: number;
  expiresAt?: number;
}

interface NwcBalanceResponse {
  balance: number;
}

interface NwcLookupInvoiceResponse {
  state: NwcInvoiceState;
  settled_at?: number;
  settledAt?: number;
  preimage?: string;
}

export class NwcProtocolError extends Error {
  readonly code: NwcErrorCode;

  constructor(code: NwcErrorCode, message: string = code) {
    super(message);
    this.name = "NwcProtocolError";
    this.code = code;
  }
}

export class NwcCapabilityError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(`missing NWC capabilities: ${missing.join(", ")}`);
    this.name = "NwcCapabilityError";
    this.missing = missing;
  }
}

export class MemoryNwcConnectionStore implements NwcConnectionStore {
  #connectionString: string | null;

  constructor(initialConnectionString: string | null = null) {
    this.#connectionString = initialConnectionString;
  }

  get(): Promise<string | null> {
    return Promise.resolve(this.#connectionString);
  }

  set(connectionString: string): Promise<void> {
    this.#connectionString = connectionString;
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.#connectionString = null;
    return Promise.resolve();
  }
}

export class BrowserNwcConnectionStore implements NwcConnectionStore {
  constructor(private readonly key = "warikan-sats:nwc-connection") {}

  get(): Promise<string | null> {
    return Promise.resolve(globalThis.localStorage?.getItem(this.key) ?? null);
  }

  set(connectionString: string): Promise<void> {
    globalThis.localStorage?.setItem(this.key, connectionString);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    globalThis.localStorage?.removeItem(this.key);
    return Promise.resolve();
  }
}

export class UnavailableNwcTransport implements NwcTransport {
  getInfo(): Promise<NwcInfo> {
    return Promise.reject(
      new NwcProtocolError(
        "RELAY_UNREACHABLE",
        "NWC relay transport is not configured",
      ),
    );
  }

  request<Result>(): Promise<Result> {
    return Promise.reject(
      new NwcProtocolError(
        "RELAY_UNREACHABLE",
        "NWC relay transport is not configured",
      ),
    );
  }
}

export function parseNwcConnectionString(
  connectionString: string,
): NwcConnection {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("invalid NWC connection string");
  }

  if (url.protocol !== "nostr+walletconnect:") {
    throw new Error("invalid NWC connection string");
  }

  const walletServicePubkey = (url.host || url.pathname.replace(/^\//, ""))
    .trim();
  const relayUrls = url.searchParams.getAll("relay").filter(Boolean);
  const walletCredential = url.searchParams.get("secret")?.trim() ?? "";
  const lud16 = url.searchParams.get("lud16")?.trim() || undefined;

  if (!walletServicePubkey || relayUrls.length === 0 || !walletCredential) {
    throw new Error("invalid NWC connection string");
  }

  for (const relayUrl of relayUrls) {
    if (!isRelayUrl(relayUrl)) {
      throw new Error("invalid NWC connection string");
    }
  }

  return {
    connectionString,
    walletServicePubkey,
    relayUrls,
    walletCredential,
    lud16,
  };
}

export class NwcWalletConnector {
  #connection: NwcConnection | null = null;
  #capabilities: Set<string> | null = null;

  constructor(
    private readonly store: NwcConnectionStore,
    private readonly transport: NwcTransport,
  ) {}

  async connect(connectionString: string): Promise<NwcConnectionStatus> {
    this.#connection = null;
    this.#capabilities = null;

    let connection: NwcConnection;
    try {
      connection = parseNwcConnectionString(connectionString);
    } catch {
      await this.store.clear();
      return "error";
    }

    try {
      const info = await this.transport.getInfo(connection);
      const capabilities = new Set(info.capabilities);
      const missing = requiredInvoiceCapabilities().filter((capability) =>
        !capabilities.has(capability)
      );
      if (missing.length > 0) {
        await this.store.clear();
        return "unsupported";
      }
      await this.store.set(connectionString);
      this.#connection = connection;
      this.#capabilities = capabilities;
      return "ready";
    } catch (error) {
      await this.store.clear();
      return connectionStatusFromError(error);
    }
  }

  async disconnect(): Promise<void> {
    this.#connection = null;
    this.#capabilities = null;
    await this.store.clear();
  }

  async getCapabilities(): Promise<Set<string>> {
    if (this.#capabilities) return new Set(this.#capabilities);
    const connection = await this.requireConnection();
    const info = await this.transport.getInfo(connection);
    this.#capabilities = new Set(info.capabilities);
    return new Set(this.#capabilities);
  }

  async getBalance(): Promise<NwcBalance> {
    await this.requireCapabilities(["get_balance"]);
    const response = await this.transport.request<NwcBalanceResponse>(
      await this.requireConnection(),
      { method: "get_balance", params: {} },
    );
    return { balanceMsats: response.balance };
  }

  async createInvoice(input: NwcCreateInvoiceInput): Promise<NwcInvoice> {
    await this.requireCapabilities(["make_invoice"]);
    const response = await this.transport.request<NwcMakeInvoiceResponse>(
      await this.requireConnection(),
      {
        method: "make_invoice",
        params: {
          amount: input.amountMsats,
          description: input.description,
          expiry: input.expirySeconds,
          metadata: input.metadata,
        },
      },
    );
    return normalizeInvoiceResponse(response, input.amountMsats);
  }

  async lookupInvoice(
    input: NwcLookupInvoiceInput,
  ): Promise<NwcLookupInvoiceResult> {
    if (!input.invoice && !input.paymentHash) {
      throw new Error("lookupInvoice requires invoice or paymentHash");
    }
    await this.requireCapabilities(["lookup_invoice"]);
    const response = await this.transport.request<NwcLookupInvoiceResponse>(
      await this.requireConnection(),
      {
        method: "lookup_invoice",
        params: {
          invoice: input.invoice,
          payment_hash: input.paymentHash,
        },
      },
    );
    const result: NwcLookupInvoiceResult = { state: response.state };
    const settledAt = response.settledAt ?? response.settled_at;
    if (settledAt !== undefined) result.settledAt = settledAt;
    if (response.preimage !== undefined) result.preimage = response.preimage;
    return result;
  }

  async pollInvoiceSettlement(
    input: NwcLookupInvoiceInput,
    options: {
      maxAttempts?: number;
      intervalMs?: number;
      sleep?: (intervalMs: number) => Promise<void>;
    } = {},
  ): Promise<NwcLookupInvoiceResult> {
    const maxAttempts = options.maxAttempts ?? 30;
    const intervalMs = options.intervalMs ?? 1_000;
    const sleep = options.sleep ?? defaultSleep;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await this.lookupInvoice(input);
      if (result.state !== "pending") return result;
      if (attempt < maxAttempts) await sleep(intervalMs);
    }

    return { state: "pending" };
  }

  async requireConnection(): Promise<NwcConnection> {
    if (this.#connection) return this.#connection;
    const stored = await this.store.get();
    if (!stored) throw new Error("NWC connection is missing");
    this.#connection = parseNwcConnectionString(stored);
    return this.#connection;
  }

  private async requireCapabilities(required: string[]): Promise<void> {
    const capabilities = await this.getCapabilities();
    const missing = required.filter((capability) =>
      !capabilities.has(capability)
    );
    if (missing.length > 0) throw new NwcCapabilityError(missing);
  }
}

export function createBrowserNwcConnector(): NwcWalletConnector {
  return new NwcWalletConnector(
    new BrowserNwcConnectionStore(),
    new UnavailableNwcTransport(),
  );
}

function requiredInvoiceCapabilities(): string[] {
  return ["make_invoice", "lookup_invoice"];
}

function isRelayUrl(relayUrl: string): boolean {
  try {
    const url = new URL(relayUrl);
    return url.protocol === "ws:" || url.protocol === "wss:";
  } catch {
    return false;
  }
}

function connectionStatusFromError(error: unknown): NwcConnectionStatus {
  if (!(error instanceof NwcProtocolError)) return "error";
  switch (error.code) {
    case "UNAUTHORIZED":
      return "unauthorized";
    case "RESTRICTED":
    case "NOT_IMPLEMENTED":
    case "UNSUPPORTED_ENCRYPTION":
      return "unsupported";
    case "RELAY_UNREACHABLE":
      return "relay_unreachable";
    default:
      return "error";
  }
}

function normalizeInvoiceResponse(
  response: NwcMakeInvoiceResponse,
  requestedAmountMsats: number,
): NwcInvoice {
  const paymentHash = response.paymentHash ?? response.payment_hash;
  if (!response.invoice || !paymentHash) {
    throw new Error("NWC make_invoice response is missing invoice data");
  }
  return {
    invoice: response.invoice,
    paymentHash,
    amountMsats: response.amountMsats ?? response.amount ??
      requestedAmountMsats,
    expiresAt: response.expiresAt ?? response.expires_at,
  };
}

function defaultSleep(intervalMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, intervalMs));
}
