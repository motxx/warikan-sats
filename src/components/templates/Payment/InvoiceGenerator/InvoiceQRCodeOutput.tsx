import React from "react";
import { InvoiceQRCode } from "./InvoiceQRCodeOutput/InvoiceQRCode";
import { EmptyInvoiceData } from "../InvoiceGenerator";

type Props = {
  invoiceData: string;
  muted?: boolean;
};

export const InvoiceQRCodeOutput: React.FC<Props> = ({
  invoiceData,
  muted = false,
}) => {
  return (
    <div className={muted || invoiceData == EmptyInvoiceData ? "blur" : ""}>
      <InvoiceQRCode data={invoiceData} />
    </div>
  );
};
