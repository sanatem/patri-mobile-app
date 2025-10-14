
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import config from '@/config/constants';
import { getCash } from '@/services/cash/get-cash';

interface UseTotalWalletValueReturn {
  totalWalletValue: number;
  investmentWalletValue: number;
  savingsWalletValue: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTotalWalletValue(): UseTotalWalletValueReturn {
  const { accessToken } = useAuth();
  const [totalWalletValue, setTotalWalletValue] = useState<number>(0);
  const [investmentWalletValue, setInvestmentWalletValue] = useState<number>(0);
  const [savingsWalletValue, setSavingsWalletValue] = useState<number>(0);
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
      
      const investmentAmount = cashData?.cash?.investment?.total_amount;
      const investmentValue = investmentAmount 
        ? (typeof investmentAmount === 'string' ? parseFloat(investmentAmount) : investmentAmount)
        : 0;
      const finalInvestmentValue = !isNaN(investmentValue) ? Math.round(investmentValue) : 0;
      
      const savingsAmount = cashData?.cash?.savings?.total_amount;
      const savingsValue = savingsAmount 
        ? (typeof savingsAmount === 'string' ? parseFloat(savingsAmount) : savingsAmount)
        : 0;
      const finalSavingsValue = !isNaN(savingsValue) ? Math.round(savingsValue) : 0;
      const total = finalInvestmentValue + finalSavingsValue;
      
      setInvestmentWalletValue(finalInvestmentValue);
      setSavingsWalletValue(finalSavingsValue);
      setTotalWalletValue(total);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setTotalWalletValue(0);
      setInvestmentWalletValue(0);
      setSavingsWalletValue(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalWalletValue();
  }, [accessToken]);

  return {
    totalWalletValue,
    investmentWalletValue,
    savingsWalletValue,
    loading,
    error,
    refetch: fetchTotalWalletValue,
  };
}