import config from '@/config/constants';

export interface CreateBankAccountRequest {
  bank_account: {
    bank_id: number;
    account_number: string;
    kind: string;
  };
}

export interface CreateBankAccountResponse {
  success: boolean;
  account?: {
    id: number;
    bank_id: number;
    bank_name: string;
    account_number: string;
    kind: string;
    kind_name: string;
    is_default: boolean;
  };
  message?: string;
}

export async function createBankAccount(
  bankAccountData: CreateBankAccountRequest,
  token: string
): Promise<CreateBankAccountResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/bank_accounts`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bankAccountData),
    });

    if (response.ok) {
      const data = await response.json();

      return {
        success: true,
        account: data.account,
      };
    }

    if (response.status === 401) {
      throw new Error('Token de autenticación inválido o expirado');
    }

    if (response.status === 422) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Datos de cuenta bancaria inválidos');
    }

    if (response.status === 409) {
      throw new Error('Esta cuenta bancaria ya está registrada');
    }

    const errorText = await response.text();
    throw new Error(`Error HTTP ${response.status}: ${errorText}`);

  } catch (error) {
    console.error('Error creating bank account:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido al crear la cuenta bancaria',
    };
  }
}