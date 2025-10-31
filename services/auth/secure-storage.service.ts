import * as SecureStore from 'expo-secure-store';

export class SecureStorageService {
  private static readonly KEYS = {
    AUTH_TOKEN: 'secure_auth_token',
    BIOMETRIC_ENABLED: 'biometric_enabled',
    ENROLLMENT_ID: 'biometric_enrollment_id',
  };

  static async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing auth token:', error);
      throw new Error('No se pudo almacenar el token de forma segura');
    }
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }

  static async deleteAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error deleting auth token:', error);
    }
  }

  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        this.KEYS.BIOMETRIC_ENABLED,
        enabled.toString()
      );
    } catch (error) {
      console.error('Error storing biometric preference:', error);
      throw error;
    }
  }

  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(this.KEYS.BIOMETRIC_ENABLED);
      return value === 'true';
    } catch (error) {
      console.error('Error checking biometric preference:', error);
      return false;
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.deleteAuthToken(),
        SecureStore.deleteItemAsync(this.KEYS.BIOMETRIC_ENABLED).catch(() => { }),
        SecureStore.deleteItemAsync(this.KEYS.ENROLLMENT_ID).catch(() => { }),
      ]);
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  }
}



