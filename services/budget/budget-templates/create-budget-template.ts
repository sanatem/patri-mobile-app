import config from '@/config/constants';
import type { CreateBudgetTemplateParams, BudgetTemplateResponse } from './types';

/**
 * Crea un nuevo presupuesto (budget template)
 * POST /api/v2/budget_templates
 */
export async function createBudgetTemplate(
  params: CreateBudgetTemplateParams,
  token: string
): Promise<BudgetTemplateResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/budget_templates`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }

      if (response.status === 422) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Datos de presupuesto inválidos');
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: BudgetTemplateResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Budget Templates Service: Error creating budget template:', error);
    throw error;
  }
}
