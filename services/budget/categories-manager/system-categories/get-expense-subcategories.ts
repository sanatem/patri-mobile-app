
import config from '@/config/constants';

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

export interface ExpenseSubcategoriesResponse {
  success: boolean;
  data: TransactionCategory[];
}

export interface GetExpenseSubcategoriesParams {
  parent_id: number;
  page?: number;
  per_page?: number;
}

/**
 * Obtiene solo las subcategorías de una categoría padre específica de tipo expense
 * GET /api/v2/transaction_categories?kind=expense&parent_id={parent_id}
 */
export async function getExpenseSubcategories(
  params: GetExpenseSubcategoriesParams,
  token: string
): Promise<ExpenseSubcategoriesResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const urlParams = new URLSearchParams();
    urlParams.append('kind', 'expense');
    urlParams.append('parent_id', params.parent_id.toString());

    if (params.page) {
      urlParams.append('page', params.page.toString());
    }

    if (params.per_page) {
      urlParams.append('per_page', params.per_page.toString());
    }

    const queryString = urlParams.toString();
    const url = `${config.apiBaseUrl}/api/v2/transaction_categories?${queryString}`;

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

      if (response.status === 404) {
        return null;
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: ExpenseSubcategoriesResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Categories Manager Service: Error fetching expense subcategories from API:', error);
    throw error;
  }
}
