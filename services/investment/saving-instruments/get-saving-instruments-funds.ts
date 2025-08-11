import config from '@/config/constants';
import type { ApiSavingInstrumentsFundsResponse } from '@/types/api';

export interface GetSavingInstrumentsFundsParams {
  page?: number;
  per_page?: number;
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

    // Verificar si la URL base está configurada
    if (!config.apiBaseUrl) {
      console.error('❌ API base URL not configured');
      throw new Error('URL base de la API no configurada');
    }

    const url = `${config.apiBaseUrl}/api/v2/saving_instruments/funds${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log('🌐 Fetching funds from URL:', url);
    console.log('🔧 API Base URL:', config.apiBaseUrl);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status, response.statusText);

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
    console.log('📊 Service response data:', data);
    return data;

  } catch (error) {
    console.error('❌ Saving Instruments Funds Service: Error fetching funds from API:', error);
    throw error;
  }
}
