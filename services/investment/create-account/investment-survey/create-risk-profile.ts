import config from '@/config/constants';

export interface RiskProfileData {
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

export interface CreateRiskProfileRequest {
  risk_profile: RiskProfileData;
}

export interface CreateRiskProfileResponse {
  risk_profile?: RiskProfileData;
  success: boolean;
  message?: string;
  errors?: string[];
}

export async function createRiskProfile(
  token: string,
  riskProfileData: RiskProfileData
): Promise<CreateRiskProfileResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/risk_profile`;

    const requestBody: CreateRiskProfileRequest = {
      risk_profile: riskProfileData,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        risk_profile: data.risk_profile,
        success: true,
        message: 'Risk profile created successfully',
      };
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Invalid token');
    }

    if (response.status === 422) {
      return {
        success: false,
        message: 'Validation error',
        errors: data.errors || ['Invalid data provided'],
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error creating risk profile:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error creating risk profile',
    };
  }
}
