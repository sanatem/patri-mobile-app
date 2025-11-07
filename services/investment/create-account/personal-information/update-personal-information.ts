import config from '@/config/constants';

export interface PersonalInformationUpdateData {
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

export interface UpdatePersonalInformationRequest {
  personal_information: PersonalInformationUpdateData;
}

export interface UpdatePersonalInformationResponse {
  personal_information?: PersonalInformationUpdateData;
  success: boolean;
  message?: string;
  errors?: string[];
}

export async function updatePersonalInformation(
  token: string,
  personalInformationData: PersonalInformationUpdateData
): Promise<UpdatePersonalInformationResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/personal_information`;

    const requestBody: UpdatePersonalInformationRequest = {
      personal_information: personalInformationData,
    };

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        personal_information: data.personal_information,
        success: true,
        message: 'Personal information updated successfully',
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 422) {
      return {
        success: false,
        message: 'Validation error',
        errors: data.errors || ['Invalid data provided'],
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        message: 'Personal information not found',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error updating personal information:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error updating personal information',
    };
  }
}
