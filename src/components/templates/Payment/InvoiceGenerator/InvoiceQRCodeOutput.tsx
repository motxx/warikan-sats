import React from "react";
import { InvoiceQRCode } from "./InvoiceQRCodeOutput/InvoiceQRCode";
import { EmptyInvoiceData } from "../InvoiceGenerator";

type Props = {
  invoiceData: string;
};

export const InvoiceQRCodeOutput: React.FC<Props> = ({ invoiceData }) => {
  return (
    <div className="h-[200px] w-[200px]">
      <div className={invoiceData == EmptyInvoiceData ? "blur" : ""}>
        <InvoiceQRCode data={invoiceData} />
      </div>
    </div>
  );
};
