import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, {
  type DateTimePickerEvent
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput
} from "react-native-paper";
import { z } from "zod";

import type { DebtDirection } from "../../contracts";
import { formatDisplayDate } from "../../utils/date.util";
import { parseAmountToMinor } from "../../utils/currency.util";

const debtFormSchema = z.object({
  direction: z.enum(["given", "taken"]),
  personName: z.string().trim().min(1, "Person name is required").max(80),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => parseAmountToMinor(value) !== null, {
      message: "Enter a valid amount"
    }),
  dueDate: z.date().nullable(),
  note: z.string().max(500).optional()
});

export type DebtFormValues = z.infer<typeof debtFormSchema>;

export interface DebtFormPayload {
  direction: DebtDirection;
  personName: string;
  amountMinor: number;
  dueDate?: string;
  note?: string;
}

export const DebtForm = ({
  onSubmit,
  submitLabel,
  isSubmitting = false
}: {
  onSubmit: (payload: DebtFormPayload) => Promise<void> | void;
  submitLabel: string;
  isSubmitting?: boolean;
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      direction: "given",
      personName: "",
      amount: "",
      dueDate: null,
      note: ""
    }
  });

  const submit = handleSubmit(async (values) => {
    const note = values.note?.trim();

    await onSubmit({
      direction: values.direction,
      personName: values.personName.trim(),
      amountMinor: parseAmountToMinor(values.amount) ?? 0,
      ...(values.dueDate ? { dueDate: values.dueDate.toISOString() } : {}),
      ...(note ? { note } : {})
    });
  });

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="direction"
        render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={(nextValue) => {
              onChange(nextValue);
            }}
            buttons={[
              { value: "given", label: "Given" },
              { value: "taken", label: "Taken" }
            ]}
          />
        )}
      />

      <Controller
        control={control}
        name="personName"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Person name"
            testID="debt-form-person-name"
            value={value}
            onChangeText={onChange}
            error={Boolean(errors.personName)}
          />
        )}
      />
      <HelperText type="error" visible={Boolean(errors.personName)}>
        {errors.personName?.message}
      </HelperText>

      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Amount"
            keyboardType="decimal-pad"
            testID="debt-form-amount"
            value={value}
            onChangeText={onChange}
            error={Boolean(errors.amount)}
          />
        )}
      />
      <HelperText type="error" visible={Boolean(errors.amount)}>
        {errors.amount?.message}
      </HelperText>

      <Controller
        control={control}
        name="dueDate"
        render={({ field: { onChange, value } }) => (
          <View style={styles.dateField}>
            <Text variant="labelLarge">Due date</Text>
            <Button mode="outlined" onPress={() => setShowDatePicker(true)}>
              {value ? formatDisplayDate(value) : "Set due date"}
            </Button>
            {value ? (
              <Button mode="text" onPress={() => onChange(null)}>
                Clear due date
              </Button>
            ) : null}
            {showDatePicker ? (
              <DateTimePicker
                value={value ?? new Date()}
                mode="date"
                onChange={(
                  _event: DateTimePickerEvent,
                  selectedDate?: Date
                ) => {
                  setShowDatePicker(false);

                  if (selectedDate) {
                    onChange(selectedDate);
                  }
                }}
              />
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Note"
            testID="debt-form-note"
            value={value ?? ""}
            onChangeText={onChange}
            multiline
          />
        )}
      />

      <Button
        mode="contained"
        onPress={() => void submit()}
        loading={isSubmitting}
      >
        {submitLabel}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8
  },
  dateField: {
    gap: 8
  }
});
