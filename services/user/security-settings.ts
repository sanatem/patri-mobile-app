import config from '@/config/constants';
import type {
  UserResponse,
  UpdateSecuritySettingsRequest,
  UpdateSecuritySettingsResponse,
} from '@/types/security';

/**
 * Get user's notification preferences (including security alerts toggle state)
 * Backend endpoint: GET /api/v2/user
 * Returns user.notification_preferences.security_alerts for the toggle
 */
export const getSecurityAlertStatus = async (token: string): Promise<boolean> => {
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
