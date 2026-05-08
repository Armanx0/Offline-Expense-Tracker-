import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import {
  Button,
  Modal,
  Portal,
  RadioButton,
  Text,
  TextInput,
  useTheme
} from "react-native-paper";

import { useCategories, useCreateCategory } from "../../hooks/useCategories";

const presetColors = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#10B981",
  "#3B82F6",
  "#8B5CF6"
];

export const CategoryPicker = ({
  value,
  onChange
}: {
  value: string | null;
  onChange: (categoryId: string) => void;
}) => {
  const theme = useTheme();
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("\uD83D\uDCB8");
  const [color, setColor] = useState(presetColors[0] ?? "#EF4444");

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === value) ?? null,
    [categories, value]
  );

  const closeModal = () => {
    setVisible(false);
  };

  const handleSelect = (categoryId: string) => {
    onChange(categoryId);
    closeModal();
  };

  const handleCreate = async () => {
    try {
      const category = await createCategory.mutateAsync({
        name,
        icon,
        color
      });
      onChange(category.id);
      setName("");
      setIcon("\uD83D\uDCB8");
      setColor(presetColors[0] ?? "#EF4444");
      closeModal();
    } catch (error) {
      Alert.alert(
        "Unable to save category",
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  return (
    <>
      <Button
        mode="outlined"
        onPress={() => setVisible(true)}
        disabled={isLoading}
      >
        {selectedCategory
          ? `${selectedCategory.icon ?? "*"} ${selectedCategory.name}`
          : "Choose category"}
      </Button>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={closeModal}
          contentContainerStyle={styles.modalShell}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardWrapper}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.modal,
                { backgroundColor: theme.colors.surface }
              ]}
            >
              <Text variant="titleMedium">Pick a category</Text>
              <RadioButton.Group
                onValueChange={handleSelect}
                value={value ?? ""}
              >
                {categories.map((category) => (
                  <RadioButton.Item
                    key={category.id}
                    label={`${category.icon ?? "*"} ${category.name}`}
                    value={category.id}
                  />
                ))}
              </RadioButton.Group>
              <View
                style={[
                  styles.divider,
                  { borderTopColor: theme.colors.outlineVariant }
                ]}
              />
              <Text variant="titleSmall">Create new category</Text>
              <TextInput label="Name" value={name} onChangeText={setName} />
              <TextInput
                label="Icon"
                value={icon}
                onChangeText={setIcon}
                maxLength={4}
              />
              <View style={styles.colorRow}>
                {presetColors.map((preset) => (
                  <Pressable
                    key={preset}
                    onPress={() => setColor(preset)}
                    style={styles.colorPressable}
                  >
                    <View
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: preset },
                        color === preset
                          ? { borderColor: theme.colors.onSurface }
                          : null
                      ]}
                    />
                  </Pressable>
                ))}
              </View>
              <Button
                mode="contained"
                onPress={() => {
                  void handleCreate();
                }}
                disabled={!name.trim() || createCategory.isPending}
                loading={createCategory.isPending}
              >
                Save category
              </Button>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  modalShell: {
    margin: 20,
    maxHeight: "80%"
  },
  keyboardWrapper: {
    flexShrink: 1
  },
  modal: {
    borderRadius: 24,
    gap: 12,
    padding: 20
  },
  divider: {
    borderTopWidth: 1,
    marginVertical: 8
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  colorPressable: {
    borderRadius: 999
  },
  colorSwatch: {
    borderColor: "transparent",
    borderRadius: 999,
    borderWidth: 3,
    height: 34,
    width: 34
  }
});
