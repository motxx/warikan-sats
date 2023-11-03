import React from "react";
import { IonCard, IonCardContent } from "@ionic/react";
import { Amount } from "../atoms/Amount";
import { fromSats } from "../../services/currency";

type Props = {
  balance: number; // sats
  lang: "ja" | "en";
};

export const WalletBalance: React.FC<Props> = ({ balance, lang }) => {
  return (
    <IonCard>
      <IonCardContent>
        <div className="text-3xl text-white font-extrabold">
          <Amount
            currencyUnit={lang === "ja" ? "jpy" : "usd"}
            amount={fromSats(balance, lang === "ja" ? "jpy" : "usd")}
          />
        </div>
        <div>
          <Amount currencyUnit="sats" amount={balance} />
        </div>
      </IonCardContent>
    </IonCard>
  );
};
