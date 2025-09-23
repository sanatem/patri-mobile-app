import config from '@/config/constants';

interface SetDefaultBankAccountResponse {
  success: boolean;
  message?: string;
  account?: any;
}

export const setDefaultBankAccount = async (
  accountId: number,
  accessToken: string
): Promise<SetDefaultBankAccountResponse> => {
  try {
    const response = await fetch(
      `${config.apiBaseUrl}/api/v2/bank_accounts/${accountId}/update_default`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bank_account: {
            is_default: true
          }
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        if (response.status === 404) {
          errorMessage = 'Endpoint no encontrado. Verifica la URL del API.';
        } else if (response.status >= 500) {
          errorMessage = 'Error interno del servidor.';
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }

    let data;
    try {
      data = await response.json();
    } catch { 
      data = {};
    }

    return {
      success: true,
      account: data,
    };
  } catch (error: any) {
    console.error('Error setting default bank account:', error);
    return {
      success: false,
      message: 'Error de conexión al actualizar la cuenta',
    };
  }
};