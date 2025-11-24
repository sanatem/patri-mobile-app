import config from '@/config/constants';

export interface EmploymentInformation {
  company_name?: string;
  company_rut?: string;
  charge?: string;
  profession?: string;
  commercial_activity?: string;
}

export interface GetEmploymentInformationResponse {
  employment_information: EmploymentInformation | null;
  success: boolean;
  message?: string;
}

export async function getEmploymentInformation(token: string): Promise<GetEmploymentInformationResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/employment_information`;

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
        employment_information: data.data?.employment_information || null,
        success: true,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 404) {
      return {
        employment_information: null,
        success: true,
        message: 'No employment information found',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error fetching employment information:', error);

    return {
      employment_information: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error fetching employment information',
    };
  }
}
