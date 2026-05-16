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
      <div className="min-h-full w-full overflow-y-auto px-4 py-8">
        <div className="mx-auto flex w-full max-w-[520px] flex-col">
          <InvoiceGenerator walletConnector={walletConnector} />
        </div>
      </div>
    </IonContent>
  );
};
