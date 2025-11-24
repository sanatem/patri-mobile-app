import config from '@/config/constants';
import type { BrokerDocument } from './get-broker-documentations';

export interface SignContractsData {
  broker_documents: BrokerDocument[];
}

export interface SignContractsResponse {
  success: boolean;
  message?: string;
  data?: SignContractsData;
}

export async function signContracts(token: string): Promise<SignContractsResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/broker_documentations/sign`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();

      return {
        success: true,
        message: result.message || 'Contratos firmados exitosamente',
        data: result.data || { broker_documents: [] },
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 400) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'No se pueden firmar los contratos. Verifica que hayas completado todos los requisitos.',
      };
    }

    if (response.status === 422) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Datos inválidos para firmar contratos',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error signing contracts:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al firmar contratos',
    };
  }
}
