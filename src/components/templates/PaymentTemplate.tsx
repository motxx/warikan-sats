import React from "react";
import { IonContent } from "@ionic/react";
import {
  InvoiceGenerator,
  type WalletConnectionClient,
} from "./Payment/InvoiceGenerator";

type Props = {
  walletConnector?: WalletConnectionClient;
};

export const PaymentTemplate: React.FC<Props> = ({ walletConnector }) => {
  return (
    <IonContent>
      <div className="flex flex-col place-items-center h-[95%]">
        <div className="flex flex-col place-items-center h-full w-[50%] min-w-[375px] overflow-y-scroll">
          <InvoiceGenerator walletConnector={walletConnector} />
        </div>
      </div>
    </IonContent>
  );
};
