import config from '@/config/constants';

export interface DeleteAssetResponse {
  success: boolean;
  error?: string;
}

export const deleteAsset = async (id: number, token: string): Promise<DeleteAssetResponse> => {
  try {
    const url = `${config.apiBaseUrl}/api/v2/networth/assets/${id}`;

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
    console.error('Error deleting asset:', error);

    return {
      success: false,
      error: error.message || 'Error al eliminar el activo'
    };
  }
};