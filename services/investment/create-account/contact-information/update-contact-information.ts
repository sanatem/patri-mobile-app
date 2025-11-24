import config from '@/config/constants';
import { AddressData, LocationData, ContactInformation } from './get-contact-information';

export interface UpdateContactInformationPayload {
  contact_information: {
    address?: string;
    address_number?: string;
    phones?: string[];
    address_data?: Partial<AddressData>;
    location_data?: Partial<LocationData>;
  };
}

export interface UpdateContactInformationResponse {
  contact_information: ContactInformation | null;
  success: boolean;
  message?: string;
}

export async function updateContactInformation(
  token: string,
  payload: UpdateContactInformationPayload
): Promise<UpdateContactInformationResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/contact_information`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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

    if (response.status === 422) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Validation error');
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error updating contact information:', error);

    return {
      contact_information: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error updating contact information',
    };
  }
}
