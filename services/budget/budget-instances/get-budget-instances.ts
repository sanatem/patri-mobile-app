import config from '@/config/constants';
import type { BudgetInstance, BudgetSummary } from '../budget-templates/types';

export interface GetBudgetInstancesParams {
  start_date?: string;
  end_date?: string;
  budget_template_id?: number;
  user_category_id?: number;
  limit?: number;
  page?: number;
  per_page?: number;
  template_active?: boolean;
}

export interface GetBudgetInstancesResponse {
  success: boolean;
  budget_instances: BudgetInstance[];
  summary?: BudgetSummary;
}

/**
 * Obtiene instancias de presupuesto con filtros opcionales
 * GET /api/v2/budget_instances
 *
 * @param params.start_date - Filtra desde fecha (YYYY-MM-DD)
 * @param params.end_date - Filtra hasta fecha (YYYY-MM-DD)
 * @param params.budget_template_id - Filtra por template específico
 * @param params.user_category_id - Filtra por categoría específica
 * @param params.limit - Límite de resultados (default: 50)
 */
export async function getBudgetInstances(
  params: GetBudgetInstancesParams,
  token: string
): Promise<GetBudgetInstancesResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const urlParams = new URLSearchParams();

    if (params.start_date) {
      urlParams.append('start_date', params.start_date);
    }
    if (params.end_date) {
      urlParams.append('end_date', params.end_date);
    }
    if (params.budget_template_id !== undefined) {
      urlParams.append('budget_template_id', params.budget_template_id.toString());
    }
    if (params.user_category_id !== undefined) {
      urlParams.append('user_category_id', params.user_category_id.toString());
    }
    if (params.limit !== undefined) {
      urlParams.append('limit', params.limit.toString());
    }
    if (params.page !== undefined) {
      urlParams.append('page', params.page.toString());
    }
    if (params.per_page !== undefined) {
      urlParams.append('per_page', params.per_page.toString());
    }
    if (params.template_active !== undefined) {
      urlParams.append('template_active', params.template_active.toString());
    }

    const queryString = urlParams.toString();
    const url = `${config.apiBaseUrl}/api/v2/budget_instances${queryString ? `?${queryString}` : ''}`;

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
        return { success: true, budget_instances: [] };
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: GetBudgetInstancesResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Budget Instances Service: Error fetching budget instances:', error);
    throw error;
  }
}
