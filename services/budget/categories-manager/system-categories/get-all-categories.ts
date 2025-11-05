
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

export interface AllCategoriesResponse {
  success: boolean;
  data: TransactionCategory[];
}

export interface GetAllCategoriesParams {
  page?: number;
  per_page?: number;
}

/**
 * Obtiene todas las categorías (gastos e ingresos)
 * GET /api/v2/transaction_categories
 */
export async function getAllCategories(
  params: GetAllCategoriesParams,
  token: string
): Promise<AllCategoriesResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const urlParams = new URLSearchParams();

    if (params.page) {
      urlParams.append('page', params.page.toString());
    }

    if (params.per_page) {
      urlParams.append('per_page', params.per_page.toString());
    }

    const queryString = urlParams.toString();
    const url = `${config.apiBaseUrl}/api/v2/transaction_categories${queryString ? `?${queryString}` : ''}`;

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

    const data: AllCategoriesResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Categories Manager Service: Error fetching all categories from API:', error);
    throw error;
  }
}
