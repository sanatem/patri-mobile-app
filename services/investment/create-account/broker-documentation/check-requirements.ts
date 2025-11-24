import config from '@/config/constants';

export interface BrokerError {
  error: string;
  message: string;
}

export interface BrokerDetail {
  name: string;
  code: string;
  broker_document_id: number;
  status: string;
}

export interface MissingRequirement {
  broker: string;
  broker_code: string;
  error: string;
  message: string;
}

export interface IdentityCardStatus {
  exists: boolean;
  verified: boolean;
  completed: boolean;
  has_front: boolean;
  has_back: boolean;
}

export interface FormStatus {
  exists: boolean;
  completed: boolean;
  required?: boolean;
}

export interface BrokerDocumentStatus {
  broker_code: string;
  broker_name: string;
  exists: boolean;
  signed: boolean;
  status: string;
  has_questionnaire: boolean;
}

export interface FormsStatus {
  identity_card: IdentityCardStatus;
  personal_information: FormStatus;
  contact_information: FormStatus;
  employment_information: FormStatus & { required: boolean };
  spouse: FormStatus & { required: boolean };
  broker_documents: BrokerDocumentStatus[];
}

export interface CheckRequirementsData {
  requirements_met: boolean;
  missing_requirements: MissingRequirement[];
  details: {
    brokers: BrokerDetail[];
    forms_status: FormsStatus;
  };
}

export interface CheckRequirementsResponse {
  success: boolean;
  data?: CheckRequirementsData;
  message?: string;
}

export async function checkRequirements(token: string): Promise<CheckRequirementsResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/broker_documentations/check_requirements`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();

      return {
        success: true,
        data: result.data || {
          requirements_met: false,
          missing_requirements: [],
          details: { brokers: [] },
        },
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 404) {
      return {
        success: false,
        message: 'No se encontraron requisitos',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error checking requirements:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al verificar requisitos',
    };
  }
}
