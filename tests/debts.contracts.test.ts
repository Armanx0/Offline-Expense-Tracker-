import {
  createDebtRequestSchema,
  listDebtsQuerySchema,
  recordDebtPaymentRequestSchema,
  updateDebtMetadataRequestSchema
} from "../src/contracts";

describe("debt contracts", () => {
  it("parses valid create debt input", () => {
    expect(
      createDebtRequestSchema.parse({
        personName: "Riya",
        direction: "given",
        amountMinor: 1250,
        currencyCode: "INR"
      })
    ).toEqual(
      expect.objectContaining({
        personName: "Riya",
        direction: "given",
        amountMinor: 1250
      })
    );
  });

  it("supports nullable metadata updates", () => {
    expect(
      updateDebtMetadataRequestSchema.parse({
        dueDate: null,
        note: null
      })
    ).toEqual({
      dueDate: null,
      note: null
    });
  });

  it("applies list defaults", () => {
    expect(listDebtsQuerySchema.parse({})).toEqual({
      direction: "given",
      status: "open"
    });
  });

  it("rejects non-positive payments", () => {
    expect(() =>
      recordDebtPaymentRequestSchema.parse({
        amountMinor: 0
      })
    ).toThrow();
  });
});
