import config from '@/config/constants';

export interface AssetsBreakdown {
  fixed_assets: number;
  saving_instruments: number;
  investment_properties: number;
  main_homes: number;
}

export interface DebtsBreakdown {
  total_debts: number;
}

export interface Networth {
  patrimony_value: number;
  total_assets: number;
  total_debts: number;
  assets_breakdown: AssetsBreakdown;
  debts_breakdown: DebtsBreakdown;
  has_complete_data: boolean;
}

export interface NetworthResponse {
  networth: Networth;
}

export async function getNetworth(token: string): Promise<NetworthResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/networth`;

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
        throw new Error('Usuario no encontrado');
      }
      
      if (response.status === 500) {
        throw new Error('Error interno del servidor');
      }
      
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: NetworthResponse = await response.json();
    return data;

  } catch (error) { 
    throw error;
  }
}