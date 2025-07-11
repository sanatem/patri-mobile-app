
import config from '@/config/constants';

export interface TimelineEntry {
  date: string;
  value: number;
}

export interface VariationWithRange {
  vs_current: {
    absolute_change: number;
    percentage_change: number;
    trend: 'positive' | 'negative';
  };
}

export interface VariationWithoutRange {
  last_month_variation: {
    absolute_change: number;
    percentage_change: number;
    trend: 'positive' | 'negative';
    comparison_date: string;
    days_compared: number;
  };
}

export interface DateRangeWithRange {
  start_date: string;
  end_date: string;
}

export interface DateRangeWithoutRange {
  period: string;
}

export interface NetworthHistoricResponse {
  historic: {
    timeline: TimelineEntry[];
    variation: VariationWithRange | VariationWithoutRange;
    date_range: DateRangeWithRange | DateRangeWithoutRange;
    current_patrimony: number;
  };
}

export interface GetNetworthHistoricParams {
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}

export async function getNetworthHistoric(
  token: string, 
  params: GetNetworthHistoricParams = {}
): Promise<NetworthHistoricResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const queryParams = new URLSearchParams();
    
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

    console.log('📡 Fetching networth historic data from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }
      
      if (response.status === 404) {
        return null; // No hay datos históricos
      }
      
      if (response.status === 500) {
        throw new Error('Error interno del servidor');
      }
      
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: NetworthHistoricResponse = await response.json();
    
    console.log('✅ Networth historic data loaded successfully');
    console.log('📊 Timeline entries:', data.historic.timeline.length);
    console.log('📊 Current patrimony:', data.historic.current_patrimony.toLocaleString('es-CL'));
    
    // Log variation info
    if ('vs_current' in data.historic.variation) {
      console.log('📊 Variation vs current:', data.historic.variation.vs_current.percentage_change.toFixed(2) + '%');
    } else {
      console.log('📊 Last month variation:', data.historic.variation.last_month_variation.percentage_change.toFixed(2) + '%');
    }
    
    return data;

  } catch (error) {
    console.error('❌ Networth Historic Service: Error fetching historic data from API:', error);
    throw error;
  }
}