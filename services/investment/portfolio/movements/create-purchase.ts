import config from '@/config/constants';

export interface CreatePurchaseRequest {
  type: 'deposit_intention' | 'opening';
  user_id: number;
  goal_id: number;
  investment_account_id: number;
  broker_portfolio_id: number;
  amount: number;
  source?: string;
}

export interface CreatePurchaseResponse {
  movement: {
    id: number;
    type: string;
    original_amount: number;
    current_amount: number;
    investment_amount: number;
    aasm_state: string;
    created_at: string;
    updated_at: string;
    source_destination: string;
    payment_method: string;
    broker_portfolio_name: string;
    user_id: number;
    goal_id: number;
    goal_wallet_id: number;
    orphan: boolean;
  };
  fintoc_widget?: {
    widget_token: string;
    fintoc_event_id: string;
    fintoc_public_key: string;
    webhook_url: string;
    delete_url: string;
    country: string;
    product: string;
    holder_type: string;
  };
}

export interface CreatePurchaseApiResponse {
  success: boolean;
  data: CreatePurchaseResponse;
  message?: string;
}

export const createPurchaseService = {
  async createPurchase(
    purchaseData: CreatePurchaseRequest,
    token: string
  ): Promise<CreatePurchaseResponse> {
    try {
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      const url = `${config.apiBaseUrl}/api/v2/movements/create_purchase`;

      const requestBody: CreatePurchaseRequest = {
        ...purchaseData,
        source: purchaseData.source || 'cash',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create Purchase Service: Error en respuesta:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Token de autenticación inválido o expirado');
        }
        
        if (response.status === 422) {
          throw new Error('Datos de compra inválidos');
        }
        
        if (response.status === 404) {
          throw new Error('Meta o cuenta de inversión no encontrada');
        }
        
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data: CreatePurchaseResponse = await response.json();
      
      return data;

    } catch (error) {
      console.error('Create Purchase Service: Error creating purchase:', error);
      throw error;
    }
  },

  async validatePurchaseData(
    purchaseData: Partial<CreatePurchaseRequest>
  ): Promise<string[]> {
    const errors: string[] = [];

    if (!purchaseData.type) {
      errors.push('El tipo de compra es requerido');
    } else if (!['deposit_intention', 'opening'].includes(purchaseData.type)) {
      errors.push('El tipo de compra debe ser "deposit_intention" o "opening"');
    }

    if (!purchaseData.user_id || purchaseData.user_id <= 0) {
      errors.push('ID de usuario es requerido y debe ser válido');
    }

    if (!purchaseData.goal_id || purchaseData.goal_id <= 0) {
      errors.push('ID de meta es requerido y debe ser válido');
    }

    if (!purchaseData.investment_account_id || purchaseData.investment_account_id <= 0) {
      errors.push('ID de cuenta de inversión es requerido y debe ser válido');
    }

    if (!purchaseData.broker_portfolio_id || purchaseData.broker_portfolio_id <= 0) {
      errors.push('ID de portafolio del broker es requerido y debe ser válido');
    }

    if (!purchaseData.amount || purchaseData.amount <= 0) {
      errors.push('El monto debe ser mayor a 0');
    } else if (purchaseData.amount < 1000) {
      errors.push('El monto mínimo es $1.000');
    }

    return errors;
  }
};
