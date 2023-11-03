import React from "react";
import { PrimaryButton } from "../../../atoms/buttons/PrimaryButton";

type Props = {
  amount: number;
  lang: "ja" | "en";
  onInvoiceGenerated: (data: string) => void;
};

const onClick = (props: Props) => {
  console.log("generate invoice");
  props.onInvoiceGenerated(
    "lnbc100u1pj5fxaspp5dcqac89l07nhx3l6j7f5yhhhrsukzmt5433jt42kkaj3kcpp9kaqdqcu2d2rc56583f4g0zn2s79x4pcqzzsxqyz5vqsp5wtssdh7adu4q60pkxapqqnnep5ravsgcwxcmw664ggfslkllkvds9qyyssq9pl8npevwmpk8tz800sxeq2rt3quaxpvk89yt36zlnx0rudj7cy3jgmkr3du0l5whz32fgswm0tzzcf6tacg4lhh46tsg6asy4664acpfpr3p3"
  );
};

export const GenerateInvoiceButton: React.FC<Props> = (props: Props) => {
  return (
    <div className="h-10 w-[80%]">
      <PrimaryButton onClick={() => onClick(props)}>
        GenerateInvoice
      </PrimaryButton>
    </div>
  );
};
