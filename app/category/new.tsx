import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

import { ScreenContainer } from "../../src/components/common/ScreenContainer";
import { useCreateCategory } from "../../src/hooks/useCategories";

export default function NewCategoryScreen() {
  const createCategory = useCreateCategory();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("\uD83D\uDCB8");
  const [color, setColor] = useState("#1D4ED8");

  return (
    <ScreenContainer>
      <Text variant="headlineMedium">New category</Text>
      <TextInput label="Name" value={name} onChangeText={setName} />
      <TextInput
        label="Icon"
        value={icon}
        onChangeText={setIcon}
        maxLength={4}
      />
      <TextInput label="Color" value={color} onChangeText={setColor} />
      <Button
        mode="contained"
        loading={createCategory.isPending}
        disabled={!name.trim()}
        onPress={() => {
          void createCategory
            .mutateAsync({
              name,
              icon,
              color
            })
            .then(() => router.back())
            .catch((error: Error) => {
              Alert.alert("Unable to save category", error.message);
            });
        }}
      >
        Save category
      </Button>
    </ScreenContainer>
  );
}
