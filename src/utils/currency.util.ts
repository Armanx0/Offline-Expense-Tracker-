export const formatCurrency = (amountMinor: number, currencyCode = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2
  }).format(amountMinor / 100);

export const parseAmountToMinor = (input: string) => {
  const normalized = Number.parseFloat(input.replace(/,/g, ""));

  if (Number.isNaN(normalized) || normalized <= 0) {
    return null;
  }

  return Math.round(normalized * 100);
};
