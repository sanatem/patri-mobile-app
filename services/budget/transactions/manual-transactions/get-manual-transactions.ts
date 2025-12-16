import config from '@/config/constants';
import type { ManualTransactionsListResponse, ManualTransaction } from './types';

export interface GetManualTransactionsParams {
  page?: number;
  per_page?: number;
  start_date?: string;
  end_date?: string;
  bank_account_id?: number;
  transaction_type?: 'income' | 'expense';
}

export async function getManualTransactions(
  params: GetManualTransactionsParams,
  token: string
): Promise<ManualTransactionsListResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.bank_account_id) queryParams.append('bank_account_id', params.bank_account_id.toString());
    if (params.transaction_type) queryParams.append('transaction_type', params.transaction_type);

    const url = `${config.apiBaseUrl}/api/v2/manual_transactions?${queryParams.toString()}`;

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

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();

    // Handle different response formats
    const transactions: ManualTransaction[] = responseData.data || responseData.manual_transactions || [];

    return {
      success: true,
      data: transactions,
      meta: responseData.meta,
    };

  } catch (error) {
    console.error('Get Manual Transactions Service: Error fetching transactions:', error);
    throw error;
  }
}
