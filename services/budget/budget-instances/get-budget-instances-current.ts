import config from '@/config/constants';
import type { BudgetInstancesCurrentResponse } from '../budget-templates/types';

/**
 * Obtiene los presupuestos del período actual con sus cálculos
 * GET /api/v2/budget_instances/current
 */
export async function getBudgetInstancesCurrent(
  token: string
): Promise<BudgetInstancesCurrentResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/budget_instances/current`;

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

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: BudgetInstancesCurrentResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Budget Instances Service: Error fetching current budget instances:', error);
    throw error;
  }
}
