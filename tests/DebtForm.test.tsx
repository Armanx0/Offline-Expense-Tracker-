import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

import { DebtForm } from "../src/components/debts/DebtForm";

jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

describe("DebtForm", () => {
  it("submits parsed minor units with the selected direction", async () => {
    const onSubmit = jest.fn();
    const screen = render(
      <DebtForm submitLabel="Save debt" onSubmit={onSubmit} />
    );

    fireEvent.changeText(screen.getByLabelText("Person name"), "Aman");
    fireEvent.changeText(screen.getByLabelText("Amount"), "12.5");
    fireEvent.press(screen.getByText("Save debt"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: "given",
          personName: "Aman",
          amountMinor: 1250
        })
      );
    });
  });
});
