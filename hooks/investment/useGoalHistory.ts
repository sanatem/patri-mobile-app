import { useState, useEffect, useMemo } from 'react';
import { goalHistoryService, GoalHistoryParams, GoalHistoryData } from '@/services/investment/portfolio/goals/get-goal-history';
import { useAuth } from '@/providers/AuthProvider';

interface UseGoalHistoryProps {
  goalId: string;
  period?: '1M' | '3M' | '6M' | '1Y' | 'ALL';
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

interface UseGoalHistoryReturn {
  historyData: GoalHistoryData | null;
  filteredData: GoalHistoryData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

const getDateRange = (period: '1M' | '3M' | '6M' | '1Y' | 'ALL' = '1M') => {
  const endDate = new Date();
  let startDate = new Date();

  switch (period) {
    case '1M':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case '3M':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6M':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case '1Y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case 'ALL':
      startDate = new Date('2020-01-01');
      break;
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

export function useGoalHistory(props: UseGoalHistoryProps): UseGoalHistoryReturn {
  const { goalId, period = '1M', startDate, endDate, page = 1, perPage = 30 } = props;
  
  
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

      const dateRange = startDate && endDate ? { startDate, endDate } : getDateRange(period);

      const params: GoalHistoryParams = {
        goalId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
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
      console.error('useGoalHistory - Error detallado:', {
        message: err instanceof Error ? err.message : 'Error desconocido',
        stack: err instanceof Error ? err.stack : undefined,
        goalId,
        dateRange: startDate && endDate ? { startDate, endDate } : getDateRange(period),
        fullError: err
      });
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

  const filteredData = useMemo(() => {
    if (!historyData) return null;
    if (startDate && endDate) return historyData; // Si hay fechas específicas, no filtramos

    const { startDate: periodStartDate } = getDateRange(period);
    const filteredValues = historyData.historicValues.filter(point => {
      return point.date >= periodStartDate;
    });

    return {
      ...historyData,
      historicValues: filteredValues
    };
  }, [historyData, period, startDate, endDate]);

  useEffect(() => {
    if (goalId && accessToken) {
      fetchData(1, false);
    }
  }, [goalId, accessToken, startDate, endDate, period]);

  return {
    historyData,
    filteredData,
    loading,
    error,
    refetch,
    loadMore,
    hasMore: historyData?.pagination.hasNextPage || false,
  };
} 