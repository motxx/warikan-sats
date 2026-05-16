import { assertEquals, assertRejects } from "@std/assert";
import { FakeNwcWallet } from "../helpers/fake_nwc_wallet.ts";

Deno.test("fake NWC wallet creates and settles invoices", () => {
  const wallet = new FakeNwcWallet();
  const invoice = wallet.createInvoice({
    amountMsats: 21_000,
    description: "warikan participant 1",
  });

  assertEquals(invoice.state, "pending");
  assertEquals(wallet.lookupInvoice(invoice.paymentHash).state, "pending");

  wallet.settleInvoice(invoice.paymentHash, 1_700_000_123);

  assertEquals(wallet.lookupInvoice(invoice.paymentHash), {
    ...invoice,
    state: "settled",
    settledAt: 1_700_000_123,
  });
});

Deno.test("fake NWC wallet enforces required capabilities", async () => {
  const wallet = new FakeNwcWallet(["lookup_invoice"]);

  await assertRejects(
    async () => {
      wallet.createInvoice({
        amountMsats: 21_000,
        description: "warikan participant 1",
      });
    },
    Error,
    "missing NWC capabilities: make_invoice",
  );
});
