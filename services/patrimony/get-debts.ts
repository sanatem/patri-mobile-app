import config from '@/config/constants';
import type { ApiDebtsResponse } from '@/types/api';

interface GetDebtsParams {
  page?: number;
  per_page?: number;
  debt_category?: string;
}

export async function getDebts(token: string, params: GetDebtsParams = {}): Promise<ApiDebtsResponse | null> {
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
    
    if (params.debt_category) {
      queryParams.append('debt_category', params.debt_category);
    }

    const url = `${config.apiBaseUrl}/api/v2/networth/debts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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

    const data: ApiDebtsResponse = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Debts Service: Error fetching debts from API:', error);
    throw error;
  }
} 