import type { UserCategory } from '../categories-manager/types';

export type BudgetRecurrence = 'monthly' | 'weekly' | 'yearly';

export interface BudgetTemplateCategory {
  id: number;
  name: string;
  kind: 'expense' | 'income';
  emoji_code: string;
}

export interface BudgetTemplate {
  id: number;
  user_category: BudgetTemplateCategory;
  amount: number;
  recurrence: BudgetRecurrence;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetTemplateParams {
  user_category_id: number;
  amount: number;
  recurrence: BudgetRecurrence;
  start_date?: string; // Formato: yyyy-mm-dd
  income_user_category_id?: number; // Categoría de ingreso asociada
}

export interface UpdateBudgetTemplateParams {
  amount: number;
}

export interface BudgetTemplatesResponse {
  success: boolean;
  budget_templates: BudgetTemplate[];
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
  period: string;
  start_date: string;
  end_date: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: string;
  over_budget: boolean;
  created_at: string;
  category: BudgetInstanceCategory;
  recurrence: BudgetRecurrence;
  template_active: boolean;
}

export interface BudgetSummary {
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  categories_count: number;
  over_budget_count: number;
  warning_count: number;
  healthy_count: number;
}

export interface BudgetInstancesCurrentResponse {
  success: boolean;
  budget_instances: BudgetInstance[];
  summary: BudgetSummary;
}

export interface BudgetInstancesHistoryResponse {
  success: boolean;
  data: BudgetInstance[];
}

export interface GetBudgetHistoryParams {
  user_category_id: number;
}

export interface CombinedBudget {
  template: BudgetTemplate;
  instance: BudgetInstance | null;
  hasProgress: boolean;
}
