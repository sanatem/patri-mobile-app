/**
 * useAuth0WebView Hook
 *
 * Manages the WebView-based Auth0 authentication flow.
 * Generates the authorize URL and handles the auth state.
 */

import { useState, useCallback, useMemo } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import { auth0Config } from '@/config/auth0.config';

export interface UseAuth0WebViewReturn {
  /** The Auth0 authorize URL */
  authUrl: string;
  /** The redirect URI */
  redirectUri: string;
  /** Whether the auth flow is in progress */
  isAuthenticating: boolean;
  /** Any error that occurred */
  error: string | null;
  /** Start the authentication process */
  startAuth: () => void;
  /** Reset the auth state */
  resetAuth: () => void;
  /** Clear any error */
  clearError: () => void;
}

export interface UseAuth0WebViewOptions {
  /** Optional connection to use (e.g., 'google-oauth2', 'apple') */
  connection?: string;
  /** Optional prompt type */
  prompt?: 'login' | 'consent' | 'select_account' | 'none';
  /** Optional screen hint */
  screenHint?: 'login' | 'signup';
}

/**
 * Generate the redirect URI for the auth flow
 */
const getRedirectUri = (): string => {
  if (__DEV__) {
    return makeRedirectUri({
      scheme: 'com.patrimore.patrimore',
      path: 'auth0-callback',
      preferLocalhost: false,
    });
  }
  return makeRedirectUri({
    scheme: 'com.patrimore.patrimore',
    path: 'auth0-callback',
  });
};

/**
 * Hook for managing WebView-based Auth0 authentication
 */
export function useAuth0WebView(
  options: UseAuth0WebViewOptions = {}
): UseAuth0WebViewReturn {
  const { connection, prompt = 'login', screenHint = 'login' } = options;

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUri = useMemo(() => getRedirectUri(), []);

  /**
   * Generate the Auth0 authorize URL
   */
  const authUrl = useMemo(() => {
    const auth0Domain = `https://${auth0Config.domain}`;
    const authUrl = new URL(`${auth0Domain}/authorize`);

    // NOTE: We intentionally do NOT include 'audience' here to match the regular login flow
    // The regular AuthProvider login also omits the audience parameter
    const params: Record<string, string> = {
      client_id: auth0Config.clientId || '',
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'openid profile email',
      nonce: `nonce-${Date.now()}`,
      display: 'touch',
      prompt,
      ui_locales: 'es',
      screen_hint: screenHint,
      // Mobile-specific params
      mobile: '1',
      is_mobile: 'true',
      device: 'mobile',
      platform: 'mobile',
      responsive: 'true',
      touch: 'true',
    };

    // Add connection if specified (for social logins)
    if (connection) {
      params.connection = connection;
    }

    // Add all params to URL
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        authUrl.searchParams.set(key, value);
      }
    });

    return authUrl.toString();
  }, [redirectUri, connection, prompt, screenHint]);

  /**
   * Start the authentication process
   */
  const startAuth = useCallback(() => {
    setIsAuthenticating(true);
    setError(null);
  }, []);

  /**
   * Reset the auth state
   */
  const resetAuth = useCallback(() => {
    setIsAuthenticating(false);
    setError(null);
  }, []);

  /**
   * Clear any error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    authUrl,
    redirectUri,
    isAuthenticating,
    error,
    startAuth,
    resetAuth,
    clearError,
  };
}
