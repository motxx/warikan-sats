import React, { useState } from "react";
import { ResultBalance } from "./InvoiceInputForm/ResultBalance";
import { WarikanArgsInput } from "./InvoiceInputForm/WarikanArgsInput";
import { AddNotes } from "./InvoiceInputForm/AddNotes";

type Props = {
  onChange: (input: InvoiceInputValue) => void;
};

export interface InvoiceInputValue {
  amount: number;
  participantCount: number;
  notes: string;
}

export const InvoiceInputForm: React.FC<Props> = ({ onChange }) => {
  const [resultBalance, setResultBalance] = useState<number>(0);
  const [participantCount, setParticipantCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");

  React.useEffect(() => {
    onChange({ amount: resultBalance, participantCount, notes });
  }, [resultBalance, participantCount, notes]);

  return (
    <div className="flex h-full w-full flex-col items-stretch gap-4 rounded-[20px] border border-[#d7e1d4] bg-white p-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#a05a00]">
          Split details
        </div>
        <div className="mt-1 text-sm text-[#5c675d]">
          Enter the bill total and number of people.
        </div>
      </div>
      <WarikanArgsInput
        onInput={(input) => {
          setResultBalance(input.amount);
          setParticipantCount(input.participantCount);
        }}
        lang="ja"
      />
      <div>
        <ResultBalance balance={resultBalance} lang="ja" />
      </div>
      <div className="w-full">
        <label className="grid gap-2 text-sm font-semibold text-[#354036]">
          <span>Note</span>
          <AddNotes onInput={setNotes} />
        </label>
      </div>
    </div>
  );
};
