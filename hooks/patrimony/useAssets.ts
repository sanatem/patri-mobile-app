import { useState, useEffect } from 'react';
import { getAssets } from '@/services/patrimony/get-assets';
import { useAuth } from '@/providers/AuthProvider';
import type { ApiAssetsResponse } from '@/types/api';

interface UseAssetsParams {
  page?: number;
  per_page?: number;
  category?: string;
}

interface UseAssetsReturn {
  assets: ApiAssetsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAssets(params: UseAssetsParams = {}, enabled: boolean = true): UseAssetsReturn {
  const { accessToken } = useAuth();
  const [assets, setAssets] = useState<ApiAssetsResponse | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async () => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (!accessToken) {
        throw new Error('No hay token de autenticación disponible');
      }
      
      const assetsData = await getAssets(accessToken, params);
      setAssets(assetsData);
    } catch (err) {
      console.error('Error loading assets:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && enabled) {
      fetchAssets();
    } else if (!enabled) {
      setLoading(false);
      setError(null);
    }
  }, [accessToken, enabled, params.page, params.per_page, params.category]);

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
  };
} 