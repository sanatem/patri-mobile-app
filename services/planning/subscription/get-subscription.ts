import config from '@/config/constants';

export interface Payment {
  id: number;
  amount: number;
  state: 'approved' | 'pending' | 'rejected' | 'authorized' | 'cancelled' | 'refund';
  created_at: string;
}

export interface SubscriptionData {
  plan_name: string;
  total_amount: number;
  annual_payment: boolean;
  end_date: string | null;
  proceed_with_cancellation_on: string | null;
  next_payment_on: string | null;
  payments: Payment[];
}

export interface SubscriptionResponse {
  success: boolean;
  data: SubscriptionData;
}

export interface PaymentsPaginationMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

export interface SubscriptionPaymentsData {
  payments: Payment[];
  meta: PaymentsPaginationMeta;
}

export interface SubscriptionPaymentsResponse {
  success: boolean;
  data: SubscriptionPaymentsData;
}

export interface GetPaymentsParams {
  page?: number;
  per_page?: number;
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
      id: number;
      amount: number;
      state: 'approved' | 'pending' | 'rejected' | 'authorized' | 'cancelled' | 'refund';
      created_at: string;
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
        proceed_with_cancellation_on: apiData.data.dates.proceed_with_cancellation_on,
        next_payment_on: apiData.data.dates.next_payment_on,
        payments: apiData.data.payment ? [apiData.data.payment] : [],
      }
    };

    return transformedData;

  } catch (error) {
    console.error('Subscription Service: Error fetching subscription data from API:', error);
    throw error;
  }
}

interface APIPaymentsResponse {
  success: boolean;
  data: Payment[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export async function getSubscriptionPayments(
  token: string,
  params?: GetPaymentsParams
): Promise<SubscriptionPaymentsResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const queryParams = new URLSearchParams();
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }

    const url = `${config.apiBaseUrl}/api/v2/subscription/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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
        // Retornar estructura vacía en lugar de null para evitar errores
        return {
          success: true,
          data: {
            payments: [],
            meta: {
              current_page: 1,
              total_pages: 1,
              total_count: 0,
              per_page: params?.per_page || 3,
            }
          }
        };
      }

      if (response.status === 500) {
        throw new Error('Error interno del servidor');
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const apiData: APIPaymentsResponse = await response.json();

    return {
      success: apiData.success,
      data: {
        payments: apiData.data,
        meta: {
          current_page: apiData.pagination.current_page,
          total_pages: apiData.pagination.total_pages,
          total_count: apiData.pagination.total_count,
          per_page: apiData.pagination.per_page,
        },
      }
    };

  } catch (error) {
    console.error('Subscription Payments Service: Error fetching payments data from API:', error);
    // No lanzar error, retornar estructura vacía
    return {
      success: false,
      data: {
        payments: [],
        meta: {
          current_page: 1,
          total_pages: 1,
          total_count: 0,
          per_page: params?.per_page || 3,
        }
      }
    };
  }
}
