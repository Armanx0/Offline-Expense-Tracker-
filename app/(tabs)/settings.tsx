import { router } from "expo-router";
import { Alert, View } from "react-native";
import {
  Button,
  Card,
  SegmentedButtons,
  Text,
  useTheme
} from "react-native-paper";

import { ErrorState } from "../../src/components/common/ErrorState";
import { LoadingState } from "../../src/components/common/LoadingState";
import { ScreenContainer } from "../../src/components/common/ScreenContainer";
import {
  useCategories,
  useDeleteCategory
} from "../../src/hooks/useCategories";
import {
  useExportBackupFile,
  useExportExpensesCsv
} from "../../src/hooks/useExports";
import { useUiStore } from "../../src/store/ui.store";
import { useUserStore } from "../../src/store/user.store";

export default function SettingsScreen() {
  const theme = useTheme();
  const user = useUserStore((state) => state.user);
  const themePreference = useUiStore((state) => state.themePreference);
  const setThemePreference = useUiStore((state) => state.setThemePreference);
  const categories = useCategories();
  const deleteCategory = useDeleteCategory();
  const exportExpensesCsv = useExportExpensesCsv();
  const exportBackupFile = useExportBackupFile();

  const showExportResult = (
    title: string,
    uri: string,
    savedExternally: boolean
  ) => {
    Alert.alert(
      title,
      savedExternally
        ? "Saved to the folder you selected."
        : `Saved inside the app storage at:\n${uri}`
    );
  };

  const confirmCsvExport = () => {
    Alert.alert(
      "Export CSV",
      "Do you want to export your expenses as a CSV file now?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: () => {
            void exportExpensesCsv
              .mutateAsync()
              .then((result) => {
                showExportResult(
                  "CSV export ready",
                  result.uri,
                  result.savedExternally
                );
              })
              .catch((error: Error) => {
                Alert.alert("CSV export failed", error.message);
              });
          }
        }
      ]
    );
  };

  const confirmBackupExport = () => {
    Alert.alert(
      "Export backup",
      "Do you want to create a full backup file now?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: () => {
            void exportBackupFile
              .mutateAsync()
              .then((result) => {
                showExportResult(
                  "Backup file ready",
                  result.uri,
                  result.savedExternally
                );
              })
              .catch((error: Error) => {
                Alert.alert("Backup export failed", error.message);
              });
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer>
      <View style={{ gap: 6 }}>
        <Text variant="headlineMedium">Settings</Text>
        <Text variant="bodyMedium">
          Manage your offline profile, appearance, categories, and backups.
        </Text>
      </View>
      <Card>
        <Card.Content style={{ gap: 8 }}>
          <Text variant="titleMedium">Appearance</Text>
          <Text variant="bodySmall">
            Choose how the app should look on this device.
          </Text>
          <SegmentedButtons
            value={themePreference}
            onValueChange={(value) => {
              void setThemePreference(value);
            }}
            buttons={[
              { value: "system", label: "System" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" }
            ]}
          />
        </Card.Content>
      </Card>
      <Card>
        <Card.Content style={{ gap: 8 }}>
          <Text variant="titleMedium">Offline profile</Text>
          <Text variant="titleMedium">{user?.name}</Text>
          <Text variant="bodyMedium">{user?.email}</Text>
          <Text variant="bodySmall">
            {user?.currencyCode} / {user?.timezone}
          </Text>
          <Text variant="bodySmall">
            All data stays on this device until you export it.
          </Text>
        </Card.Content>
      </Card>
      <Card>
        <Card.Content style={{ gap: 12 }}>
          <Text variant="titleMedium">Export data</Text>
          <Button
            mode="contained"
            onPress={confirmCsvExport}
            loading={exportExpensesCsv.isPending}
          >
            Export CSV
          </Button>
          <Button
            mode="outlined"
            onPress={confirmBackupExport}
            loading={exportBackupFile.isPending}
          >
            Export backup file
          </Button>
        </Card.Content>
      </Card>
      <Button
        mode="contained-tonal"
        onPress={() => router.push("/category/new")}
      >
        Create category
      </Button>
      {categories.isLoading ? (
        <LoadingState label="Loading categories..." />
      ) : null}
      {categories.error ? (
        <ErrorState message={categories.error.message} />
      ) : null}
      {categories.data?.map((category) => (
        <Card key={category.id}>
          <Card.Content
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <View>
              <Text variant="titleSmall">
                {category.icon ?? "*"} {category.name}
              </Text>
              <Text variant="bodySmall">{category.color ?? "No color"}</Text>
            </View>
            <Button
              mode="text"
              textColor={theme.colors.error}
              onPress={() => {
                Alert.alert("Delete category", `Delete ${category.name}?`, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      void deleteCategory
                        .mutateAsync(category.id)
                        .catch((error: Error) => {
                          Alert.alert(
                            "Unable to delete category",
                            error.message
                          );
                        });
                    }
                  }
                ]);
              }}
            >
              Delete
            </Button>
          </Card.Content>
        </Card>
      ))}
    </ScreenContainer>
  );
}
