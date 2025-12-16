import config from '@/config/constants';
import type { BudgetInstance } from '../budget-templates/types';

export interface PatchBudgetInstanceParams {
  amount: number;
  update_template?: boolean;
}

export interface PatchBudgetInstanceResponse {
  success: boolean;
  budget_instance: BudgetInstance;
}

/**
 * Actualiza una instancia de presupuesto
 * PATCH /api/v2/budget_instances/:id
 *
 * @param instanceId - ID de la instancia a actualizar
 * @param params.amount - Nuevo monto del presupuesto
 * @param params.update_template - Si es true, también actualiza el template (default: false)
 */
export async function patchBudgetInstance(
  instanceId: number | string,
  params: PatchBudgetInstanceParams,
  token: string
): Promise<PatchBudgetInstanceResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/budget_instances/${instanceId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        update_template: params.update_template ?? false,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }

      if (response.status === 404) {
        throw new Error('Instancia de presupuesto no encontrada');
      }

      if (response.status === 422) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Datos inválidos');
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: PatchBudgetInstanceResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Budget Instances Service: Error patching budget instance:', error);
    throw error;
  }
}
