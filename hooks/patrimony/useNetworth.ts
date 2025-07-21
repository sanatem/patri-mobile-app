
import { useState, useEffect } from 'react';
import { getNetworth, NetworthResponse } from '@/services/patrimony/get-networth';
import { useAuth } from '@/providers/AuthProvider';

interface UseNetworthReturn {
  networthData: NetworthResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNetworth(): UseNetworthReturn {
  const { accessToken } = useAuth();
  const [networthData, setNetworthData] = useState<NetworthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworth = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await getNetworth(accessToken);
      console.log('🔍 Hook received data:', data);
      setNetworthData(data);
    } catch (err) {
      console.error('Error loading networth data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworth();
  }, [accessToken]);

  return {
    networthData,
    loading,
    error,
    refetch: fetchNetworth,
  };
}