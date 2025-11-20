import config from '@/config/constants';

export interface DeleteGoalResponse {
  success: boolean;
  message?: string;
}

export async function deleteGoal(
  token: string,
  goalId: string | number
): Promise<DeleteGoalResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/goals/${goalId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Meta eliminada exitosamente',
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
    console.error('Error deleting goal:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al eliminar la meta',
    };
  }
}
