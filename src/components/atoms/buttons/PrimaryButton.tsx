import { IonButton } from "@ionic/react";
import React from "react";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

export const PrimaryButton: React.FC<Props> = ({
  children,
  onClick,
  disabled = false,
}) => {
  return (
    <IonButton
      color="primary"
      className="m-0 min-h-12 w-full text-sm font-bold"
      style={{ textTransform: "none" }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </IonButton>
  );
};
