import config from '@/config/constants';

export interface LinkedBudget {
  id: number;
  category_name: string;
  category_emoji: string;
  amount: number;
}

export interface IncomeSource {
  id: number;
  name: string;
  display_name: string;
  emoji_code: string;
  total_income: number;
  allocated: number;
  available: number;
  linked_budgets_count: number;
  linked_budgets: LinkedBudget[];
}

export interface GetIncomeSourcesResponse {
  success: boolean;
  data: {
    income_sources: IncomeSource[];
    period: {
      start_date: string;
      end_date: string;
    };
  };
}

export interface GetIncomeSourcesParams {
  start_date?: string;
  end_date?: string;
}

/**
 * Obtiene las fuentes de ingreso con saldo disponible
 * GET /api/v2/user_categories/income_sources
 *
 * @param params.start_date - Fecha inicio del período (YYYY-MM-DD)
 * @param params.end_date - Fecha fin del período (YYYY-MM-DD)
 */
export async function getIncomeSources(
  params: GetIncomeSourcesParams,
  token: string
): Promise<GetIncomeSourcesResponse> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const urlParams = new URLSearchParams();

    if (params.start_date) {
      urlParams.append('start_date', params.start_date);
    }
    if (params.end_date) {
      urlParams.append('end_date', params.end_date);
    }

    const queryString = urlParams.toString();
    const url = `${config.apiBaseUrl}/api/v2/user_categories/income_sources${queryString ? `?${queryString}` : ''}`;

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

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: GetIncomeSourcesResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Income Sources Service: Error fetching income sources:', error);
    throw error;
  }
}
