// src/pages/Tab2.tsx

import React from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent } from '@ionic/react';
import Payer from '../components/Payer';

const Tab2: React.FC = () => {
    const invoices = [
        { name: "Alice", amount: 500 },
        { name: "Bob", amount: 500 },
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>請求書の支払い</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonCard>
                    <IonCardContent>
                        <Payer invoices={invoices} />
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default Tab2;