import React from "react";
import { Amount } from "../../../../atoms/texts/Amount";
import { fromSats } from "../../../../../services/currency";

type Props = {
  balance: number; // sats
  lang: "ja" | "en";
};

export const ResultBalance: React.FC<Props> = ({ balance, lang }) => {
  return (
    <div className="flex flex-col place-items-center gap-y-2 rounded-2xl border border-[#d7e1d4] bg-[#eef6ea] px-4 py-5 text-center">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#a05a00]">
        Each person pays
      </div>
      <div className="text-4xl font-extrabold leading-none text-[#1e231f]">
        <Amount currencyUnit="sats" amount={balance} />
      </div>
      <div className="text-sm font-medium text-[#5c675d]">
        <Amount
          currencyUnit={lang === "ja" ? "jpy" : "usd"}
          amount={fromSats(balance, lang === "ja" ? "jpy" : "usd")}
        />
      </div>
    </div>
  );
};
