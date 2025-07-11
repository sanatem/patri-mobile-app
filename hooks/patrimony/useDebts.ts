import { useState, useEffect } from 'react';
import { getDebts } from '@/services/patrimony/get-debts';
import { useAuth } from '@/providers/AuthProvider';
import type { ApiDebtsResponse } from '@/types/api';

interface UseDebtsParams {
  page?: number;
  per_page?: number;
  debt_category?: string;
}

interface UseDebtsReturn {
  debts: ApiDebtsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDebts(params: UseDebtsParams = {}, enabled: boolean = true): UseDebtsReturn {
  const { accessToken } = useAuth();
  const [debts, setDebts] = useState<ApiDebtsResponse | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = async () => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (!accessToken) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      const debtsData = await getDebts(accessToken, params);
      setDebts(debtsData);
    } catch (err) {
      console.error('Error loading debts:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && enabled) {
      fetchDebts();
    } else if (!enabled) {
      setLoading(false);
      setError(null);
    }
  }, [accessToken, enabled, params.page, params.per_page, params.debt_category]);

  return {
    debts,
    loading,
    error,
    refetch: fetchDebts,
  };
} 