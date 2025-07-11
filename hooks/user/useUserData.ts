
import { useState, useEffect } from 'react';
import { getUserData, UserResponse } from '@/services/user/get-user';
import { useAuth } from '@/providers/AuthProvider';

interface UseUserDataReturn {
  userData: UserResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserData(): UseUserDataReturn {
  const { accessToken } = useAuth();
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await getUserData(accessToken);
      setUserData(data);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [accessToken]);

  return {
    userData,
    loading,
    error,
    refetch: fetchUserData,
  };
}