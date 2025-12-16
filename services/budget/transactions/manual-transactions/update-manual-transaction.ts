import config from '@/config/constants';
import type { UpdateManualTransactionParams, ManualTransactionResponse } from './types';

export async function updateManualTransaction(
  transactionId: number,
  params: UpdateManualTransactionParams,
  token: string
): Promise<ManualTransactionResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/manual_transactions/${transactionId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
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

    const data = await response.json();
    return {
      success: true,
      data,
    };

  } catch (error) {
    console.error('Update Manual Transaction Service: Error updating transaction:', error);
    throw error;
  }
}
