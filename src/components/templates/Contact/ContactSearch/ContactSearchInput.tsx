import { TextInput } from "../../../atoms/inputs/TextInput";

type Props = {
  onInputKeyword: (keyword: string) => void;
};

export const ContactSearchInput: React.FC<Props> = ({ onInputKeyword }) => {
  return (
    <div className="w-full">
      <TextInput
        onInput={onInputKeyword}
        placeholder="Search..."
        textAlign="left"
      />
    </div>
  );
};
