/**
 * MFA Settings Screen
 *
 * Allows users to enable/disable MFA and manage recovery codes.
 * Auth0 handles the actual enrollment via Universal Login.
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
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/AuthProvider';
import { useMFA } from '@/hooks/mfa';
import { RecoveryCodesModal } from '@/components/mfa';
import { ConfirmModal } from '@/components/ui';

export default function MFASettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = useAuth();
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
  } = useMFA();

  const [showEnableConfirm, setShowEnableConfirm] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

  const isEnabled = status?.mfa_enabled && status?.enrolled;
  const isPendingEnrollment = status?.mfa_enabled && !status?.enrolled;

  // Handle enable MFA
  const handleEnableMFA = async () => {
    setShowEnableConfirm(false);
    const success = await enableMFA();
    if (success) {
      Alert.alert(
        t('mfa.setup.title'),
        t('mfa.setup.logoutMessage'),
        [
          {
            text: t('common.understood'),
            onPress: async () => {
              await logout();
            },
          },
        ]
      );
    }
  };

  // Handle disable MFA
  const handleDisableMFA = async () => {
    setShowDisableConfirm(false);
    const success = await disableMFA();
    if (success) {
      Alert.alert(
        t('mfa.disable.success'),
        t('mfa.disable.logoutMessage'),
        [
          {
            text: t('common.understood'),
            onPress: async () => {
              await logout();
            },
          },
        ]
      );
    }
  };

  // Handle regenerate recovery codes
  const handleRegenerateRecoveryCodes = async () => {
    setShowRegenerateConfirm(false);
    const codes = await regenerateRecoveryCodes();
    if (codes && codes.length > 0) {
      setShowRecoveryCodes(true);
    }
  };

  // Handle closing recovery codes modal
  const handleCloseRecoveryCodes = () => {
    setShowRecoveryCodes(false);
    clearNewRecoveryCodes();
  };

  // Show error alert
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

          {/* Info about authenticator apps */}
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
            <Text style={styles.sectionTitle}>{t('mfa.recoveryCodes.title')}</Text>
          </View>

          {/* Recovery codes count */}
          <View style={styles.recoveryCard}>
            <View style={styles.recoveryInfo}>
              <Text style={styles.recoveryCount}>
                {status?.recovery_codes_remaining || 0}
              </Text>
              <Text style={styles.recoveryLabel}>
                {(status?.recovery_codes_remaining || 0) === 1
                  ? t('mfa.recoveryCodes.oneCodeRemaining')
                  : t('mfa.recoveryCodes.codesRemaining', { count: status?.recovery_codes_remaining || 0 })}
              </Text>
            </View>

            {/* Warning if low codes */}
            {(status?.recovery_codes_remaining || 0) <= 2 && (
              <View style={styles.lowCodesWarning}>
                <AlertTriangle size={16} color={Colors.warning[600]} />
                <Text style={styles.lowCodesText}>
                  {t('mfa.recoveryCodes.lowCodesWarning')}
                </Text>
              </View>
            )}
          </View>

          {/* Regenerate button */}
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
              {t('mfa.recoveryCodes.regenerate')}
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
  recoveryCard: {
    backgroundColor: Colors.gray[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  recoveryInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  recoveryCount: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  recoveryLabel: {
    fontSize: 14,
    color: Colors.gray[600],
    marginTop: 4,
  },
  lowCodesWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning[50],
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  lowCodesText: {
    flex: 1,
    fontSize: 13,
    color: Colors.warning[700],
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

