import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddDebtAmountRequest,
  CreateDebtRequest,
  ListDebtsQuery,
  RecordDebtPaymentRequest,
  UpdateDebtMetadataRequest
} from "../contracts";

import { offlineData } from "../data/offline-data";

const debtKeys = {
  summary: ["debt-summary"] as const,
  list: (query: ListDebtsQuery) => ["debts", query] as const,
  detail: (id: string) => ["debt-detail", id] as const
};

const invalidateDebtQueries = async (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  await queryClient.invalidateQueries({ queryKey: debtKeys.summary });
  await queryClient.invalidateQueries({ queryKey: ["debts"] });
};

export const useDebtSummary = () =>
  useQuery({
    queryKey: debtKeys.summary,
    queryFn: () => offlineData.getDebtSummary()
  });

export const useDebts = (query: ListDebtsQuery) =>
  useQuery({
    queryKey: debtKeys.list(query),
    queryFn: () => offlineData.getDebts(query),
    placeholderData: (previousData) => previousData
  });

export const useDebt = (id: string) =>
  useQuery({
    queryKey: debtKeys.detail(id),
    queryFn: () => offlineData.getDebt(id),
    enabled: Boolean(id)
  });

export const useCreateDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDebtRequest) => offlineData.createDebt(payload),
    onSuccess: async () => {
      await invalidateDebtQueries(queryClient);
    }
  });
};

export const useUpdateDebtMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: UpdateDebtMetadataRequest;
    }) => offlineData.updateDebtMetadata(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: debtKeys.detail(variables.id)
      });
      await invalidateDebtQueries(queryClient);
    }
  });
};

export const useAddDebtAmount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: AddDebtAmountRequest;
    }) => offlineData.addDebtAmount(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: debtKeys.detail(variables.id)
      });
      await invalidateDebtQueries(queryClient);
    }
  });
};

export const useRecordDebtPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: RecordDebtPaymentRequest;
    }) => offlineData.recordDebtPayment(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: debtKeys.detail(variables.id)
      });
      await invalidateDebtQueries(queryClient);
    }
  });
};

export const useDeleteDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => offlineData.deleteDebt(id),
    onSuccess: async () => {
      await invalidateDebtQueries(queryClient);
    }
  });
};
