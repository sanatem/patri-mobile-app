import config from '@/config/constants';
import { SpouseInformation } from './get-spouse-information';

export interface UpdateSpouseInformationResponse {
  success: boolean;
  message?: string;
  spouse?: SpouseInformation;
}

export async function createSpouseInformation(
  token: string,
  spouseData: Partial<SpouseInformation>
): Promise<UpdateSpouseInformationResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/spouse`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ spouse: spouseData }),
    });

    if (response.ok) {
      const data = await response.json();

      return {
        success: true,
        spouse: data.data?.spouse,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    const errorData = await response.json().catch(() => ({}));
    console.error('Error response from backend:', errorData);

    const errorMessage = errorData.message
      || errorData.error
      || (errorData.errors ? JSON.stringify(errorData.errors) : null)
      || `HTTP ${response.status}: ${response.statusText}`;

    throw new Error(errorMessage);

  } catch (error) {
    console.error('Error creating spouse information:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error creating spouse information',
    };
  }
}

export async function updateSpouseInformation(
  token: string,
  spouseData: Partial<SpouseInformation>
): Promise<UpdateSpouseInformationResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/spouse`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ spouse: spouseData }),
    });

    if (response.ok) {
      const data = await response.json();

      return {
        success: true,
        spouse: data.data?.spouse,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    const errorData = await response.json().catch(() => ({}));
    console.error('Error response from backend:', errorData);

    const errorMessage = errorData.message
      || errorData.error
      || (errorData.errors ? JSON.stringify(errorData.errors) : null)
      || `HTTP ${response.status}: ${response.statusText}`;

    throw new Error(errorMessage);

  } catch (error) {
    console.error('Error updating spouse information:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error updating spouse information',
    };
  }
}
