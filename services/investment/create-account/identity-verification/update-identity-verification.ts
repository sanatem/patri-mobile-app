import config from '@/config/constants';

export interface UpdateIdentityCardPayload {
  frontImage?: string; // base64 string (opcional)
  backImage?: string;  // base64 string (opcional)
  verified?: boolean; // true si fue accept/review, false si fue reject
}

export interface UpdateIdentityCardResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export async function updateIdentityCard(
  token: string,
  payload: UpdateIdentityCardPayload
): Promise<UpdateIdentityCardResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/identity_card`;

    // Crear FormData para enviar las imágenes
    const formData = new FormData();

    // Solo agregar las imágenes que fueron proporcionadas
    if (payload.frontImage) {
      const frontBlob = await (await fetch(payload.frontImage)).blob();
      formData.append('identity_card[front]', frontBlob, 'front.jpg');
    }

    if (payload.backImage) {
      const backBlob = await (await fetch(payload.backImage)).blob();
      formData.append('identity_card[back]', backBlob, 'back.jpg');
    }
    
    // Agregar el estado de verificación si está disponible
    if (payload.verified !== undefined) {
      formData.append('identity_card[verified]', payload.verified.toString());
    }

    console.log('Updating identity card with verified status:', payload.verified);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Identity card updated successfully:', data);
      return {
        success: true,
        message: data.message || 'Identity card updated successfully',
        data: data.data,
      };
    }

    console.error('Error updating identity card:', data);
    return {
      success: false,
      message: data.message || 'Error updating identity card',
    };

  } catch (error) {
    console.error('Error updating identity card:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error updating identity card',
    };
  }
}
