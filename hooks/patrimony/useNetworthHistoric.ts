// hooks/patrimony/useNetworthHistoric.ts
import { useState, useEffect, useCallback } from 'react';
import { getNetworthHistoric, NetworthHistoricResponse, GetNetworthHistoricParams } from '@/services/patrimony/get-networth-historic';
import { useAuth } from '@/providers/AuthProvider';

interface UseNetworthHistoricReturn {
  historicData: NetworthHistoricResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

const formatDateToYYYYMMDD = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return start <= end && end <= now;
};

export function useNetworthHistoric(params: GetNetworthHistoricParams = {}): UseNetworthHistoricReturn {
  const { accessToken } = useAuth();
  const [historicData, setHistoricData] = useState<NetworthHistoricResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldLoadMore, setShouldLoadMore] = useState(true);

  const fetchHistoricData = async (page: number = 1, append: boolean = false) => {
    if (!accessToken || !shouldLoadMore) {
      setLoading(false);
      return;
    }

    try {
      if (!append) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      // Format and validate dates
      const formattedStartDate = params.start_date ? formatDateToYYYYMMDD(params.start_date) : undefined;
      const formattedEndDate = params.end_date ? formatDateToYYYYMMDD(params.end_date) : undefined;

      // Validate date range if both dates are provided
      if (formattedStartDate && formattedEndDate) {
        if (!validateDateRange(formattedStartDate, formattedEndDate)) {
          throw new Error('Invalid date range: Start date must be before or equal to end date, and end date cannot be in the future');
        }
      }

      const formattedParams = {
        ...params,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        page,
        per_page: 50,
        order: 'desc' as const
      };

      console.log('📊 Fetching historic data with params:', formattedParams);
      
      const data = await getNetworthHistoric(accessToken, formattedParams);

      if (data) {
        let shouldContinue = true;
        
        if (append && historicData) {
          // Combinar los datos existentes con los nuevos
          const combinedTimeline = [...historicData.historic.timeline];
          const newEntries: typeof combinedTimeline = [];
          
          // Agregar solo entradas nuevas que no existan ya y verificar si debemos continuar
          data.historic.timeline.forEach(newEntry => {
            const entryDate = new Date(newEntry.date);
            
            // Si tenemos fecha límite, verificar si debemos incluir esta entrada
            if (formattedParams.start_date) {
              const startDate = new Date(formattedParams.start_date);
              if (entryDate < startDate) {
                shouldContinue = false;
                return;
              }
            }
            
            if (!combinedTimeline.some(existing => existing.date === newEntry.date)) {
              newEntries.push(newEntry);
            }
          });

          // Agregar nuevas entradas al timeline
          combinedTimeline.push(...newEntries);

          // Ordenar por fecha descendente (más reciente primero)
          combinedTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          // Eliminar duplicados si los hay
          const uniqueTimeline = combinedTimeline.filter((entry, index, self) =>
            index === self.findIndex((e) => e.date === entry.date)
          );

          console.log('📊 Combined timeline:', {
            total: uniqueTimeline.length,
            firstDate: uniqueTimeline[0]?.date,
            lastDate: uniqueTimeline[uniqueTimeline.length - 1]?.date
          });

          setHistoricData({
            historic: {
              ...data.historic,
              timeline: uniqueTimeline,
            }
          });
        } else {
          setHistoricData(data);
          console.log('📊 Initial data:', {
            total: data.historic.timeline.length,
            firstDate: data.historic.timeline[0]?.date,
            lastDate: data.historic.timeline[data.historic.timeline.length - 1]?.date
          });
        }

        // Actualizar el estado de paginación
        const hasNextPage = data.historic.pagination?.has_next_page && shouldContinue;
        setHasMore(hasNextPage);
        setCurrentPage(data.historic.pagination?.current_page || page);
        setShouldLoadMore(shouldContinue && hasNextPage);

        console.log('📊 Pagination status:', {
          hasNextPage,
          currentPage: data.historic.pagination?.current_page,
          shouldContinue
        });
      }
    } catch (err) {
      console.error('❌ Error loading networth historic data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setShouldLoadMore(false);
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const loadMore = useCallback(async () => {
    if (hasMore && !loading && !isLoadingMore && shouldLoadMore) {
      console.log('📊 Loading more data, page:', currentPage + 1);
      await fetchHistoricData(currentPage + 1, true);
    }
  }, [hasMore, loading, isLoadingMore, currentPage, shouldLoadMore]);

  // Efecto para la carga inicial
  useEffect(() => {
    console.log('📊 Initializing data fetch with params:', params);
    setCurrentPage(1);
    setShouldLoadMore(true);
    fetchHistoricData(1, false);
  }, [accessToken, params.start_date, params.end_date]);

  // Efecto para cargar automáticamente más datos
  useEffect(() => {
    if (shouldLoadMore && !loading && !isLoadingMore && hasMore) {
      loadMore();
    }
  }, [shouldLoadMore, loading, isLoadingMore, hasMore, loadMore]);

  return {
    historicData,
    loading: loading || isLoadingMore,
    error,
    refetch: () => {
      setShouldLoadMore(true);
      return fetchHistoricData(1, false);
    },
    loadMore,
    hasMore
  };
}