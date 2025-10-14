import config from '@/config/constants';

export interface DeleteBankAccountResponse {
  success: boolean;
  message?: string;
}

export async function deleteBankAccount(
  accountId: number,
  token: string
): Promise<DeleteBankAccountResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/bank_accounts/${accountId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return {
        success: true,
      };
    }

    if (response.status === 401) {
      throw new Error('Token de autenticación inválido o expirado');
    }

    if (response.status === 404) {
      throw new Error('Cuenta bancaria no encontrada');
    }

    if (response.status === 422) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'No se puede eliminar esta cuenta bancaria');
    }

    const errorText = await response.text();
    throw new Error(`Error HTTP ${response.status}: ${errorText}`);

  } catch (error) {
    console.error('Error deleting bank account:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido al eliminar la cuenta bancaria',
    };
  }
}