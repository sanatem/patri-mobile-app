import config from '@/config/constants';

export interface CreateDebtRequest {
  debt: {
    name: string;
    debt_category_id: number;
    amount: number;
    unit: string;
    installments_quantity: number;
    installment_amount: number;
    comments?: string;
  };
}

export interface CreateDebtResponse {
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

export const createDebt = async (data: CreateDebtRequest, token: string): Promise<CreateDebtResponse> => {
  try {
    const url = `${config.apiBaseUrl}/api/v2/networth/create_debt`;

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
    console.error('Error creating debt:', error);
    
    return {
      success: false,
      error: error.message || 'Error al crear el pasivo'
    };
  }
}; 