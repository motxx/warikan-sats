import React, { useState } from "react";
import { ResultBalance } from "./InvoiceInputForm/ResultBalance";
import { WarikanArgsInput } from "./InvoiceInputForm/WarikanArgsInput";

type Props = {
  onChange: (amount: number) => void;
};

export const InvoiceInputForm: React.FC<Props> = ({ onChange }) => {
  const [resultBalance, setResultBalance] = useState<number>(0);

  return (
    <>
      <WarikanArgsInput onChange={setResultBalance} lang="ja" />
      <ResultBalance balance={resultBalance} lang="ja" />
    </>
  );
};
