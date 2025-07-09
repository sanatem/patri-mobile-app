import { useState, useEffect } from 'react';
import { getPortfolioDetails, MetaDetails } from '@/services/investment/portfolio/portfolio-details/get-portfolio-details';
import { getMovementsByGoal, Movement } from '@/services/investment/portfolio/movements/get-movements';

interface UsePortfolioDetailsProps {
  metaName: string;
}

interface UsePortfolioDetailsReturn {
  metaDetails: MetaDetails | null;
  movements: Movement[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePortfolioDetails({ metaName }: UsePortfolioDetailsProps): UsePortfolioDetailsReturn {
  const [metaDetails, setMetaDetails] = useState<MetaDetails | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [metaData, movementsData] = await Promise.all([
        getPortfolioDetails(metaName),
        getMovementsByGoal(metaName)
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
    if (metaName) {
      fetchData();
    }
  }, [metaName]);

  return {
    metaDetails,
    movements,
    loading,
    error,
    refetch: fetchData,
  };
} 