import { assert, assertEquals, assertRejects } from "@std/assert";
import {
  createRegtestInvoice,
  healthCheckRegtest,
  readRegtestState,
  resetRegtest,
  settleRegtestInvoice,
  startRegtest,
  stopRegtest,
} from "../../scripts/nwc-regtest.ts";

async function withRegtestDir(
  fn: (rootDir: string) => Promise<void>,
): Promise<void> {
  const rootDir = await Deno.makeTempDir({
    prefix: "warikan-nwc-regtest-",
  });
  try {
    await fn(rootDir);
  } finally {
    await Deno.remove(rootDir, { recursive: true }).catch(() => {});
  }
}

Deno.test("NWC regtest environment exposes a healthy receiver and payers", async () => {
  await withRegtestDir(async (rootDir) => {
    const state = await startRegtest({
      rootDir,
      now: new Date("2026-05-16T00:00:00.000Z"),
    });
    const health = await healthCheckRegtest({ rootDir });

    assert(health.ok);
    assertEquals(state.startedAt, "2026-05-16T00:00:00.000Z");
    assertEquals(
      state.wallets.filter((wallet) => wallet.role === "payer").length,
      3,
    );
    assertEquals(
      state.wallets.find((wallet) => wallet.role === "receiver")
        ?.capabilities,
      ["make_invoice", "lookup_invoice", "get_balance"],
    );
    assertEquals(
      state.wallets.find((wallet) => wallet.role === "receiver")
        ?.connectionString?.startsWith("nostr+walletconnect://"),
      true,
    );
  });
});

Deno.test("NWC regtest environment creates, settles, and resets invoices", async () => {
  await withRegtestDir(async (rootDir) => {
    await startRegtest({ rootDir });

    const invoice = await createRegtestInvoice({
      amountMsats: 42_000,
      description: "warikan participant 1",
    }, { rootDir });
    assertEquals(invoice.state, "pending");

    const settled = await settleRegtestInvoice(invoice.paymentHash, {
      rootDir,
      now: new Date("2026-05-16T00:00:05.000Z"),
    });
    assertEquals(settled.state, "settled");
    assertEquals(settled.settledAt, 1_778_889_605);

    const beforeReset = await readRegtestState({ rootDir });
    assertEquals(beforeReset.invoices.length, 1);

    const afterReset = await resetRegtest({ rootDir });
    assertEquals(afterReset.invoices, []);
    assertEquals(afterReset.nextInvoiceId, 1);
  });
});

Deno.test("NWC regtest environment reports missing state as unhealthy", async () => {
  await withRegtestDir(async (rootDir) => {
    await stopRegtest({ rootDir });

    const health = await healthCheckRegtest({ rootDir });

    assertEquals(health.ok, false);
    assertEquals(
      health.errors[0]?.startsWith("regtest state is not readable"),
      true,
    );
  });
});

Deno.test("NWC regtest invoice helper rejects invalid amounts", async () => {
  await withRegtestDir(async (rootDir) => {
    await startRegtest({ rootDir });

    await assertRejects(
      () =>
        createRegtestInvoice({
          amountMsats: 0,
          description: "invalid",
        }, { rootDir }),
      Error,
      "amountMsats must be a positive integer",
    );
  });
});
