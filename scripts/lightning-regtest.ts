#!/usr/bin/env -S deno run --allow-run --allow-read

const PROJECT = "warikan-sats-lightning-regtest";
const COMPOSE_FILE =
  new URL("../docker-compose.lightning-regtest.yml", import.meta.url)
    .pathname;
const BITCOIN_AUTH = [
  "-regtest",
  "-rpcuser=regtest",
  "-rpcpassword=regtest",
];
const LIGHTNING = ["lightning-cli", "--network=regtest"];

interface CommandResult {
  code: number;
  stdout: string;
  stderr: string;
}

async function run(
  args: string[],
  options: { check?: boolean; quiet?: boolean } = {},
): Promise<CommandResult> {
  const command = new Deno.Command(args[0]!, {
    args: args.slice(1),
    stdout: "piped",
    stderr: "piped",
  });
  const output = await command.output();
  const result = {
    code: output.code,
    stdout: new TextDecoder().decode(output.stdout).trim(),
    stderr: new TextDecoder().decode(output.stderr).trim(),
  };
  if (!options.quiet && result.stdout) console.log(result.stdout);
  if (!options.quiet && result.stderr) console.error(result.stderr);
  if (options.check !== false && result.code !== 0) {
    throw new Error(
      `command failed (${result.code}): ${
        args.join(" ")
      }\n${result.stdout}\n${result.stderr}`,
    );
  }
  return result;
}

function composeArgs(args: string[]): string[] {
  return ["docker", "compose", "-p", PROJECT, "-f", COMPOSE_FILE, ...args];
}

async function compose(
  args: string[],
  options: { check?: boolean; quiet?: boolean } = {},
): Promise<CommandResult> {
  return await run(composeArgs(args), options);
}

async function execRaw(
  service: string,
  args: string[],
  options: { check?: boolean; quiet?: boolean } = {},
): Promise<string> {
  return (await compose(["exec", "-T", service, ...args], options)).stdout;
}

async function execJson<T>(
  service: string,
  args: string[],
  options: { check?: boolean; quiet?: boolean } = {},
): Promise<T> {
  const stdout = await execRaw(service, args, { ...options, quiet: true });
  try {
    return JSON.parse(stdout) as T;
  } catch {
    throw new Error(`expected JSON from ${service}: ${stdout}`);
  }
}

async function bitcoinRaw(args: string[]): Promise<string> {
  return await execRaw("bitcoind", ["bitcoin-cli", ...BITCOIN_AUTH, ...args], {
    quiet: true,
  });
}

async function bitcoinJson<T>(args: string[]): Promise<T> {
  return await execJson("bitcoind", ["bitcoin-cli", ...BITCOIN_AUTH, ...args]);
}

async function lightningJson<T>(service: string, args: string[]): Promise<T> {
  return await execJson(service, [...LIGHTNING, ...args]);
}

async function waitFor(
  label: string,
  fn: () => Promise<boolean>,
  options: { attempts?: number; intervalMs?: number } = {},
): Promise<void> {
  const attempts = options.attempts ?? 60;
  const intervalMs = options.intervalMs ?? 1_000;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      if (await fn()) return;
    } catch {
      // Keep polling; containerized services often reject early RPC attempts.
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`${label} did not become ready`);
}

async function ensureMinerWallet(): Promise<void> {
  await bitcoinRaw(["createwallet", "miner"]).catch(() => "");
}

async function mine(blocks: number): Promise<void> {
  await ensureMinerWallet();
  const address = await bitcoinRaw(["-rpcwallet=miner", "getnewaddress"]);
  await bitcoinJson([
    "-rpcwallet=miner",
    "generatetoaddress",
    String(blocks),
    address,
  ]);
}

async function start(): Promise<void> {
  await compose(["up", "-d", "bitcoind", "cln-receiver", "cln-payer"]);
}

async function stop(): Promise<void> {
  await compose(["down"]);
}

async function reset(): Promise<void> {
  await compose(["down", "-v", "--remove-orphans"]);
}

async function status(): Promise<void> {
  await compose(["ps"]);
}

async function health(): Promise<void> {
  await waitFor("bitcoind RPC", async () => {
    const info = await bitcoinJson<{ chain: string }>(["getblockchaininfo"]);
    return info.chain === "regtest";
  });
  await waitFor("receiver lightningd", async () => {
    const info = await lightningJson<{ network: string }>("cln-receiver", [
      "getinfo",
    ]);
    return info.network === "regtest";
  });
  await waitFor("payer lightningd", async () => {
    const info = await lightningJson<{ network: string }>("cln-payer", [
      "getinfo",
    ]);
    return info.network === "regtest";
  });
  console.log("Lightning regtest containers are healthy");
}

async function fundPayer(): Promise<void> {
  const address = await lightningJson<{ bech32: string }>("cln-payer", [
    "newaddr",
    "bech32",
  ]);
  await ensureMinerWallet();
  await bitcoinRaw(["-rpcwallet=miner", "sendtoaddress", address.bech32, "1"]);
  await mine(6);
  await waitFor("payer confirmed on-chain funds", async () => {
    const funds = await lightningJson<{
      outputs?: Array<{ status?: string; amount_msat?: number | string }>;
    }>("cln-payer", ["listfunds"]);
    return (funds.outputs ?? []).some((output) =>
      output.status === "confirmed" && msats(output.amount_msat) > 0
    );
  }, { attempts: 90 });
}

async function openChannel(): Promise<void> {
  const receiver = await lightningJson<{ id: string }>("cln-receiver", [
    "getinfo",
  ]);
  await execRaw("cln-payer", [
    ...LIGHTNING,
    "connect",
    `${receiver.id}@cln-receiver:9735`,
  ], { check: false, quiet: true });
  await lightningJson("cln-payer", ["fundchannel", receiver.id, "1000000sat"]);
  await mine(6);
  await waitFor("payer channel", async () => {
    const channels = await lightningJson<{
      channels?: Array<{ state?: string }>;
    }>("cln-payer", ["listpeerchannels", receiver.id]);
    return (channels.channels ?? []).some((channel) =>
      channel.state === "CHANNELD_NORMAL"
    );
  }, { attempts: 90 });
}

function msats(value: number | string | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return Number(value.replace(/msat$/, ""));
}

async function payInvoice(): Promise<void> {
  const label = `warikan-${Date.now()}`;
  const invoice = await lightningJson<{
    bolt11: string;
    payment_hash: string;
  }>("cln-receiver", [
    "invoice",
    "21000msat",
    label,
    "warikan lightning regtest smoke",
  ]);
  await lightningJson("cln-payer", ["pay", invoice.bolt11]);
  const settled = await lightningJson<{
    invoices: Array<{ payment_hash: string; status: string }>;
  }>("cln-receiver", ["listinvoices", label]);
  const match = settled.invoices.find((candidate) =>
    candidate.payment_hash === invoice.payment_hash
  );
  if (match?.status !== "paid") {
    throw new Error(`invoice was not paid: ${JSON.stringify(settled)}`);
  }
}

async function smoke(): Promise<void> {
  await reset();
  try {
    await start();
    await health();
    await mine(101);
    await fundPayer();
    await openChannel();
    await payInvoice();
    console.log("Lightning regtest smoke payment completed");
  } finally {
    await reset().catch(() => {});
  }
}

if (import.meta.main) {
  const command = Deno.args[0] ?? "smoke";
  switch (command) {
    case "start":
      await start();
      break;
    case "stop":
      await stop();
      break;
    case "reset":
      await reset();
      break;
    case "status":
      await status();
      break;
    case "health":
      await health();
      break;
    case "smoke":
      await smoke();
      break;
    default:
      console.error(
        "Usage: deno run --allow-run --allow-read scripts/lightning-regtest.ts <start|stop|reset|status|health|smoke>",
      );
      Deno.exit(2);
  }
}
