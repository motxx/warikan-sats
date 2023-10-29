import React from "react";
import { IonPage } from "@ionic/react";
import { PaymentTemplate } from "../components/templates/PaymentTemplate";
import { Menu } from "../components/templates/Common/Menu";
import { Header } from "../components/templates/Common/Header";

export const PaymentPage: React.FC = () => {
  return (
    <>
      <Menu />
      <IonPage id="main-content">
        <Header />
        <PaymentTemplate />
      </IonPage>
    </>
  );
};
