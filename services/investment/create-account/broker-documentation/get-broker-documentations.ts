import config from '@/config/constants';

export interface BrokerDocument {
  id: number;
  broker_id: number;
  broker_name: string;
  broker_code: string;
  signed: boolean;
  status: 'pending' | 'approved' | 'rejected';
  file_attached: boolean;
  file_url: string;
  commercial_mandate_attached?: boolean;
  commercial_mandate_url?: string;
  signed_at: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationData {
  current_page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface GetBrokerDocumentationsResponse {
  broker_documents: BrokerDocument[];
  pagination: PaginationData | null;
  success: boolean;
  message?: string;
}

export interface GetBrokerDocumentationsParams {
  page?: number;
  per_page?: number;
}

export async function getBrokerDocumentations(
  token: string,
  params?: GetBrokerDocumentationsParams
): Promise<GetBrokerDocumentationsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const queryString = queryParams.toString();
    const url = `${config.apiBaseUrl}/api/v2/broker_documentations${queryString ? `?${queryString}` : ''}`;

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
        broker_documents: data.data?.broker_documents || [],
        pagination: data.data?.pagination || null,
        success: true,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 404) {
      return {
        broker_documents: [],
        pagination: null,
        success: true,
        message: 'No broker documents found',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error fetching broker documentations:', error);

    return {
      broker_documents: [],
      pagination: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error fetching broker documentations',
    };
  }
}
