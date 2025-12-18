import config from '@/config/constants';
import type {
  UserResponse,
  UpdateSecuritySettingsRequest,
  UpdateSecuritySettingsResponse,
} from '@/types/security';

// Feature flag: set to false when backend is ready
const USE_MOCK_DATA = false;

// Mock data for user response
const MOCK_USER_RESPONSE: UserResponse = {
  user: {
    notification_preferences: {
      security_alerts: false,
      marketing_emails: false,
      product_updates: true,
    },
  },
};

/**
 * Mock delay to simulate API call
 */
const mockDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get user's notification preferences (including security alerts toggle state)
 * Backend endpoint: GET /api/v2/user
 * Returns user.notification_preferences.security_alerts for the toggle
 */
export const getSecurityAlertStatus = async (token: string): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    console.log('🔐 Using mock security alert status');
    await mockDelay(500);
    return MOCK_USER_RESPONSE.user.notification_preferences.security_alerts;
  }

  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/user`;

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

    const data: UserResponse = await response.json();
    return data.user.notification_preferences?.security_alerts ?? false;
  } catch (error) {
    console.error('Error fetching user security alert status:', error);
    throw error;
  }
};

/**
 * Update security notification settings
 * Backend endpoint: PATCH /api/v2/user
 * 
 * @throws {Error} 422 - Invalid value provided
 */
export const updateSecuritySettings = async (
  token: string,
  enabled: boolean
): Promise<UpdateSecuritySettingsResponse> => {
  if (USE_MOCK_DATA) {
    console.log('🔐 Mock updating security notifications:', enabled);
    await mockDelay(300);
    
    // Update mock data
    MOCK_USER_RESPONSE.user.notification_preferences.security_alerts = enabled;
    
    return {
      success: true,
      message: 'Preferencias actualizadas exitosamente',
      user: {
        notification_preferences: {
          security_alerts: enabled,
          marketing_emails: false,
          product_updates: true,
        },
      },
    };
  }

  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/user`;
    const requestBody: UpdateSecuritySettingsRequest = {
      notification_preferences: {
        security_alerts: enabled,
      },
    };

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }
      if (response.status === 422) {
        throw new Error('Valor inválido proporcionado');
      }
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: UpdateSecuritySettingsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating security settings:', error);
    throw error;
  }
};
