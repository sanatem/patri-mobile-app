import config from '@/config/constants';
import type { ApiAssetsResponse } from '@/types/api';

interface GetAssetsParams {
  page?: number;
  per_page?: number;
  category?: string;
}

export async function getAssets(token: string, params: GetAssetsParams = {}): Promise<ApiAssetsResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const queryParams = new URLSearchParams();
    
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }
    
    if (params.category) {
      queryParams.append('category', params.category);
    }

    const url = `${config.apiBaseUrl}/api/v2/networth/assets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }
      
      if (response.status === 404) {
        return null;
      }
      
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: ApiAssetsResponse = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Assets Service: Error fetching assets from API:', error);
    throw error;
  }
}