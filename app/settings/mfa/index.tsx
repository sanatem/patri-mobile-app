/**
 * MFA Settings Screen
 *
 * Allows users to enable/disable MFA and manage recovery codes.
 * - iOS: Simple logout approach (Auth0 handles enrollment on next login)
 * - Android: Uses in-app WebView to keep session alive when switching to authenticator app
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Key,
  RefreshCw,
  AlertTriangle,
  Info,
  RotateCcw,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/AuthProvider';
import { useMFA } from '@/hooks/mfa';
import { RecoveryCodesModal } from '@/components/mfa';
import { ConfirmModal } from '@/components/ui';

const MFA_ENROLLMENT_CREDENTIAL_KEY = 'mfa_setup_credential';

export default function MFASettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { forceLogout, accessToken } = useAuth();
  const {
    status,
    isLoading,
    isProcessing,
    error,
    newRecoveryCodes,
    enableMFA,
    disableMFA,
    regenerateRecoveryCodes,
    clearError,
    clearNewRecoveryCodes,
    fetchStatus,
  } = useMFA();

  const [showEnableConfirm, setShowEnableConfirm] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if user has enrolled by looking at factors array (more reliable than enrolled flag)
  const hasEnrolledFactors = status?.factors && status.factors.length > 0;
  const isEnrolled = status?.enrolled || hasEnrolledFactors;
  const isEnabled = status?.mfa_enabled && isEnrolled;
  const isPendingEnrollment = status?.mfa_enabled && !isEnrolled;

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      await fetchStatus();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Enable MFA - different flow for iOS vs Android
  const handleEnableMFA = async () => {
    setShowEnableConfirm(false);
    const success = await enableMFA();

    if (success) {
      if (Platform.OS === 'android') {
        // Android: Save token, force logout, navigate to in-app WebView
        if (accessToken) {
          await AsyncStorage.setItem(MFA_ENROLLMENT_CREDENTIAL_KEY, accessToken);
        }
        await forceLogout();
        router.replace('/auth/mfa-enrollment');
      } else {
        // iOS: Show message and force logout (no browser session)
        // User will complete MFA enrollment on next login via Auth0
        Alert.alert(
          t('mfa.setup.title'),
          t('mfa.setup.logoutMessage'),
          [
            {
              text: t('common.understood'),
              onPress: async () => {
                await forceLogout();
                router.replace('/');
              },
            },
          ]
        );
      }
    }
  };

  const handleDisableMFA = async () => {
    setShowDisableConfirm(false);
    const success = await disableMFA();
    if (success) {
      Alert.alert(
        t('mfa.disable.success'),
        t('mfa.disable.logoutMessage', { defaultValue: 'Two-factor authentication has been disabled for your account.' }),
        [
          {
            text: t('common.understood'),
            onPress: () => {
              fetchStatus();
            },
          },
        ]
      );
    }
  };

  const handleRegenerateRecoveryCodes = async () => {
    setShowRegenerateConfirm(false);
    const codes = await regenerateRecoveryCodes();
    if (codes && codes.length > 0) {
      setShowRecoveryCodes(true);
    }
  };

  const handleCloseRecoveryCodes = () => {
    setShowRecoveryCodes(false);
    clearNewRecoveryCodes();
  };

  // Handle pending enrollment - resume setup
  const handleResumeSetup = async () => {
    if (Platform.OS === 'android') {
      if (accessToken) {
        await AsyncStorage.setItem(MFA_ENROLLMENT_CREDENTIAL_KEY, accessToken);
      }
      await forceLogout();
      router.replace('/auth/mfa-enrollment');
    } else {
      await forceLogout();
    }
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert(t('common.error'), error, [
        { text: t('common.understood'), onPress: clearError },
      ]);
    }
  }, [error, clearError, t]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{t('mfa.title')}</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefreshStatus}
            disabled={isLoading || isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={Colors.primary[500]} />
            ) : (
              <RotateCcw size={20} color={Colors.primary[500]} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>{t('mfa.subtitle')}</Text>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>{t('mfa.status.checking')}</Text>
        </View>
      )}

      {/* Status Card */}
      {!isLoading && (
        <View style={styles.statusCard}>
          <View style={[
            styles.statusIconContainer,
            isEnabled ? styles.statusIconEnabled : styles.statusIconDisabled
          ]}>
            {isEnabled ? (
              <ShieldCheck size={32} color={Colors.success[500]} />
            ) : (
              <ShieldAlert size={32} color={Colors.gray[400]} />
            )}
          </View>
          <Text style={styles.statusTitle}>
            {isEnabled ? t('mfa.status.enabled') : t('mfa.status.disabled')}
          </Text>
          {isPendingEnrollment && (
            <View style={styles.pendingBadge}>
              <Info size={14} color={Colors.warning[600]} />
              <Text style={styles.pendingText}>{t('mfa.status.pendingEnrollment')}</Text>
            </View>
          )}
        </View>
      )}

      {/* Pending Enrollment Info */}
      {!isLoading && isPendingEnrollment && (
        <View style={styles.section}>
          <View style={styles.infoBox}>
            <Info size={16} color={Colors.warning[600]} />
            <Text style={styles.infoTextWarning}>
              {t('mfa.pending.description', { defaultValue: 'MFA is enabled but not yet set up. Complete the setup to secure your account.' })}
            </Text>
          </View>

          <View style={[styles.infoBox, { marginTop: 8, backgroundColor: Colors.primary[50] }]}>
            <Info size={16} color={Colors.primary[500]} />
            <Text style={styles.infoText}>
              {t('mfa.pending.refreshHint', { defaultValue: 'If you already completed MFA setup, tap the refresh button above to update the status.' })}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.resumeButton}
            onPress={handleResumeSetup}
            disabled={isProcessing}
          >
            <Smartphone size={20} color="white" />
            <Text style={styles.resumeButtonText}>
              {t('mfa.pending.resumeSetup', { defaultValue: 'Complete Setup' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelSetupButton}
            onPress={() => setShowDisableConfirm(true)}
            disabled={isProcessing}
          >
            <Text style={styles.cancelSetupButtonText}>
              {t('mfa.pending.cancelSetup', { defaultValue: 'Cancel Setup' })}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Enable/Disable Toggle Section */}
      {!isLoading && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Smartphone size={20} color={Colors.gray[600]} />
            <Text style={styles.sectionTitle}>{t('mfa.methods.totp.title')}</Text>
          </View>

          <View style={styles.toggleCard}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>{t('mfa.setup.authenticatorApp')}</Text>
              <Text style={styles.toggleDescription}>
                {t('mfa.methods.totp.description')}
              </Text>
            </View>
            <Switch
              value={status?.mfa_enabled || false}
              onValueChange={(value) => {
                if (value) {
                  setShowEnableConfirm(true);
                } else {
                  setShowDisableConfirm(true);
                }
              }}
              disabled={isProcessing}
              trackColor={{
                false: Colors.gray[300],
                true: Colors.primary[500],
              }}
              thumbColor="white"
            />
          </View>

          <View style={styles.infoBox}>
            <Info size={16} color={Colors.primary[500]} />
            <Text style={styles.infoText}>
              {t('mfa.setup.step1.description')}
            </Text>
          </View>
        </View>
      )}

      {/* Recovery Codes Section */}
      {!isLoading && isEnabled && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Key size={20} color={Colors.gray[600]} />
            <Text style={styles.sectionTitle}>
              {t('mfa.recoveryCodes.titleSingle', { defaultValue: 'Backup Code' })}
            </Text>
          </View>

          {/* Status indicator */}
          <View style={styles.recoveryCard}>
            {(status?.recovery_codes_remaining ?? 0) > 0 ? (
              <View style={styles.recoveryStatusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.recoveryStatusText}>
                  {t('mfa.recoveryCodes.hasBackupCode', { defaultValue: 'You have a backup code saved' })}
                </Text>
              </View>
            ) : (
              <View style={styles.recoveryStatusRow}>
                <View style={[styles.statusDot, styles.statusDotWarning]} />
                <Text style={styles.recoveryStatusTextWarning}>
                  {t('mfa.recoveryCodes.noBackupCode', { defaultValue: 'No backup code available' })}
                </Text>
              </View>
            )}
          </View>

          {/* Info text */}
          <View style={styles.infoBox}>
            <Info size={16} color={Colors.gray[500]} />
            <Text style={styles.infoTextMuted}>
              {t('mfa.recoveryCodes.infoSingle', { defaultValue: 'Your backup code can be used once to access your account if you lose your phone. Generating a new code will replace the previous one.' })}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowRegenerateConfirm(true)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={Colors.primary[500]} />
            ) : (
              <RefreshCw size={20} color={Colors.primary[500]} />
            )}
            <Text style={styles.actionButtonText}>
              {(status?.recovery_codes_remaining ?? 0) > 0
                ? t('mfa.recoveryCodes.regenerateSingle', { defaultValue: 'Generate New Code' })
                : t('mfa.recoveryCodes.generateSingle', { defaultValue: 'Generate Backup Code' })
              }
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      )}

      {/* Confirm Enable Modal */}
      <ConfirmModal
        visible={showEnableConfirm}
        onClose={() => setShowEnableConfirm(false)}
        onConfirm={handleEnableMFA}
        title={t('mfa.setup.title')}
        message={t('mfa.setup.confirmMessage')}
        confirmButtonText={t('mfa.setup.confirmButton')}
        cancelButtonText={t('common.cancel')}
      />

      {/* Confirm Disable Modal */}
      <ConfirmModal
        visible={showDisableConfirm}
        onClose={() => setShowDisableConfirm(false)}
        onConfirm={handleDisableMFA}
        title={t('mfa.disable.title')}
        message={t('mfa.disable.warning')}
        confirmButtonText={t('mfa.disable.confirm')}
        cancelButtonText={t('common.cancel')}
        isDestructive
      />

      {/* Confirm Regenerate Modal */}
      <ConfirmModal
        visible={showRegenerateConfirm}
        onClose={() => setShowRegenerateConfirm(false)}
        onConfirm={handleRegenerateRecoveryCodes}
        title={t('mfa.recoveryCodes.regenerate')}
        message={t('mfa.recoveryCodes.regenerateWarning')}
        confirmButtonText={t('mfa.recoveryCodes.regenerateConfirm')}
        cancelButtonText={t('common.cancel')}
        isDestructive
      />

      {/* Recovery Codes Modal */}
      {newRecoveryCodes && (
        <RecoveryCodesModal
          visible={showRecoveryCodes}
          onClose={handleCloseRecoveryCodes}
          codes={newRecoveryCodes}
          isNewCodes
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: 'white',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginLeft: -8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  refreshButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 40,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.gray[600],
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconEnabled: {
    backgroundColor: Colors.success[50],
  },
  statusIconDisabled: {
    backgroundColor: Colors.gray[100],
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
    textAlign: 'center',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    gap: 6,
  },
  pendingText: {
    fontSize: 12,
    color: Colors.warning[700],
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: Colors.gray[600],
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary[50],
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary[700],
    lineHeight: 18,
  },
  infoTextWarning: {
    flex: 1,
    fontSize: 13,
    color: Colors.warning[700],
    lineHeight: 18,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[500],
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  resumeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  cancelSetupButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  cancelSetupButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.gray[600],
  },
  recoveryCard: {
    backgroundColor: Colors.gray[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  recoveryStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success[500],
  },
  statusDotWarning: {
    backgroundColor: Colors.warning[500],
  },
  recoveryStatusText: {
    fontSize: 14,
    color: Colors.gray[700],
    fontWeight: '500',
  },
  recoveryStatusTextWarning: {
    fontSize: 14,
    color: Colors.warning[700],
    fontWeight: '500',
  },
  infoTextMuted: {
    flex: 1,
    fontSize: 13,
    color: Colors.gray[600],
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary[500],
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary[500],
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
