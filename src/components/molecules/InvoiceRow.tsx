import { IonCol, IonRow } from "@ionic/react";
import { Label } from "../atoms/Label";
import { Payment } from "./Payment";

type Props = {
    invoice: Invoice;
    lang: 'ja' | 'en';
};

export type Invoice = {
    type: 'sent' | 'received';
    note: string;
    amount: number;
};

export const InvoiceRow: React.FC<Props> = (props: Props) => {
    return (
        <IonRow>
            <IonCol size="8">
                <Label label={props.invoice.note} />
            </IonCol>
            <IonCol size="4" className="ion-text-right">
                <Payment
                    currencyUnit={props.lang === 'ja' ? 'jpy' : 'usd'}
                    type={props.invoice.type}
                    amount={props.invoice.amount}
                />
          </IonCol>
      </IonRow>
    );
}
