import config from '@/config/constants';
import type { BrokerDocument } from './get-broker-documentations';

export interface GetBrokerDocumentationResponse {
  broker_document: BrokerDocument | null;
  success: boolean;
  message?: string;
}

export async function getBrokerDocumentation(
  id: number,
  token: string
): Promise<GetBrokerDocumentationResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/broker_documentations/${id}`;

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
        broker_document: data.data || null,
        success: true,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 404) {
      return {
        broker_document: null,
        success: false,
        message: 'Broker document not found',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error fetching broker documentation:', error);

    return {
      broker_document: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error fetching broker documentation',
    };
  }
}
