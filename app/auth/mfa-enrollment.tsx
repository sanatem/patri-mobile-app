/**
 * MFA Enrollment Screen (Android only)
 *
 * Uses in-app WebView on Android to keep session alive when switching to authenticator app.
 * iOS users should not reach this screen - they use the simple logout flow.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth0WebView } from '@/hooks/auth';
import { useAuth } from '@/providers/AuthProvider';
import { Auth0WebView } from '@/components/auth';
import { disableMFA } from '@/services/mfa';
import { ConfirmModal } from '@/components/ui';
import Colors from '@/constants/Colors';
import { ShieldCheck, RefreshCw } from 'lucide-react-native';

const MFA_ENROLLMENT_CREDENTIAL_KEY = 'mfa_setup_credential';

export default function MFAEnrollmentScreen() {
  const { t } = useTranslation();
  const { authUrl, redirectUri } = useAuth0WebView();
  const { refreshSessionWithToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // iOS should not use this screen - redirect to home
  if (Platform.OS === 'ios') {
    router.replace('/');
    return null;
  }

  const handleSuccess = useCallback(async (accessToken: string) => {
    setIsProcessing(true);
    try {
      await AsyncStorage.removeItem(MFA_ENROLLMENT_CREDENTIAL_KEY);
      const success = await refreshSessionWithToken(accessToken);
      if (success) {
        router.replace('/(tabs)/patrimony');
      } else {
        throw new Error('Failed to complete setup');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsProcessing(false);
    }
  }, [refreshSessionWithToken]);

  const handleError = useCallback((err: Error) => {
    setError(err.message || 'An error occurred');
  }, []);

  const handleCancel = useCallback(() => {
    setShowCancelConfirm(true);
  }, []);

  const confirmCancel = async () => {
    setShowCancelConfirm(false);
    setIsCancelling(true);
    try {
      const storedCredential = await AsyncStorage.getItem(MFA_ENROLLMENT_CREDENTIAL_KEY);
      if (storedCredential) {
        try {
          await disableMFA(storedCredential);
        } catch {
          // Ignore - credential might be expired
        }
        await AsyncStorage.removeItem(MFA_ENROLLMENT_CREDENTIAL_KEY);
      }
    } catch {
      // Ignore errors during cancel
    }
    setIsCancelling(false);
    router.replace('/');
  };

  const dismissCancel = () => {
    setShowCancelConfirm(false);
  };

  const handleRetry = () => {
    setError(null);
  };

  if (isCancelling) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.secondary[500]} />
          <Text style={styles.text}>{t('mfa.enrollment.cancelling', { defaultValue: 'Cancelling...' })}</Text>
        </View>
      </View>
    );
  }

  if (isProcessing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.secondary[500]} />
          <Text style={styles.text}>{t('auth.webview.processing', { defaultValue: 'Completing setup...' })}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.center}>
          <ShieldCheck size={48} color={Colors.secondary[500]} />
          <Text style={styles.title}>{t('mfa.enrollment.title', { defaultValue: 'MFA Setup' })}</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
            <RefreshCw size={20} color="white" />
            <Text style={styles.primaryButtonText}>{t('common.retry', { defaultValue: 'Try Again' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel}>
            <Text style={styles.secondaryButtonText}>{t('common.cancel', { defaultValue: 'Cancel' })}</Text>
          </TouchableOpacity>
        </View>
        <ConfirmModal
          visible={showCancelConfirm}
          onClose={dismissCancel}
          onConfirm={confirmCancel}
          title={t('mfa.enrollment.cancelTitle', { defaultValue: 'Cancel MFA Setup?' })}
          message={t('mfa.enrollment.cancelMessage', { defaultValue: 'This will disable two-factor authentication.' })}
          confirmButtonText={t('mfa.enrollment.cancelConfirm', { defaultValue: 'Yes, Cancel' })}
          cancelButtonText={t('common.no', { defaultValue: 'No' })}
          isDestructive
        />
      </View>
    );
  }

  // Android: Use Modal with WebView to keep it alive when switching apps
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Modal visible={true} animationType="slide" onRequestClose={handleCancel}>
        <Auth0WebView
          authUrl={authUrl}
          redirectUri={redirectUri}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          onError={handleError}
          title={t('mfa.enrollment.title', { defaultValue: 'Set Up 2FA' })}
        />
      </Modal>
      <ConfirmModal
        visible={showCancelConfirm}
        onClose={dismissCancel}
        onConfirm={confirmCancel}
        title={t('mfa.enrollment.cancelTitle', { defaultValue: 'Cancel MFA Setup?' })}
        message={t('mfa.enrollment.cancelMessage', { defaultValue: 'This will disable two-factor authentication.' })}
        confirmButtonText={t('mfa.enrollment.cancelConfirm', { defaultValue: 'Yes, Cancel' })}
        cancelButtonText={t('common.no', { defaultValue: 'No' })}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: Colors.gray[600],
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error[600],
    textAlign: 'center',
    marginVertical: 16,
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
    marginTop: 16,
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
    marginTop: 8,
  },
  secondaryButtonText: {
    color: Colors.gray[600],
    fontSize: 16,
    fontWeight: '500',
  },
});

