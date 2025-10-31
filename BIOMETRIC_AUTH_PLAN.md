# Plan de Implementación: Autenticación Biométrica (Passkey)

## 📋 Resumen Ejecutivo

Este documento detalla el plan completo para implementar autenticación biométrica como método alternativo de inicio de sesión rápido, complementando el sistema Auth0 existente.

---

## 🎯 Objetivos

- ✅ Permitir login rápido mediante Face ID/Touch ID/Huella digital
- ✅ Mantener Auth0 como sistema de autenticación principal
- ✅ Almacenar tokens de forma segura
- ✅ Implementar fallbacks robustos
- ✅ Experiencia de usuario fluida

---

## 🔍 Análisis del Sistema Actual

### Autenticación Existente
- **Provider**: Auth0 con múltiples métodos (Email/Password, Google, Apple)
- **Almacenamiento**: AsyncStorage para `auth_token` y `backend_user_data`
- **Validación**: Backend endpoint `/api/v2/auth/validate`
- **Token**: JWT almacenado en AsyncStorage (no seguro para biometría)

### Flujo Actual
1. Usuario inicia sesión con Auth0
2. Token se guarda en AsyncStorage
3. En app start, se verifica token existente
4. Si es válido, se restaura sesión automáticamente

### Problemas Identificados
- ❌ AsyncStorage NO es seguro para datos sensibles
- ❌ No hay re-autenticación periódica
- ❌ Falta validación de soporte biométrico

---

## 🏗️ Arquitectura de la Solución

### Componentes Principales

```
┌─────────────────────────────────────────────┐
│           App Initialization                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│   BiometricAuthProvider (Wrapper)          │
│   - Detecta soporte biométrico              │
│   - Gestiona estado de habilitación         │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴──────────┐
        ▼                    ▼
┌──────────────┐    ┌──────────────────┐
│ Auth0 Login  │    │ Biometric Login  │
│   (Primary)  │    │   (Secondary)    │
└──────────────┘    └──────────────────┘
        │                    │
        └─────────┬──────────┘
                  ▼
        ┌─────────────────────┐
        │   Secure Storage    │
        │  (expo-secure-store)│
        └─────────────────────┘
```

### Flujo de Autenticación Biométrica

```
1. App Start
   ├─> ¿Biometría habilitada?
   │   ├─> SÍ: Mostrar prompt biométrico
   │   │   ├─> Éxito: Restaurar sesión
   │   │   ├─> Fallo: Contador de intentos
   │   │   └─> Cancelar: Pantalla de login
   │   └─> NO: Login normal Auth0

2. Settings
   ├─> Toggle Biometría
   │   ├─> Validar soporte del dispositivo
   │   ├─> Prompt biométrico de confirmación
   │   └─> Guardar preferencia

3. Token Management
   ├─> Token válido: Usar directamente
   ├─> Token expirado: Forzar login Auth0
   └─> Token inválido: Limpiar y login
```

---

## 🔐 Seguridad

### Almacenamiento Seguro

**ANTES** (AsyncStorage - Inseguro)
```typescript
AsyncStorage.setItem('auth_token', token);
```

**DESPUÉS** (SecureStore - Seguro)
```typescript
import * as SecureStore from 'expo-secure-store';

// iOS: Keychain
// Android: EncryptedSharedPreferences
SecureStore.setItemAsync('secure_auth_token', token);
```

### Validaciones de Seguridad

1. **Verificar soporte biométrico**: Antes de habilitar la función
2. **Validar token**: Cada vez que se usa biometría
3. **Timeout**: Máximo 3 intentos fallidos
4. **Expiración**: Re-validar con backend si token > 7 días
5. **Cambios en biometría**: Deshabilitar si usuario modifica biometría del dispositivo

### Estrategia de Almacenamiento

```typescript
// Tokens en SecureStore
SecureStore: {
  'secure_auth_token',        // Token de Auth0
  'biometric_enabled',         // Boolean
  'biometric_enrollment_id'    // ID del enrollment biométrico
}

// Preferencias en AsyncStorage
AsyncStorage: {
  'biometric_preference',      // Usuario habilitó/deshabilitó
  'backend_user_data'          // Datos no sensibles
}
```

---

## 📦 Dependencias Necesarias

### Nuevas Dependencias

```json
{
  "dependencies": {
    "expo-local-authentication": "~15.0.8",
    "expo-secure-store": "~14.0.8"
  }
}
```

### Instalación

```bash
npx expo install expo-local-authentication expo-secure-store
```

---

## 📁 Estructura de Archivos

### Nuevos Archivos a Crear

```
/services/auth/
├── biometric-auth.service.ts      # Lógica principal de biometría
└── secure-storage.service.ts      # Wrapper para SecureStore

/providers/
└── BiometricAuthProvider.tsx      # Context provider

/hooks/auth/
├── useBiometricAuth.ts            # Hook principal
└── useBiometricCapability.ts      # Verificación de soporte

/components/auth/
├── BiometricPrompt.tsx            # UI del prompt biométrico
└── BiometricSetup.tsx             # Wizard de configuración

/types/
└── biometric.ts                   # Tipos TypeScript

/utils/auth/
└── biometric-validation.ts        # Validaciones y helpers
```

### Archivos a Modificar

```
/providers/AuthProvider.tsx        # Integrar biometría
/app/index.tsx                     # Verificar biometría en start
/app/auth/webview.tsx              # Opción de biometría post-login
/app/settings/settings.tsx         # Toggle de configuración
/locales/*.json                    # Traducciones
```

---

## 🔧 Implementación Detallada

### Fase 1: Infraestructura Base (2-3 horas)

#### 1.1 Servicio de Almacenamiento Seguro

**Archivo**: `/services/auth/secure-storage.service.ts`

```typescript
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

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
    }
  }

  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(this.KEYS.BIOMETRIC_ENABLED);
      return value === 'true';
    } catch (error) {
      return false;
    }
  }

  static async clearAll(): Promise<void> {
    await Promise.all([
      this.deleteAuthToken(),
      SecureStore.deleteItemAsync(this.KEYS.BIOMETRIC_ENABLED).catch(() => {}),
      SecureStore.deleteItemAsync(this.KEYS.ENROLLMENT_ID).catch(() => {}),
    ]);
  }
}
```

#### 1.2 Servicio de Autenticación Biométrica

**Archivo**: `/services/auth/biometric-auth.service.ts`

```typescript
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricCapability {
  isSupported: boolean;
  isEnrolled: boolean;
  biometricType: BiometricType;
  availableTypes: LocalAuthentication.AuthenticationType[];
}

export class BiometricAuthService {
  private static failedAttempts = 0;
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 30000; // 30 segundos
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

  static getBiometricName(type: BiometricType): string {
    switch (type) {
      case 'facial':
        return Platform.OS === 'ios' ? 'Face ID' : 'Reconocimiento facial';
      case 'fingerprint':
        return Platform.OS === 'ios' ? 'Touch ID' : 'Huella digital';
      case 'iris':
        return 'Reconocimiento de iris';
      default:
        return 'Biometría';
    }
  }

  static async authenticate(reason?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Verificar lockout
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

      // Manejar intentos fallidos
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
```

#### 1.3 Tipos TypeScript

**Archivo**: `/types/biometric.ts`

```typescript
export interface BiometricAuthState {
  isEnabled: boolean;
  isSupported: boolean;
  biometricType: 'fingerprint' | 'facial' | 'iris' | 'none';
  isLoading: boolean;
}

export interface BiometricAuthContextType {
  biometricState: BiometricAuthState;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  checkBiometricCapability: () => Promise<void>;
}

export interface BiometricSetupResult {
  success: boolean;
  error?: string;
}
```

---

### Fase 2: Provider y Context (2-3 horas)

#### 2.1 Biometric Auth Provider

**Archivo**: `/providers/BiometricAuthProvider.tsx`

```typescript
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
      // Verificar capacidad
      const capability = await BiometricAuthService.checkCapability();
      if (!capability.isSupported) {
        throw new Error('Biometría no soportada en este dispositivo');
      }

      // Autenticar para confirmar
      const authResult = await BiometricAuthService.authenticate(
        'Confirma tu identidad para habilitar el acceso biométrico'
      );

      if (!authResult.success) {
        throw new Error(authResult.error || 'Autenticación fallida');
      }

      // Guardar preferencia
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
```

---

### Fase 3: Integración con Auth Provider (3-4 horas)

#### 3.1 Modificar AuthProvider

**Archivo**: `/providers/AuthProvider.tsx`

**Cambios necesarios:**

1. **Importar servicios de biometría**
```typescript
import { SecureStorageService } from '@/services/auth/secure-storage.service';
import { BiometricAuthService } from '@/services/auth/biometric-auth.service';
```

2. **Nuevo método: `loginWithBiometric`**
```typescript
const loginWithBiometric = async (): Promise<boolean> => {
  setLoading(true);
  setError(null);

  try {
    // 1. Verificar que biometría esté habilitada
    const isBiometricEnabled = await SecureStorageService.isBiometricEnabled();
    if (!isBiometricEnabled) {
      throw new Error('Biometría no habilitada');
    }

    // 2. Autenticar con biometría
    const authResult = await BiometricAuthService.authenticate(
      'Autentícate para acceder a Patrimore'
    );

    if (!authResult.success) {
      throw new Error(authResult.error || 'Autenticación biométrica fallida');
    }

    // 3. Recuperar token seguro
    const token = await SecureStorageService.getAuthToken();
    if (!token) {
      throw new Error('No se encontró token almacenado');
    }

    // 4. Validar token con backend
    setAccessToken(token);
    const userInfo = await fetchUserInfo(token);

    try {
      const backendUser = await validateWithBackend(token);
      const completeUser: User = {
        ...userInfo,
        backendUserId: backendUser.user_id,
      };
      setUser(completeUser);
      return true;
    } catch (error) {
      // Token expirado o inválido
      await SecureStorageService.clearAll();
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
  } catch (error) {
    console.error('Biometric login error:', error);
    setError(error instanceof Error ? error.message : 'Error de autenticación biométrica');
    return false;
  } finally {
    setLoading(false);
  }
};
```

3. **Modificar `handleAuthResponse` para guardar en SecureStore**
```typescript
const handleAuthResponse = async (access_token: string): Promise<boolean> => {
  setError(null);
  try {
    // ... código existente ...

    // CAMBIO: También guardar en SecureStore si biometría está habilitada
    await AsyncStorage.setItem('auth_token', access_token);

    const isBiometricEnabled = await SecureStorageService.isBiometricEnabled();
    if (isBiometricEnabled) {
      await SecureStorageService.setAuthToken(access_token);
    }

    setAccessToken(access_token);
    // ... resto del código ...
  } catch (error) {
    // ... manejo de errores ...
  }
};
```

4. **Modificar `logout` para limpiar SecureStore**
```typescript
const logout = async () => {
  setLoading(true);
  try {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('backend_user_data');
    await SecureStorageService.clearAll(); // NUEVO

    // ... resto del código ...
  } catch (error) {
    throw error;
  } finally {
    setLoading(false);
  }
};
```

5. **Agregar al contexto**
```typescript
interface AuthContextType {
  // ... propiedades existentes ...
  loginWithBiometric: () => Promise<boolean>; // NUEVO
}

return (
  <AuthContext.Provider
    value={{
      // ... valores existentes ...
      loginWithBiometric, // NUEVO
    }}
  >
    {children}
  </AuthContext.Provider>
);
```

---

### Fase 4: UI Components (4-5 horas)

#### 4.1 Biometric Prompt Component

**Archivo**: `/components/auth/BiometricPrompt.tsx`

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Fingerprint, Scan } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui';

interface BiometricPromptProps {
  onBiometricAuth: () => void;
  onPasswordAuth: () => void;
  biometricType: 'fingerprint' | 'facial' | 'iris' | 'none';
  loading?: boolean;
}

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  onBiometricAuth,
  onPasswordAuth,
  biometricType,
  loading = false,
}) => {
  const getBiometricIcon = () => {
    if (biometricType === 'facial') {
      return <Scan size={64} color={Colors.primary[500]} />;
    }
    return <Fingerprint size={64} color={Colors.primary[500]} />;
  };

  const getBiometricText = () => {
    if (biometricType === 'facial') {
      return Platform.OS === 'ios' ? 'Face ID' : 'Reconocimiento facial';
    }
    return Platform.OS === 'ios' ? 'Touch ID' : 'Huella digital';
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {getBiometricIcon()}
      </View>

      <Text style={styles.title}>Bienvenido de vuelta</Text>
      <Text style={styles.subtitle}>
        Usa {getBiometricText()} para acceder rápidamente
      </Text>

      <View style={styles.buttonsContainer}>
        <Button
          onPress={onBiometricAuth}
          disabled={loading}
          style={styles.biometricButton}
        >
          Usar {getBiometricText()}
        </Button>

        <TouchableOpacity
          onPress={onPasswordAuth}
          disabled={loading}
          style={styles.passwordButton}
        >
          <Text style={styles.passwordButtonText}>Usar contraseña</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 32,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  biometricButton: {
    width: '100%',
  },
  passwordButton: {
    padding: 16,
    alignItems: 'center',
  },
  passwordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary[500],
  },
});
```

#### 4.2 Biometric Settings Toggle

**Archivo**: `/components/auth/BiometricSetup.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Fingerprint, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useBiometricAuth } from '@/providers/BiometricAuthProvider';
import { useTranslation } from 'react-i18next';

export const BiometricSetup: React.FC = () => {
  const { t } = useTranslation();
  const { biometricState, enableBiometric, disableBiometric } = useBiometricAuth();
  const [isToggling, setIsToggling] = useState(false);

  const getBiometricName = () => {
    if (biometricState.biometricType === 'facial') {
      return Platform.OS === 'ios' ? 'Face ID' : 'reconocimiento facial';
    }
    return Platform.OS === 'ios' ? 'Touch ID' : 'huella digital';
  };

  const handleToggle = async (value: boolean) => {
    if (isToggling) return;

    setIsToggling(true);

    try {
      if (value) {
        const success = await enableBiometric();
        if (!success) {
          Alert.alert(
            'Error',
            'No se pudo habilitar la autenticación biométrica. Por favor, intenta nuevamente.'
          );
        }
      } else {
        Alert.alert(
          'Deshabilitar autenticación biométrica',
          `¿Estás seguro de que deseas deshabilitar ${getBiometricName()}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Deshabilitar',
              style: 'destructive',
              onPress: async () => {
                await disableBiometric();
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Error al procesar la solicitud'
      );
    } finally {
      setIsToggling(false);
    }
  };

  if (!biometricState.isSupported) {
    return (
      <View style={styles.unsupportedContainer}>
        <AlertCircle size={20} color={Colors.gray[400]} />
        <Text style={styles.unsupportedText}>
          Tu dispositivo no soporta autenticación biométrica
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Fingerprint size={24} color={Colors.primary[500]} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Acceso rápido con {getBiometricName()}</Text>
        <Text style={styles.subtitle}>
          Inicia sesión rápidamente usando tu {getBiometricName()} en lugar de tu contraseña
        </Text>
      </View>
      <Switch
        value={biometricState.isEnabled}
        onValueChange={handleToggle}
        disabled={isToggling || biometricState.isLoading}
        trackColor={{
          false: Colors.gray[300],
          true: Colors.primary[500],
        }}
        thumbColor="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
  },
  unsupportedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    marginBottom: 16,
  },
  unsupportedText: {
    fontSize: 14,
    color: Colors.gray[600],
    marginLeft: 12,
    flex: 1,
  },
});
```

---

### Fase 5: Integración en Pantallas (3-4 horas)

#### 5.1 Modificar App Index (Pantalla Inicial)

**Archivo**: `/app/index.tsx`

```typescript
// Agregar al inicio del componente
const { biometricState, authenticateWithBiometric } = useBiometricAuth();
const { loginWithBiometric } = useAuth();
const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);

// Modificar useEffect para verificar biometría
useEffect(() => {
  const checkAuthAndBiometric = async () => {
    const token = await AsyncStorage.getItem('auth_token');
    const isBiometricEnabled = await SecureStorageService.isBiometricEnabled();

    if (token && isBiometricEnabled && biometricState.isSupported) {
      setShowBiometricPrompt(true);
    }
  };

  checkAuthAndBiometric();
}, [biometricState.isSupported]);

// Handler para autenticación biométrica
const handleBiometricLogin = async () => {
  try {
    const success = await loginWithBiometric();
    if (success) {
      router.replace('/(tabs)/patrimony');
    } else {
      // Falló, mostrar login normal
      setShowBiometricPrompt(false);
    }
  } catch (error) {
    Alert.alert('Error', 'Error al autenticar con biometría');
    setShowBiometricPrompt(false);
  }
};

// Renderizar BiometricPrompt si corresponde
if (showBiometricPrompt) {
  return (
    <BiometricPrompt
      onBiometricAuth={handleBiometricLogin}
      onPasswordAuth={() => setShowBiometricPrompt(false)}
      biometricType={biometricState.biometricType}
      loading={loading}
    />
  );
}
```

#### 5.2 Agregar a Settings

**Archivo**: `/app/settings/settings.tsx`

```typescript
// Agregar al menuItems array (después de "Preferences")
{
  id: '1.5',
  title: 'Autenticación biométrica',
  subtitle: 'Acceso rápido con Face ID o huella digital',
  icon: Fingerprint,
  onPress: () => {}, // Se renderiza inline
  customRender: () => <BiometricSetup />,
},

// Modificar renderMenuItem
const renderMenuItem = (item: any) => {
  if (item.customRender) {
    return <View key={item.id}>{item.customRender()}</View>;
  }

  return (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      {/* ... código existente ... */}
    </TouchableOpacity>
  );
};
```

---

### Fase 6: Traducciones (1 hora)

#### 6.1 Español (es.json)

```json
{
  "biometric": {
    "title": "Autenticación biométrica",
    "subtitle": "Acceso rápido y seguro",
    "enable": "Habilitar {{type}}",
    "disable": "Deshabilitar {{type}}",
    "faceId": "Face ID",
    "touchId": "Touch ID",
    "fingerprint": "Huella digital",
    "prompt": {
      "title": "Bienvenido de vuelta",
      "subtitle": "Usa {{type}} para acceder rápidamente",
      "authenticate": "Autentícate para continuar",
      "enable": "Confirma tu identidad para habilitar el acceso biométrico"
    },
    "errors": {
      "notSupported": "Tu dispositivo no soporta autenticación biométrica",
      "notEnrolled": "No tienes biometría configurada en tu dispositivo",
      "failed": "Autenticación fallida. Intenta nuevamente.",
      "canceled": "Autenticación cancelada",
      "lockout": "Demasiados intentos fallidos. Intenta nuevamente en {{seconds}} segundos.",
      "sessionExpired": "Sesión expirada. Por favor, inicia sesión nuevamente."
    },
    "setup": {
      "title": "Acceso rápido con {{type}}",
      "description": "Inicia sesión rápidamente usando tu {{type}} en lugar de tu contraseña",
      "confirm": "¿Estás seguro de que deseas deshabilitar {{type}}?"
    }
  }
}
```

#### 6.2 Inglés (en.json)

```json
{
  "biometric": {
    "title": "Biometric Authentication",
    "subtitle": "Quick and secure access",
    "enable": "Enable {{type}}",
    "disable": "Disable {{type}}",
    "faceId": "Face ID",
    "touchId": "Touch ID",
    "fingerprint": "Fingerprint",
    "prompt": {
      "title": "Welcome back",
      "subtitle": "Use {{type}} to access quickly",
      "authenticate": "Authenticate to continue",
      "enable": "Confirm your identity to enable biometric access"
    },
    "errors": {
      "notSupported": "Your device doesn't support biometric authentication",
      "notEnrolled": "You don't have biometrics configured on your device",
      "failed": "Authentication failed. Please try again.",
      "canceled": "Authentication canceled",
      "lockout": "Too many failed attempts. Try again in {{seconds}} seconds.",
      "sessionExpired": "Session expired. Please log in again."
    },
    "setup": {
      "title": "Quick access with {{type}}",
      "description": "Log in quickly using your {{type}} instead of your password",
      "confirm": "Are you sure you want to disable {{type}}?"
    }
  }
}
```

---

### Fase 7: Configuración y Testing (2-3 horas)

#### 7.1 Actualizar app.json

**Cambios necesarios:**

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSFaceIDUsageDescription": "Patrimore utiliza Face ID para permitirte acceder de forma rápida y segura a tu información financiera.",
        "NSBiometricUsageDescription": "Patrimore utiliza autenticación biométrica para permitirte acceder de forma rápida y segura a tu información financiera."
      }
    },
    "android": {
      "permissions": [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT"
      ]
    },
    "plugins": [
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Patrimore utiliza Face ID para permitirte acceder de forma rápida y segura a tu información financiera."
        }
      ]
    ]
  }
}
```

#### 7.2 Actualizar _layout.tsx Principal

**Archivo**: `/app/_layout.tsx`

```typescript
import { BiometricAuthProvider } from '@/providers/BiometricAuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <BiometricAuthProvider>
        {/* ... resto del código ... */}
      </BiometricAuthProvider>
    </AuthProvider>
  );
}
```

---

## 🧪 Plan de Testing

### Tests Manuales

#### 1. **Configuración Inicial**
- [ ] Instalar app en dispositivo físico con biometría
- [ ] Verificar que toggle aparece en Settings
- [ ] Habilitar biometría - debe solicitar autenticación
- [ ] Verificar que se guarda la preferencia

#### 2. **Flujo de Login con Biometría**
- [ ] Cerrar sesión completamente
- [ ] Reabrir app - debe mostrar BiometricPrompt
- [ ] Autenticar exitosamente - debe entrar a la app
- [ ] Intentar autenticación fallida 3 veces - debe bloquear
- [ ] Esperar timeout y reintentar

#### 3. **Fallbacks**
- [ ] En BiometricPrompt, presionar "Usar contraseña"
- [ ] Debe mostrar pantalla de login normal
- [ ] Login con Auth0 debe funcionar normalmente

#### 4. **Deshabilitación**
- [ ] Deshabilitar biometría desde Settings
- [ ] Cerrar sesión y reabrir app
- [ ] No debe mostrar BiometricPrompt

#### 5. **Edge Cases**
- [ ] Token expirado - debe forzar login Auth0
- [ ] Usuario elimina biometría del dispositivo
- [ ] App en background por > 5 minutos
- [ ] Cambio de usuario

### Tests por Plataforma

#### iOS
- [ ] Face ID funciona correctamente
- [ ] Touch ID funciona (en dispositivos soportados)
- [ ] Permisos solicitados correctamente
- [ ] Keychain almacena datos seguros

#### Android
- [ ] Huella digital funciona
- [ ] Reconocimiento facial funciona (si disponible)
- [ ] EncryptedSharedPreferences funciona
- [ ] Permisos solicitados correctamente

---

## 📊 Criterios de Éxito

### Funcionalidad
- ✅ Login biométrico funciona en iOS y Android
- ✅ Toggle en Settings funciona correctamente
- ✅ Fallback a contraseña disponible
- ✅ Manejo correcto de errores
- ✅ Traducciones completas

### Seguridad
- ✅ Token almacenado en SecureStore
- ✅ Máximo 3 intentos fallidos con timeout
- ✅ Token expirado re-autenticaTiene con Auth0
- ✅ Limpieza correcta en logout

### UX
- ✅ Prompts nativos del sistema
- ✅ Mensajes claros en español
- ✅ Animaciones fluidas
- ✅ Loading states apropiados

---

## 🚀 Plan de Despliegue

### Pre-deployment Checklist
1. [ ] Todas las traducciones agregadas
2. [ ] Tests manuales completados
3. [ ] app.json actualizado con permisos
4. [ ] Documentación actualizada
5. [ ] Review de código completado

### Deployment Steps
1. Instalar dependencias
```bash
npx expo install expo-local-authentication expo-secure-store
```

2. Actualizar app.json con permisos

3. Crear todos los archivos nuevos según estructura

4. Modificar archivos existentes

5. Build de desarrollo
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

6. Testing en dispositivos físicos

7. Build de producción (cuando esté probado)
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

---

## 📝 Consideraciones Adicionales

### Migración de Usuarios Existentes
- Usuarios actuales NO tendrán biometría habilitada por defecto
- Deben habilitarla manualmente desde Settings
- AsyncStorage auth_token se mantiene como fallback

### Mantenimiento
- Monitorear logs de autenticación biométrica
- Tracking de adoption rate del feature
- Feedback de usuarios sobre la experiencia

### Futuras Mejoras
- [ ] Soporte para múltiples usuarios en mismo dispositivo
- [ ] Biometría para acciones sensibles (transferencias, etc.)
- [ ] Configuración de timeout personalizable
- [ ] Analytics de uso de biometría

---

## ⏱️ Estimación de Tiempo Total

| Fase | Tiempo Estimado | Descripción |
|------|----------------|-------------|
| Fase 1 | 2-3 horas | Infraestructura base (servicios) |
| Fase 2 | 2-3 horas | Provider y Context |
| Fase 3 | 3-4 horas | Integración con Auth Provider |
| Fase 4 | 4-5 horas | UI Components |
| Fase 5 | 3-4 horas | Integración en pantallas |
| Fase 6 | 1 hora | Traducciones |
| Fase 7 | 2-3 horas | Configuración y Testing |
| **TOTAL** | **17-23 horas** | **~3 días de trabajo** |

---

## 🎯 Conclusión

Este plan proporciona una implementación completa y segura de autenticación biométrica para la app Patrimore, cumpliendo con todos los criterios de aceptación y mejores prácticas de seguridad móvil.

La implementación es modular, mantenible y escalable para futuras mejoras.




