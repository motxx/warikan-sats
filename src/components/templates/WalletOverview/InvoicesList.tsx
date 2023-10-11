import React from "react";
import { Invoice, InvoicesListItem } from "./InvoicesList/ListItem";
import { IonGrid, IonItem, IonList } from "@ionic/react";

type Props = {
  invoices: Invoice[];
  lang: "ja" | "en";
  onInvoiceGenerated: OnInvoiceGenerated;
};

export type OnInvoiceGenerated = (invoices: Invoice[]) => void;

export const WalletInvoicesList: React.FC<Props> = ({
  invoices,
  lang,
  onInvoiceGenerated,
}) => {
  return (
    <div>
      <h2>History</h2>
      <IonList>
        {invoices.map((invoice, idx) => (
          <IonItem key={idx}>
            <IonGrid>
              <InvoicesListItem lang={lang} invoice={invoice} />
            </IonGrid>
          </IonItem>
        ))}
      </IonList>
    </div>
  );
};
