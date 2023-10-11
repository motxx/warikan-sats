import React from "react";
import { Button } from "../../../atoms/Button";

type Props = {
  amount: number;
  lang: "ja" | "en";
  onInvoiceGenerated: (data: string) => void;
};

const onClick = (props: Props) => {
  console.log("generate invoice");
  props.onInvoiceGenerated("invoice");
};

export const GenerateInvoiceButton: React.FC<Props> = (props: Props) => {
  return <Button onClick={() => onClick(props)}>GenerateInvoice</Button>;
};
