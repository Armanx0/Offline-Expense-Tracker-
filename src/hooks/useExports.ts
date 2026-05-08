import { useMutation } from "@tanstack/react-query";

import { offlineData } from "../data/offline-data";

export const useExportExpensesCsv = () =>
  useMutation({
    mutationFn: () => offlineData.exportExpensesCsv()
  });

export const useExportBackupFile = () =>
  useMutation({
    mutationFn: () => offlineData.exportBackupFile()
  });
