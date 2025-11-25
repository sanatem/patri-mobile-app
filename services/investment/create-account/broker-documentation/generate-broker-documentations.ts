import config from '@/config/constants';
import type { BrokerDocument } from './get-broker-documentations';

export interface GenerateBrokerDocumentationsResponse {
  broker_documents: BrokerDocument[];
  success: boolean;
  message?: string;
}

export async function generateBrokerDocumentations(
  token: string
): Promise<GenerateBrokerDocumentationsResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/broker_documentations/generate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();

      return {
        broker_documents: data.data?.broker_documents || [],
        success: true,
        message: data.message || 'Documentos generados exitosamente',
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error generating broker documentations:', error);

    return {
      broker_documents: [],
      success: false,
      message: error instanceof Error ? error.message : 'Error generating broker documentations',
    };
  }
}
