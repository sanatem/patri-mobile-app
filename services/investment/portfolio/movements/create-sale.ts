import config from '@/config/constants';

export interface CreateSaleRequest {
  type: 'retirement' | 'closing';
  user_id: number;
  goal_id: number;
  investment_account_id: number;
  amount: number;
  destination?: string;
}

export interface SaleMovement {
  id: number;
  type: string;
  original_amount: number;
  current_amount: number;
  investment_amount: number;
  aasm_state: 'created' | 'confirmed' | 'settled' | 'finished';
  created_at: string;
  updated_at: string;
  source_destination: string;
  payment_method: string;
  broker_portfolio_name: string;
  user_id: number;
  goal_id: number;
  goal_wallet_id: number;
  orphan: boolean;
}

export interface CreateSaleResponse {
  movements: SaleMovement[];
  goal: {
    id: number;
    name: string;
  };
}

export interface CreateSaleApiResponse {
  success: boolean;
  data: CreateSaleResponse;
  message?: string;
}

export const createSaleService = {
  async createSale(
    saleData: any,
    token: string
  ): Promise<CreateSaleResponse> {
    try {
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      const url = `${config.apiBaseUrl}/api/v2/movements/create_sale`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create Sale Service: Error en respuesta:', response.status, errorText);

        if (response.status === 401) {
          throw new Error('Token de autenticación inválido o expirado');
        }

        if (response.status === 422) {
          throw new Error('Datos de venta inválidos');
        }

        if (response.status === 404) {
          throw new Error('Meta o cuenta de inversión no encontrada');
        }

        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data: CreateSaleResponse = await response.json();

      return data;

    } catch (error) {
      console.error('Create Sale Service: Error creating sale:', error);
      throw error;
    }
  },

  async validateSaleData(
    saleData: Partial<CreateSaleRequest>
  ): Promise<string[]> {
    const errors: string[] = [];

    if (!saleData.type) {
      errors.push('El tipo de venta es requerido');
    } else if (!['retirement', 'closing'].includes(saleData.type)) {
      errors.push('El tipo de venta debe ser "retirement" o "closing"');
    }

    if (!saleData.user_id || saleData.user_id <= 0) {
      errors.push('ID de usuario es requerido y debe ser válido');
    }

    if (!saleData.goal_id || saleData.goal_id <= 0) {
      errors.push('ID de meta es requerido y debe ser válido');
    }

    if (!saleData.investment_account_id || saleData.investment_account_id <= 0) {
      errors.push('ID de cuenta de inversión es requerido y debe ser válido');
    }

    if (!saleData.amount || saleData.amount <= 0) {
      errors.push('El monto debe ser mayor a 0');
    } else if (saleData.amount < 1000) {
      errors.push('El monto mínimo es $1.000');
    }

    return errors;
  }
};