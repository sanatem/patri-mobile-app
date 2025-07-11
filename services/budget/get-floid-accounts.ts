
import config from '@/config/constants';

export interface FloidAccount {
  id: number;
  account: string;
  bank: string;
  country: string;
  floid_id: string;
  status: string;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
  transaction_count: number;
  is_active: boolean;
}

export interface FloidAccountsResponse {
  floid_accounts: FloidAccount[];
  total_count: number;
  user_id: number;
}

export async function getFloidAccounts(token: string): Promise<FloidAccountsResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/floid`;

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

    const data: FloidAccountsResponse = await response.json();
    
    return data;

  } catch (error) {
    console.error('❌ Floid Accounts Service: Error fetching accounts from API:', error);
    throw error;
  }
}