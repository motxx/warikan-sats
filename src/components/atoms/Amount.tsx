type Props = {
  currencyUnit: "jpy" | "usd";
  amount: number;
};

const numberFormat = (num: number): string => num.toLocaleString();

export const Amount: React.FC<Props> = ({ currencyUnit, amount }) => {
  return (
    <>
      {currencyUnit === "jpy" ? "\xA5" : "$"}
      {numberFormat(amount)}
    </>
  );
};
