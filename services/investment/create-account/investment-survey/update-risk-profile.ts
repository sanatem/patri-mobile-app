import config from '@/config/constants';

export interface RiskProfileUpdateData {
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

export interface UpdateRiskProfileRequest {
  risk_profile: RiskProfileUpdateData;
}

export interface UpdateRiskProfileResponse {
  risk_profile?: RiskProfileUpdateData;
  success: boolean;
  message?: string;
  errors?: string[];
}

export async function updateRiskProfile(
  token: string,
  riskProfileData: RiskProfileUpdateData
): Promise<UpdateRiskProfileResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/risk_profile`;

    const requestBody: UpdateRiskProfileRequest = {
      risk_profile: riskProfileData,
    };

    const response = await fetch(url, {
      method: 'PATCH',
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
        message: 'Risk profile updated successfully',
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

    if (response.status === 404) {
      return {
        success: false,
        message: 'Risk profile not found',
      };
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.error('Error updating risk profile:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error updating risk profile',
    };
  }
}
