import * as SecureStore from 'expo-secure-store';

export class SecureStorageService {
  private static readonly KEYS = {
    AUTH_TOKEN: 'secure_auth_token',
    BIOMETRIC_ENABLED: 'biometric_enabled',
    ENROLLMENT_ID: 'biometric_enrollment_id',
    FAILED_ATTEMPTS: 'biometric_failed_attempts',
    LOCKOUT_END_TIME: 'biometric_lockout_end_time',
    TOKEN_STORED_AT: 'token_stored_at',
  };

  static async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.KEYS.AUTH_TOKEN, token);
      // Store timestamp when token was saved
      await SecureStore.setItemAsync(this.KEYS.TOKEN_STORED_AT, Date.now().toString());
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
        SecureStore.deleteItemAsync(this.KEYS.FAILED_ATTEMPTS).catch(() => { }),
        SecureStore.deleteItemAsync(this.KEYS.LOCKOUT_END_TIME).catch(() => { }),
        SecureStore.deleteItemAsync(this.KEYS.TOKEN_STORED_AT).catch(() => { }),
      ]);
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  }

  // Failed attempts management
  static async setFailedAttempts(attempts: number): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.KEYS.FAILED_ATTEMPTS, attempts.toString());
    } catch (error) {
      console.error('Error storing failed attempts:', error);
    }
  }

  static async getFailedAttempts(): Promise<number> {
    try {
      const value = await SecureStore.getItemAsync(this.KEYS.FAILED_ATTEMPTS);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      console.error('Error retrieving failed attempts:', error);
      return 0;
    }
  }

  static async clearFailedAttempts(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.KEYS.FAILED_ATTEMPTS);
      await SecureStore.deleteItemAsync(this.KEYS.LOCKOUT_END_TIME);
    } catch (error) {
      console.error('Error clearing failed attempts:', error);
    }
  }

  // Lockout time management
  static async setLockoutEndTime(timestamp: number): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.KEYS.LOCKOUT_END_TIME, timestamp.toString());
    } catch (error) {
      console.error('Error storing lockout end time:', error);
    }
  }

  static async getLockoutEndTime(): Promise<number | null> {
    try {
      const value = await SecureStore.getItemAsync(this.KEYS.LOCKOUT_END_TIME);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error('Error retrieving lockout end time:', error);
      return null;
    }
  }

  // Token expiration check
  static async getTokenStoredAt(): Promise<number | null> {
    try {
      const value = await SecureStore.getItemAsync(this.KEYS.TOKEN_STORED_AT);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error('Error retrieving token stored timestamp:', error);
      return null;
    }
  }

  static async isTokenExpired(maxAgeInDays: number = 30): Promise<boolean> {
    try {
      const storedAt = await this.getTokenStoredAt();
      if (!storedAt) return true;

      const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;
      return Date.now() - storedAt > maxAge;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}



