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
    <div className="flex flex-row gap-4">
      <div className="w-3/5 flex flex-row place-items-center text-sm text-white font-medium">
        <span className="w-1/3 min-w-[30px] pt-4 text-center">total</span>
        <div className="w-2/3">
          <NumberInput
            ariaLabel="Total amount"
            onInput={setTotal}
            prefix={lang === "ja" ? "\xA5" : "$"}
            defaultValue={0}
          />
        </div>
      </div>
      <div className="w-2/5 flex flex-row place-items-center text-sm text-white font-medium">
        <span className="w-1/2 min-w-[30px] pt-4 text-center">divided by</span>
        <div className="w-2/3">
          <NumberInput
            ariaLabel="Participant count"
            onInput={setDividedBy}
            defaultValue={1}
          />
        </div>
      </div>
    </div>
  );
};
