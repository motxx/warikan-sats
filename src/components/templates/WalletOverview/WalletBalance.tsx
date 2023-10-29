import React from "react";
import { IonCard, IonCardContent } from "@ionic/react";
import { Amount } from "../../atoms/Amount";

type Props = {
  balance: number; // sats
  lang: "ja" | "en";
};

export const WalletBalance: React.FC<Props> = ({ balance, lang }) => {
  return (
    <>
      <IonCard>
        <IonCardContent>
          <div>
            <Amount
              currencyUnit={lang === "ja" ? "jpy" : "usd"}
              amount={balance / 123} // TODO: use real exchange rate
            />
          </div>
          <div>
            <Amount currencyUnit="sats" amount={balance} />
          </div>
        </IonCardContent>
      </IonCard>
    </>
  );
};
