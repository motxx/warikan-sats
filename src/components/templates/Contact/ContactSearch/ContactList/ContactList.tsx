import { IonList } from "@ionic/react";
import { Contact, ContactListItem } from "./ContactListItem";

type Props = {
  contacts: Contact[];
  keyword: string;
};

export const ContactList: React.FC<Props> = ({ contacts, keyword }) => {
  return (
    <IonList className="m-0 p-0 w-full">
      {contacts
        .filter(
          (contact, _) =>
            !keyword ||
            contact.name
              .toLocaleLowerCase()
              .includes(keyword.toLocaleLowerCase())
        )
        .map((contact, idx) => (
          <ContactListItem contact={contact} key={idx} />
        ))}
    </IonList>
  );
};
