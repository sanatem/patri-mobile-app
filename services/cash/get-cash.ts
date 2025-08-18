// services/patrimony/get-cash.ts
import config from '@/config/constants';

export interface Cash {
  total_amount: number | string;
  user_cash: number | string;
  available_amount: number | string;
  valued_balance: number | string;
  pending_rebalancing_amount: number | string;
  pending_deposits_amount: number | string;
  pending_purchase_orders_amount: number | string;
  pending_retirements_amount: number | string;
  pending_sale_orders_amount: number | string;
  user_cash_without_pending_movements: number | string;
  last_cash_update: string;
}

export interface CashResponse {
  cash: Cash;
}

export async function getCash(token: string): Promise<CashResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/cash`;

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
        throw new Error('Usuario no tiene cuenta de inversión');
      }
      
      if (response.status === 500) {
        throw new Error('Error interno del servidor');
      }
      
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: CashResponse = await response.json();
    
    return data;

  } catch (error) {
    console.error('❌ Cash Service: Error fetching cash data from API:', error);
    throw error;
  }
}