import React from "react";
import { IonContent } from "@ionic/react";
import { InvoiceGenerator } from "./Payment/InvoiceGenerator";

export const PaymentTemplate: React.FC = () => {
  return (
    <IonContent>
      <div className="flex flex-col place-items-center h-[95%]">
        <div className="flex flex-col place-items-center h-full w-[50%] min-w-[375px] overflow-y-scroll">
          <InvoiceGenerator />
        </div>
      </div>
    </IonContent>
  );
};
