import { useState, useEffect } from 'react';
import { getCash, CashResponse } from '@/services/cash/get-cash';
import { useAuth } from '@/providers/AuthProvider';

interface UseCashReturn {
  cashData: CashResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCash(): UseCashReturn {
  const { accessToken } = useAuth();
  const [cashData, setCashData] = useState<CashResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCashData = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await getCash(accessToken);
      setCashData(data);
    } catch (err) {
      console.error('Error loading cash data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashData();
  }, [accessToken]);

  return {
    cashData,
    loading,
    error,
    refetch: fetchCashData,
  };
}