import React, { createContext, useContext, useState, useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { makeRedirectUri } from 'expo-auth-session';
import { router } from 'expo-router';
import { auth0Config } from '@/config/auth0.config';
import config from '@/config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import { SecureStorageService } from '@/services/auth/secure-storage.service';
import { BiometricAuthService } from '@/services/auth/biometric-auth.service';
import { getDeviceInfo, requestPushPermissions, setOneSignalExternalUserId } from '@/utils/device-info';

WebBrowser.maybeCompleteAuthSession();


const initializeRevenueCat = async (backendUserId: number, email?: string) => {
  try {
    const isConfigured = await Purchases.isConfigured();

    if (isConfigured) {
      await Purchases.logIn(backendUserId.toString());
      if (email) {
        await Purchases.setEmail(email);
      }
      return;
    }

    const apiKey = Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
      : Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
        : null;

    if (!apiKey) {
      console.warn(`RevenueCat API key not found for platform: ${Platform.OS}`);
      return;
    }

    await Purchases.configure({
      apiKey,
      appUserID: backendUserId.toString(),
    });

    if (email) {
      await Purchases.setEmail(email);
    }

  } catch (error) {
    console.error('Error configuring RevenueCat:', error);
  }
};

type BackendUserResponse = {
  user_id: number;
  email: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  picture?: string;
  backendUserId?: number;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  forceLogout: () => Promise<void>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const auth0ClientId = auth0Config.clientId;
const auth0Domain = `https://${auth0Config.domain}`;

const getRedirectUri = () => {
  if (__DEV__) {
    return makeRedirectUri({
      scheme: 'com.patrimore.patrimore',
      path: 'auth0-callback',
      preferLocalhost: false
    });
  } else {
    return makeRedirectUri({
      scheme: 'com.patrimore.patrimore',
      path: 'auth0-callback'
    });
  }
};

const redirectUri = getRedirectUri();

const discovery = {
  authorizationEndpoint: `${auth0Domain}/authorize`,
  tokenEndpoint: `${auth0Domain}/oauth/token`,
  userInfoEndpoint: `${auth0Domain}/userinfo`,
  revocationEndpoint: `${auth0Domain}/oauth/revoke`
};

const validateWithBackend = async (token: string): Promise<BackendUserResponse> => {
  try {
    const baseUrl = config.apiBaseUrl;

    // Try to get device info but don't let it break auth
    let deviceInfo: Awaited<ReturnType<typeof getDeviceInfo>> | null = null;
    try {
      await requestPushPermissions();
      deviceInfo = await getDeviceInfo();
    } catch (error) {
      console.warn('Failed to get device info:', error);
    }

    // Build request options
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };

    // Only add body if we have device info
    if (deviceInfo) {
      requestOptions.body = JSON.stringify({
        device: {
          platform: deviceInfo.platform,
          device_model: deviceInfo.device_model,
          os_version: deviceInfo.os_version,
          app_version: deviceInfo.app_version,
          ...(deviceInfo.push_token && { push_token: deviceInfo.push_token })
        }
      });
    }

    const response = await fetch(`${baseUrl}/api/v2/auth/validate`, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend validation failed:', response.status, errorText);
      throw new Error(`Backend validation failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend validation error:', error);
    throw error;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authPromiseResolve, setAuthPromiseResolve] = useState<((value: boolean) => void) | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: auth0ClientId,
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
      scopes: ['openid', 'profile', 'email'],
      usePKCE: false,
      extraParams: {
        nonce: 'nonce',
        display: 'touch',
        prompt: 'login',
        ui_locales: 'es',
        screen_hint: 'login',
        mode: 'mobile',
        layout: 'responsive'
      } as AuthSession.AuthRequestConfig['extraParams'],
    } as AuthSession.AuthRequestConfig,
    discovery
  );

  useEffect(() => {
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');

        if (token) {
          setAccessToken(token);

          const userInfo = await fetchUserInfo(token);

          try {
            const backendUser = await validateWithBackend(token);

            const completeUser = {
              ...userInfo,
              backendUserId: backendUser.user_id,
            };
            setUser(completeUser);

            await initializeRevenueCat(backendUser.user_id, userInfo.email);
          } catch (error) {
            await logout();
          }
        } else {
        }
      } catch (error) {
        await logout();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleAuthResponse(access_token).then((success) => {
        if (authPromiseResolve) {
          authPromiseResolve(success);
          setAuthPromiseResolve(null);
        }
        setIsAuthenticating(false);
      });
    } else if (response?.type === 'error') {
      console.error('Auth response error:', response.error);
      setLoading(false);
      setIsAuthenticating(false);
      if (authPromiseResolve) {
        authPromiseResolve(false);
        setAuthPromiseResolve(null);
      }
    }
  }, [response, authPromiseResolve]);

  const handleAuthResponse = async (access_token: string): Promise<boolean> => {
    setError(null);
    try {

      const jwtParts = access_token.split('.');

      if (jwtParts.length === 3) {
        try {
          const header = JSON.parse(atob(jwtParts[0]));
          const payload = JSON.parse(atob(jwtParts[1]));
        } catch (e) {
        }
      } else {
      }

      await AsyncStorage.setItem('auth_token', access_token);

      // Also save to SecureStore if biometric is enabled
      const isBiometricEnabled = await SecureStorageService.isBiometricEnabled();
      if (isBiometricEnabled) {
        await SecureStorageService.setAuthToken(access_token);
      }

      setAccessToken(access_token);

      const userInfo = await fetchUserInfo(access_token);

      try {
        const backendUser = await validateWithBackend(access_token);

        const completeUser: User = {
          ...userInfo,
          backendUserId: backendUser.user_id,
        };

        setUser(completeUser);
        await AsyncStorage.setItem('backend_user_data', JSON.stringify(backendUser));

        // Set OneSignal external user ID
        if (backendUser.user_id) {
          await setOneSignalExternalUserId(backendUser.user_id.toString());
        }

        await initializeRevenueCat(backendUser.user_id, userInfo.email);

        try {
          await AsyncStorage.setItem('splash_seen', 'true');
        } catch { }
        return true;
      } catch (error) {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('backend_user_data');
        setUser(null);
        setAccessToken(null);
        setError('Error de validación con el servidor. Por favor, intenta de nuevo.');
        return false;
      }
    } catch (error) {
      setUser(null);
      setAccessToken(null);
      setError('Error al procesar la autenticación. Por favor, intenta de nuevo.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch(`${auth0Domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const userInfo = await response.json();
      return {
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      };
    } catch (error) {
      throw error;
    }
  };

  const login = async (): Promise<boolean> => {
    if (isAuthenticating) {
      console.warn('Authentication already in progress, ignoring duplicate call');
      return false;
    }

    setIsAuthenticating(true);
    setLoading(true);
    setError(null);

    try {
      const authPromise = new Promise<boolean>((resolve) => {
        setAuthPromiseResolve(() => resolve);
      });

      const result = await promptAsync();

      if (result.type === 'success') {
        return await authPromise;
      } else if (result.type === 'cancel') {
        setAuthPromiseResolve(null);
        return false;
      } else {
        setError('Error durante el proceso de autenticación');
        setAuthPromiseResolve(null);
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Error al abrir el navegador de autenticación');
      setAuthPromiseResolve(null);
      return false;
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('backend_user_data');
      await SecureStorageService.clearAll(); // Clear biometric tokens

      setUser(null);
      setAccessToken(null);
      setError(null);

      const logoutUrl = `${auth0Domain}/v2/logout?client_id=${auth0ClientId}&returnTo=${encodeURIComponent(redirectUri)}`;
      await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUri);

      try {
        await Purchases.logOut();
      } catch (error) {
        console.warn('RevenueCat logout failed:', error);
      }

      if (Platform.OS === 'android') {
        BackHandler.exitApp();
      } else {
        router.replace('/auth/webview');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const authTimeout = setTimeout(() => {
      setLoading(false);
      setError('Timeout: La autenticación tardó demasiado. Por favor, intenta de nuevo.');
    }, 120000);

    try {
      const authUrl = new URL(`${auth0Domain}/authorize`);
      const params: Record<string, string | undefined> = {
        client_id: auth0ClientId,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope: 'openid profile email',
        connection: 'google-oauth2',
        nonce: 'nonce',
        display: 'touch',
        prompt: 'login',
        ui_locales: 'es',
        screen_hint: 'login',
        mobile: '1',
        is_mobile: 'true',
        device: 'mobile',
        platform: 'mobile',
        desktop: 'false',
        responsive: 'true',
        touch: 'true',
        viewport: 'mobile'
      };

      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined)
      ) as Record<string, string>;

      const result = await WebBrowser.openAuthSessionAsync(
        `${authUrl}?${new URLSearchParams(filteredParams).toString()}`,
        redirectUri,
        {
          preferEphemeralSession: true,
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          createTask: false,
          showTitle: false,
          showInRecents: false,
          enableBarCollapsing: true
        }
      );

      if (result.type === 'success' && 'url' in result) {
        try {
          const url = new URL(result.url);
          if (!url.hash || url.hash.length < 2) {
            throw new Error('URL de respuesta inválida');
          }

          const params = new URLSearchParams(url.hash.substring(1));
          const access_token = params.get('access_token');

          if (!access_token || access_token.trim() === '') {
            throw new Error('Token de acceso no encontrado en la respuesta');
          }

          clearTimeout(authTimeout);
          return await handleAuthResponse(access_token);
        } catch (error) {
          clearTimeout(authTimeout);
          console.error('Error procesando respuesta de autenticación Google:', error);
          setError('Error al procesar la respuesta de autenticación. Por favor, intenta de nuevo.');
          return false;
        }
      } else if (result.type === 'cancel') {
        clearTimeout(authTimeout);
        setError('Autenticación cancelada por el usuario');
        return false;
      } else {
        clearTimeout(authTimeout);
        setError('Error al iniciar sesión con Google. Por favor, intenta de nuevo.');
        return false;
      }
    } catch (error) {
      clearTimeout(authTimeout);
      console.error('Google login error:', error);
      setError('Error al iniciar sesión con Google. Por favor, intenta de nuevo.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithApple = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const authTimeout = setTimeout(() => {
      setLoading(false);
      setError('Timeout: La autenticación tardó demasiado. Por favor, intenta de nuevo.');
    }, 120000);

    try {
      const authUrl = new URL(`${auth0Domain}/authorize`);
      const params: Record<string, string | undefined> = {
        client_id: auth0ClientId,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope: 'openid profile email',
        connection: 'apple',
        nonce: 'nonce',
        display: 'touch',
        prompt: 'login',
        ui_locales: 'es',
        screen_hint: 'login',
        mobile: '1',
        is_mobile: 'true',
        device: 'mobile',
        platform: 'mobile',
        desktop: 'false',
        responsive: 'true',
        touch: 'true',
        viewport: 'mobile'
      };

      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined)
      ) as Record<string, string>;

      authUrl.search = new URLSearchParams(filteredParams).toString();

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        redirectUri,
        {
          preferEphemeralSession: true,
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          createTask: false,
          showTitle: false,
          showInRecents: false,
          enableBarCollapsing: true
        }
      );

      if (result.type === 'success' && 'url' in result) {
        try {
          const url = new URL(result.url);
          if (!url.hash || url.hash.length < 2) {
            throw new Error('URL de respuesta inválida');
          }

          const params = new URLSearchParams(url.hash.substring(1));
          const access_token = params.get('access_token');

          if (!access_token || access_token.trim() === '') {
            throw new Error('Token de acceso no encontrado en la respuesta');
          }

          clearTimeout(authTimeout);
          return await handleAuthResponse(access_token);
        } catch (error) {
          clearTimeout(authTimeout);
          console.error('Error procesando respuesta de autenticación Apple:', error);
          setError('Error al procesar la respuesta de autenticación. Por favor, intenta de nuevo.');
          return false;
        }
      } else if (result.type === 'cancel') {
        clearTimeout(authTimeout);
        setError('Autenticación cancelada por el usuario');
        return false;
      } else {
        clearTimeout(authTimeout);
        setError('Error al iniciar sesión con Apple. Por favor, intenta de nuevo.');
        return false;
      }
    } catch (error) {
      clearTimeout(authTimeout);
      console.error('Apple login error:', error);
      setError('Error al iniciar sesión con Apple. Por favor, intenta de nuevo.');
      return false;
    } finally {
      setLoading(false);
    }
  };

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

        // Initialize RevenueCat with user data
        await initializeRevenueCat(backendUser.user_id, userInfo.email);

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

  const forceLogout = async () => {
    setLoading(true);

    try {
      setUser(null);
      setAccessToken(null);
      setError(null);
      setAuthPromiseResolve(null);

      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('backend_user_data');
      await SecureStorageService.clearAll(); // Clear biometric tokens

      const tokenCheck = await AsyncStorage.getItem('auth_token');
      const userDataCheck = await AsyncStorage.getItem('backend_user_data');

      if (tokenCheck || userDataCheck) {
        const allKeys = await AsyncStorage.getAllKeys();
        const authKeys = allKeys.filter(key =>
          key.includes('auth') ||
          key.includes('token') ||
          key.includes('user') ||
          key.includes('backend')
        );
        await AsyncStorage.multiRemove(authKeys);
      }

      try {
        await Purchases.logOut();
      } catch (error) {
        console.warn('RevenueCat logout failed:', error);
      }

      if (Platform.OS === 'android') {
        BackHandler.exitApp();
      } else {
        router.replace('/auth/webview');
      }
    } catch (error) {
      setUser(null);
      setAccessToken(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        accessToken,
        isAuthenticated: !!user,
        login,
        logout,
        forceLogout,
        loginWithGoogle,
        loginWithApple,
        loginWithBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
