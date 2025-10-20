import { useState, useEffect } from 'react';
import { getSubscription, SubscriptionResponse } from '@/services/planning/subscription/get-subscription';
import { useAuth } from '@/providers/AuthProvider';

interface UseSubscriptionReturn {
  subscriptionData: SubscriptionResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { accessToken } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getSubscription(accessToken);
      setSubscriptionData(data);
    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [accessToken]);

  return {
    subscriptionData,
    loading,
    error,
    refetch: fetchSubscriptionData,
  };
}
