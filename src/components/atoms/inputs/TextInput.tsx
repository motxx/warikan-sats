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
      className={`h-12 w-full rounded-xl border border-[#cfdacb] bg-white px-3 text-base font-medium text-[#1e231f] ${textAlignClass}`}
      onIonInput={(e) => onInput(e.target.value?.toString() ?? "")}
      placeholder={placeholder}
    />
  );
};
