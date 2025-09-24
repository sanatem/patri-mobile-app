import config from '@/config/constants';

export interface DeleteDebtResponse {
  success: boolean;
  error?: string;
}

export const deleteDebt = async (id: number, token: string): Promise<DeleteDebtResponse> => {
  try {
    const url = `${config.apiBaseUrl}/api/v2/networth/debts/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = '';

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || 'Error desconocido del servidor';
      } catch (parseError) {
        const errorText = await response.text();
        errorMessage = `Error ${response.status}: ${errorText}`;
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error deleting debt:', error);

    return {
      success: false,
      error: error.message || 'Error al eliminar el pasivo'
    };
  }
};