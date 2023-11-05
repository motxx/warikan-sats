import React from "react";
import { TextInput } from "../../../../atoms/inputs/TextInput";

type Props = {
  onInput: (notes: string) => void;
};

export const AddNotes: React.FC<Props> = ({ onInput }) => {
  return (
    <div className="place-items-center w-full">
      <TextInput onInput={onInput} placeholder="Add notes" />
    </div>
  );
};
