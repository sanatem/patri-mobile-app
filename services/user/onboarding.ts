import config from '@/config/constants';

export interface OnboardingPersonalInformation {
  first_name: string;
  last_name: string;
  rut: string;
  birth_date: string;
  monthly_incomes: string;
  residence_country: string;
}

export interface OnboardingRequest {
  personal_information: OnboardingPersonalInformation;
}

export interface OnboardingResponse {
  success: boolean;
  message?: string;
}

export async function submitOnboarding(
  token: string, 
  onboardingData: OnboardingRequest
): Promise<OnboardingResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/user/personal_information`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(onboardingData),
    });

    if (!response.ok) {
      let errorMessage = '';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || 'Error desconocido del servidor';
      } catch (parseError) {
        const errorText = await response.text();
        errorMessage = `Error ${response.status}: ${errorText}`;
      }

      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }
      
      if (response.status === 400) {
        throw new Error(`Datos inválidos: ${errorMessage}`);
      }
      
      if (response.status === 500) {
        throw new Error(`Error interno del servidor: ${errorMessage}`);
      }
      
      throw new Error(`Error del servidor (${response.status}): ${errorMessage}`);
    }

    const data: OnboardingResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Onboarding Service: Error submitting onboarding data:', error);
    throw error;
  }
} 