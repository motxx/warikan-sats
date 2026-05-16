import { QRCodeCanvas } from "qrcode.react";

interface Props {
  data: string;
}

export const InvoiceQRCode: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-full w-full bg-white">
      <QRCodeCanvas className="p-1" size={224} value={data} />
    </div>
  );
};
