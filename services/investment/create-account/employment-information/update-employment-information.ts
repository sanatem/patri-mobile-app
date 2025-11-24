import config from '@/config/constants';
import { EmploymentInformation } from './get-employment-information';

export interface UpdateEmploymentInformationPayload {
  employment_information: {
    company_name?: string;
    company_rut?: string;
    charge?: string;
    profession?: string;
    commercial_activity?: string;
  };
}

export interface UpdateEmploymentInformationResponse {
  employment_information: EmploymentInformation | null;
  success: boolean;
  message?: string;
}

export async function updateEmploymentInformation(
  token: string,
  payload: UpdateEmploymentInformationPayload
): Promise<UpdateEmploymentInformationResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/employment_information`;

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
    console.error('Error updating employment information:', error);

    return {
      employment_information: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error updating employment information',
    };
  }
}
