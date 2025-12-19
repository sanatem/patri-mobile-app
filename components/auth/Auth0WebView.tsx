/**
 * Auth0WebView Component (Android only)
 *
 * In-app WebView for Auth0 login on Android.
 * Keeps the session alive when user switches to authenticator app.
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import { ArrowLeft, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export interface Auth0WebViewProps {
  authUrl: string;
  redirectUri: string;
  onSuccess: (accessToken: string) => void;
  onCancel: () => void;
  onError: (error: Error) => void;
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
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasHandledRedirect = useRef(false);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const { url } = navState;

      if (hasHandledRedirect.current) return;

      if (url && url.startsWith(redirectUri)) {
        hasHandledRedirect.current = true;

        try {
          const parsedUrl = new URL(url);
          const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const error = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');

          if (error) {
            onError(new Error(errorDescription || error));
          } else if (accessToken) {
            onSuccess(accessToken);
          } else {
            onError(new Error('No access token received'));
          }
        } catch (err) {
          onError(err instanceof Error ? err : new Error('Failed to parse response'));
        }
      }
    },
    [redirectUri, onSuccess, onError]
  );

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    onError(new Error('Failed to load page'));
  }, [onError]);

  if (!authUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid authentication URL</Text>
          <TouchableOpacity style={styles.button} onPress={onCancel}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'android' && (
        <StatusBar translucent backgroundColor="white" barStyle="dark-content" />
      )}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onCancel}>
          <ArrowLeft size={24} color={Colors.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || 'Sign In'}
        </Text>
        <TouchableOpacity style={styles.headerButton} onPress={onCancel}>
          <X size={24} color={Colors.gray[700]} />
        </TouchableOpacity>
      </View>

      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: authUrl }}
          style={styles.webView}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          originWhitelist={['*']}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.secondary[500]} />
            <Text style={styles.loadingText}>Loading...</Text>
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
    // On Android, SafeAreaView doesn't handle status bar - add padding manually
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
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
  },
  webView: {
    flex: 1,
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
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray[600],
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

