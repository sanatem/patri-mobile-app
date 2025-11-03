import config from '@/config/constants';

export interface CreateFloidTransactionParams {
  floid_account_id: number;
  amount_in?: number;
  amount_out?: number;
  branch?: string;
  description?: string;
  doc_number?: string;
  date?: string;
  user_category_id?: number | null;
  auto_category?: boolean;
}

export interface CreateFloidTransactionResponse {
  id: number;
  transaction_id: string;
  date: string;
  balance: number;
  transaction_type: 'income' | 'outcome';
  amount: number;
  description: string;
  bank: string;
  account_number: string;
}

export async function createFloidTransaction(
  params: CreateFloidTransactionParams,
  token: string
): Promise<CreateFloidTransactionResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/floid/transactions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transaction: params }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: CreateFloidTransactionResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Create Floid Transaction Service: Error creating transaction:', error);
    throw error;
  }
}
