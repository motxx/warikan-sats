import { IonInput, IonItem, IonList } from "@ionic/react";

export type Props = {
  onInput: (notes: string) => void;
  placeholder?: string;
};

export const TextInput: React.FC<Props> = ({ onInput, placeholder }) => {
  return (
    <IonInput
      className="border-b border-gray-300 text-sm font-medium font-roboto text-center h-full w-full"
      onIonInput={(e) => onInput(e.target.value?.toString() ?? "")}
      placeholder={placeholder}
    />
  );
};
