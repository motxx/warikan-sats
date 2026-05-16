import React from "react";
import { TextInput } from "../../../../atoms/inputs/TextInput";

type Props = {
  onInput: (notes: string) => void;
};

export const AddNotes: React.FC<Props> = ({ onInput }) => {
  return (
    <div className="w-full">
      <TextInput
        onInput={onInput}
        placeholder="Optional note"
        textAlign="left"
      />
    </div>
  );
};
