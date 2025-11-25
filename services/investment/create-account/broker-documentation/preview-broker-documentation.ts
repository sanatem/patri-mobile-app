import config from '@/config/constants';

export interface PreviewBrokerDocumentationResponse {
  url: string | null;
  success: boolean;
  message?: string;
}

export interface PreviewBrokerDocumentationParams {
  signed?: boolean;
  document_type?: string;
}

export async function previewBrokerDocumentation(
  id: number,
  token: string,
  params?: PreviewBrokerDocumentationParams
): Promise<PreviewBrokerDocumentationResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.signed !== undefined) {
      queryParams.append('signed', params.signed.toString());
    }
    if (params?.document_type) {
      queryParams.append('document_type', params.document_type);
    }

    const queryString = queryParams.toString();
    const url = `${config.apiBaseUrl}/api/v2/broker_documentations/${id}/preview${queryString ? `?${queryString}` : ''}`;

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
        url: data.data?.url || null,
        success: true,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 404) {
      return {
        url: null,
        success: false,
        message: 'Document preview not found',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error fetching broker documentation preview:', error);

    return {
      url: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error fetching broker documentation preview',
    };
  }
}
