import config from '@/config/constants';
import type { CreatePropertyRequest, CreatePropertyResponse } from '@/types/api';

export const createProperty = async (data: CreatePropertyRequest, token: string): Promise<CreatePropertyResponse> => {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/properties`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = '';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorData.detail || 'Error desconocido del servidor';
      } catch (parseError) {
        const errorText = await response.text();
        errorMessage = `Error ${response.status}: ${errorText}`;
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    const responseData = await response.json();
    
    return {
      success: true,
      data: responseData
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al crear la propiedad'
    };
  }
};