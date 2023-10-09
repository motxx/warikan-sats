import React from 'react';
import { InvoiceHistory } from '../molecules/InvoiceHistory';
import { Invoice } from '../molecules/InvoiceRow';

type Props = {
    invoices: Invoice[];
    onInvoiceGenerated: OnInvoiceGenerated;
    lang: 'ja' | 'en';
};

export type OnInvoiceGenerated = (invoices: Invoice[]) => void;

export const InvoiceHistoryCard: React.FC<Props> = (props: Props) => {
    return (
        <div>
            <h2>History</h2>
            <InvoiceHistory
                lang={props.lang}
                invoices={props.invoices}
            />
        </div>
    );
};
