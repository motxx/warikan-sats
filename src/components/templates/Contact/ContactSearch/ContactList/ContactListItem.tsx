import { IonCol, IonGrid, IonItem, IonRow } from "@ionic/react";
import { Label } from "../../../../atoms/texts/Label";

type Props = {
  contact: Contact;
};

export type Contact = {
  name: string;
  address: string;
};

export const ContactListItem: React.FC<Props> = ({ contact }) => {
  return (
    <IonItem className="m-0 p-0">
      <IonGrid>
        <IonRow>
          <IonCol size="8">
            <Label>{contact.name}</Label>
          </IonCol>
          <IonCol size="4" className="ion-text-right">
            <Label>
              {contact.address.substring(0, 8) +
                "..." +
                contact.address.substring(contact.address.length - 4)}
            </Label>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonItem>
  );
};
