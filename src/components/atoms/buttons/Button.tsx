import { IonButton } from "@ionic/react";
import React from "react";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
};

export const Button: React.FC<Props> = ({ children, onClick }) => {
  return <IonButton onClick={onClick}>{children}</IonButton>;
};
