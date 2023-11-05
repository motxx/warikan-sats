import { IonLabel } from "@ionic/react";
import { Amount } from "../../../../atoms/texts/Amount";

type Props = {
  type: "sent" | "received";
  currencyUnit: "jpy" | "usd";
  amount: number;
};

export const AmountChange: React.FC<Props> = ({
  type,
  currencyUnit,
  amount,
}) => {
  return (
    <IonLabel>
      {type === "sent" ? "-" : "+"}
      {` `}
      <Amount currencyUnit={currencyUnit} amount={amount} />
    </IonLabel>
  );
};
