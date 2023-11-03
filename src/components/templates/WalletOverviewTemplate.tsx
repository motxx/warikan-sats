import React from "react";
import { IonContent } from "@ionic/react";
import { Invoice } from "./WalletOverview/InvoicesList/ListItem";
import { WalletBalance } from "./WalletBalance";
import { InvoicesList } from "./WalletOverview/InvoicesList";

type Props = {
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
  balance: number;
  lang: "ja" | "en";
};

export const WalletOverviewTemplate: React.FC<Props> = ({
  invoices,
  setInvoices,
  balance,
  lang,
}) => {
  return (
    <IonContent>
      <div className="grid grid-cols-1 place-items-center h-[95%] overflow-y-clip">
        <div className="grid grid-cols-1 place-items-center h-full w-[50%] min-w-[375px]">
          <WalletBalance balance={balance} lang={lang} />
          <InvoicesList
            invoices={invoices}
            onInvoiceGenerated={setInvoices}
            lang={lang}
          />
        </div>
      </div>
    </IonContent>
  );
};
