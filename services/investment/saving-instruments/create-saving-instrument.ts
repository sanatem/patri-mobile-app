import config from '@/config/constants';

export interface BaseSavingInstrumentPayload {
  kind: string;
  name: string;
  total_amount: number;
  unit?: string;
  available_amount?: number;
  annual_return_rate?: number;
  comments?: string;
  bank_id?: number;
  broker_id?: number;
  apv_institution_id?: number;
  afp_institution_id?: number;
  crowdfunding_institution_id?: number;
  crowdfunding_credit_id?: string;
  period_return_rate?: number;
  due_date?: string;
  start_date?: string;
  end_date?: string;
  return_rate?: number;
  deposit_kind?: string;
  fund_kind?: 'investment' | 'mutual';
  fund_id?: string;
  fund_series_id?: string;
  guaranteed_capital?: number;
  monthly_return_rate?: number;
  tax_regime?: string;
  funds?: Record<string, { code: string; percentage: string }>;
}

export interface CreateSavingInstrumentRequest {
  saving_instrument: BaseSavingInstrumentPayload;
}

export interface CreateSavingInstrumentResponse {
  success: boolean;
  data?: any;
  message?: string;
  errors?: string[];
  error?: string;
}

export async function createSavingInstrument(
  data: CreateSavingInstrumentRequest,
  token: string
): Promise<CreateSavingInstrumentResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/saving_instruments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const text = await response.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch {}

    if (!response.ok) {
      return {
        success: false,
        error: json?.errors?.join(', ') || json?.message || `Error ${response.status}`,
      };
    }

    return { success: true, data: json, message: json?.message };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Error al crear instrumento' };
  }
}


