// hooks/investment/useTotalWalletValue.ts
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import config from '@/config/constants';
import { getCash } from '@/services/cash/get-cash';

interface UseTotalWalletValueReturn {
  totalWalletValue: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTotalWalletValue(): UseTotalWalletValueReturn {
  const { accessToken } = useAuth();
  const [totalWalletValue, setTotalWalletValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTotalWalletValue = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const cashData = await getCash(accessToken);
      
      const totalAmount = cashData?.cash?.total_amount;
      
      if (totalAmount !== undefined && totalAmount !== null) {
        const numericValue = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;
        if (!isNaN(numericValue)) {
          setTotalWalletValue(Math.round(numericValue));
          return;
        }
      }
      
      const url = `${config.apiBaseUrl}/api/v2/goals`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const goals = data.goals || [];
        let total = 0;
        
        goals.forEach((goal: any) => {
          const walletValue = Math.round(Number(goal.wallet_value) || 0);
          total += walletValue;
        });

        setTotalWalletValue(Math.round(total));
      } else {
        setTotalWalletValue(0);
      }

    } catch (err) {
      console.error('❌ Error in fetchTotalWalletValue:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setTotalWalletValue(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalWalletValue();
  }, [accessToken]);

  return {
    totalWalletValue,
    loading,
    error,
    refetch: fetchTotalWalletValue,
  };
}