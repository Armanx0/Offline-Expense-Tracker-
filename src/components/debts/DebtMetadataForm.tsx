import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, {
  type DateTimePickerEvent
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { z } from "zod";

import { formatDisplayDate } from "../../utils/date.util";

const debtMetadataFormSchema = z.object({
  personName: z.string().trim().min(1, "Person name is required").max(80),
  dueDate: z.date().nullable(),
  note: z.string().max(500).optional()
});

export type DebtMetadataFormValues = z.infer<typeof debtMetadataFormSchema>;

export interface DebtMetadataPayload {
  personName: string;
  dueDate: string | null;
  note: string | null;
}

export const DebtMetadataForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting = false
}: {
  initialValues: DebtMetadataFormValues;
  onSubmit: (payload: DebtMetadataPayload) => Promise<void> | void;
  submitLabel: string;
  isSubmitting?: boolean;
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<DebtMetadataFormValues>({
    resolver: zodResolver(debtMetadataFormSchema),
    values: initialValues
  });

  const submit = handleSubmit(async (values) => {
    const note = values.note?.trim();

    await onSubmit({
      personName: values.personName.trim(),
      dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      note: note?.length ? note : null
    });
  });

  return (
    <View style={styles.container}>
      <Text variant="titleMedium">Details</Text>

      <Controller
        control={control}
        name="personName"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Person name"
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
            value={value ?? ""}
            onChangeText={onChange}
            multiline
          />
        )}
      />

      <Button
        mode="contained-tonal"
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
