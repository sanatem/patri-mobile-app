export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricAuthState {
  isEnabled: boolean;
  isSupported: boolean;
  biometricType: BiometricType;
  isLoading: boolean;
}

export interface BiometricAuthContextType {
  biometricState: BiometricAuthState;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  checkBiometricCapability: () => Promise<void>;
  canUseBiometric: () => Promise<boolean>;
  getRemainingLockoutTime: () => number;
  clearFailedAttempts: () => Promise<void>;
}

export interface BiometricSetupResult {
  success: boolean;
  error?: string;
}

export interface BiometricCapability {
  isSupported: boolean;
  isEnrolled: boolean;
  biometricType: BiometricType;
  availableTypes: number[];
}


