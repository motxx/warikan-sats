import React from "react";
import { IonPage } from "@ionic/react";
import { Menu } from "../components/templates/Common/Menu";
import { Header } from "../components/templates/Common/Header";
import { ContactTemplate } from "../components/templates/ContactTemplate";
import { Contact } from "../components/templates/Contact/ContactSearch/ContactList/ContactListItem";

export const ContactPage: React.FC = () => {
  const contacts = [
    {
      name: "Natori Sana",
      address: "0x22C543708B566cB96Ec4299A4c57b13731cf7f48",
    },
    {
      name: "Hoshimiya Ichigo",
      address: "0x122bBddBc8e80F42b7d0d413418344ee2834264d",
    },
    {
      name: "Nakahara Misaki",
      address: "0x320ca244AD9A30311Ebf2FB2341D5f0921979773",
    },
    {
      name: "Nakahara Misaki",
      address: "0x320ca244AD9A30311Ebf2FB2341D5f0921979773",
    },
    {
      name: "Nakahara Misaki",
      address: "0x320ca244AD9A30311Ebf2FB2341D5f0921979773",
    },
    {
      name: "Nakahara Misaki",
      address: "0x320ca244AD9A30311Ebf2FB2341D5f0921979773",
    },
  ];

  const onContactAdded = (newContact: Contact) => {
    console.log({ newContact });
    contacts.push(newContact); // not re-rendered properly
  };

  return (
    <>
      <Menu />
      <IonPage id="main-content">
        <Header />
        <ContactTemplate contacts={contacts} onContactAdded={onContactAdded} />
      </IonPage>
    </>
  );
};
