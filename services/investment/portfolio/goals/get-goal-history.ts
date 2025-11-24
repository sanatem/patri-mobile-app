import config from '@/config/constants';

interface ApiGoalHistoryResponse {
  goal_id?: number;
  historic_goal_value: Array<{
    x: string;
    y: number;
  }>;
  pagination?: {
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

const transformApiGoalHistoryResponse = (apiData: ApiGoalHistoryResponse & { goal_id: number }): GoalHistoryData => {
  const historicValues = Array.isArray(apiData.historic_goal_value)
    ? apiData.historic_goal_value.map(point => ({
        date: point.x,
        value: point.y
      }))
    : [];

  return {
    goalId: apiData.goal_id || 0,
    historicValues,
    pagination: {
      currentPage: apiData.pagination?.current_page || 1,
      perPage: apiData.pagination?.per_page || 30,
      totalCount: apiData.pagination?.total_count || historicValues.length,
      totalPages: apiData.pagination?.total_pages || 1,
      hasNextPage: apiData.pagination?.has_next_page || false,
      hasPrevPage: apiData.pagination?.has_prev_page || false
    }
  };
};

export const goalHistoryService = {
  async getGoalHistory(params: GoalHistoryParams, token: string): Promise<GoalHistoryData> {
    try {

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

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('goalHistoryService - Error response:', {
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

      const responseData = await response.json();

      // La respuesta tiene la estructura: { success: true, data: { goal_id: ..., historic_goal_value: [...], pagination: {...} } }
      const data: ApiGoalHistoryResponse = responseData.data || responseData;

      console.log('goalHistoryService - Response data:', JSON.stringify(data, null, 2));

      if (!data.historic_goal_value) {
        console.error('goalHistoryService - Invalid data structure:', data);
        throw new Error('Estructura de datos inválida en la respuesta');
      }

      // Usar goal_id de la respuesta o del parámetro
      const goalIdNumber = data.goal_id || parseInt(params.goalId, 10);
      const transformedData = transformApiGoalHistoryResponse({ ...data, goal_id: goalIdNumber });

      return transformedData;

    } catch (error) {
      console.error('goalHistoryService - Error completo:', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        params,
        isDev: __DEV__
      });
      
      throw error;
    }
  }
}; 