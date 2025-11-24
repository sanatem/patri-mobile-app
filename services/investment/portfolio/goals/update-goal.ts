import config from '@/config/constants';

export interface UpdateGoalParams {
  name?: string;
  kind?: string;
  target_amount?: number;
  target_date?: string;
}

export interface UpdateGoalResponse {
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

export async function updateGoal(
  token: string,
  goalId: string | number,
  goalData: UpdateGoalParams
): Promise<UpdateGoalResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/goals/${goalId}`;

    const response = await fetch(url, {
      method: 'PUT',
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

    if (response.status === 404) {
      throw new Error('Meta no encontrada');
    }

    const errorData = await response.json().catch(() => ({}));

    const errorMessage = errorData.message
      || errorData.error
      || (errorData.errors ? JSON.stringify(errorData.errors) : null)
      || `HTTP ${response.status}: ${response.statusText}`;

    throw new Error(errorMessage);

  } catch (error) {
    console.error('Error updating goal:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al actualizar la meta',
    };
  }
}
