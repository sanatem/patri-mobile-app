import config from '@/config/constants';

export interface CreateAssetRequest {
  asset: {
    name: string;
    asset_category_id: number;
    commercial_value: string;
    unit: string;
    kind: string;
    comments?: string;
  };
}

export interface CreateAssetResponse {
  success: boolean;
  data?: {
    id: number;
    name: string;
    asset_category_id: number;
    commercial_value: number;
    unit: string;
    kind: string;
    comments?: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export const createAsset = async (data: CreateAssetRequest, token: string): Promise<CreateAssetResponse> => {
  try {
    const url = `${config.apiBaseUrl}/api/v2/networth/create_asset`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
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

    const responseData = await response.json();
    
    return {
      success: true,
      data: responseData
    };
  } catch (error: any) {
    console.error('Error creating asset:', error);
    
    return {
      success: false,
      error: error.message || 'Error al crear el activo'
    };
  }
}; 