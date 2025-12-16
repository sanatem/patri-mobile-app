import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  getManualTransactions,
  GetManualTransactionsParams,
  ManualTransaction,
} from '@/services/budget/transactions/manual-transactions';

interface UseManualTransactionsOptions {
  bankAccountId?: number;
  startDate?: string;
  endDate?: string;
  transactionType?: 'income' | 'expense';
  perPage?: number;
  autoFetch?: boolean;
}

interface UseManualTransactionsReturn {
  transactions: ManualTransaction[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  totalIncome: number;
  totalExpense: number;
}

export function useManualTransactions(options: UseManualTransactionsOptions = {}): UseManualTransactionsReturn {
  const { accessToken } = useAuth();
  const [transactions, setTransactions] = useState<ManualTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const {
    bankAccountId,
    startDate,
    endDate,
    transactionType,
    perPage = 20,
    autoFetch = true,
  } = options;

  const fetchTransactions = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      const params: GetManualTransactionsParams = {
        page: pageNum,
        per_page: perPage,
      };

      if (bankAccountId) params.bank_account_id = bankAccountId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (transactionType) params.transaction_type = transactionType;

      const response = await getManualTransactions(params, accessToken);

      if (response.success) {
        let newTransactions = response.data;

        // Filter transactions by type locally (in case API doesn't support it)
        if (transactionType === 'income') {
          newTransactions = newTransactions.filter(t => t.amount_in > 0);
        } else if (transactionType === 'expense') {
          newTransactions = newTransactions.filter(t => t.amount_out > 0);
        }

        if (append) {
          setTransactions(prev => [...prev, ...newTransactions]);
        } else {
          setTransactions(newTransactions);
        }

        // Determine if there are more pages
        if (response.meta) {
          setHasMore(pageNum < response.meta.total_pages);
        } else {
          setHasMore(newTransactions.length === perPage);
        }
      }
    } catch (err) {
      console.error('Error fetching manual transactions:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  }, [accessToken, bankAccountId, startDate, endDate, transactionType, perPage]);

  // Refetch only if autoFetch is enabled
  const refetch = useCallback(async () => {
    if (!autoFetch) return; // Don't fetch if autoFetch is disabled
    setPage(1);
    await fetchTransactions(1, false);
  }, [fetchTransactions, autoFetch]);

  const loadMore = useCallback(async () => {
    if (!autoFetch) return; // Don't fetch if autoFetch is disabled
    if (!hasMore || loading) return;

    const nextPage = page + 1;
    setPage(nextPage);
    await fetchTransactions(nextPage, true);
  }, [hasMore, loading, page, fetchTransactions, autoFetch]);

  // Initial fetch and when autoFetch changes
  useEffect(() => {
    if (autoFetch && accessToken) {
      fetchTransactions(1, false);
    } else if (!autoFetch) {
      // Clear transactions when autoFetch is disabled (mode changed to floid)
      setTransactions([]);
      setPage(1);
      setHasMore(true);
    }
  }, [autoFetch, accessToken, bankAccountId, startDate, endDate, transactionType]);

  // Calculate totals
  const totalIncome = transactions.reduce((sum, t) => sum + (t.amount_in || 0), 0);
  const totalExpense = transactions.reduce((sum, t) => sum + (t.amount_out || 0), 0);

  return {
    transactions,
    loading,
    error,
    hasMore,
    refetch,
    loadMore,
    totalIncome,
    totalExpense,
  };
}
