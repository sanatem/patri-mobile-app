import config from '@/config/constants';
import type { ApiSavingInstrumentsFundsResponse } from '@/types/api';

export interface GetSavingInstrumentsFundsParams {
  page?: number;
  per_page?: number;
  kind?: 'investment' | 'mutual';
  search?: string;
  id?: number;
}

export async function getSavingInstrumentsFunds(
  token: string, 
  params: GetSavingInstrumentsFundsParams = {}
): Promise<ApiSavingInstrumentsFundsResponse | null> {
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

    if (params.kind) {
      queryParams.append('kind', params.kind);
    }

    if (params.search) {
      queryParams.append('search', params.search);
    }

    if (params.id) {
      queryParams.append('id', params.id.toString());
    }

    if (!config.apiBaseUrl) {
      console.error('❌ API base URL not configured');
      throw new Error('URL base de la API no configurada');
    }

    const url = `${config.apiBaseUrl}/api/v2/saving_instruments/funds${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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

    const data: ApiSavingInstrumentsFundsResponse = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Saving Instruments Funds Service: Error fetching funds from API:', error);
    throw error;
  }
}
