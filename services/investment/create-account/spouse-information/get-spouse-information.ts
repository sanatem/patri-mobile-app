import config from '@/config/constants';

export interface SpouseInformation {
  first_name?: string;
  last_name?: string;
  rut?: string;
  birth_date?: string;
  sex?: string;
  email?: string;
  nationality?: string;
  phone?: string;
  same_address?: boolean;
  broker_relationship?: string;
  address?: string;
  address_number?: string;
  location_data?: {
    region?: string;
    commune?: string;
  };
  father_last_name?: string;
  mother_last_name?: string;
  region?: string;
  commune?: string;
}

export interface GetSpouseInformationResponse {
  spouse: SpouseInformation | null;
  success: boolean;
  message?: string;
}

export async function getSpouseInformation(token: string): Promise<GetSpouseInformationResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/spouse`;

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
        spouse: data.data?.spouse || null,
        success: true,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 404) {
      return {
        spouse: null,
        success: true,
        message: 'No spouse information found',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error fetching spouse information:', error);

    return {
      spouse: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error fetching spouse information',
    };
  }
}

export interface RequiresSpouseResponse {
  requires_spouse: boolean;
  success: boolean;
  message?: string;
}

export async function requiresSpouse(token: string): Promise<RequiresSpouseResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/spouse/requires`;

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
        requires_spouse: data.data?.requires_spouse || false,
        success: true,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    return {
      requires_spouse: false,
      success: false,
      message: 'Error checking spouse requirement',
    };

  } catch (error) {
    console.error('Error checking spouse requirement:', error);

    return {
      requires_spouse: false,
      success: false,
      message: error instanceof Error ? error.message : 'Error checking spouse requirement',
    };
  }
}
