// hooks/patrimony/useNetworthHistoric.ts
import { useState, useEffect } from 'react';
import { getNetworthHistoric, NetworthHistoricResponse, GetNetworthHistoricParams } from '@/services/patrimony/get-networth-historic';
import { useAuth } from '@/providers/AuthProvider';

interface UseNetworthHistoricReturn {
  historicData: NetworthHistoricResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNetworthHistoric(params: GetNetworthHistoricParams = {}): UseNetworthHistoricReturn {
  const { accessToken } = useAuth();
  const [historicData, setHistoricData] = useState<NetworthHistoricResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricData = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await getNetworthHistoric(accessToken, params);
      setHistoricData(data);
    } catch (err) {
      console.error('Error loading networth historic data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricData();
  }, [accessToken, params.start_date, params.end_date, params.page, params.per_page]);

  return {
    historicData,
    loading,
    error,
    refetch: fetchHistoricData,
  };
}