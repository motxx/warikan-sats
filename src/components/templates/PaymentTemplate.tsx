import React from "react";
import { IonContent } from "@ionic/react";
import { InvoiceGenerator } from "./Payment/InvoiceGenerator";

export const PaymentTemplate: React.FC = () => {
  return (
    <IonContent>
      <div className="grid grid-cols-1 place-items-center h-[95%] overflow-y-clip">
        <div className="grid grid-cols-1 place-items-center h-full w-[50%] min-w-[375px]">
          <InvoiceGenerator />
        </div>
      </div>
    </IonContent>
  );
};
