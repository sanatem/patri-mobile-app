// services/budget/assign-transaction-category.ts
import config from '@/config/constants';

export interface AssignTransactionCategoryData {
  transaction_ids: number[];
  transaction_category_id: number;
  auto_category?: boolean;
}

export interface AssignTransactionCategoryParams {
  transaction_ids: number[];
  transaction_category_id: number;
  auto_category?: boolean;
}

export interface AssignedTransaction {
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
  transaction_category_id?: number;
}

export interface AssignTransactionCategoryResponse {
  success: boolean;
  message: string;
  updated_transactions?: AssignedTransaction[];
}

export async function assignTransactionCategory(
  params: AssignTransactionCategoryParams,
  token: string
): Promise<AssignTransactionCategoryResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const { transaction_ids, transaction_category_id, auto_category = false } = params;
    const url = `${config.apiBaseUrl}/api/v2/floid/transactions/assign_category`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_ids,
        transaction_category_id,
        auto_category
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }

      if (response.status === 404) {
        throw new Error('Transacciones no encontradas');
      }

      if (response.status === 422) {
        const errorData = await response.json();
        throw new Error(`Error de validación: ${JSON.stringify(errorData)}`);
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: AssignTransactionCategoryResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Floid Transaction Service: Error assigning category to transactions:', error);
    throw error;
  }
}
