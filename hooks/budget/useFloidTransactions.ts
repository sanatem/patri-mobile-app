// hooks/budget/useFloidTransactions.ts
import { useState, useEffect } from 'react';
import { 
  getFloidTransactions, 
  FloidTransactionsResponse,
  GetFloidTransactionsParams 
} from '@/services/budget/get-floid-transactions';
import { useAuth } from '@/providers/AuthProvider';

interface UseFloidTransactionsProps {
  floidId: string;
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

    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);
      
      const requestParams: GetFloidTransactionsParams = {
        ...params,
        page
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
    if (params.floidId && enabled) {
      fetchTransactions(1, false);
    }
  }, [
    params.floidId, 
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
