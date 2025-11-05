
import config from '@/config/constants';
import type { UserCategoryResponse } from '../types';

/**
 * Obtiene una categoría de usuario específica por su ID
 * GET /api/v2/user_categories/:id
 *
 * @param id - ID de la categoría a obtener
 * @param token - Token de autenticación
 */
export async function getUserCategory(
  id: number,
  token: string
): Promise<UserCategoryResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    if (!id) {
      throw new Error('ID de categoría es requerido');
    }

    const url = `${config.apiBaseUrl}/api/v2/user_categories/${id}`;

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

    const data: UserCategoryResponse = await response.json();
    return data;

  } catch (error) {
    console.error('User Categories Service: Error fetching user category from API:', error);
    throw error;
  }
}
