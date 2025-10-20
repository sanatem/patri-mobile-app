import config from '@/config/constants';

export interface Payment {
  amount: number;
  approved_at: string;
  state: 'approved' | 'pending' | 'rejected' | 'authorized' | 'cancelled' | 'refund';
}

export interface SubscriptionData {
  plan_name: string;
  total_amount: number;
  annual_payment: boolean;
  end_date: string | null;
  payments: Payment[];
}

export interface SubscriptionResponse {
  success: boolean;
  data: SubscriptionData;
}

interface APISubscriptionResponse {
  success: boolean;
  data: {
    plan: {
      name: string;
      recurring: boolean;
    };
    subscription: {
      state: string;
      total_amount: number;
      annual_payment: boolean;
    };
    dates: {
      start_date: string;
      end_date: string | null;
      next_payment_on: string | null;
      proceed_with_cancellation_on: string | null;
    };
    payment: {
      amount: number;
      approved_at: string;
      state: 'approved' | 'pending' | 'rejected' | 'authorized' | 'cancelled' | 'refund';
    };
  };
}

export async function getSubscription(token: string): Promise<SubscriptionResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/subscription`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }

      if (response.status === 404) {
        return null;
      }

      if (response.status === 500) {
        throw new Error('Error interno del servidor');
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const apiData: APISubscriptionResponse = await response.json();

    const transformedData: SubscriptionResponse = {
      success: apiData.success,
      data: {
        plan_name: apiData.data.plan.name,
        total_amount: apiData.data.subscription.total_amount,
        annual_payment: apiData.data.subscription.annual_payment,
        end_date: apiData.data.dates.end_date,
        payments: apiData.data.payment ? [apiData.data.payment] : [],
      }
    };

    return transformedData;

  } catch (error) {
    console.error('Subscription Service: Error fetching subscription data from API:', error);
    throw error;
  }
}
