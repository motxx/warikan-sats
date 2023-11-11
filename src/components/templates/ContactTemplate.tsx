import React from "react";
import { IonContent } from "@ionic/react";
import { Head } from "../atoms/texts/Head";
import { Contact } from "./Contact/ContactSearch/ContactList/ContactListItem";
import { ContactSearch } from "./Contact/ContactSearch";

type Props = {
  contacts: Contact[];
  onContactAdded: (newContact: Contact) => void;
};

export const ContactTemplate: React.FC<Props> = ({
  contacts,
  onContactAdded,
}) => {
  return (
    <IonContent>
      <div className="flex flex-col place-items-center h-[95%]">
        <div className="flex flex-col place-items-center h-full w-[50%] min-w-[375px]">
          <div className="text-left h-[15%] w-full px-[5%] pb-[10%]">
            <Head>Contact</Head>
          </div>
          <div className="space-y-[10%] pb-[5%] h-[60%] w-[90%]">
            <ContactSearch
              contacts={contacts}
              onContactAdded={onContactAdded}
            />
          </div>
        </div>
      </div>
    </IonContent>
  );
};
