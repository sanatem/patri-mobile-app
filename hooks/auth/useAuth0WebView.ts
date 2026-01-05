/**
 * useAuth0WebView Hook (Android only)
 *
 * Generates Auth0 authorize URL for in-app WebView.
 */

import { useMemo } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import { auth0Config } from '@/config/auth0.config';

export interface UseAuth0WebViewReturn {
  authUrl: string;
  redirectUri: string;
}

const getRedirectUri = (): string => {
  return makeRedirectUri({
    scheme: 'com.patrimore.patrimore',
    path: 'auth0-callback',
  });
};

export function useAuth0WebView(): UseAuth0WebViewReturn {
  const redirectUri = useMemo(() => getRedirectUri(), []);

  const authUrl = useMemo(() => {
    if (!auth0Config.domain || !auth0Config.clientId) {
      return '';
    }

    const url = new URL(`https://${auth0Config.domain}/authorize`);

    const params: Record<string, string> = {
      client_id: auth0Config.clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'openid profile email',
      nonce: `nonce-${Date.now()}`,
      prompt: 'login',
      ui_locales: 'es',
    };

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return url.toString();
  }, [redirectUri]);

  return { authUrl, redirectUri };
}

