import config from '@/config/constants';

export interface PersonalInformation {
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  sex?: string;
  gender?: string;
  rut?: string;
  nationality?: string;
  employment_situation?: string;
  marital_status?: string;
  conjugal_regime?: string;
  pep?: boolean;
  us_person?: boolean;
  has_a_broker_relationship?: boolean;
  has_broker_relationship_with_vector?: boolean;
  broker_relationship_type?: string | null;
}

export interface GetPersonalInformationResponse {
  personal_information: PersonalInformation | null;
  success: boolean;
  message?: string;
}

export async function getPersonalInformation(token: string): Promise<GetPersonalInformationResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/personal_information`;

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
        personal_information: data.personal_information || null,
        success: true,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 404) {
      return {
        personal_information: null,
        success: true,
        message: 'No personal information found',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error fetching personal information:', error);

    return {
      personal_information: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error fetching personal information',
    };
  }
}
