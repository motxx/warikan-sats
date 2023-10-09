import { IonButton, IonList, IonItem, IonLabel } from '@ionic/react';
import React from 'react';

interface PayerProps {
    invoices: { name: string, amount: number }[];
}

const Payer: React.FC<PayerProps> = ({ invoices }) => {
    const handlePay = (invoice: { name: string, amount: number }) => {
        // ここでLightning Network経由での支払いロジックを実装します
        console.log(`Paying ${invoice.amount} to ${invoice.name}`);
    };

    return (
        <IonList>
            {invoices.map((invoice, idx) => (
                <IonItem key={idx}>
                    <IonLabel>{invoice.name}: {invoice.amount}円</IonLabel>
                    <IonButton slot="end" onClick={() => handlePay(invoice)}>支払う</IonButton>
                </IonItem>
            ))}
        </IonList>
    );
};

export default Payer;