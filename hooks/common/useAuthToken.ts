import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UseAuthTokenReturn {
  token: string | null;
  isTokenValid: boolean;
  isLoading: boolean;
  getToken: () => Promise<string | null>;
  clearToken: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getAuthHeaders: () => { Authorization?: string };
}

export const useAuthToken = (): UseAuthTokenReturn => {
  const { accessToken, isAuthenticated, user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setToken(accessToken);
    setIsLoading(false);
  }, [accessToken]);

  const getToken = async (): Promise<string | null> => {
    try {
      if (token) {
        return token;
      }
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        return storedToken;
      }

      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const clearToken = async (): Promise<void> => {
    try {
      setToken(null);
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('backend_user_data');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem('auth_token');
      setToken(storedToken);
    } catch (error) {
      console.error('Error refreshing token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const isTokenValid = Boolean(token && isAuthenticated && user);

  return {
    token,
    isTokenValid,
    isLoading,
    getToken,
    clearToken,
    refreshToken,
    getAuthHeaders,
  };
}; 