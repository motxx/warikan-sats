import React from "react";
import { GenerateInvoiceButton } from "./InvoiceGenerator/GenerateInvoiceButton";
import { InvoiceInputForm } from "./InvoiceGenerator/InvoiceInputForm";
import { InvoiceQRCodeOutput } from "./InvoiceGenerator/InvoiceQRCodeOutput";

type Props = {};

export const InvoiceGenerator: React.FC<Props> = ({}) => {
  const [amount, setAmount] = React.useState(0);
  const [invoiceData, setInvoiceData] = React.useState("");
  return (
    <>
      <InvoiceInputForm onChange={setAmount} />
      <GenerateInvoiceButton
        amount={amount}
        lang="ja"
        onInvoiceGenerated={setInvoiceData}
      />
      <InvoiceQRCodeOutput invoiceData={invoiceData} />
    </>
  );
};
