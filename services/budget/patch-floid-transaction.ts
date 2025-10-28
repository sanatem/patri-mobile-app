// services/budget/patch-floid-transaction.ts
import config from '@/config/constants';

export interface PatchFloidTransactionData {
  description?: string;
  processed?: boolean;
  amount_in?: number;
  amount_out?: number;
  balance?: number;
  date?: string;
  category?: string;
  subcategory?: string;
}

export interface PatchFloidTransactionParams {
  transactionId: string;
  transaction: PatchFloidTransactionData;
}

export interface PatchFloidTransactionResponse {
  id: number;
  transaction_id: string;
  date: string;
  balance: number;
  transaction_type: 'income' | 'outcome';
  amount: number;
  description: string;
  processed: boolean;
  bank: string;
  account_number: string;
  amount_in?: number;
  amount_out?: number;
}

export async function patchFloidTransaction(
  params: PatchFloidTransactionParams,
  token: string
): Promise<PatchFloidTransactionResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const { transactionId, transaction } = params;
    const url = `${config.apiBaseUrl}/api/v2/floid/transactions/${transactionId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transaction }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }

      if (response.status === 404) {
        throw new Error('Transacción no encontrada');
      }

      if (response.status === 422) {
        const errorData = await response.json();
        throw new Error(`Error de validación: ${JSON.stringify(errorData)}`);
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: PatchFloidTransactionResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Floid Transaction Service: Error updating transaction from API:', error);
    throw error;
  }
}
