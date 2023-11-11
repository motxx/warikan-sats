import React from "react";
import { SecondaryButton } from "../../../atoms/buttons/SecondaryButton";
import { Contact } from "./ContactList/ContactListItem";

type Props = {
  onContactAdded: (newContact: Contact) => void;
};

const onClick = (props: Props) => {
  props.onContactAdded({
    name: "new name",
    address: "0xA16B024E0339683b7f172305E4A5DF376bF7ede2",
  });
};

export const AddContact: React.FC<Props> = (props: Props) => {
  return (
    <SecondaryButton onClick={() => onClick(props)}>
      ADD CONTACT
    </SecondaryButton>
  );
};
