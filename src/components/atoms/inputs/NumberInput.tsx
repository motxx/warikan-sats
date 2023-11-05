import { IonInput } from "@ionic/react";
import { useRef, useState } from "react";

export type Props = {
  onInput: (amount: number) => void;
  defaultValue?: number;
  prefix?: string;
};

export const NumberInput: React.FC<Props> = ({
  onInput,
  defaultValue,
  prefix,
}) => {
  const withPrefix = (str: string) => (prefix ? `${prefix} ${str}` : str);
  const [inputModel, setInputModel] = useState(defaultValue?.toString() ?? "0");
  const ionInputEl = useRef<HTMLIonInputElement>(null);

  const onInputWithValidation = (ev: Event) => {
    const value = (ev.target as HTMLIonInputElement).value as string;

    const filteredValue =
      value.replace(/[^\d]+/g, "").replace(/^0(\d+)/, "$1") || "";

    const displayedValue = withPrefix(filteredValue);
    setInputModel(displayedValue);

    console.log({ value, filteredValue, displayedValue });

    const inputCmp = ionInputEl.current;
    if (inputCmp !== null) {
      // XXX: 0や空文字列の場合、ev.target.valueが "", "¥ ", "¥ 0", "¥ 00" などの
      //      文字列を取ってしまうが、filteredValueの値は正常
      inputCmp.value = withPrefix(filteredValue);
    }

    onInput(parseInt(filteredValue));
  };

  return (
    <IonInput
      className="border-b border-gray-300 text-lg font-medium text-center h-full w-full"
      value={inputModel}
      onIonInput={onInputWithValidation}
      ref={ionInputEl}
    />
  );
};
