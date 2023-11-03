import React from "react";
import { GenerateInvoiceButton } from "./InvoiceGenerator/GenerateInvoiceButton";
import { InvoiceInputForm } from "./InvoiceGenerator/InvoiceInputForm";
import { InvoiceQRCodeOutput } from "./InvoiceGenerator/InvoiceQRCodeOutput";

type Props = {};
export const EmptyInvoiceData =
  "EMPTY00u1pj5fxaspp5dcqac89l07nhx3l6j7f5yhhhrsukzmt5433jt42kkaj3kcpp9kaqdqcu2d2rc56583f4g0zn2s79x4pcqzzsxqyz5vqsp5wtssdh7adu4q60pkxapqqnnep5ravsgcwxcmw664ggfslkllkvds9qyyssq9pl8npevwmpk8tz800sxeq2rt3quaxpvk89yt36zlnx0rudj7cy3jgmkr3du0l5whz32fgswm0tzzcf6tacg4lhh46tsg6asy4664acpfpr3p3";

export const InvoiceGenerator: React.FC<Props> = ({}) => {
  const [amount, setAmount] = React.useState(0);
  const [invoiceData, setInvoiceData] = React.useState(EmptyInvoiceData);
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
