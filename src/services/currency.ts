export const fromSats = (
  amount: number,
  currencyUnit: "jpy" | "usd"
): number => {
  // TODO: use real exchange rate
  return (
    amount *
    (currencyUnit === "jpy"
      ? 10000 / 194273
      : currencyUnit === "usd"
      ? 10000 / 29077178
      : 1)
  );
};
