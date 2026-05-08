import React from "react";
import { Text } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { ExpenseForm } from "../src/components/expenses/ExpenseForm";

jest.mock("../src/components/expenses/CategoryPicker", () => ({
  CategoryPicker: ({ onChange }: { onChange: (value: string) => void }) => {
    React.useEffect(() => {
      onChange("ck1234567890123456789012");
    }, [onChange]);

    return <Text>Mock Category Picker</Text>;
  }
}));

jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

describe("ExpenseForm", () => {
  it("submits parsed minor units", async () => {
    const onSubmit = jest.fn();
    const screen = render(
      <ExpenseForm submitLabel="Save expense" onSubmit={onSubmit} />
    );

    fireEvent.changeText(screen.getByLabelText("Amount"), "12.5");
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
