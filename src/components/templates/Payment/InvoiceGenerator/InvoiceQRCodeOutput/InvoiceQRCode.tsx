import { QRCodeCanvas } from "qrcode.react";

interface Props {
  data: string;
}

export const InvoiceQRCode: React.FC<Props> = ({ data }) => {
  return <QRCodeCanvas value={data} />;
};
