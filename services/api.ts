import config from '@/config/constants';
import { router } from 'expo-router';
import { SecureStorageService } from '@/services/auth/secure-storage.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Global handler for 401 errors
let is401Handling = false;

const handle401Error = async () => {
  // Prevent multiple simultaneous 401 handlers
  if (is401Handling) return;

  is401Handling = true;

  try {
    // Clear all auth data
    await SecureStorageService.clearAll();
    await SecureStorageService.setBiometricEnabled(false);
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('backend_user_data');

    // Show message
    Alert.alert(
      'Sesión expirada',
      'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to home
            router.replace('/');
          }
        }
      ]
    );
  } catch (error) {
    console.error('Error handling 401:', error);
    // Force navigation to home even if cleanup fails
    router.replace('/');
  } finally {
    is401Handling = false;
  }
};

export class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = config.apiBaseUrl || '';
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
    };

    if (this.accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      await handle401Error();
      throw new Error('Sesión expirada');
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error ${response.status}: ${error}`);
    }

    return response.json();
  }

  // GET request
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiService = new ApiService();

// Export the 401 handler for use in other services if needed
export { handle401Error };

/**
 * Note: Many services in this codebase still use direct fetch calls and check for 401 status.
 * They should gradually migrate to use this ApiService class which handles 401 globally.
 * In the meantime, they can import and use the handle401Error function directly:
 *
 * import { handle401Error } from '@/services/api';
 *
 * if (response.status === 401) {
 *   await handle401Error();
 *   throw new Error('Token de autenticación inválido o expirado');
 * }
 */
