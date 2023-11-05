import React from "react";
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import { Menu } from "../components/templates/Common/Menu";
import { Header } from "../components/templates/Common/Header";

export const ContactPage: React.FC = () => {
  const history = [
    { date: "2023-10-09", event: "Aliceから500円を受け取った" },
    { date: "2023-10-08", event: "Bobに500円を支払った" },
    { date: "2023-10-08", event: "Bobに500円を支払った" },
    { date: "2023-10-08", event: "Bobに500円を支払った" },
    { date: "2023-10-08", event: "Bobに500円を支払った" },
    { date: "2023-10-08", event: "Bobに500円を支払った" },
    { date: "2023-10-08", event: "Bobに500円を支払った" },
    { date: "2023-10-08", event: "Bobに500円を支払った" },
    { date: "2023-10-08", event: "Bobに500円を支払った" },
  ];

  return (
    <>
      <Menu />
      <IonPage id="main-content">
        <Header />
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
    </>
  );
};
