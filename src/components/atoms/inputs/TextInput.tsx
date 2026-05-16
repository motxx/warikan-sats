import { IonInput } from "@ionic/react";

export type Props = {
  onInput: (inputText: string) => void;
  placeholder?: string;
  textAlign?: "left" | "center" | "right";
};

export const TextInput: React.FC<Props> = ({
  onInput,
  placeholder,
  textAlign = "center",
}) => {
  const textAlignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[textAlign];

  return (
    <IonInput
      className={`h-12 w-full border-b border-gray-300 text-base font-medium ${textAlignClass}`}
      onIonInput={(e) => onInput(e.target.value?.toString() ?? "")}
      placeholder={placeholder}
    />
  );
};
