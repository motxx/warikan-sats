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
  return (
    <IonInput
      className={`border-b border-gray-300 text-sm font-medium text-${textAlign} h-full w-full`}
      onIonInput={(e) => onInput(e.target.value?.toString() ?? "")}
      placeholder={placeholder}
    />
  );
};
