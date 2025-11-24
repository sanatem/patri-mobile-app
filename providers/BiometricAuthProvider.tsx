import React, { createContext, useContext, useState, useEffect } from 'react';
import { BiometricAuthService } from '@/services/auth/biometric-auth.service';
import { SecureStorageService } from '@/services/auth/secure-storage.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  BiometricAuthState,
  BiometricAuthContextType
} from '@/types/biometric';

const BIOMETRIC_LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
const MAX_ATTEMPTS = 3;

const BiometricAuthContext = createContext<BiometricAuthContextType | undefined>(
  undefined
);

export const useBiometricAuth = () => {
  const context = useContext(BiometricAuthContext);
  if (!context) {
    throw new Error('useBiometricAuth must be used within BiometricAuthProvider');
  }
  return context;
};

export const BiometricAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [biometricState, setBiometricState] = useState<BiometricAuthState>({
    isEnabled: false,
    isSupported: false,
    biometricType: 'none',
    isLoading: true,
  });
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);

  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    try {
      const capability = await BiometricAuthService.checkCapability();
      const isEnabled = await SecureStorageService.isBiometricEnabled();

      // Load failed attempts and lockout time
      const storedAttempts = await SecureStorageService.getFailedAttempts();
      const storedLockoutTime = await SecureStorageService.getLockoutEndTime();

      if (storedAttempts) {
        setFailedAttempts(storedAttempts);
      }

      if (storedLockoutTime && Date.now() < storedLockoutTime) {
        setLockoutEndTime(storedLockoutTime);
      }

      setBiometricState({
        isSupported: capability.isSupported,
        isEnabled: isEnabled && capability.isSupported,
        biometricType: capability.biometricType,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error initializing biometric:', error);
      setBiometricState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const enableBiometric = async (): Promise<boolean> => {
    try {
      const capability = await BiometricAuthService.checkCapability();
      if (!capability.isSupported) {
        throw new Error('Biometría no soportada en este dispositivo');
      }

      const authResult = await BiometricAuthService.authenticate(
        'Confirma tu identidad para habilitar el acceso biométrico'
      );

      if (!authResult.success) {
        throw new Error(authResult.error || 'Autenticación fallida');
      }

      // Get current auth token from AsyncStorage and store it in SecureStorage
      const currentToken = await AsyncStorage.getItem('auth_token');
      if (currentToken) {
        await SecureStorageService.setAuthToken(currentToken);
      } else {
        throw new Error('No hay sesión activa. Por favor, inicia sesión primero.');
      }

      await SecureStorageService.setBiometricEnabled(true);

      setBiometricState((prev) => ({
        ...prev,
        isEnabled: true,
      }));

      return true;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    }
  };

  const disableBiometric = async (): Promise<void> => {
    try {
      await SecureStorageService.setBiometricEnabled(false);
      // Clear the auth token from SecureStorage when disabling biometric
      await SecureStorageService.clearAll();

      setBiometricState((prev) => ({
        ...prev,
        isEnabled: false,
      }));
    } catch (error) {
      console.error('Error disabling biometric:', error);
      throw error;
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    if (!biometricState.isEnabled || !biometricState.isSupported) {
      return false;
    }

    // Check lockout
    if (lockoutEndTime && Date.now() < lockoutEndTime) {
      return false;
    }

    const result = await BiometricAuthService.authenticate(
      'Autentícate para acceder a Patrimore'
    );

    if (result.success) {
      // Clear failed attempts on success
      await clearFailedAttempts();
      return true;
    } else {
      // Increment failed attempts
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      await SecureStorageService.setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = Date.now() + BIOMETRIC_LOCKOUT_TIME;
        setLockoutEndTime(lockoutTime);
        await SecureStorageService.setLockoutEndTime(lockoutTime);
      }

      return false;
    }
  };

  const checkBiometricCapability = async () => {
    await initializeBiometric();
  };

  const canUseBiometric = async (): Promise<boolean> => {
    if (!biometricState.isEnabled || !biometricState.isSupported) {
      return false;
    }

    // Check lockout
    if (lockoutEndTime && Date.now() < lockoutEndTime) {
      return false;
    }

    // Check if we have a stored token
    const hasToken = await SecureStorageService.getAuthToken();
    return !!hasToken;
  };

  const getRemainingLockoutTime = (): number => {
    if (!lockoutEndTime || Date.now() >= lockoutEndTime) {
      return 0;
    }
    return Math.ceil((lockoutEndTime - Date.now()) / 1000); // Return seconds
  };

  const clearFailedAttempts = async (): Promise<void> => {
    setFailedAttempts(0);
    setLockoutEndTime(null);
    await SecureStorageService.clearFailedAttempts();
  };

  return (
    <BiometricAuthContext.Provider
      value={{
        biometricState,
        enableBiometric,
        disableBiometric,
        authenticateWithBiometric,
        checkBiometricCapability,
        canUseBiometric,
        getRemainingLockoutTime,
        clearFailedAttempts,
      }}
    >
      {children}
    </BiometricAuthContext.Provider>
  );
};


