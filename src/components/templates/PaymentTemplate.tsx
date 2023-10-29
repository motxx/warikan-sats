import React from "react";
import { IonContent } from "@ionic/react";
import { InvoiceGenerator } from "./Payment/InvoiceGenerator";

export const PaymentTemplate: React.FC = () => {
  return (
    <>
      <IonContent className="ion-padding">
        <InvoiceGenerator />
      </IonContent>
    </>
  );
};
