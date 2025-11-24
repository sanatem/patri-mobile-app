import config from '@/config/constants';
import { AddressData, LocationData, ContactInformation } from './get-contact-information';

export interface CreateContactInformationPayload {
  contact_information: {
    address: string;
    address_number: string;
    phones: string[];
    address_data: AddressData;
    location_data: LocationData;
  };
}

export interface CreateContactInformationResponse {
  contact_information: ContactInformation | null;
  success: boolean;
  message?: string;
}

export async function createContactInformation(
  token: string,
  payload: CreateContactInformationPayload
): Promise<CreateContactInformationResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/contact_information`;

    const response = await fetch(url, {
      method: 'POST',
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
    console.error('Error creating contact information:', error);

    return {
      contact_information: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error creating contact information',
    };
  }
}
