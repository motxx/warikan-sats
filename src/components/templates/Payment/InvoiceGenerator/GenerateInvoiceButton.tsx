import React from "react";
import { PrimaryButton } from "../../../atoms/buttons/PrimaryButton";

type Props = {
  disabled?: boolean;
  label?: string;
  onGenerate: () => void;
  variant?: "primary" | "secondary";
};

export const GenerateInvoiceButton: React.FC<Props> = (props: Props) => {
  return (
    <PrimaryButton
      onClick={props.onGenerate}
      disabled={props.disabled}
      variant={props.variant}
    >
      {props.label ?? "Create split invoices"}
    </PrimaryButton>
  );
};
