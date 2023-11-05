export const fromSats = (
  amount: number,
  currencyUnit: "jpy" | "usd"
): number => {
  // TODO: use real exchange rate
  return (
    Math.round(
      amount *
        (currencyUnit === "jpy"
          ? 10000 / 194273
          : currencyUnit === "usd"
          ? 10000 / 29077178
          : 1) *
        10
    ) / 10
  );
};

export const toSats = (amount: number, currencyUnit: "jpy" | "usd"): number => {
  // TODO: use real exchange rate
  return Math.floor(
    amount *
      (currencyUnit === "jpy"
        ? 194273 / 10000
        : currencyUnit === "usd"
        ? 29077178 / 10000
        : 1)
  );
};
