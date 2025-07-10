import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { makeRedirectUri } from 'expo-auth-session';
import { auth0Config } from '@/config/auth0.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

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
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
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
      scheme: 'exp',
      path: 'auth0-callback',
      preferLocalhost: false
    });
  } else {
    return makeRedirectUri({
      scheme: 'com.patrimore.app',
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
    const response = await fetch('https://staging.patrimore.com/api/v2/auth/validate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

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
            setUser({
              ...userInfo,
              backendUserId: backendUser.user_id,
            });
          } catch (error) {
            await logout();
          }
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
      handleAuthResponse(access_token);
    } else if (response?.type === 'error') {
      console.error('Auth response error:', response.error);
      setLoading(false);
    }
  }, [response]);

  const handleAuthResponse = async (access_token: string): Promise<boolean> => {
    setError(null);
    try {
      await AsyncStorage.setItem('auth_token', access_token);
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
    setLoading(true);
    setError(null);
    try {
      const authUrl = new URL(`${auth0Domain}/authorize`);
      const params = new URLSearchParams({
        client_id: auth0ClientId,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope: 'openid profile email',
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
      });
      authUrl.search = params.toString();

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        redirectUri,
        {
          preferEphemeralSession: true,
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          createTask: false,
          showTitle: false,
          showInRecents: false,
          enableBarCollapsing: true,
          windowFeatures: {
            'viewport': 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
            'mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-status-bar-style': 'default',
            'format-detection': 'telephone=no',
            'msapplication-tap-highlight': 'no',
            'user-scalable': 'no',
            'shrink-to-fit': 'no'
          }
        }
      );

      if (result.type === 'success' && 'url' in result) {
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));
        const access_token = params.get('access_token');
        if (access_token) {
          return await handleAuthResponse(access_token);
        }
      }
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('backend_user_data');
      setUser(null);
      setAccessToken(null);

      const logoutUrl = `${auth0Domain}/v2/logout?client_id=${auth0ClientId}&returnTo=${encodeURIComponent(redirectUri)}`;
      await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUri);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const authUrl = new URL(`${auth0Domain}/authorize`);
      const params = new URLSearchParams({
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
      });
      authUrl.search = params.toString();

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        redirectUri,
        {
          preferEphemeralSession: true,
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          createTask: false,
          showTitle: false,
          showInRecents: false,
          enableBarCollapsing: true,
          windowFeatures: {
            'viewport': 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
            'mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-status-bar-style': 'default',
            'format-detection': 'telephone=no',
            'msapplication-tap-highlight': 'no',
            'user-scalable': 'no',
            'shrink-to-fit': 'no'
          }
        }
      );

      if (result.type === 'success' && 'url' in result) {
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));
        const access_token = params.get('access_token');
        if (access_token) {
          return await handleAuthResponse(access_token);
        }
      }
      setError('Error al iniciar sesión con Google. Por favor, intenta de nuevo.');
      return false;
    } catch (error) {
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
    try {
      const authUrl = new URL(`${auth0Domain}/authorize`);
      const params = new URLSearchParams({
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
      });
      authUrl.search = params.toString();

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        redirectUri,
        {
          preferEphemeralSession: true,
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          createTask: false,
          showTitle: false,
          showInRecents: false,
          enableBarCollapsing: true,
          windowFeatures: {
            'viewport': 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
            'mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-status-bar-style': 'default',
            'format-detection': 'telephone=no',
            'msapplication-tap-highlight': 'no',
            'user-scalable': 'no',
            'shrink-to-fit': 'no'
          }
        }
      );

      if (result.type === 'success' && 'url' in result) {
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));
        const access_token = params.get('access_token');
        if (access_token) {
          return await handleAuthResponse(access_token);
        }
      }
      setError('Error al iniciar sesión con Apple. Por favor, intenta de nuevo.');
      return false;
    } catch (error) {
      console.error('Apple login error:', error);
      setError('Error al iniciar sesión con Apple. Por favor, intenta de nuevo.');
      return false;
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
        loginWithGoogle,
        loginWithApple,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};