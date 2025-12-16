import config from '@/config/constants';
import type { ManualTransactionResponse } from './types';

export async function getManualTransaction(
  transactionId: number,
  token: string
): Promise<ManualTransactionResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/manual_transactions/${transactionId}`;

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
        throw new Error('Transacción no encontrada');
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    return {
      success: true,
      data: responseData.manual_transaction || responseData.data || responseData,
    };

  } catch (error) {
    console.error('Get Manual Transaction Service: Error fetching transaction:', error);
    throw error;
  }
}
