import config from '@/config/constants';
import { EmploymentInformation } from './get-employment-information';

export interface CreateEmploymentInformationPayload {
  employment_information: {
    company_name: string;
    company_rut: string;
    charge: string;
    profession: string;
    commercial_activity: string;
  };
}

export interface CreateEmploymentInformationResponse {
  employment_information: EmploymentInformation | null;
  success: boolean;
  message?: string;
}

export async function createEmploymentInformation(
  token: string,
  payload: CreateEmploymentInformationPayload
): Promise<CreateEmploymentInformationResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/employment_information`;

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
        employment_information: data.data?.employment_information || null,
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
    console.error('Error creating employment information:', error);

    return {
      employment_information: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error creating employment information',
    };
  }
}
