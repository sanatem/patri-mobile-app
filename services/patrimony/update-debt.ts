import config from '@/config/constants';

export interface UpdateDebtRequest {
  debt: {
    name: string;
    debt_category_id: number;
    amount: string;
    unit: string;
    installments_quantity: number;
    installment_amount: string;
    comments?: string;
    property_id?: number;
    property_attributes?: {
      commercial_value: string;
      unit: string;
      location: string;
      square_mts: number;
    };
  };
}

export interface UpdateDebtResponse {
  success: boolean;
  data?: {
    id: number;
    name: string;
    debt_category_id: number;
    amount: number;
    unit: string;
    installments_quantity: number;
    installment_amount: number;
    comments?: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export const updateDebt = async (id: number, data: UpdateDebtRequest, token: string): Promise<UpdateDebtResponse> => {
  try {
    const url = `${config.apiBaseUrl}/api/v2/networth/debts/${id}`;

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
    console.error('Error updating debt:', error);

    return {
      success: false,
      error: error.message || 'Error al actualizar el pasivo'
    };
  }
};