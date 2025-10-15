/**
 * React Query hooks for Portfolio API integration
 *
 * These hooks provide a clean interface for:
 * - Data fetching with automatic caching
 * - Optimistic updates
 * - Automatic refetching on mutations
 * - Loading and error states
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, AssetCreateData, TransactionCreateData } from '@/lib/api';
import { toast } from 'sonner';

// ============================================
// Query Keys (for cache management)
// ============================================
export const portfolioKeys = {
  all: ['portfolio'] as const,
  assets: () => [...portfolioKeys.all, 'assets'] as const,
  asset: (id: string) => [...portfolioKeys.assets(), id] as const,
  assetSummary: (id: string) => [...portfolioKeys.asset(id), 'summary'] as const,
  transactions: () => [...portfolioKeys.all, 'transactions'] as const,
  transaction: (id: string) => [...portfolioKeys.transactions(), id] as const,
  transactionsByAsset: (assetId: string) => [...portfolioKeys.transactions(), 'asset', assetId] as const,
  summary: () => [...portfolioKeys.all, 'summary'] as const,
};

// ============================================
// Assets Hooks
// ============================================

/**
 * Fetch all assets for the authenticated user
 */
export function useAssets() {
  return useQuery({
    queryKey: portfolioKeys.assets(),
    queryFn: () => apiClient.getAssets(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single asset by ID
 */
export function useAsset(id: string) {
  return useQuery({
    queryKey: portfolioKeys.asset(id),
    queryFn: () => apiClient.getAsset(id),
    enabled: !!id,
  });
}

/**
 * Fetch asset summary (calculations)
 */
export function useAssetSummary(id: string) {
  return useQuery({
    queryKey: portfolioKeys.assetSummary(id),
    queryFn: () => apiClient.getAssetSummary(id),
    enabled: !!id,
  });
}

/**
 * Create a new asset
 */
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssetCreateData) => apiClient.createAsset(data),
    onSuccess: (newAsset) => {
      // Invalidate and refetch assets list
      queryClient.invalidateQueries({ queryKey: portfolioKeys.assets() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.summary() });

      toast.success(`Ativo ${newAsset.ticker} adicionado com sucesso!`);
    },
    onError: (error: any) => {
      const message = error.message || 'Erro ao criar ativo';
      toast.error(message);
    },
  });
}

/**
 * Update an existing asset
 */
export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssetCreateData> }) =>
      apiClient.updateAsset(id, data),
    onSuccess: (updatedAsset) => {
      // Invalidate specific asset and list
      queryClient.invalidateQueries({ queryKey: portfolioKeys.asset(updatedAsset.id) });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.assets() });

      toast.success('Ativo atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar ativo');
    },
  });
}

/**
 * Delete an asset
 */
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAsset(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: portfolioKeys.asset(deletedId) });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.assets() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.summary() });

      toast.success('Ativo removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao deletar ativo');
    },
  });
}

// ============================================
// Transactions Hooks
// ============================================

/**
 * Fetch all transactions (optionally filtered by asset)
 */
export function useTransactions(assetId?: string) {
  return useQuery({
    queryKey: assetId
      ? portfolioKeys.transactionsByAsset(assetId)
      : portfolioKeys.transactions(),
    queryFn: () => apiClient.getTransactions(assetId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single transaction by ID
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: portfolioKeys.transaction(id),
    queryFn: () => apiClient.getTransaction(id),
    enabled: !!id,
  });
}

/**
 * Create a new transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransactionCreateData) => apiClient.createTransaction(data),
    onSuccess: (newTransaction) => {
      // Invalidate transactions and related asset data
      queryClient.invalidateQueries({ queryKey: portfolioKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.asset(newTransaction.asset_id) });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.assetSummary(newTransaction.asset_id) });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.summary() });

      toast.success('Transação registrada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar transação');
    },
  });
}

/**
 * Update an existing transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionCreateData> }) =>
      apiClient.updateTransaction(id, data),
    onSuccess: (updatedTransaction) => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.transaction(updatedTransaction.id) });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.asset(updatedTransaction.asset_id) });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.assetSummary(updatedTransaction.asset_id) });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.summary() });

      toast.success('Transação atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar transação');
    },
  });
}

/**
 * Delete a transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTransaction(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: portfolioKeys.transaction(deletedId) });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.summary() });

      toast.success('Transação removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao deletar transação');
    },
  });
}

// ============================================
// Portfolio Summary Hooks
// ============================================

/**
 * Fetch portfolio consolidated summary
 */
export function usePortfolioSummary() {
  return useQuery({
    queryKey: portfolioKeys.summary(),
    queryFn: () => apiClient.getPortfolioSummary(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}