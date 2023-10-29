import React, { useState } from "react";
import { IonPage } from "@ionic/react";
import { WalletOverviewTemplate } from "../components/templates/WalletOverviewTemplate";
import { Invoice } from "../components/templates/WalletOverview/InvoicesList/ListItem";
import { Menu } from "../components/templates/Common/Menu";
import { Header } from "../components/templates/Common/Header";

const lang = "ja";
const mockBalance = 10000;
const mockInvoices: Invoice[] = [
  { type: "received", note: "飲み会🍻", amount: 4000 },
  { type: "sent", note: "Thank you for your streaming!!", amount: 3700 },
  { type: "sent", note: "忘年会", amount: 1000 },
];

export const WalletOverviewPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  return (
    <>
      <Menu />
      <IonPage id="main-content">
        <Header />
        <WalletOverviewTemplate
          invoices={mockInvoices}
          setInvoices={setInvoices}
          balance={mockBalance}
          lang={lang}
        />
      </IonPage>
    </>
  );
};
