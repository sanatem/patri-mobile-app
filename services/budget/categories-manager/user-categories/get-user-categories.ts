
import config from '@/config/constants';
import type { UserCategoriesResponse, GetUserCategoriesParams } from '../types';

/**
 * Obtiene las categorías del usuario con filtros opcionales
 * GET /api/v2/user_categories
 *
 * @param params - Filtros opcionales:
 *   - kind: Filtrar por tipo ('expense' o 'income')
 *   - parent_id: Filtrar por categoría padre
 *   - system_based: Solo categorías basadas en sistema (heredadas/copiadas)
 *   - custom: Solo categorías personalizadas creadas por el usuario
 * @param token - Token de autenticación
 */
export async function getUserCategories(
  params: GetUserCategoriesParams,
  token: string
): Promise<UserCategoriesResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const urlParams = new URLSearchParams();

    if (params.kind) {
      urlParams.append('kind', params.kind);
    }

    if (params.parent_id !== undefined) {
      urlParams.append('parent_id', params.parent_id.toString());
    }

    if (params.system_based !== undefined) {
      urlParams.append('system_based', params.system_based.toString());
    }

    if (params.custom !== undefined) {
      urlParams.append('custom', params.custom.toString());
    }

    if (params.page) {
      urlParams.append('page', params.page.toString());
    }

    if (params.per_page) {
      urlParams.append('per_page', params.per_page.toString());
    }

    const queryString = urlParams.toString();
    const url = `${config.apiBaseUrl}/api/v2/user_categories${queryString ? `?${queryString}` : ''}`;

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

    const data: UserCategoriesResponse = await response.json();
    return data;

  } catch (error) {
    console.error('User Categories Service: Error fetching user categories from API:', error);
    throw error;
  }
}
