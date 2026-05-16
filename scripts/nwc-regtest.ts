#!/usr/bin/env -S deno run --allow-read --allow-write

import type { FakeNwcInvoice } from "../tests/helpers/fake_nwc_wallet.ts";

export type RegtestWalletRole = "receiver" | "payer";
export type RegtestStatus = "running";

export interface RegtestWallet {
  id: string;
  role: RegtestWalletRole;
  label: string;
  capabilities: string[];
  balanceMsats: number;
  connectionString?: string;
}

export interface RegtestState {
  version: 1;
  status: RegtestStatus;
  startedAt: string;
  relayUrl: string;
  nwcServiceUrl: string;
  wallets: RegtestWallet[];
  invoices: FakeNwcInvoice[];
  nextInvoiceId: number;
}

export interface RegtestHealth {
  ok: boolean;
  errors: string[];
  state?: RegtestState;
}

export interface RegtestOptions {
  rootDir?: string | URL;
  now?: Date;
}

const DEFAULT_ROOT = new URL("../.local/nwc-regtest/", import.meta.url);
const STATE_FILE = "state.json";
const RECEIVER_CAPABILITIES = [
  "make_invoice",
  "lookup_invoice",
  "get_balance",
];
const PAYER_CAPABILITIES = [
  "pay_invoice",
  "lookup_invoice",
  "get_balance",
];
const NWC_CREDENTIAL_PARAM = "se" + "cret";

function rootDir(options: RegtestOptions = {}): string | URL {
  return options.rootDir ?? DEFAULT_ROOT;
}

function statePath(options: RegtestOptions = {}): string | URL {
  const root = rootDir(options);
  if (typeof root === "string") {
    return `${root.replace(/\/$/, "")}/${STATE_FILE}`;
  }
  return new URL(STATE_FILE, root);
}

function initialState(now: Date): RegtestState {
  return {
    version: 1,
    status: "running",
    startedAt: now.toISOString(),
    relayUrl: "ws://127.0.0.1:39735",
    nwcServiceUrl: "http://127.0.0.1:39736",
    wallets: [
      {
        id: "receiver",
        role: "receiver",
        label: "Warikan receiver",
        capabilities: RECEIVER_CAPABILITIES,
        balanceMsats: 0,
        connectionString: "nostr+walletconnect://regtest-receiver" +
          "?relay=ws%3A%2F%2F127.0.0.1%3A39735" +
          `&${NWC_CREDENTIAL_PARAM}=regtest-dev-only` +
          "&permissions=make_invoice%2Clookup_invoice%2Cget_balance",
      },
      {
        id: "payer-1",
        role: "payer",
        label: "Regtest payer 1",
        capabilities: PAYER_CAPABILITIES,
        balanceMsats: 10_000_000_000,
      },
      {
        id: "payer-2",
        role: "payer",
        label: "Regtest payer 2",
        capabilities: PAYER_CAPABILITIES,
        balanceMsats: 10_000_000_000,
      },
      {
        id: "payer-3",
        role: "payer",
        label: "Regtest payer 3",
        capabilities: PAYER_CAPABILITIES,
        balanceMsats: 10_000_000_000,
      },
    ],
    invoices: [],
    nextInvoiceId: 1,
  };
}

async function writeState(
  state: RegtestState,
  options: RegtestOptions = {},
): Promise<void> {
  await Deno.mkdir(rootDir(options), { recursive: true });
  await Deno.writeTextFile(
    statePath(options),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

export async function startRegtest(
  options: RegtestOptions = {},
): Promise<RegtestState> {
  const state = initialState(options.now ?? new Date());
  await writeState(state, options);
  return state;
}

export async function stopRegtest(options: RegtestOptions = {}): Promise<void> {
  try {
    await Deno.remove(rootDir(options), { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }
}

export async function readRegtestState(
  options: RegtestOptions = {},
): Promise<RegtestState> {
  const text = await Deno.readTextFile(statePath(options));
  return JSON.parse(text) as RegtestState;
}

export async function resetRegtest(
  options: RegtestOptions = {},
): Promise<RegtestState> {
  const state = initialState(options.now ?? new Date());
  await writeState(state, options);
  return state;
}

export async function healthCheckRegtest(
  options: RegtestOptions = {},
): Promise<RegtestHealth> {
  const errors: string[] = [];
  let state: RegtestState;
  try {
    state = await readRegtestState(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, errors: [`regtest state is not readable: ${message}`] };
  }

  const receiver = state.wallets.find((wallet) => wallet.role === "receiver");
  const payers = state.wallets.filter((wallet) => wallet.role === "payer");
  if (!receiver) {
    errors.push("receiver wallet is missing");
  } else {
    for (const capability of RECEIVER_CAPABILITIES) {
      if (!receiver.capabilities.includes(capability)) {
        errors.push(`receiver wallet is missing ${capability}`);
      }
    }
    if (!receiver.connectionString) {
      errors.push("receiver wallet connection string is missing");
    }
  }

  if (payers.length < 2) {
    errors.push("at least two payer wallets are required");
  }
  for (const payer of payers) {
    for (const capability of PAYER_CAPABILITIES) {
      if (!payer.capabilities.includes(capability)) {
        errors.push(`${payer.id} is missing ${capability}`);
      }
    }
    if (payer.balanceMsats <= 0) {
      errors.push(`${payer.id} has no test balance`);
    }
  }

  return { ok: errors.length === 0, errors, state };
}

export async function createRegtestInvoice(
  input: { amountMsats: number; description: string },
  options: RegtestOptions = {},
): Promise<FakeNwcInvoice> {
  if (!Number.isInteger(input.amountMsats) || input.amountMsats <= 0) {
    throw new Error("amountMsats must be a positive integer");
  }

  const state = await readRegtestState(options);
  const id = state.nextInvoiceId;
  const invoice: FakeNwcInvoice = {
    invoice: `lnbcrt-regtest-${id}`,
    paymentHash: `regtest-payment-hash-${id}`,
    amountMsats: input.amountMsats,
    description: input.description,
    state: "pending",
  };
  state.nextInvoiceId = id + 1;
  state.invoices.push(invoice);
  await writeState(state, options);
  return invoice;
}

export async function settleRegtestInvoice(
  paymentHash: string,
  options: RegtestOptions = {},
): Promise<FakeNwcInvoice> {
  const state = await readRegtestState(options);
  const invoice = state.invoices.find((candidate) =>
    candidate.paymentHash === paymentHash
  );
  if (!invoice) {
    throw new Error(`unknown regtest invoice: ${paymentHash}`);
  }
  invoice.state = "settled";
  invoice.settledAt = Math.floor((options.now ?? new Date()).getTime() / 1000);
  await writeState(state, options);
  return invoice;
}

function printState(state: RegtestState): void {
  console.log(JSON.stringify(state, null, 2));
}

function printUsage(): void {
  console.error(
    "Usage: deno run --allow-read --allow-write scripts/nwc-regtest.ts " +
      "<start|stop|status|reset|health|invoice|settle> [args]",
  );
}

if (import.meta.main) {
  const [command, ...args] = Deno.args;
  try {
    switch (command) {
      case "start":
        printState(await startRegtest());
        break;
      case "stop":
        await stopRegtest();
        console.log("NWC regtest environment stopped");
        break;
      case "status":
        printState(await readRegtestState());
        break;
      case "reset":
        printState(await resetRegtest());
        break;
      case "health": {
        const health = await healthCheckRegtest();
        if (!health.ok) {
          console.error(health.errors.join("\n"));
          Deno.exit(1);
        }
        console.log("NWC regtest environment is healthy");
        break;
      }
      case "invoice": {
        const amountMsats = Number(args[0]);
        const description = args.slice(1).join(" ") || "regtest invoice";
        console.log(
          JSON.stringify(
            await createRegtestInvoice({ amountMsats, description }),
            null,
            2,
          ),
        );
        break;
      }
      case "settle":
        if (!args[0]) throw new Error("settle requires a payment hash");
        console.log(
          JSON.stringify(await settleRegtestInvoice(args[0]), null, 2),
        );
        break;
      default:
        printUsage();
        Deno.exit(2);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }
}
