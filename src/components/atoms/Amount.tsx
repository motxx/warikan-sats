type Props = {
  currencyUnit: "jpy" | "usd" | "sats";
  amount: number;
};

const numberFormat = (num: number): string => num.toLocaleString();

export const Amount: React.FC<Props> = ({ currencyUnit, amount }) => {
  return (
    <>
      {currencyUnit === "jpy" ? "\xA5" : currencyUnit === "usd" ? "$" : ""}
      {numberFormat(amount)}
      {currencyUnit === "sats" ? " sats" : ""}
    </>
  );
};
