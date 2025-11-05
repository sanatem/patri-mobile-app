import { useState, useEffect } from 'react';
import { getCash, CashResponse } from '@/services/investment/cash/get-cash';
import { useAuth } from '@/providers/AuthProvider';

interface UseCashReturn {
  cash: CashResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCash(): UseCashReturn {
  const { accessToken, isAuthenticated } = useAuth();
  const [cash, setCash] = useState<CashResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCash = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!accessToken) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      const cashData = await getCash(accessToken);
      setCash(cashData);
    } catch (err) {
      console.error('useCash: Error loading cash:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchCash();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken]);

  return {
    cash,
    loading,
    error,
    refetch: fetchCash,
  };
}
