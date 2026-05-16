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
    <div className="flex flex-col place-items-center h-full w-full">
      <WarikanArgsInput
        onInput={(input) => {
          setResultBalance(input.amount);
          setParticipantCount(input.participantCount);
        }}
        lang="ja"
      />
      <div className="pt-[15%] pb-[5%]">
        <ResultBalance balance={resultBalance} lang="ja" />
      </div>
      <div className="w-3/5">
        <AddNotes onInput={setNotes} />
      </div>
    </div>
  );
};
