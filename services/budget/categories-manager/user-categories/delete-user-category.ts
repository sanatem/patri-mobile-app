
import config from '@/config/constants';

export interface DeleteUserCategoryResponse {
  success: boolean;
  message?: string;
}

/**
 * Elimina una categoría de usuario
 * DELETE /api/v2/user_categories/:id
 *
 * @param id - ID de la categoría a eliminar
 * @param token - Token de autenticación
 */
export async function deleteUserCategory(
  id: number,
  token: string
): Promise<DeleteUserCategoryResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    if (!id) {
      throw new Error('ID de categoría es requerido');
    }

    const url = `${config.apiBaseUrl}/api/v2/user_categories/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
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
        throw new Error('Categoría no encontrada');
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: DeleteUserCategoryResponse = await response.json();
    return data;

  } catch (error) {
    console.error('User Categories Service: Error deleting user category:', error);
    throw error;
  }
}
