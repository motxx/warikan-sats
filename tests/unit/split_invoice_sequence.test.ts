import { assertEquals, assertRejects } from "@std/assert";
import {
  confirmActiveSplitInvoice,
  createSplitInvoiceSequence,
  getActiveSplitInvoice,
  retryActiveSplitInvoice,
  type SplitInvoiceClient,
} from "../../src/services/splitInvoiceSequence.ts";
import type {
  NwcCreateInvoiceInput,
  NwcInvoice,
  NwcLookupInvoiceInput,
  NwcLookupInvoiceResult,
} from "../../src/services/nwc.ts";

class FakeSplitInvoiceClient implements SplitInvoiceClient {
  created: NwcCreateInvoiceInput[] = [];
  lookupResults: NwcLookupInvoiceResult[] = [];
  #nextInvoiceId = 1;

  async createInvoice(input: NwcCreateInvoiceInput): Promise<NwcInvoice> {
    this.created.push(input);
    const id = this.#nextInvoiceId++;
    return {
      invoice: `lnbc-split-${id}`,
      paymentHash: `payment-hash-${id}`,
      amountMsats: input.amountMsats,
    };
  }

  async lookupInvoice(
    _input: NwcLookupInvoiceInput,
  ): Promise<NwcLookupInvoiceResult> {
    return this.lookupResults.shift() ?? { state: "pending" };
  }
}

Deno.test("split invoice sequence creates one invoice per participant", async () => {
  const client = new FakeSplitInvoiceClient();

  const sequence = await createSplitInvoiceSequence({
    splitId: "split-1",
    amountMsats: 21_000,
    participantCount: 3,
    note: "dinner",
  }, client);

  assertEquals(sequence.status, "ready");
  assertEquals(sequence.activeIndex, 0);
  assertEquals(sequence.invoices.map((invoice) => invoice.invoice), [
    "lnbc-split-1",
    "lnbc-split-2",
    "lnbc-split-3",
  ]);
  assertEquals(client.created.map((input) => input.description), [
    "warikan split-1 participant 1/3 - dinner",
    "warikan split-1 participant 2/3 - dinner",
    "warikan split-1 participant 3/3 - dinner",
  ]);
});

Deno.test("split invoice sequence advances only after settlement", async () => {
  const client = new FakeSplitInvoiceClient();
  client.lookupResults = [
    { state: "pending" },
    { state: "settled", settledAt: 1_778_889_600 },
  ];
  const sequence = await createSplitInvoiceSequence({
    amountMsats: 21_000,
    participantCount: 2,
  }, client);

  const stillWaiting = await confirmActiveSplitInvoice(sequence, client);
  assertEquals(stillWaiting.status, "ready");
  assertEquals(stillWaiting.activeIndex, 0);
  assertEquals(
    getActiveSplitInvoice(stillWaiting)?.paymentHash,
    "payment-hash-1",
  );

  const advanced = await confirmActiveSplitInvoice(stillWaiting, client);
  assertEquals(advanced.status, "ready");
  assertEquals(advanced.activeIndex, 1);
  assertEquals(advanced.invoices[0]?.state, "settled");
});

Deno.test("split invoice sequence reaches completed after the final participant pays", async () => {
  const client = new FakeSplitInvoiceClient();
  client.lookupResults = [{ state: "settled", settledAt: 1_778_889_600 }];
  const sequence = await createSplitInvoiceSequence({
    amountMsats: 21_000,
    participantCount: 1,
  }, client);

  const completed = await confirmActiveSplitInvoice(sequence, client);

  assertEquals(completed.status, "completed");
  assertEquals(getActiveSplitInvoice(completed), null);
});

Deno.test("split invoice sequence keeps failed participant active and can retry", async () => {
  const client = new FakeSplitInvoiceClient();
  client.lookupResults = [{ state: "expired" }];
  const sequence = await createSplitInvoiceSequence({
    amountMsats: 21_000,
    participantCount: 2,
  }, client);

  const failed = await confirmActiveSplitInvoice(sequence, client);
  assertEquals(failed.status, "failed");
  assertEquals(failed.activeIndex, 0);
  assertEquals(getActiveSplitInvoice(failed)?.state, "failed");

  const retried = await retryActiveSplitInvoice(failed, client);
  assertEquals(retried.status, "ready");
  assertEquals(retried.activeIndex, 0);
  assertEquals(getActiveSplitInvoice(retried)?.state, "pending");
  assertEquals(getActiveSplitInvoice(retried)?.paymentHash, "payment-hash-3");
});

Deno.test("split invoice sequence validates amount and participant count", async () => {
  const client = new FakeSplitInvoiceClient();

  await assertRejects(
    () =>
      createSplitInvoiceSequence({
        amountMsats: 0,
        participantCount: 2,
      }, client),
    Error,
    "amountMsats must be a positive integer",
  );

  await assertRejects(
    () =>
      createSplitInvoiceSequence({
        amountMsats: 21_000,
        participantCount: 0,
      }, client),
    Error,
    "participantCount must be a positive integer",
  );
});
