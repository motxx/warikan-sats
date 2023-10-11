import React from "react";
import { IonHeader, IonToolbar, IonTitle } from "@ionic/react";

export const Header: React.FC = () => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="ion-text-center">Account Details</IonTitle>
        </IonToolbar>
      </IonHeader>
    </>
  );
};
