
import config from '@/config/constants';

export interface DeleteFloidTransactionParams {
  transactionId: string;
}

export interface DeleteFloidTransactionResponse {
  success: boolean;
  message?: string;
}

export async function deleteFloidTransaction(
  params: DeleteFloidTransactionParams,
  token: string
): Promise<DeleteFloidTransactionResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const { transactionId } = params;
    const url = `${config.apiBaseUrl}/api/v2/floid/transactions/${transactionId}`;

    const response = await fetch(url, {
      method: 'DELETE',
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

    if (response.status === 204) {
      return { success: true };
    }

    const data: DeleteFloidTransactionResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Floid Transaction Service: Error deleting transaction from API:', error);
    throw error;
  }
}
