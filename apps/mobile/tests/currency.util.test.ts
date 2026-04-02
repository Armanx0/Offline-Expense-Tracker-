import { formatCurrency, parseAmountToMinor } from "../src/utils/currency.util";

describe("currency util", () => {
  it("parses and formats amounts", () => {
    expect(parseAmountToMinor("10.55")).toBe(1055);
    expect(parseAmountToMinor("0")).toBeNull();
    expect(formatCurrency(1055, "INR")).toContain("10.55");
  });
});
