import React from "react";

type Props = {
  invoiceData: string;
};

export const InvoiceQRCodeOutput: React.FC<Props> = ({ invoiceData }) => {
  return (
    <>
      <div>QRCode output: {invoiceData}</div>
    </>
  );
};
