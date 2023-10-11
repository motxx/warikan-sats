import React from "react";
import { IonContent } from "@ionic/react";
import { Header } from "./Common/Header";
import { InvoiceGenerator } from "./Payment/InvoiceGenerator";

export const PaymentTemplate: React.FC = () => {
  return (
    <>
      <Header />
      <IonContent className="ion-padding">
        <InvoiceGenerator />
      </IonContent>
    </>
  );
};
