import config from '@/config/constants';

export interface DeleteUserResponse {
  message: string;
  success: boolean;
}

export async function deleteUserAccount(token: string): Promise<DeleteUserResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/user/delete_request`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }
      
      if (response.status === 403) {
        throw new Error('No tienes permisos para solicitar la eliminación de esta cuenta');
      }
      
      if (response.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      
      if (response.status === 409) {
        throw new Error('Ya existe una solicitud de eliminación pendiente');
      }
      
      if (response.status === 500) {
        throw new Error('Error interno del servidor');
      }
      
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: DeleteUserResponse = await response.json();
    
    console.log('✅ User account deletion request submitted successfully');
    return data;

  } catch (error) {
    console.error('❌ User Service: Error requesting user account deletion:', error);
    throw error;
  }
} 