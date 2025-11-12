
import config from '@/config/constants';
import type { UserCategoryResponse } from '../types';

export interface CreateUserCategoryParams {
  name: string;
  kind: 'expense' | 'income';
  emoji_code: string;
  transaction_category_id?: number; // Para categorías basadas en sistema
  parent_id?: number; // Para subcategorías
}

export interface CreateUserCategoryPayload {
  user_category: CreateUserCategoryParams;
}

/**
 * Crea una nueva categoría de usuario
 * POST /api/v2/user_categories
 *
 * Tipos de categorías:
 * - Custom: Solo name, kind, emoji_code
 * - Basada en sistema: Incluye transaction_category_id
 * - Subcategoría: Incluye parent_id
 *
 * @param params - Datos de la categoría
 * @param token - Token de autenticación
 */
export async function createUserCategory(
  params: CreateUserCategoryParams,
  token: string
): Promise<UserCategoryResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    if (!params.name || !params.kind || !params.emoji_code) {
      throw new Error('name, kind y emoji_code son campos requeridos');
    }

    const payload: CreateUserCategoryPayload = {
      user_category: params
    };

    const url = `${config.apiBaseUrl}/api/v2/user_categories`;

    const response = await fetch(url, {
      method: 'POST',
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
    console.error('User Categories Service: Error creating user category:', error);
    throw error;
  }
}
