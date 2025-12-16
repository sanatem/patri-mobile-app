import config from '@/config/constants';
import type { DeactivateBudgetTemplateResponse } from './types';

/**
 * Desactiva un presupuesto
 * PATCH /api/v2/budget_templates/:id/deactivate
 */
export async function deactivateBudgetTemplate(
  templateId: number,
  token: string
): Promise<DeactivateBudgetTemplateResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/budget_templates/${templateId}/deactivate`;

    const response = await fetch(url, {
      method: 'PATCH',
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
        throw new Error('Presupuesto no encontrado');
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: DeactivateBudgetTemplateResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Budget Templates Service: Error deactivating budget template:', error);
    throw error;
  }
}
