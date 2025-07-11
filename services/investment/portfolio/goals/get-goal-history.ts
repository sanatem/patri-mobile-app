import config from '@/config/constants';

interface ApiGoalHistoryResponse {
  goal_id: number;
  historic_goal_value: Array<{
    x: string;
    y: number;
  }>;
  pagination: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}

export interface GoalHistoryParams {
  goalId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

export interface GoalHistoryPoint {
  date: string;
  value: number;
}

export interface GoalHistoryData {
  goalId: number;
  historicValues: GoalHistoryPoint[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const transformApiGoalHistoryResponse = (apiData: ApiGoalHistoryResponse): GoalHistoryData => {
  return {
    goalId: apiData.goal_id,
    historicValues: apiData.historic_goal_value.map(point => ({
      date: point.x,
      value: point.y
    })),
    pagination: {
      currentPage: apiData.pagination.current_page,
      perPage: apiData.pagination.per_page,
      totalCount: apiData.pagination.total_count,
      totalPages: apiData.pagination.total_pages,
      hasNextPage: apiData.pagination.has_next_page,
      hasPrevPage: apiData.pagination.has_prev_page
    }
  };
};

export const goalHistoryService = {
  async getGoalHistory(params: GoalHistoryParams, token: string): Promise<GoalHistoryData> {
    try {
      console.log('🚀 goalHistoryService - Iniciando llamada con params:', {
        goalId: params.goalId,
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page,
        perPage: params.perPage
      });

      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      const queryParams = new URLSearchParams();
      
      if (params.startDate) {
        queryParams.append('start_date', params.startDate);
      }
      
      if (params.endDate) {
        queryParams.append('end_date', params.endDate);
      }
      
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      
      if (params.perPage) {
        queryParams.append('per_page', params.perPage.toString());
      }

      const queryString = queryParams.toString();
      const url = `${config.apiBaseUrl}/api/v2/goals/${params.goalId}/historic_value${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔗 goalHistoryService - URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 goalHistoryService - Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ goalHistoryService - Error response:', {
          status: response.status,
          errorText
        });
        
        if (response.status === 404) {
          throw new Error('Meta no encontrada');
        }
        
        if (response.status === 401) {
          throw new Error('Token de autenticación inválido o expirado');
        }
        
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data: ApiGoalHistoryResponse = await response.json();
      console.log('✅ goalHistoryService - Datos recibidos:', {
        goalId: data.goal_id,
        pointsCount: data.historic_goal_value.length,
        pagination: data.pagination
      });
      
      const transformedData = transformApiGoalHistoryResponse(data);
      
      return transformedData;

    } catch (error) {
      console.error('❌ goalHistoryService - Error completo:', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        params,
        isDev: __DEV__
      });
      
      if (__DEV__) {
        console.log('🔄 goalHistoryService - Retornando datos mock en desarrollo');
        const mockHistoryData: GoalHistoryData = {
          goalId: parseInt(params.goalId),
          historicValues: [
            { date: '2024-01-01', value: 100000 },
            { date: '2024-01-15', value: 150000 },
            { date: '2024-02-01', value: 175000 },
            { date: '2024-02-15', value: 200000 },
            { date: '2024-03-01', value: 225000 },
            { date: '2024-03-15', value: 250000 },
            { date: '2024-04-01', value: 275000 },
            { date: '2024-04-15', value: 300000 },
          ],
          pagination: {
            currentPage: 1,
            perPage: 30,
            totalCount: 8,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
          }
        };
        
        return mockHistoryData;
      }
      
      throw error;
    }
  }
}; 