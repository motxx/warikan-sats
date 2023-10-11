import React from "react";
import { IonContent } from "@ionic/react";
import { Invoice } from "./WalletOverview/InvoicesList/ListItem";
import { Header } from "./Common/Header";
import { WalletBalance } from "./WalletOverview/WalletBalance";
import { WalletInvoicesList } from "./WalletOverview/InvoicesList";

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
    <>
      <Header />
      <IonContent className="ion-text-center">
        <WalletBalance balance={balance} lang={lang} />
        <WalletInvoicesList
          invoices={invoices}
          onInvoiceGenerated={setInvoices}
          lang={lang}
        />
      </IonContent>
    </>
  );
};
