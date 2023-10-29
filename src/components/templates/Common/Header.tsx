import { IonButtons, IonHeader, IonMenuButton, IonToolbar } from "@ionic/react";

export const Header = () => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="end">
          <IonMenuButton></IonMenuButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};
