import { useState, useEffect } from 'react';
import { getPortfolioDetails, MetaDetails } from '@/services/investment/portfolio/portfolio-details/get-portfolio-details';
import { getMovementsByGoal, Movement } from '@/services/investment/portfolio/movements/get-movements';
import { investmentService } from '@/services/investment/get-portfolio';
import { useAuth } from '@/providers/AuthProvider';

interface UsePortfolioDetailsProps {
  goalId: string;
}

interface UsePortfolioDetailsReturn {
  metaDetails: MetaDetails | null;
  movements: Movement[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseHasInvestmentAccountReturn {
  hasInvestmentAccount: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePortfolioDetails({ goalId }: UsePortfolioDetailsProps): UsePortfolioDetailsReturn {
  const [metaDetails, setMetaDetails] = useState<MetaDetails | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!accessToken) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      const [metaData, movementsData] = await Promise.all([
        getPortfolioDetails(goalId, accessToken),
        getMovementsByGoal(goalId, accessToken || undefined)
      ]);
      
      setMetaDetails(metaData);
      setMovements(movementsData);
    } catch (err) {
      console.error('Error loading portfolio details:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (goalId && accessToken) {
      fetchData();
    }
  }, [goalId, accessToken]);

  return {
    metaDetails,
    movements,
    loading,
    error,
    refetch: fetchData,
  };
}

export function useHasInvestmentAccount(): UseHasInvestmentAccountReturn {
  const { accessToken } = useAuth();
  const [hasInvestmentAccount, setHasInvestmentAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkInvestmentAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const hasAccount = await investmentService.hasInvestmentAccount(accessToken || undefined);
      setHasInvestmentAccount(hasAccount);
    } catch (err) {
      console.error('Error checking investment account:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setHasInvestmentAccount(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkInvestmentAccount();
  }, [accessToken]);

  return {
    hasInvestmentAccount,
    loading,
    error,
    refetch: checkInvestmentAccount,
  };
} 