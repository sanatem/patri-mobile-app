
import config from '@/config/constants';
import type { UserCategoryResponse } from '../types';

export interface UpdateUserCategoryParams {
  name?: string;
  emoji_code?: string;
  parent_id?: number;
}

export interface UpdateUserCategoryPayload {
  user_category: UpdateUserCategoryParams;
}

/**
 * Actualiza una categoría de usuario
 * PATCH /api/v2/user_categories/:id
 *
 * @param id - ID de la categoría a actualizar
 * @param params - Datos a actualizar (todos opcionales)
 * @param token - Token de autenticación
 */
export async function updateUserCategory(
  id: number,
  params: UpdateUserCategoryParams,
  token: string
): Promise<UserCategoryResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    if (!id) {
      throw new Error('ID de categoría es requerido');
    }

    if (Object.keys(params).length === 0) {
      throw new Error('Al menos un campo debe ser proporcionado para actualizar');
    }

    const payload: UpdateUserCategoryPayload = {
      user_category: params
    };

    const url = `${config.apiBaseUrl}/api/v2/user_categories/${id}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }

      if (response.status === 404) {
        throw new Error('Categoría no encontrada');
      }

      if (response.status === 422) {
        const errorData = await response.json();
        throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: UserCategoryResponse = await response.json();
    return data;

  } catch (error) {
    console.error('User Categories Service: Error updating user category:', error);
    throw error;
  }
}
