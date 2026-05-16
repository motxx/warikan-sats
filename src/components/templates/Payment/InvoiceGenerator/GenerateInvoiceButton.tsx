import React from "react";
import { PrimaryButton } from "../../../atoms/buttons/PrimaryButton";

type Props = {
  disabled?: boolean;
  label?: string;
  onGenerate: () => void;
};

export const GenerateInvoiceButton: React.FC<Props> = (props: Props) => {
  return (
    <PrimaryButton onClick={props.onGenerate} disabled={props.disabled}>
      {props.label ?? "START SPLIT"}
    </PrimaryButton>
  );
};
