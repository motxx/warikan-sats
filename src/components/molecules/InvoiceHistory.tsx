import { IonGrid, IonItem, IonList } from "@ionic/react";
import { Invoice, InvoiceRow } from "./InvoiceRow";

type Props = {
    lang: 'ja' | 'en';
    invoices: Invoice[];
}

export const InvoiceHistory: React.FC<Props> = (props: Props) => {
    return (
        <IonList>
            {props.invoices.map((invoice, idx) => (
                <IonItem key={idx}>
                    <IonGrid>
                        <InvoiceRow
                            lang={props.lang}
                            invoice={invoice}
                        />
                    </IonGrid>
                </IonItem>
            ))}
        </IonList>
    )
};
