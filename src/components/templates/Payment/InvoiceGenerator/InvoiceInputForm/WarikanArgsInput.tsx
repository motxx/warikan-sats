import React from "react";
import { NumberInput } from "../../../../atoms/inputs/NumberInput";
import { toSats } from "../../../../../services/currency";

type Props = {
  onInput: (input: { amount: number; participantCount: number }) => void;
  lang: "ja" | "en";
};

export const WarikanArgsInput: React.FC<Props> = ({ onInput, lang }) => {
  const [total, setTotal] = React.useState<number>(0);
  const [dividedBy, setDividedBy] = React.useState<number>(1);

  React.useEffect(() => {
    if (isNaN(total)) {
      setTotal(0);
    } else if (isNaN(dividedBy)) {
      setDividedBy(1);
    } else {
      const fiatBalance = total / dividedBy;
      onInput({
        amount: toSats(fiatBalance, lang === "ja" ? "jpy" : "usd"),
        participantCount: Math.max(1, Math.floor(dividedBy)),
      });
    }
  }, [total, dividedBy]);

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <label className="grid gap-2 text-sm font-medium text-white">
        <span>合計</span>
        <div>
          <NumberInput
            ariaLabel="Total amount"
            onInput={setTotal}
            prefix={lang === "ja" ? "\xA5" : "$"}
            defaultValue={0}
          />
        </div>
      </label>
      <label className="grid gap-2 text-sm font-medium text-white">
        <span>人数</span>
        <div>
          <NumberInput
            ariaLabel="Participant count"
            onInput={setDividedBy}
            defaultValue={1}
          />
        </div>
      </label>
    </div>
  );
};
