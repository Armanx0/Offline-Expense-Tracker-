import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, {
  type DateTimePickerEvent
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { z } from "zod";

import { parseAmountToMinor } from "../../utils/currency.util";
import { formatDisplayDate } from "../../utils/date.util";
import { CategoryPicker } from "./CategoryPicker";

const expenseFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => parseAmountToMinor(value) !== null, {
      message: "Enter a valid amount"
    }),
  description: z.string().max(500).optional(),
  occurredAt: z.date(),
  categoryId: z.string().cuid("Choose a valid category")
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export interface ExpenseFormPayload {
  amountMinor: number;
  description?: string;
  occurredAt: string;
  categoryId: string;
}

export const ExpenseForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting = false
}: {
  initialValues?: Partial<ExpenseFormValues>;
  onSubmit: (payload: ExpenseFormPayload) => Promise<void> | void;
  submitLabel: string;
  isSubmitting?: boolean;
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: initialValues?.amount ?? "",
      description: initialValues?.description ?? "",
      occurredAt: initialValues?.occurredAt ?? new Date(),
      categoryId: initialValues?.categoryId ?? ""
    }
  });

  const submit = handleSubmit(async (values) => {
    const description = values.description?.trim();
    await onSubmit({
      amountMinor: parseAmountToMinor(values.amount) ?? 0,
      occurredAt: values.occurredAt.toISOString(),
      categoryId: values.categoryId,
      ...(description ? { description } : {})
    });
  });

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Amount"
            keyboardType="decimal-pad"
            testID="expense-form-amount"
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
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Description"
            testID="expense-form-description"
            value={value ?? ""}
            onChangeText={onChange}
            multiline
          />
        )}
      />

      <Controller
        control={control}
        name="occurredAt"
        render={({ field: { onChange, value } }) => (
          <>
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
          </>
        )}
      />

      <Controller
        control={control}
        name="categoryId"
        render={({ field: { onChange, value } }) => (
          <CategoryPicker value={value || null} onChange={onChange} />
        )}
      />
      <HelperText type="error" visible={Boolean(errors.categoryId)}>
        {errors.categoryId?.message}
      </HelperText>

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
  }
});
