import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { ExpenseForm } from "../src/components/expenses/ExpenseForm";

const mockReact = React;

jest.mock("../src/components/expenses/CategoryPicker", () => {
  return {
    CategoryPicker: ({ onChange }: { onChange: (value: string) => void }) => {
      mockReact.useEffect(() => {
        onChange("ck1234567890123456789012");
      }, [onChange]);

      return null;
    }
  };
});

jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

describe("ExpenseForm", () => {
  it("submits parsed minor units", async () => {
    const onSubmit = jest.fn();
    const screen = render(
      <ExpenseForm submitLabel="Save expense" onSubmit={onSubmit} />
    );

    fireEvent.changeText(screen.getByTestId("expense-form-amount"), "12.5");
    fireEvent.press(screen.getByText("Save expense"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          amountMinor: 1250,
          categoryId: "ck1234567890123456789012"
        })
      );
    });
  });
});
