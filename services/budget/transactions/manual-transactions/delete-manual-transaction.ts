import config from '@/config/constants';

export interface DeleteManualTransactionResponse {
  success: boolean;
  message?: string;
}

export async function deleteManualTransaction(
  transactionId: number,
  token: string
): Promise<DeleteManualTransactionResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/manual_transactions/${transactionId}`;

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

    return {
      success: true,
      message: 'Transacción eliminada correctamente',
    };

  } catch (error) {
    console.error('Delete Manual Transaction Service: Error deleting transaction:', error);
    throw error;
  }
}
