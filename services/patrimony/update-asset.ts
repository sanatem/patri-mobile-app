import config from '@/config/constants';

export interface UpdateAssetRequest {
  asset: {
    name?: string;
    asset_category_id?: number;
    commercial_value?: string;
    unit?: string;
    kind?: string;
    comments?: string;
    location?: string;
    square_mts?: number;
    apartment_number?: string;
    number_of_bedrooms?: number;
    number_of_bathrooms?: number;
    total_amount?: number;
    annual_return_rate?: number;
    crowdfunding_institution_id?: number;
    crowdfunding_credit_id?: string;
    period_return_rate?: number;
    due_date?: string;
    fund_kind?: string;
    fund_id?: string;
    fund_series_id?: string;
    mutual_fund_manager_id?: number;
    broker_id?: number;
    bank_id?: number;
    deposit_kind?: string;
    start_date?: string;
    end_date?: string;
    afp_institution_id?: number;
    apv_institution_id?: number;
    tax_regime?: string;
    funds?: Record<string, any>;
    [key: string]: any;
  };
}

export interface UpdateAssetResponse {
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

export const updateAsset = async (id: number, data: UpdateAssetRequest, token: string, assetType?: string): Promise<UpdateAssetResponse> => {
  try {
    let url = `${config.apiBaseUrl}/api/v2/networth/assets/${id}`;

    if (assetType) {
      url += `?asset_type=${assetType}`;
    }

    const response = await fetch(url, {
      method: 'PATCH',
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
    console.error('Error updating asset:', error);

    return {
      success: false,
      error: error.message || 'Error al actualizar el activo'
    };
  }
};