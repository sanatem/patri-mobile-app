import config from '@/config/constants';

export interface GetSavingInstrumentsResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

export async function getSavingInstruments(token: string): Promise<GetSavingInstrumentsResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/saving_instruments`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data?.error || data?.message || 'Error al listar instrumentos' };
    }
    return { success: true, data: data?.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error al listar instrumentos' };
  }
}


