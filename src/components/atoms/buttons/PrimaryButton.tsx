import { IonButton } from "@ionic/react";
import React from "react";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
};

export const PrimaryButton: React.FC<Props> = ({ children, onClick }) => {
  return (
    <IonButton
      color="primary"
      className="h-full w-full m-0 text-xs font-bold"
      style={{ textTransform: "none" }}
      onClick={onClick}
    >
      {children}
    </IonButton>
  );
};
