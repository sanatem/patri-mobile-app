import config from '@/config/constants';

export interface BrokerError {
  error: string;
  message: string;
}

export interface BrokerDetail {
  name: string;
  code: string;
  can_sign: boolean;
  errors: BrokerError[];
}

export interface MissingRequirement {
  broker: string;
  broker_code: string;
  error: string;
  message: string;
}

export interface CheckRequirementsData {
  requirements_met: boolean;
  missing_requirements: MissingRequirement[];
  details: {
    brokers: BrokerDetail[];
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
