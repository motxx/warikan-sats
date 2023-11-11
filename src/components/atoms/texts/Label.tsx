import { IonLabel } from "@ionic/react";

export type Props = {
  children: React.ReactNode;
};

export const Label: React.FC<Props> = ({ children }) => {
  return <IonLabel>{children}</IonLabel>;
};
