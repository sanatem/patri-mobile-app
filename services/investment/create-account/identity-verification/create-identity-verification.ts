import config from '@/config/constants';

export interface CreateIdentityCardPayload {
  frontImage: string; // base64 string
  backImage: string;  // base64 string
  verified?: boolean; // true si fue accept/review, false si fue reject
}

export interface CreateIdentityCardResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export async function createIdentityCard(
  token: string,
  payload: CreateIdentityCardPayload
): Promise<CreateIdentityCardResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/identity_card`;

    // Crear FormData para enviar las imágenes
    const formData = new FormData();

    // Convertir base64 a blob para FormData
    const frontBlob = await (await fetch(payload.frontImage)).blob();
    const backBlob = await (await fetch(payload.backImage)).blob();

    formData.append('identity_card[front]', frontBlob, 'front.jpg');
    formData.append('identity_card[back]', backBlob, 'back.jpg');
    
    // Agregar el estado de verificación si está disponible
    if (payload.verified !== undefined) {
      formData.append('identity_card[verified]', payload.verified.toString());
    }

    console.log('Creating identity card with images and verified status:', payload.verified);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Identity card created successfully:', data);
      return {
        success: true,
        message: data.message || 'Identity card created successfully',
        data: data.data,
      };
    }

    console.error('Error creating identity card:', data);
    return {
      success: false,
      message: data.message || 'Error creating identity card',
    };

  } catch (error) {
    console.error('Error creating identity card:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error creating identity card',
    };
  }
}
