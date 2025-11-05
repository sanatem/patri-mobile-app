import config from '@/config/constants';

export interface RiskProfile {
  goal?: string;
  investment_withdrawal?: string;
  investment_knowledge?: string;
  previous_investments?: string;
  investment_choice?: string;
  investment_drop?: string;
  monthly_liquid_rent_in_millions?: string;
  saving_choice?: string;
  financial_profession_relationship?: string;
  assets_for_investment?: string;
}

export interface GetRiskProfileResponse {
  risk_profile: RiskProfile | null;
  success: boolean;
  message?: string;
}

export async function getRiskProfile(token: string): Promise<GetRiskProfileResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/risk_profile`;

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
        risk_profile: data.risk_profile || null,
        success: true,
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 404) {
      return {
        risk_profile: null,
        success: true,
        message: 'No risk profile found',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error fetching risk profile:', error);

    return {
      risk_profile: null,
      success: false,
      message: error instanceof Error ? error.message : 'Error fetching risk profile',
    };
  }
}
