import {
  IonContent,
  IonHeader,
  IonMenu,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

export const Menu = () => {
  return (
    <>
      <IonMenu side="end" contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu Content</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          This is the menu content.
        </IonContent>
      </IonMenu>
    </>
  );
};
