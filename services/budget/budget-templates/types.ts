import type { UserCategory } from '../categories-manager/types';

// Budget Template types
export type BudgetRecurrence = 'monthly' | 'weekly' | 'yearly';

export interface BudgetTemplate {
  id: number;
  user_category_id: number;
  amount: number;
  recurrence: BudgetRecurrence;
  is_active: boolean;
  category: UserCategory;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetTemplateParams {
  user_category_id: number;
  amount: number;
  recurrence: BudgetRecurrence;
}

export interface UpdateBudgetTemplateParams {
  amount: number;
}

export interface BudgetTemplatesResponse {
  success: boolean;
  data: BudgetTemplate[];
}

export interface BudgetTemplateResponse {
  success: boolean;
  data: BudgetTemplate;
}

export interface DeactivateBudgetTemplateResponse {
  success: boolean;
}

// Budget Instance types
export interface BudgetInstanceCategory {
  id: number;
  name: string;
  kind: 'expense' | 'income';
  emoji_code: string;
}

export interface BudgetInstance {
  id: number;
  budget_template_id: number;
  start_date: string;
  end_date: string;
  amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage: number;
  over_budget: boolean;
  category: BudgetInstanceCategory;
  recurrence: BudgetRecurrence;
}

export interface BudgetSummary {
  total_budgeted: number;
  total_spent: number;
  total_remaining: number;
  categories_count: number;
  over_budget_count: number;
  warning_count: number;
  healthy_count: number;
}

export interface BudgetInstancesCurrentResponse {
  success: boolean;
  data: {
    budget_instances: BudgetInstance[];
    summary: BudgetSummary;
  };
}

export interface BudgetInstancesHistoryResponse {
  success: boolean;
  data: BudgetInstance[];
}

export interface GetBudgetHistoryParams {
  user_category_id: number;
}
