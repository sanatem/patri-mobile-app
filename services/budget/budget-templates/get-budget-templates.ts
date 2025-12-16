import config from '@/config/constants';
import type { BudgetTemplatesResponse } from './types';

/**
 * Obtiene los templates de presupuesto activos del usuario
 * GET /api/v2/budget_templates
 */
export async function getBudgetTemplates(
  token: string
): Promise<BudgetTemplatesResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/budget_templates`;

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

    const data: BudgetTemplatesResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Budget Templates Service: Error fetching budget templates:', error);
    throw error;
  }
}
