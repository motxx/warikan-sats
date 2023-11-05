import React, { useState } from "react";
import { ResultBalance } from "./InvoiceInputForm/ResultBalance";
import { WarikanArgsInput } from "./InvoiceInputForm/WarikanArgsInput";
import { AddNotes } from "./InvoiceInputForm/AddNotes";

type Props = {
  onChange: (amount: number) => void;
};

export const InvoiceInputForm: React.FC<Props> = ({ onChange }) => {
  const [resultBalance, setResultBalance] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  return (
    <div className="flex flex-col place-items-center h-full w-full">
      <WarikanArgsInput onInput={setResultBalance} lang="ja" />
      <div className="pt-[15%] pb-[5%]">
        <ResultBalance balance={resultBalance} lang="ja" />
      </div>
      <div className="w-3/5">
        <AddNotes onInput={setNotes} />
      </div>
    </div>
  );
};
