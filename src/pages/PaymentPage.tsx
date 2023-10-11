import React from "react";
import { IonPage } from "@ionic/react";
import { PaymentTemplate } from "../components/templates/PaymentTemplate";

export const PaymentPage: React.FC = () => {
  return (
    <IonPage>
      <PaymentTemplate />
    </IonPage>
  );
};
