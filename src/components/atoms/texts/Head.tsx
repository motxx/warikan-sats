import { IonHeader } from "@ionic/react";

export type Props = {
  children: React.ReactNode;
};

export const Head: React.FC<Props> = ({ children }) => {
  return <IonHeader className="text-2xl font-bold">{children}</IonHeader>;
};
