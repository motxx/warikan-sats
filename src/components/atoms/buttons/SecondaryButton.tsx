import { IonButton } from "@ionic/react";
import React from "react";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
};

export const SecondaryButton: React.FC<Props> = ({ children, onClick }) => {
  return (
    <IonButton
      color="secondary"
      className="h-full w-full m-0 text-xs font-semibold"
      style={{ textTransform: "none" }}
      onClick={onClick}
    >
      {children}
    </IonButton>
  );
};
