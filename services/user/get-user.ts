// services/user/get-user.ts
import config from '@/config/constants';

export interface PersonalInformation {
  first_name: string;
  last_name: string;
  full_name: string;
  rut: string;
  birth_date: string;
  gender: string;
  sex: string;
  marital_status: string;
  conjugal_regime: string;
  employment_situation: string;
  monthly_incomes: number;
  residence_country: string;
}

export interface ContactInformation {
  address: string;
  floor_number: string;
  phones: string[];
  location_data: Record<string, any>;
}

export interface Advisor {
  id: number;
  advisor_name: string;
  email: string;
  phone: string;
  description: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
  currency: string;
  language: string;
  have_investment_account: boolean;
  investment_account: string;
  plan: string;
  created_at: string;
  updated_at: string;
  personal_information: PersonalInformation;
  contact_information: ContactInformation;
  advisor: Advisor;
}

export interface UserResponse {
  user: User;
}

export async function getUserData(token: string): Promise<UserResponse | null> {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/user`;

    console.log('📡 Fetching user data from:', url);

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
      
      if (response.status === 500) {
        throw new Error('Error interno del servidor');
      }
      
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: UserResponse = await response.json();
    
    console.log('✅ User data loaded successfully');
    console.log('👤 User:', data.user.personal_information.full_name);
    console.log('👨‍💼 Advisor:', data.user.advisor.advisor_name);
    
    return data;

  } catch (error) {
    console.error('❌ User Service: Error fetching user data from API:', error);
    throw error;
  }
}