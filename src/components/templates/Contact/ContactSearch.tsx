import React from "react";
import { ContactList } from "./ContactSearch/ContactList/ContactList";
import { Contact } from "./ContactSearch/ContactList/ContactListItem";
import { ContactSearchInput } from "./ContactSearch/ContactSearchInput";
import { AddContact } from "./ContactSearch/AddContact";

type Props = {
  contacts: Contact[];
  onContactAdded: (newContact: Contact) => void;
};

export const ContactSearch: React.FC<Props> = ({
  contacts,
  onContactAdded,
}) => {
  const [keyword, setKeyword] = React.useState("");
  const onInputKeyword = (keyword: string) => {
    setKeyword(keyword);
  };

  return (
    <>
      <ContactSearchInput onInputKeyword={onInputKeyword} />
      <div className="h-[80%] w-full overflow-y-scroll">
        <ContactList contacts={contacts} keyword={keyword} />
      </div>
      <div className="h-[10%] w-full py-[5%]">
        <AddContact onContactAdded={onContactAdded} />
      </div>
    </>
  );
};
