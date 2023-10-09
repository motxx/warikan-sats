import React from 'react';
import { IonContent } from '@ionic/react';
import { Invoice } from '../molecules/InvoiceRow';
import { Header } from '../organisms/Header';
import { BalanceCard } from '../organisms/BalanceCard';
import { InvoiceHistoryCard } from '../organisms/InvoiceHistoryCard';

type Props = {
    invoices: Invoice[];
    setInvoices: (invoices: Invoice[]) => void;
    balance: number;
    lang: 'ja' | 'en';
};

export const HomeTemplate: React.FC<Props> = (props: Props) => {
    return (
        <>
            <Header />
            <IonContent className="ion-text-center">
                <BalanceCard
                    balance={props.balance}
                    lang={props.lang}
                />
                <InvoiceHistoryCard
                    invoices={props.invoices}
                    onInvoiceGenerated={props.setInvoices}
                    lang={props.lang}
                />
            </IonContent>
        </>
    );
};
