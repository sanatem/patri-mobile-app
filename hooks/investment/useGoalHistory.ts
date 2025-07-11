import { useState, useEffect } from 'react';
import { goalHistoryService, GoalHistoryParams, GoalHistoryData } from '@/services/investment/portfolio/goals/get-goal-history';
import { useAuth } from '@/providers/AuthProvider';

interface UseGoalHistoryProps {
  goalId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

interface UseGoalHistoryReturn {
  historyData: GoalHistoryData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useGoalHistory(props: UseGoalHistoryProps): UseGoalHistoryReturn {
  const { goalId, startDate, endDate, page = 1, perPage = 30 } = props;
  const [historyData, setHistoryData] = useState<GoalHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const { accessToken } = useAuth();

  const fetchData = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      setError(null);
      
      if (!accessToken) {
        throw new Error('No hay token de autenticación disponible');
      }

      const params: GoalHistoryParams = {
        goalId,
        startDate,
        endDate,
        page: pageNum,
        perPage
      };

      const data = await goalHistoryService.getGoalHistory(params, accessToken);
      
      if (append && historyData) {
        setHistoryData({
          ...data,
          historicValues: [...historyData.historicValues, ...data.historicValues]
        });
      } else {
        setHistoryData(data);
      }
      
      setCurrentPage(pageNum);
    } catch (err) {
      console.error('❌ useGoalHistory - Error loading goal history:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    setCurrentPage(1);
    await fetchData(1, false);
  };

  const loadMore = async () => {
    if (historyData?.pagination.hasNextPage) {
      await fetchData(currentPage + 1, true);
    }
  };

  useEffect(() => {
    if (goalId && accessToken) {
      fetchData(1, false);
    }
  }, [goalId, accessToken, startDate, endDate, perPage]);

  return {
    historyData,
    loading,
    error,
    refetch,
    loadMore,
    hasMore: historyData?.pagination.hasNextPage || false,
  };
} 