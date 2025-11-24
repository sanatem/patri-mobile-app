import config from '@/config/constants';

export interface AddressData {
  country?: string;
  state?: string;
  city?: string;
  route?: string;
  street_number?: string;
  postal_code?: string;
  county?: string;
  latitude?: string;
  longitude?: string;
}

export interface LocationData {
  region?: string;
  commune?: string;
}

export interface ContactInformation {
  address?: string;
  address_number?: string;
  floor_number?: string;
  phones?: string[];
  address_data?: AddressData;
  location_data?: LocationData;
}

export interface GetContactInformationResponse {
  contact_information: ContactInformation | null;
  success: boolean;
  message?: string;
}

export async function getContactInformation(token: string): Promise<GetContactInformationResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/contact_information`;

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
        contact_information: data.data?.contact_information || null,
        success: true,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 404) {
      return {
        contact_information: null,
        success: true,
        message: 'No contact information found',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error fetching contact information:', error);

    return {
      contact_information: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error fetching contact information',
    };
  }
}
