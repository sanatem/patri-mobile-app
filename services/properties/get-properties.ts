import config from '@/config/constants';
import type { ApiPropertiesResponse } from '@/types/api';

interface GetPropertiesParams {
  page?: number;
  per_page?: number;
  property_type?: 'main_home' | 'investment';
  kind?: 'own' | 'rent';
}

export async function getProperties(token: string, params: GetPropertiesParams = {}): Promise<ApiPropertiesResponse | null> {
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
    
    if (params.property_type) {
      queryParams.append('property_type', params.property_type);
    }
    
    if (params.kind) {
      queryParams.append('kind', params.kind);
    }

    const url = `${config.apiBaseUrl}/api/v2/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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

    const data: ApiPropertiesResponse = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Properties Service: Error fetching properties from API:', error);
    throw error;
  }
}