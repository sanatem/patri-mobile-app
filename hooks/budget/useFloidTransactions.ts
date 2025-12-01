// hooks/budget/useFloidTransactions.ts
import { useState, useEffect } from 'react';
import { 
  getFloidTransactions, 
  FloidTransactionsResponse,
  GetFloidTransactionsParams 
} from '@/services/budget/transactions/get-floid-transactions';
import { useAuth } from '@/providers/AuthProvider';

interface UseFloidTransactionsProps {
  floidId?: string;
  floidIds?: string[];
  page?: number;
  per_page?: number;
  date?: string;
  start_date?: string;
  end_date?: string;
  transaction_type?: 'income' | 'outcome';
  processed?: boolean;
  enabled?: boolean;
}

interface UseFloidTransactionsReturn {
  transactions: FloidTransactionsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useFloidTransactions(props: UseFloidTransactionsProps): UseFloidTransactionsReturn {
  const { enabled = true, ...params } = props;
  const { accessToken } = useAuth();
  const [transactions, setTransactions] = useState<FloidTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(params.page || 1);

  const fetchTransactions = async (page: number = 1, append: boolean = false) => {
    if (!accessToken || !enabled) {
      setLoading(false);
      return;
    }

    const { floidIds, ...restParams } = params;
    if (floidIds && floidIds.length > 0) {
      try {
        if (!append) {
          setLoading(true);
        }
        setError(null);

        const requests = floidIds.map(id =>
          getFloidTransactions({
            ...restParams,
            floidId: id,
            page
          }, accessToken)
        );

        const results = await Promise.all(requests);

        const allTransactions = results.flatMap(result => result?.transactions || []);

        // Check if ANY account has more pages
        const hasAnyNextPage = results.some(result => result?.pagination?.has_next_page === true);
        const totalCount = results.reduce((sum, result) => sum + (result?.pagination?.total_count || 0), 0);
        const maxTotalPages = Math.max(...results.map(result => result?.pagination?.total_pages || 1));

        const combinedData: FloidTransactionsResponse = {
          transactions: allTransactions,
          pagination: {
            current_page: page,
            total_count: totalCount,
            total_pages: maxTotalPages,
            has_next_page: hasAnyNextPage,
            has_previous_page: page > 1
          }
        };

        if (append && transactions) {
          setTransactions({
            ...combinedData,
            transactions: [...transactions.transactions, ...combinedData.transactions]
          });
        } else {
          setTransactions(combinedData);
        }

        setCurrentPage(page);
      } catch (err) {
        console.error('Error loading Floid transactions:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    } else if (params.floidId) {
      // Comportamiento original para un solo ID
      try {
        if (!append) {
          setLoading(true);
        }
        setError(null);

        const requestParams: GetFloidTransactionsParams = {
          floidId: params.floidId,
          page,
          per_page: params.per_page,
          date: params.date,
          start_date: params.start_date,
          end_date: params.end_date,
          transaction_type: params.transaction_type,
          processed: params.processed
        };

        const data = await getFloidTransactions(requestParams, accessToken);

        if (append && transactions) {
          setTransactions({
            ...data!,
            transactions: [...transactions.transactions, ...data!.transactions]
          });
        } else {
          setTransactions(data);
        }

        setCurrentPage(page);
      } catch (err) {
        console.error('Error loading Floid transactions:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
  };

  const loadMore = async () => {
    if (transactions?.pagination.has_next_page) {
      await fetchTransactions(currentPage + 1, true);
    }
  };

  const refetch = async () => {
    setCurrentPage(1);
    await fetchTransactions(1, false);
  };

  useEffect(() => {
    if ((params.floidId || (params.floidIds && params.floidIds.length > 0)) && enabled) {
      fetchTransactions(1, false);
    }
  }, [
    params.floidId,
    params.floidIds,
    params.start_date,
    params.end_date,
    params.transaction_type,
    params.processed,
    accessToken,
    enabled
  ]);
  
  return {
    transactions,
    loading,
    error,
    refetch,
    loadMore,
    hasMore: transactions?.pagination.has_next_page || false,
  };
}
