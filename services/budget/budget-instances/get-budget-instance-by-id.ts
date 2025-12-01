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

export async function getBudgetInstanceById(
  instanceId: number | string,
  accessToken: string
): Promise<BudgetInstanceByIdResponse> {
  const response = await fetch(`${config.apiBaseUrl}/api/v2/budget_instances/${instanceId}`, {
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
