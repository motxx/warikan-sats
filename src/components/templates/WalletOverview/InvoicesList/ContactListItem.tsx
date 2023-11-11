import { IonCol, IonGrid, IonItem, IonRow } from "@ionic/react";
import { Label } from "../../../atoms/texts/Label";
import { AmountChange } from "./Item/AmountChange";

type Props = {
  invoice: Invoice;
  lang: "ja" | "en";
};

export type Invoice = {
  type: "sent" | "received";
  note: string;
  amount: number;
};

export const InvoicesListItem: React.FC<Props> = ({ invoice, lang }) => {
  return (
    <IonItem>
      <IonGrid>
        <IonRow>
          <IonCol size="8">
            <Label>{invoice.note}</Label>
          </IonCol>
          <IonCol size="4" className="ion-text-right">
            <AmountChange
              currencyUnit={lang === "ja" ? "jpy" : "usd"}
              type={invoice.type}
              amount={invoice.amount}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonItem>
  );
};
