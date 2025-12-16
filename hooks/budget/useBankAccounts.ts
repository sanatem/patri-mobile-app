import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getBankAccounts, BankAccount } from '@/services/investment/bank-accounts/get-bank-account';

interface UseBankAccountsReturn {
  accounts: BankAccount[];
  loading: boolean;
  error: string | null;
  hasAccounts: boolean;
  refetch: () => Promise<void>;
}

export function useBankAccounts(): UseBankAccountsReturn {
  const { accessToken } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getBankAccounts(accessToken);

      if (response.success) {
        setAccounts(response.accounts);
      } else {
        setError(response.message || 'Error al cargar cuentas bancarias');
      }
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar cuentas bancarias');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    error,
    hasAccounts: accounts.length > 0,
    refetch: fetchAccounts,
  };
}
