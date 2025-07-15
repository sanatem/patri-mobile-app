
import config from '@/config/constants';

export interface TimelineEntry {
  date: string;
  value: number;
}

export interface VariationWithRange {
  last_month_variation: {
    absolute_change: number;
    percentage_change: number;
    trend: 'positive' | 'negative';
  };
}

export interface VariationWithoutRange {
  vs_current: {
    absolute_change: number;
    percentage_change: number;
    trend: 'positive' | 'negative';
  };
}

export interface DateRangeWithRange {
  start_date: string;
  end_date: string;
}

export interface DateRangeWithoutRange {
  start_date: string;
  end_date: string;
}

export interface NetworthHistoricResponse {
  historic: {
    timeline: TimelineEntry[];
    variation: VariationWithRange | VariationWithoutRange;
    date_range: DateRangeWithRange | DateRangeWithoutRange;
    current_patrimony: number;
    pagination: {
      current_page: number;
      per_page: number;
      total_records: number;
      total_pages: number;
      current_page_records: number;
      has_next_page: boolean;
      has_previous_page: boolean;
    };
  };
}

export interface GetNetworthHistoricParams {
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
  order?: 'desc' | 'asc';
}

export async function getNetworthHistoric(
  token: string, 
  params: GetNetworthHistoricParams = {}
): Promise<NetworthHistoricResponse | null> {
  try {
    if (!token) {
      console.error('❌ getNetworthHistoric - No token provided');
      throw new Error('No hay token de autenticación disponible');
    }

    const queryParams = new URLSearchParams();
    
    queryParams.append('order', params.order || 'desc');
    
    if (params.start_date) {
      queryParams.append('start_date', params.start_date);
    }
    
    if (params.end_date) {
      queryParams.append('end_date', params.end_date);
    }
    
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }

    const url = `${config.apiBaseUrl}/api/v2/networth/historic${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ getNetworthHistoric - Authentication error');
        throw new Error('Token de autenticación inválido o expirado');
      }
      
      if (response.status === 404) {
        console.log('⚠️ getNetworthHistoric - No historic data available');
        return {
          historic: {
            timeline: [],
            variation: {
              vs_current: {
                absolute_change: 0,
                percentage_change: 0,
                trend: 'positive'
              }
            },
            date_range: {
              start_date: params.start_date || new Date().toISOString().split('T')[0],
              end_date: params.end_date || new Date().toISOString().split('T')[0]
            },
            current_patrimony: 0,
            pagination: {
              current_page: params.page || 1,
              per_page: params.per_page || 50,
              total_records: 0,
              total_pages: 1,
              current_page_records: 0,
              has_next_page: false,
              has_previous_page: false
            }
          }
        };
      }
      
      const errorText = await response.text();
      console.error('❌ getNetworthHistoric - API Error:', {
        status: response.status,
        error: errorText
      });
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: NetworthHistoricResponse = await response.json();
    

    
    if ('last_month_variation' in data.historic.variation) {
      console.log('📊 getNetworthHistoric - Last month variation:', 
        data.historic.variation.last_month_variation.percentage_change.toFixed(2) + '%'
      );
    }

    return data;

  } catch (error) {
    console.error('❌ getNetworthHistoric - Error:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      params
    });
    throw error;
  }
}