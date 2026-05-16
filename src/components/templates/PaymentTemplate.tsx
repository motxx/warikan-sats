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
    <IonContent fullscreen>
      <div className="min-h-full w-full overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+1.25rem)] sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-[440px] flex-col">
          <InvoiceGenerator walletConnector={walletConnector} />
        </div>
      </div>
    </IonContent>
  );
};
