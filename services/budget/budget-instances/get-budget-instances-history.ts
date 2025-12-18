import config from '@/config/constants';
import type { BudgetInstancesHistoryResponse, GetBudgetHistoryParams } from '../budget-templates/types';

/**
 * Obtiene el historial de un presupuesto específico
 * GET /api/v2/budget_instances?user_category_id={id}
 */
export async function getBudgetInstancesHistory(
  params: GetBudgetHistoryParams,
  token: string
): Promise<BudgetInstancesHistoryResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const urlParams = new URLSearchParams();
    urlParams.append('user_category_id', params.user_category_id.toString());

    const url = `${config.apiBaseUrl}/api/v2/budget_instances?${urlParams.toString()}`;

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
        return { success: true, data: [] };
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: BudgetInstancesHistoryResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Budget Instances Service: Error fetching budget history:', error);
    throw error;
  }
}
