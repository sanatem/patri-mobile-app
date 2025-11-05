import config from '@/config/constants';
import type { ApiDebt } from '@/types/api';

export type DebtType = 'credit_card' | 'consumer_credit' | 'automotive_credit' | 'commercial_credit' | 'mortgage_credit' | 'mortgage' | 'credit_line' | 'family_loan' | 'other';

export interface DebtDetailResponse {
  debt: ApiDebt;
}

export async function getDebtDetail(token: string, id: number, debtType: DebtType): Promise<ApiDebt | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/networth/debts/${id}?debt_type=${encodeURIComponent(debtType)}`;

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

    const apiResponse: DebtDetailResponse = await response.json();
    return apiResponse.debt;

  } catch (error) {
    console.error('❌ Debt Detail Service: Error fetching debt detail from API:', error);
    throw error;
  }
}
