
// Shared types for categories manager

export interface TransactionCategory {
  id: number;
  name: string;
  translated_name: string;
  kind: 'expense' | 'income';
  parent_id: number | null;
  children: TransactionCategory[];
  created_at: string;
  updated_at: string;
}

export interface UserCategory {
  id: number;
  name: string;
  translated_name: string;
  kind: 'expense' | 'income';
  parent_id: number | null;
  emoji_code?: string;
  system_based: boolean; // Heredadas o copiadas de las categorías del sistema
  custom: boolean; // Creadas por el usuario
  transaction_category_id?: number; // ID de la categoría del sistema (si es basada en sistema)
  children?: UserCategory[];
  created_at: string;
  updated_at: string;
}

export interface AllCategoriesResponse {
  success: boolean;
  data: TransactionCategory[];
}

export interface UserCategoriesResponse {
  success: boolean;
  data: UserCategory[];
}

export interface UserCategoryResponse {
  success: boolean;
  data: UserCategory;
}

export interface GetAllCategoriesParams {
  page?: number;
  per_page?: number;
}

export interface GetUserCategoriesParams {
  kind?: 'expense' | 'income';
  parent_id?: number;
  system_based?: boolean;
  custom?: boolean;
  page?: number;
  per_page?: number;
}

export interface CreateUserCategoryParams {
  name: string;
  kind: 'expense' | 'income';
  emoji_code: string;
  transaction_category_id?: number; // Para categorías basadas en sistema
  parent_id?: number; // Para subcategorías
}

export interface UpdateUserCategoryParams {
  name?: string;
  emoji_code?: string;
  parent_id?: number;
}

export interface DeleteUserCategoryResponse {
  success: boolean;
  message?: string;
}
