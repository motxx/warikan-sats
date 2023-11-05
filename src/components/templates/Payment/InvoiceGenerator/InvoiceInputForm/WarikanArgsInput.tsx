import React from "react";
import { IonCard, IonCardContent } from "@ionic/react";
import { NumberInput } from "../../../../atoms/inputs/NumberInput";

type Props = {
  onChange: (amount: number) => void;
  lang: "ja" | "en";
};

export const WarikanArgsInput: React.FC<Props> = ({ onChange, lang }) => {
  const [total, setTotal] = React.useState<number>(0);
  const [dividedBy, setDividedBy] = React.useState<number>(1);

  React.useEffect(() => {
    onChange(total / dividedBy);
  }, [total, dividedBy]);

  return (
    <IonCard>
      <IonCardContent>
        <div className="grid grid-cols-2 place-items-center gap-8">
          <div className="grid grid-cols-2 place-items-center text-sm text-white font-medium">
            <span className="min-w-[30px] pt-4">total</span>
            <NumberInput
              onInput={setTotal}
              prefix={lang === "ja" ? "\xA5" : "$"}
            />
          </div>
          <div className="grid grid-cols-2 place-items-center text-sm text-white font-medium">
            <span className="min-w-[50px] pt-4">divided by</span>
            <NumberInput onInput={setDividedBy} defaultValue={1} />
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};
