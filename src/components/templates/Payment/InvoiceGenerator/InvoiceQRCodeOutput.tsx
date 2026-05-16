import React from "react";
import { InvoiceQRCode } from "./InvoiceQRCodeOutput/InvoiceQRCode";

type Props = {
  invoiceData: string;
};

export const InvoiceQRCodeOutput: React.FC<Props> = ({ invoiceData }) => {
  return (
    <div className="rounded-[20px] border border-[#d7e1d4] bg-white p-4">
      <InvoiceQRCode data={invoiceData} />
    </div>
  );
};
