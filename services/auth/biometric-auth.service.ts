import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import type { BiometricType, BiometricCapability } from '@/types/biometric';

export class BiometricAuthService {
  private static failedAttempts = 0;
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 30000;
  private static lockoutUntil: number = 0;

  static async checkCapability(): Promise<BiometricCapability> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const availableTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: BiometricType = 'none';

      if (availableTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'facial';
      } else if (availableTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'fingerprint';
      } else if (availableTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'iris';
      }

      return {
        isSupported: compatible && enrolled,
        isEnrolled: enrolled,
        biometricType,
        availableTypes,
      };
    } catch (error) {
      console.error('Error checking biometric capability:', error);
      return {
        isSupported: false,
        isEnrolled: false,
        biometricType: 'none',
        availableTypes: [],
      };
    }
  }


  static async authenticate(reason?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (Date.now() < this.lockoutUntil) {
      const remainingSeconds = Math.ceil((this.lockoutUntil - Date.now()) / 1000);
      return {
        success: false,
        error: `Demasiados intentos fallidos. Intenta nuevamente en ${remainingSeconds} segundos.`,
      };
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason || 'Autentícate para continuar',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar contraseña',
        disableDeviceFallback: false,
      });

      if (result.success) {
        this.failedAttempts = 0;
        return { success: true };
      }

      this.failedAttempts++;

      if (this.failedAttempts >= this.MAX_ATTEMPTS) {
        this.lockoutUntil = Date.now() + this.LOCKOUT_DURATION;
        return {
          success: false,
          error: 'Demasiados intentos fallidos. Intenta nuevamente en 30 segundos.',
        };
      }

      return {
        success: false,
        error: result.error === 'user_cancel'
          ? 'Autenticación cancelada'
          : 'Autenticación fallida. Intenta nuevamente.',
      };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'Error al procesar la autenticación biométrica',
      };
    }
  }

  static resetFailedAttempts(): void {
    this.failedAttempts = 0;
    this.lockoutUntil = 0;
  }

  static getFailedAttempts(): number {
    return this.failedAttempts;
  }
}


