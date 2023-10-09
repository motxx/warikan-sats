// src/pages/Tab3.tsx

import React from 'react';
import { IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonCard, IonCardContent } from '@ionic/react';

const Tab3: React.FC = () => {
    const history = [
        { date: "2023-10-09", event: "Aliceから500円を受け取った" },
        { date: "2023-10-08", event: "Bobに500円を支払った" },
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>履歴</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonCard>
                    <IonCardContent>
                        <IonList>
                            {history.map((item, idx) => (
                                <IonItem key={idx}>
                                    <IonLabel>
                                        <h2>{item.date}</h2>
                                        <p>{item.event}</p>
                                    </IonLabel>
                                </IonItem>
                            ))}
                        </IonList>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default Tab3;
