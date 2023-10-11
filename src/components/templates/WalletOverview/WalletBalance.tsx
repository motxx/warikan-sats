import React from "react";
import { IonCard, IonCardContent } from "@ionic/react";
import { Amount } from "../../atoms/Amount";

type Props = {
  balance: number;
  lang: "ja" | "en";
};

export const WalletBalance: React.FC<Props> = ({ balance, lang }) => {
  return (
    <>
      <IonCard>
        <IonCardContent>
          <h2>Balance</h2>
          <Amount
            currencyUnit={lang === "ja" ? "jpy" : "usd"}
            amount={balance}
          />
        </IonCardContent>
      </IonCard>
    </>
  );
};
