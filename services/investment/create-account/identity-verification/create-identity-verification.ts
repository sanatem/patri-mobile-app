import config from '@/config/constants';

export interface CreateIdentityCardPayload {
  frontImage: string;
  backImage: string;
  verified?: boolean;
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
    const formData = new FormData();

    const frontBlob = await (await fetch(payload.frontImage)).blob();
    const backBlob = await (await fetch(payload.backImage)).blob();

    formData.append('identity_card[front]', frontBlob, 'front.jpg');
    formData.append('identity_card[back]', backBlob, 'back.jpg');
    
    if (payload.verified !== undefined) {
      formData.append('identity_card[verified]', payload.verified.toString());
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Identity card created successfully',
        data: data.data,
      };
    }

    return {
      success: false,
      message: data.message || 'Error creating identity card',
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error creating identity card',
    };
  }
}
