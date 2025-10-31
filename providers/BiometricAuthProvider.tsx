import React, { createContext, useContext, useState, useEffect } from 'react';
import { BiometricAuthService } from '@/services/auth/biometric-auth.service';
import { SecureStorageService } from '@/services/auth/secure-storage.service';
import type {
  BiometricAuthState,
  BiometricAuthContextType
} from '@/types/biometric';

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

  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    try {
      const capability = await BiometricAuthService.checkCapability();
      const isEnabled = await SecureStorageService.isBiometricEnabled();

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

    const result = await BiometricAuthService.authenticate(
      'Autentícate para acceder a Patrimore'
    );

    return result.success;
  };

  const checkBiometricCapability = async () => {
    await initializeBiometric();
  };

  return (
    <BiometricAuthContext.Provider
      value={{
        biometricState,
        enableBiometric,
        disableBiometric,
        authenticateWithBiometric,
        checkBiometricCapability,
      }}
    >
      {children}
    </BiometricAuthContext.Provider>
  );
};


