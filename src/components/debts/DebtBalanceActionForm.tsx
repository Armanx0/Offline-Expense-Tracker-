import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, {
  type DateTimePickerEvent
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { z } from "zod";

import { parseAmountToMinor } from "../../utils/currency.util";
import { formatDisplayDate } from "../../utils/date.util";

const debtBalanceActionSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => parseAmountToMinor(value) !== null, {
      message: "Enter a valid amount"
    }),
  occurredAt: z.date()
});

type DebtBalanceActionValues = z.infer<typeof debtBalanceActionSchema>;

export interface DebtBalanceActionPayload {
  amountMinor: number;
  occurredAt: string;
}

export const DebtBalanceActionForm = ({
  title,
  submitLabel,
  isSubmitting = false,
  onSubmit
}: {
  title: string;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (payload: DebtBalanceActionPayload) => Promise<void> | void;
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DebtBalanceActionValues>({
    resolver: zodResolver(debtBalanceActionSchema),
    defaultValues: {
      amount: "",
      occurredAt: new Date()
    }
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      amountMinor: parseAmountToMinor(values.amount) ?? 0,
      occurredAt: values.occurredAt.toISOString()
    });

    reset({
      amount: "",
      occurredAt: new Date()
    });
  });

  return (
    <View style={styles.container}>
      <Text variant="titleMedium">{title}</Text>

      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Amount"
            keyboardType="decimal-pad"
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
        name="occurredAt"
        render={({ field: { onChange, value } }) => (
          <View style={styles.dateField}>
            <Button mode="outlined" onPress={() => setShowDatePicker(true)}>
              {formatDisplayDate(value)}
            </Button>
            {showDatePicker ? (
              <DateTimePicker
                value={value}
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
