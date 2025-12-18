/**
 * MFA Enrollment Screen
 *
 * Platform-aware MFA enrollment:
 * - iOS/Android: Uses in-app WebView (keeps session alive when switching to authenticator app)
 * - Web: Uses expo-web-browser (WebView not supported on web)
 */

import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  AppState,
  AppStateStatus,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth0WebView } from '@/hooks/auth';
import { useAuth } from '@/providers/AuthProvider';
import { Auth0WebView } from '@/components/auth';
import { disableMFA } from '@/services/mfa';
import { ConfirmModal } from '@/components/ui';
import Colors from '@/constants/Colors';
import { ShieldCheck, X, RefreshCw } from 'lucide-react-native';

// Key for stored credential (must match the one in MFA settings)
// NOTE: Key must NOT contain 'token', 'auth', 'user', or 'backend' as forceLogout clears those
const MFA_ENROLLMENT_CREDENTIAL_KEY = 'mfa_setup_credential';

// Use WebView on native platforms (keeps session when switching apps)
// Use browser on web (WebView not supported)
const USE_WEBVIEW = Platform.OS === 'ios' || Platform.OS === 'android';

// Ensure auth session can complete (for web/browser flow)
WebBrowser.maybeCompleteAuthSession();

export default function MFAEnrollmentScreen() {
  const { t } = useTranslation();
  const { authUrl, redirectUri } = useAuth0WebView();
  const { refreshSessionWithToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showWebView, setShowWebView] = useState(USE_WEBVIEW);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Keep WebView visible when returning from authenticator app (iOS/Android only)
  useEffect(() => {
    if (!USE_WEBVIEW) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !isProcessing && !error) {
        setShowWebView(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isProcessing, error]);

  /**
   * Handle successful authentication (from WebView)
   */
  const handleWebViewSuccess = useCallback(async (accessToken: string) => {
    setIsProcessing(true);
    setShowWebView(false);

    try {
      // Clear the stored enrollment token - enrollment succeeded
      await AsyncStorage.removeItem(MFA_ENROLLMENT_CREDENTIAL_KEY);

      const success = await refreshSessionWithToken(accessToken);
      if (success) {
        router.replace('/(tabs)/patrimony');
      } else {
        throw new Error(t('auth.webview.errors.message'));
      }
    } catch (err) {
      console.error('[MFA Enrollment] Error processing token:', err);
      setError(err instanceof Error ? err.message : t('auth.webview.errors.message'));
      setIsProcessing(false);
    }
  }, [refreshSessionWithToken, t]);

  /**
   * Handle WebView error
   */
  const handleWebViewError = useCallback((err: Error) => {
    console.error('[MFA Enrollment] WebView error:', err);
    setShowWebView(false);
    setError(err.message || t('auth.webview.errors.message'));
  }, [t]);

  /**
   * Start the browser-based auth flow (for web platform)
   */
  const startBrowserAuthFlow = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setHasStarted(true);

    try {
      console.log('[MFA Enrollment] Starting browser auth flow');

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
        {
          preferEphemeralSession: false,
          showInRecents: true,
        }
      );

      console.log('[MFA Enrollment] Browser result:', result.type);

      if (result.type === 'success' && 'url' in result) {
        const url = new URL(result.url);
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const authError = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (authError) {
          throw new Error(errorDescription || authError);
        }

        if (!accessToken) {
          throw new Error(t('auth.webview.errors.noToken', { defaultValue: 'No access token received' }));
        }

        await AsyncStorage.removeItem(MFA_ENROLLMENT_CREDENTIAL_KEY);

        const success = await refreshSessionWithToken(accessToken);
        if (success) {
          router.replace('/(tabs)/patrimony');
        } else {
          throw new Error(t('auth.webview.errors.message'));
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        setIsProcessing(false);
        setError(t('auth.cancelledMessage', { defaultValue: 'Authentication was cancelled. You can try again or go back.' }));
      } else {
        throw new Error(t('auth.webview.errors.message'));
      }
    } catch (err) {
      console.error('[MFA Enrollment] Error:', err);
      setIsProcessing(false);
      setError(err instanceof Error ? err.message : t('auth.webview.errors.message'));
    }
  }, [authUrl, redirectUri, refreshSessionWithToken, t]);

  // Auto-start browser flow on web platform
  useEffect(() => {
    if (!USE_WEBVIEW && !hasStarted) {
      startBrowserAuthFlow();
    }
  }, [hasStarted, startBrowserAuthFlow]);

  /**
   * Cancel MFA enrollment and disable MFA
   */
  const cancelAndDisableMFA = async () => {
    console.log('[MFA Enrollment] ========== cancelAndDisableMFA START ==========');
    setIsCancelling(true);

    try {
      // Get the stored credential from before we logged out
      console.log('[MFA Enrollment] Getting stored credential...');
      const storedCredential = await AsyncStorage.getItem(MFA_ENROLLMENT_CREDENTIAL_KEY);
      console.log('[MFA Enrollment] Stored credential exists:', !!storedCredential);
      console.log('[MFA Enrollment] Credential length:', storedCredential?.length || 0);

      if (storedCredential) {
        console.log('[MFA Enrollment] Calling disableMFA API...');
        try {
          const result = await disableMFA(storedCredential);
          console.log('[MFA Enrollment] disableMFA SUCCESS:', JSON.stringify(result));
        } catch (disableError: any) {
          // Log but don't block - credential might be expired
          console.warn('[MFA Enrollment] disableMFA FAILED:', disableError?.message || disableError);
        }
        // Clear the stored credential
        await AsyncStorage.removeItem(MFA_ENROLLMENT_CREDENTIAL_KEY);
        console.log('[MFA Enrollment] Cleared stored credential');
      } else {
        console.log('[MFA Enrollment] No stored credential found - will just navigate away');
      }
    } catch (err: any) {
      console.error('[MFA Enrollment] Error during cancel:', err?.message || err);
    }

    // Always navigate away at the end
    console.log('[MFA Enrollment] Setting isCancelling to false and navigating...');
    setIsCancelling(false);
    console.log('[MFA Enrollment] Calling router.replace("/")...');
    router.replace('/');
    console.log('[MFA Enrollment] ========== cancelAndDisableMFA END ==========');
  };

  /**
   * Handle going back/cancel - works for both WebView and browser flows
   */
  const handleGoBack = () => {
    console.log('[MFA Enrollment] handleGoBack called');
    // Hide WebView and show confirm modal
    setShowWebView(false);
    setShowCancelConfirm(true);
  };

  /**
   * Handle cancel confirm - user pressed "No" (keep setup)
   */
  const handleCancelDismiss = () => {
    console.log('[MFA Enrollment] User dismissed cancel confirm');
    setShowCancelConfirm(false);
    // Show WebView again on native if user doesn't want to cancel
    if (USE_WEBVIEW && !error) {
      setShowWebView(true);
    }
  };

  /**
   * Handle cancel confirm - user pressed "Yes" (cancel setup)
   */
  const handleCancelConfirm = () => {
    console.log('[MFA Enrollment] User confirmed cancel - calling cancelAndDisableMFA');
    setShowCancelConfirm(false);
    cancelAndDisableMFA();
  };

  /**
   * Retry handler - different for WebView vs browser
   */
  const handleRetry = useCallback(() => {
    setError(null);
    if (USE_WEBVIEW) {
      setShowWebView(true);
    } else {
      setHasStarted(false);
    }
  }, []);

  // Show cancelling state
  if (isCancelling) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors.secondary[500]} />
          <Text style={styles.loadingText}>
            {t('mfa.enrollment.cancelling', { defaultValue: 'Cancelling MFA setup...' })}
          </Text>
        </View>
      </View>
    );
  }

  // Show processing state (after successful auth, before redirect)
  if (isProcessing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors.secondary[500]} />
          <Text style={styles.loadingText}>
            {t('auth.webview.processing', { defaultValue: 'Completing setup...' })}
          </Text>
        </View>
      </View>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <X size={24} color={Colors.gray[600]} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <ShieldCheck size={48} color={Colors.secondary[500]} />
          </View>

          <Text style={styles.title}>{t('mfa.enrollment.title')}</Text>

          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRetry}
          >
            <RefreshCw size={20} color="white" />
            <Text style={styles.primaryButtonText}>
              {t('common.retry', { defaultValue: 'Try Again' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoBack}
          >
            <Text style={styles.secondaryButtonText}>
              {t('mfa.enrollment.cancelConfirm', { defaultValue: 'Cancel Setup' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cancel Confirmation Modal */}
        <ConfirmModal
          visible={showCancelConfirm}
          onClose={handleCancelDismiss}
          onConfirm={handleCancelConfirm}
          title={t('mfa.enrollment.cancelTitle', { defaultValue: 'Cancel MFA Setup?' })}
          message={t('mfa.enrollment.cancelMessage', { defaultValue: 'This will disable two-factor authentication. You can enable it again later from settings.' })}
          confirmButtonText={t('mfa.enrollment.cancelConfirm', { defaultValue: 'Yes, Cancel' })}
          cancelButtonText={t('common.no')}
          isDestructive
        />
      </View>
    );
  }

  // NATIVE (iOS/Android): Show WebView in Modal
  if (USE_WEBVIEW) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Modal
          visible={showWebView}
          animationType="slide"
          presentationStyle="fullScreen"
          statusBarTranslucent
          hardwareAccelerated
          onRequestClose={handleGoBack}
        >
          <Auth0WebView
            authUrl={authUrl}
            redirectUri={redirectUri}
            onSuccess={handleWebViewSuccess}
            onCancel={handleGoBack}
            onError={handleWebViewError}
            title={t('mfa.enrollment.title')}
          />
        </Modal>

        {/* Cancel Confirmation Modal */}
        <ConfirmModal
          visible={showCancelConfirm}
          onClose={handleCancelDismiss}
          onConfirm={handleCancelConfirm}
          title={t('mfa.enrollment.cancelTitle', { defaultValue: 'Cancel MFA Setup?' })}
          message={t('mfa.enrollment.cancelMessage', { defaultValue: 'This will disable two-factor authentication. You can enable it again later from settings.' })}
          confirmButtonText={t('mfa.enrollment.cancelConfirm', { defaultValue: 'Yes, Cancel' })}
          cancelButtonText={t('common.no')}
          isDestructive
        />
      </View>
    );
  }

  // WEB: Show loading state while browser opens
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <TouchableOpacity
        style={styles.backButton}
        onPress={handleGoBack}
      >
        <X size={24} color={Colors.gray[600]} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ShieldCheck size={48} color={Colors.secondary[500]} />
        </View>

        <Text style={styles.title}>{t('mfa.enrollment.title')}</Text>

        <ActivityIndicator size="large" color={Colors.secondary[500]} style={styles.loader} />

        <Text style={styles.loadingText}>
          {t('mfa.enrollment.openingBrowser', { defaultValue: 'Opening secure login...' })}
        </Text>

        <Text style={styles.hintText}>
          {t('mfa.enrollment.browserHint', { defaultValue: 'Complete the setup in the browser that opens. You\'ll be redirected back automatically.' })}
        </Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleGoBack}
        >
          <Text style={styles.secondaryButtonText}>
            {t('common.cancel')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        visible={showCancelConfirm}
        onClose={handleCancelDismiss}
        onConfirm={handleCancelConfirm}
        title={t('mfa.enrollment.cancelTitle', { defaultValue: 'Cancel MFA Setup?' })}
        message={t('mfa.enrollment.cancelMessage', { defaultValue: 'This will disable two-factor authentication. You can enable it again later from settings.' })}
        confirmButtonText={t('mfa.enrollment.cancelConfirm', { defaultValue: 'Yes, Cancel' })}
        cancelButtonText={t('common.no')}
        isDestructive
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray[700],
    textAlign: 'center',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary[500],
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
    width: '100%',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: Colors.gray[600],
    fontSize: 16,
    fontWeight: '500',
  },
});
