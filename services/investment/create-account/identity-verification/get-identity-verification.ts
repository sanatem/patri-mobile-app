import config from '@/config/constants';

export interface IdentityCard {
  id: number;
  user_id: number;
  front_url?: string; // URL de la imagen del frente
  back_url?: string;  // URL de la imagen del reverso
  verified?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface GetIdentityCardResponse {
  identity_card: IdentityCard | null;
  success: boolean;
  message?: string;
}

export async function getIdentityCard(token: string): Promise<GetIdentityCardResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/identity_card`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();

      return {
        identity_card: data.data?.identity_card || null,
        success: true,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 404) {
      return {
        identity_card: null,
        success: true,
        message: 'No identity card found',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error fetching identity card:', error);

    return {
      identity_card: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error fetching identity card',
    };
  }
}
