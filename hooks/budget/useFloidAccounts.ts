
import { useState, useEffect } from 'react';
import { getFloidAccounts, FloidAccountsResponse } from '@/services/budget/transactions/get-floid-accounts';
import { useAuth } from '@/providers/AuthProvider';

interface UseFloidAccountsReturn {
  accounts: FloidAccountsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFloidAccounts(): UseFloidAccountsReturn {
  const { accessToken } = useAuth();
  const [accounts, setAccounts] = useState<FloidAccountsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await getFloidAccounts(accessToken);
      setAccounts(data);
    } catch (err) {
      console.error('Error loading Floid accounts:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [accessToken]);

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
  };
}