import type {
  NwcCreateInvoiceInput,
  NwcInvoice,
  NwcInvoiceState,
  NwcLookupInvoiceInput,
  NwcLookupInvoiceResult,
} from "./nwc.ts";

export type SplitInvoiceSequenceStatus =
  | "idle"
  | "loading"
  | "ready"
  | "checking"
  | "failed"
  | "completed";

export interface SplitInvoiceClient {
  createInvoice(input: NwcCreateInvoiceInput): Promise<NwcInvoice>;
  lookupInvoice(input: NwcLookupInvoiceInput): Promise<NwcLookupInvoiceResult>;
}

export interface SplitInvoiceRecord {
  participantIndex: number;
  amountMsats: number;
  description: string;
  invoice: string;
  paymentHash: string;
  state: NwcInvoiceState;
  settledAt?: number;
  error?: string;
}

export interface SplitInvoiceSequence {
  splitId: string;
  participantCount: number;
  amountMsats: number;
  activeIndex: number;
  status: SplitInvoiceSequenceStatus;
  invoices: SplitInvoiceRecord[];
  error?: string;
}

export interface CreateSplitInvoiceSequenceInput {
  splitId?: string;
  amountMsats: number;
  participantCount: number;
  note?: string;
}

export async function createSplitInvoiceSequence(
  input: CreateSplitInvoiceSequenceInput,
  client: SplitInvoiceClient,
): Promise<SplitInvoiceSequence> {
  const normalized = normalizeSplitInput(input);
  const invoices: SplitInvoiceRecord[] = [];

  for (
    let participantIndex = 1;
    participantIndex <= normalized.participantCount;
    participantIndex++
  ) {
    const description = buildParticipantDescription({
      splitId: normalized.splitId,
      participantIndex,
      participantCount: normalized.participantCount,
      note: normalized.note,
    });
    const invoice = await client.createInvoice({
      amountMsats: normalized.amountMsats,
      description,
      metadata: {
        splitId: normalized.splitId,
        participantIndex,
        participantCount: normalized.participantCount,
      },
    });
    invoices.push({
      participantIndex,
      amountMsats: normalized.amountMsats,
      description,
      invoice: invoice.invoice,
      paymentHash: invoice.paymentHash,
      state: "pending",
    });
  }

  return {
    splitId: normalized.splitId,
    participantCount: normalized.participantCount,
    amountMsats: normalized.amountMsats,
    activeIndex: 0,
    status: invoices.length === 0 ? "completed" : "ready",
    invoices,
  };
}

export function getActiveSplitInvoice(
  sequence: SplitInvoiceSequence,
): SplitInvoiceRecord | null {
  if (sequence.status === "completed") return null;
  return sequence.invoices[sequence.activeIndex] ?? null;
}

export async function confirmActiveSplitInvoice(
  sequence: SplitInvoiceSequence,
  client: SplitInvoiceClient,
): Promise<SplitInvoiceSequence> {
  const active = getActiveSplitInvoice(sequence);
  if (!active) return { ...sequence, status: "completed" };

  const checking = { ...sequence, status: "checking" as const };
  try {
    const result = await client.lookupInvoice({
      paymentHash: active.paymentHash,
    });
    return applyLookupResult(checking, result);
  } catch (error) {
    return failActiveInvoice(checking, errorMessage(error));
  }
}

export async function retryActiveSplitInvoice(
  sequence: SplitInvoiceSequence,
  client: SplitInvoiceClient,
): Promise<SplitInvoiceSequence> {
  const active = getActiveSplitInvoice(sequence);
  if (!active) return sequence;

  try {
    const invoice = await client.createInvoice({
      amountMsats: active.amountMsats,
      description: active.description,
      metadata: {
        splitId: sequence.splitId,
        participantIndex: active.participantIndex,
        participantCount: sequence.participantCount,
      },
    });
    const invoices = sequence.invoices.map((candidate, index) =>
      index === sequence.activeIndex
        ? {
          ...candidate,
          invoice: invoice.invoice,
          paymentHash: invoice.paymentHash,
          state: "pending" as const,
          settledAt: undefined,
          error: undefined,
        }
        : candidate
    );
    return { ...sequence, invoices, status: "ready", error: undefined };
  } catch (error) {
    return failActiveInvoice(sequence, errorMessage(error));
  }
}

export function applyLookupResult(
  sequence: SplitInvoiceSequence,
  result: NwcLookupInvoiceResult,
): SplitInvoiceSequence {
  const active = getActiveSplitInvoice(sequence);
  if (!active) return { ...sequence, status: "completed" };

  if (result.state === "settled") {
    const invoices = sequence.invoices.map((candidate, index) =>
      index === sequence.activeIndex
        ? {
          ...candidate,
          state: "settled" as const,
          settledAt: result.settledAt,
          error: undefined,
        }
        : candidate
    );
    const nextIndex = sequence.activeIndex + 1;
    return {
      ...sequence,
      invoices,
      activeIndex: nextIndex,
      status: nextIndex >= invoices.length ? "completed" : "ready",
      error: undefined,
    };
  }

  if (result.state === "pending") {
    return markActiveState(sequence, "pending", "ready");
  }

  return failActiveInvoice(
    markActiveState(sequence, result.state, "failed"),
    `invoice ${result.state}`,
  );
}

export function buildParticipantDescription(input: {
  splitId: string;
  participantIndex: number;
  participantCount: number;
  note?: string;
}): string {
  const note = input.note?.trim();
  const suffix = note ? ` - ${note}` : "";
  return `warikan ${input.splitId} participant ${input.participantIndex}/${input.participantCount}${suffix}`;
}

function markActiveState(
  sequence: SplitInvoiceSequence,
  state: NwcInvoiceState,
  status: SplitInvoiceSequenceStatus,
): SplitInvoiceSequence {
  const invoices = sequence.invoices.map((candidate, index) =>
    index === sequence.activeIndex ? { ...candidate, state } : candidate
  );
  return { ...sequence, invoices, status };
}

function failActiveInvoice(
  sequence: SplitInvoiceSequence,
  message: string,
): SplitInvoiceSequence {
  const invoices = sequence.invoices.map((candidate, index) =>
    index === sequence.activeIndex
      ? { ...candidate, state: "failed" as const, error: message }
      : candidate
  );
  return { ...sequence, invoices, status: "failed", error: message };
}

function normalizeSplitInput(
  input: CreateSplitInvoiceSequenceInput,
): Required<CreateSplitInvoiceSequenceInput> {
  const participantCount = Math.floor(input.participantCount);
  if (!Number.isInteger(input.amountMsats) || input.amountMsats <= 0) {
    throw new Error("amountMsats must be a positive integer");
  }
  if (participantCount <= 0) {
    throw new Error("participantCount must be a positive integer");
  }
  return {
    splitId: input.splitId?.trim() || "local-split",
    amountMsats: input.amountMsats,
    participantCount,
    note: input.note?.trim() ?? "",
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
