import { useState, useEffect } from 'react';
import { getCash, CashResponse } from '@/services/cash/get-cash';
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
      
      if (__DEV__) {
        const mockCash: CashResponse = {
          cash: {
            investment: {
              total_amount: 1500000,
              user_cash: 1128658,
              available_amount: 1128658,
              valued_balance: 1500000,
              pending_rebalancing_amount: 0,
              pending_deposits_amount: 0,
              pending_purchase_orders_amount: 0,
              pending_retirements_amount: 0,
              pending_sale_orders_amount: 0,
              user_cash_without_pending_movements: 1128658,
              account_id: 1083,
              account_name: "Cuenta de inversión",
              last_cash_update: new Date().toISOString(),
            }
          }
        };
        setCash(mockCash);
        setError(null);
      }
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
