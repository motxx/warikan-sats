import React from "react";
import { Amount } from "../../atoms/texts/Amount";
import { fromSats } from "../../../services/currency";

type Props = {
  balance: number; // sats
  lang: "ja" | "en";
};

export const WalletBalance: React.FC<Props> = ({ balance, lang }) => {
  return (
    <div className="grid grid-cols-1 place-items-center gap-2">
      <div className="text-3xl text-white font-extrabold">
        <Amount
          currencyUnit={lang === "ja" ? "jpy" : "usd"}
          amount={fromSats(balance, lang === "ja" ? "jpy" : "usd")}
        />
      </div>
      <div className="text-xs">
        <Amount currencyUnit="sats" amount={balance} />
      </div>
    </div>
  );
};
