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

      const formattedStartDate = params.start_date ? formatDateToYYYYMMDD(params.start_date) : undefined;
      const formattedEndDate = params.end_date ? formatDateToYYYYMMDD(params.end_date) : undefined;

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
        per_page: 200,
        order: 'desc' as const
      };

      const data = await getNetworthHistoric(accessToken, formattedParams);

      if (data) {
        let shouldContinue = true;

        if (append && historicData) {
          const combinedTimeline = [...historicData.historic.timeline];
          const newEntries: typeof combinedTimeline = [];

          data.historic.timeline.forEach(newEntry => {
            const entryDate = new Date(newEntry.date);

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

          combinedTimeline.push(...newEntries);

          combinedTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          const uniqueTimeline = combinedTimeline.filter((entry, index, self) =>
            index === self.findIndex((e) => e.date === entry.date)
          );

          setHistoricData({
            historic: {
              ...data.historic,
              timeline: uniqueTimeline,
            }
          });
        } else {
          setHistoricData(data);

          // Auto-fetch remaining pages after first response
          const totalPages = data.historic.pagination?.total_pages || 1;
          const currentPage = data.historic.pagination?.current_page || 1;

          if (totalPages > currentPage) {
            for (let nextPage = currentPage + 1; nextPage <= totalPages; nextPage++) {
              const nextData = await getNetworthHistoric(accessToken, {
                ...formattedParams,
                page: nextPage
              });

              if (nextData) {
                setHistoricData(prevData => {
                  if (!prevData) return nextData;

                  const combinedTimeline = [...prevData.historic.timeline];

                  nextData.historic.timeline.forEach(newEntry => {
                    if (!combinedTimeline.some(existing => existing.date === newEntry.date)) {
                      combinedTimeline.push(newEntry);
                    }
                  });

                  combinedTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                  return {
                    historic: {
                      ...nextData.historic,
                      timeline: combinedTimeline,
                    }
                  };
                });
              }
            }
          }
        }

        const hasNextPage = data.historic.pagination?.has_next_page && shouldContinue;
        setHasMore(hasNextPage);
        setCurrentPage(data.historic.pagination?.current_page || page);
        setShouldLoadMore(shouldContinue && hasNextPage);

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
      await fetchHistoricData(currentPage + 1, true);
    }
  }, [hasMore, loading, isLoadingMore, currentPage, shouldLoadMore]);

  useEffect(() => {
    setCurrentPage(1);
    setShouldLoadMore(true);
    fetchHistoricData(1, false);
  }, [accessToken, params.start_date, params.end_date]);


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
