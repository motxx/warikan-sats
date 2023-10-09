import React, { useState } from 'react';
import { IonPage } from '@ionic/react';
import { HomeTemplate } from '../components/templates/HomeTemplate';
import { Invoice } from '../components/molecules/InvoiceRow';

const lang = 'ja';
const mockBalance = 10000;
const mockInvoices: Invoice[] = [
    { type: 'received', note: '飲み会🍻', amount: 4000 },
    { type: 'sent', note: 'Thank you for your streaming!!', amount: 3700 },
    { type: 'sent', note: '忘年会', amount: 1000 },
];

export const Home: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    return (
        <IonPage>
            <HomeTemplate
                invoices={mockInvoices}
                setInvoices={setInvoices}
                balance={mockBalance}
                lang={lang}
            />
        </IonPage>
    );
};
