import { assert, assertEquals } from "@std/assert";
import {
  readRegtestState,
  settleRegtestInvoice,
  startRegtest,
  stopRegtest,
} from "../../scripts/nwc-regtest.ts";
import { RegtestNwcTransport } from "../helpers/regtest_nwc_transport.ts";
import {
  MemoryNwcConnectionStore,
  NwcWalletConnector,
} from "../../src/services/nwc.ts";
import {
  confirmActiveSplitInvoice,
  createSplitInvoiceSequence,
  getActiveSplitInvoice,
  type SplitInvoiceClient,
} from "../../src/services/splitInvoiceSequence.ts";

async function withRegtestDir(
  fn: (rootDir: string) => Promise<void>,
): Promise<void> {
  const rootDir = await Deno.makeTempDir({
    prefix: "warikan-nwc-e2e-",
  });
  try {
    await fn(rootDir);
  } finally {
    await stopRegtest({ rootDir }).catch(() => {});
    await Deno.remove(rootDir, { recursive: true }).catch(() => {});
  }
}

Deno.test("NWC regtest completes a three-person split payment sequentially", async () => {
  await withRegtestDir(async (rootDir) => {
    const regtest = await startRegtest({
      rootDir,
      now: new Date("2026-05-16T00:00:00.000Z"),
    });
    const receiver = regtest.wallets.find((wallet) =>
      wallet.role === "receiver"
    );
    assert(receiver?.connectionString);

    const connector = new NwcWalletConnector(
      new MemoryNwcConnectionStore(),
      new RegtestNwcTransport({ rootDir }),
    );
    assertEquals(await connector.connect(receiver.connectionString), "ready");
    assertEquals(await connector.getBalance(), { balanceMsats: 0 });

    const splitClient: SplitInvoiceClient = {
      createInvoice: (input) => connector.createInvoice(input),
      lookupInvoice: (input) => connector.lookupInvoice(input),
    };
    let sequence = await createSplitInvoiceSequence({
      splitId: "e2e-regtest",
      amountMsats: 21_000,
      participantCount: 3,
      note: "regtest dinner",
    }, splitClient);

    assertEquals(sequence.status, "ready");
    assertEquals(sequence.invoices.length, 3);
    assertEquals((await readRegtestState({ rootDir })).invoices.length, 3);

    sequence = await confirmActiveSplitInvoice(sequence, splitClient);
    assertEquals(sequence.status, "ready");
    assertEquals(sequence.activeIndex, 0);

    for (let participantIndex = 1; participantIndex <= 3; participantIndex++) {
      const active = getActiveSplitInvoice(sequence);
      assert(active);
      assertEquals(active.participantIndex, participantIndex);

      await settleRegtestInvoice(active.paymentHash, {
        rootDir,
        now: new Date(`2026-05-16T00:00:0${participantIndex}.000Z`),
      });
      sequence = await confirmActiveSplitInvoice(sequence, splitClient);

      assertEquals(
        sequence.invoices[participantIndex - 1]?.state,
        "settled",
      );
      assertEquals(sequence.activeIndex, participantIndex);
    }

    assertEquals(sequence.status, "completed");
    assertEquals(getActiveSplitInvoice(sequence), null);
    assertEquals(
      (await readRegtestState({ rootDir })).invoices.map((invoice) =>
        invoice.state
      ),
      ["settled", "settled", "settled"],
    );
  });
});
