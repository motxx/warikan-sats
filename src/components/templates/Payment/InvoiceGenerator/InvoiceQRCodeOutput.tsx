import React from "react";
import { InvoiceQRCode } from "./InvoiceQRCodeOutput/InvoiceQRCode";

type Props = {
  invoiceData: string;
};

export const InvoiceQRCodeOutput: React.FC<Props> = ({ invoiceData }) => {
  return (
    <div>
      <InvoiceQRCode data={invoiceData} />
    </div>
  );
};
