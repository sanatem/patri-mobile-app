import config from '@/config/constants';
import type { CreateManualTransactionParams, ManualTransactionResponse } from './types';

export async function createManualTransaction(
  params: CreateManualTransactionParams,
  token: string
): Promise<ManualTransactionResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/manual_transactions`;

    const response = await fetch(url, {
      method: 'POST',
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

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };

  } catch (error) {
    console.error('Create Manual Transaction Service: Error creating transaction:', error);
    throw error;
  }
}
