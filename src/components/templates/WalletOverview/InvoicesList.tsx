import React from "react";
import { Invoice, InvoicesListItem } from "./InvoicesList/ContactListItem";
import { IonList } from "@ionic/react";

type Props = {
  invoices: Invoice[];
  lang: "ja" | "en";
  onInvoiceGenerated: OnInvoiceGenerated;
};

export type OnInvoiceGenerated = (invoices: Invoice[]) => void;

export const InvoicesList: React.FC<Props> = ({
  invoices,
  lang,
  onInvoiceGenerated,
}) => {
  return (
    <div className="grid grid-cols-1 place-items-center gap-y-[0%]">
      <h2 className="h-full font-semibold text-lg">History</h2>
      <IonList className="h-[80%] overflow-y-scroll">
        {invoices.map((invoice, idx) => (
          <InvoicesListItem lang={lang} key={idx} invoice={invoice} />
        ))}
      </IonList>
    </div>
  );
};
