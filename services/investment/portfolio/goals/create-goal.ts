import config from '@/config/constants';

export interface CreateGoalParams {
  name: string;
  kind: string;
  target_amount: number;
  target_date: string;
  investment_account_id: number;
}

export interface CreateGoalResponse {
  success: boolean;
  message?: string;
  goal?: {
    id: number;
    name: string;
    kind: string;
    kind_name: string;
    target_amount: number;
    target_date: string;
    unit: string;
    created_at: string;
    goal_wallet: number;
    investment_account_id: number;
  };
}

export async function createGoal(
  token: string,
  goalData: CreateGoalParams
): Promise<CreateGoalResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/goals`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal: goalData }),
    });

    if (response.ok) {
      const data = await response.json();

      return {
        success: true,
        goal: data.data?.goal || data.goal,
      };
    }

    if (response.status === 401) {
      throw new Error('Token de autenticación inválido o expirado');
    }

    const errorData = await response.json().catch(() => ({}));

    const errorMessage = errorData.message
      || errorData.error
      || (errorData.errors ? JSON.stringify(errorData.errors) : null)
      || `HTTP ${response.status}: ${response.statusText}`;

    throw new Error(errorMessage);

  } catch (error) {
    console.error('Error creating goal:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al crear la meta',
    };
  }
}
