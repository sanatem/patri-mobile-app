import config from '@/config/constants';

export interface SavingInstrumentActable {
  bank_id?: number;
  bank_name?: string;
  broker_id?: number;
  broker_name?: string;
  afp_institution_id?: number;
  afp_institution_name?: string;
  apv_institution_id?: number;
  apv_institution_name?: string;
  crowdfunding_institution_id?: number;
  crowdfunding_institution_name?: string;
  crowdfunding_credit_id?: number;
  crowdfunding_credit_name?: string;
  due_date?: string;
  period_return_rate?: number | null;
  start_date?: string;
  end_date?: string;
  deposit_kind?: string;
  return_rate?: number | null;
  tax_regime?: string;
  funds?: Record<string, number>;
  fund_id?: number;
  fund_kind?: 'investment' | 'mutual';
  fund_series_id?: number;
  mutual_fund_manager_id?: number;
  mutual_fund_manager_name?: string;
  mutual_fund_id?: number;
  mutual_fund_name?: string;
  mutual_fund_rent_kind?: 'fixed' | 'variable' | 'mutual';
  mutual_fund_asset_class?: 'mutual' | 'investment';
  mutual_fund_series_id?: number;
  mutual_fund_series_name?: string;
  mutual_fund_series_initial_quote?: number;
  investment_fund_id?: number;
  investment_fund_name?: string;
  investment_fund_name_id?: number;
  investment_fund_run?: string;
  investment_fund_series_id?: number;
  investment_fund_series_name?: string;
  comments?: string;
}

export interface SavingInstrumentDetail {
  id: number;
  name: string;
  type: string;
  kind: string;
  total_amount: number;
  available_amount: number;
  annual_return_rate: number;
  unit: string;
  comments: string;
  created_at: string;
  updated_at: string;
  actable: SavingInstrumentActable;
}

export interface SavingInstrumentDetailResponse {
  success: boolean;
  data: SavingInstrumentDetail;
}

export async function getSavingInstrumentDetail(token: string, id: number): Promise<SavingInstrumentDetail | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/saving_instruments/${id}`;

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
        return null;
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const apiResponse: SavingInstrumentDetailResponse = await response.json();
    return apiResponse.data;

  } catch (error) {
    console.error('❌ Saving Instrument Detail Service: Error fetching saving instrument detail from API:', error);
    throw error;
  }
}
