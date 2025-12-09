import config from '@/config/constants';
import type { BudgetInstance } from '../budget-templates/types';

export interface BudgetInstanceTransaction {
  id: number;
  date: string;
  custom_date: string | null;
  display_date: string;
  description: string;
  amount: number;
  type: 'income' | 'outcome';
  bank: string;
}

export interface BudgetInstanceWithTransactions extends BudgetInstance {
  transactions: BudgetInstanceTransaction[];
  transactions_count: number;
}

export interface BudgetInstanceByIdResponse {
  success: boolean;
  budget_instance: BudgetInstanceWithTransactions;
}

export interface GetBudgetInstanceByIdParams {
  transactions_page?: number;
  transactions_per_page?: number;
}

/**
 * Obtiene una instancia de presupuesto por ID con sus transacciones
 * GET /api/v2/budget_instances/:id
 *
 * @param instanceId - ID de la instancia
 * @param params.transactions_page - Página de transacciones (default: 1)
 * @param params.transactions_per_page - Items por página de transacciones
 */
export async function getBudgetInstanceById(
  instanceId: number | string,
  accessToken: string,
  params?: GetBudgetInstanceByIdParams
): Promise<BudgetInstanceByIdResponse> {
  const urlParams = new URLSearchParams();

  if (params?.transactions_page !== undefined) {
    urlParams.append('transactions_page', params.transactions_page.toString());
  }
  if (params?.transactions_per_page !== undefined) {
    urlParams.append('transactions_per_page', params.transactions_per_page.toString());
  }

  const queryString = urlParams.toString();
  const url = `${config.apiBaseUrl}/api/v2/budget_instances/${instanceId}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching budget instance: ${response.status}`);
  }

  return response.json();
}
