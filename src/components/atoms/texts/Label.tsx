import { IonLabel } from "@ionic/react";

export type Props = {
  label: string;
};

export const Label: React.FC<Props> = ({ label }) => {
  return <IonLabel>{label}</IonLabel>;
};
