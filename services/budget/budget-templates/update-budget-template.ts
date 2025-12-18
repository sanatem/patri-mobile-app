import config from '@/config/constants';
import type { UpdateBudgetTemplateParams, BudgetTemplateResponse } from './types';

/**
 * Actualiza el monto de un presupuesto
 * PATCH /api/v2/budget_templates/:id
 */
export async function updateBudgetTemplate(
  templateId: number,
  params: UpdateBudgetTemplateParams,
  token: string
): Promise<BudgetTemplateResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/budget_templates/${templateId}`;

    const response = await fetch(url, {
      method: 'PATCH',
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

      if (response.status === 404) {
        throw new Error('Presupuesto no encontrado');
      }

      if (response.status === 422) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Datos de actualización inválidos');
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: BudgetTemplateResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Budget Templates Service: Error updating budget template:', error);
    throw error;
  }
}
