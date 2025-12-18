/**
 * Auth0WebView Component
 *
 * Renders Auth0 Universal Login in an in-app WebView.
 * This keeps the auth flow inside the app, so switching to the authenticator
 * app during MFA enrollment won't dismiss the login screen.
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { ArrowLeft, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

export interface Auth0WebViewProps {
  /** The Auth0 authorize URL */
  authUrl: string;
  /** The redirect URI to intercept */
  redirectUri: string;
  /** Called when authentication succeeds with the access token */
  onSuccess: (accessToken: string) => void;
  /** Called when user cancels the auth flow */
  onCancel: () => void;
  /** Called when an error occurs */
  onError: (error: Error) => void;
  /** Optional title to display in the header */
  title?: string;
}

export function Auth0WebView({
  authUrl,
  redirectUri,
  onSuccess,
  onCancel,
  onError,
  title,
}: Auth0WebViewProps) {
  const { t } = useTranslation();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Extract the auth0 domain from the authUrl for whitelist
  const auth0Domain = new URL(authUrl).hostname;

  /**
   * Handle navigation state changes to intercept the redirect
   */
  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const { url } = navState;

      // Check if this is our redirect URI
      if (url && url.startsWith(redirectUri)) {
        try {
          const parsedUrl = new URL(url);

          // Token is in the hash fragment for implicit flow
          const hashParams = new URLSearchParams(
            parsedUrl.hash.substring(1) // Remove the leading '#'
          );

          const accessToken = hashParams.get('access_token');
          const error = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');

          if (error) {
            onError(new Error(errorDescription || error));
            return;
          }

          if (accessToken) {
            onSuccess(accessToken);
            return;
          }

          // No token and no error - unexpected response
          onError(new Error(t('auth.webview.errors.noToken')));
        } catch (err) {
          onError(
            err instanceof Error
              ? err
              : new Error(t('auth.webview.errors.parseError'))
          );
        }
      }
    },
    [redirectUri, onSuccess, onError, t]
  );

  /**
   * Control which URLs the WebView can navigate to
   * Only allow Auth0 domain and the redirect URI scheme
   */
  const handleShouldStartLoadWithRequest = useCallback(
    (request: { url: string }) => {
      const { url } = request;

      // Always allow the redirect URI (to capture it)
      if (url.startsWith(redirectUri)) {
        return true;
      }

      // Allow Auth0 domain
      try {
        const urlHost = new URL(url).hostname;
        if (urlHost === auth0Domain || urlHost.endsWith('.auth0.com')) {
          return true;
        }
      } catch {
        // Invalid URL, block it
        return false;
      }

      // Allow social login domains
      const allowedDomains = [
        'accounts.google.com',
        'appleid.apple.com',
        'www.facebook.com',
        'login.microsoftonline.com',
      ];

      try {
        const urlHost = new URL(url).hostname;
        if (allowedDomains.some(domain => urlHost.includes(domain))) {
          return true;
        }
      } catch {
        return false;
      }

      // Block all other URLs for security
      return false;
    },
    [redirectUri, auth0Domain]
  );

  /**
   * Handle WebView load completion
   */
  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  /**
   * Handle WebView errors
   */
  const handleError = useCallback(
    (syntheticEvent: { nativeEvent: { description?: string } }) => {
      const { nativeEvent } = syntheticEvent;
      setHasError(true);
      setIsLoading(false);
      onError(new Error(nativeEvent.description || t('auth.webview.errors.loadFailed')));
    },
    [onError, t]
  );

  /**
   * Handle HTTP errors
   */
  const handleHttpError = useCallback(
    (syntheticEvent: { nativeEvent: { statusCode: number; description?: string } }) => {
      const { nativeEvent } = syntheticEvent;
      if (nativeEvent.statusCode >= 400) {
        setHasError(true);
        onError(
          new Error(
            `HTTP ${nativeEvent.statusCode}: ${nativeEvent.description || t('auth.webview.errors.httpError')}`
          )
        );
      }
    },
    [onError, t]
  );

  /**
   * Retry loading on error
   */
  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  const handleCancelPress = () => {
    console.log('[Auth0WebView] Cancel button pressed');
    onCancel();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCancelPress}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        >
          <ArrowLeft size={24} color={Colors.gray[700]} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || t('auth.webview.title')}
        </Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCancelPress}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        >
          <X size={24} color={Colors.gray[700]} />
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        {!hasError ? (
          <WebView
            ref={webViewRef}
            source={{ uri: authUrl }}
            style={styles.webView}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            onHttpError={handleHttpError}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            cacheEnabled={false}
            incognito={Platform.OS === 'ios'} // Fresh session on iOS
            // Security settings
            allowsBackForwardNavigationGestures={false}
            allowFileAccess={false}
            allowUniversalAccessFromFileURLs={false}
            mixedContentMode="never"
            // Android specific
            setSupportMultipleWindows={false}
            // Render loading indicator
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.secondary[500]} />
                <Text style={styles.loadingText}>
                  {t('auth.webview.loading')}
                </Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>
              {t('auth.webview.errors.title')}
            </Text>
            <Text style={styles.errorMessage}>
              {t('auth.webview.errors.message')}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              accessibilityRole="button"
              accessibilityLabel={t('common.retry')}
            >
              <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading overlay */}
        {isLoading && !hasError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.secondary[500]} />
            <Text style={styles.loadingText}>
              {t('auth.webview.loading')}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: 'white',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.gray[900],
    textAlign: 'center',
    marginHorizontal: 8,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
