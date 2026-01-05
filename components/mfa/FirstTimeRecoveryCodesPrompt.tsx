/**
 * FirstTimeRecoveryCodesPrompt Component
 *
 * Modal that prompts users to generate recovery codes after first-time MFA enrollment.
 * Shows when: mfa_enabled = true, enrolled = true, recovery_codes_remaining = null
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ShieldCheck, Key, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';

interface FirstTimeRecoveryCodesPromptProps {
  visible: boolean;
  onGenerate: () => Promise<void>;
  onSkip: () => void;
  isGenerating?: boolean;
}

export const FirstTimeRecoveryCodesPrompt: React.FC<FirstTimeRecoveryCodesPromptProps> = ({
  visible,
  onGenerate,
  onSkip,
  isGenerating = false,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <ShieldCheck size={48} color={Colors.success[500]} />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {t('mfa.recoveryCodes.firstTimeSetup.title')}
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            {t('mfa.recoveryCodes.firstTimeSetup.subtitle')}
          </Text>

          {/* Warning */}
          <View style={styles.warningContainer}>
            <AlertTriangle size={18} color={Colors.warning[600]} />
            <Text style={styles.warningText}>
              {t('mfa.recoveryCodes.firstTimeSetup.skipWarning')}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={
                isGenerating
                  ? t('common.loading')
                  : t('mfa.recoveryCodes.firstTimeSetup.generateButton', { defaultValue: 'Generate Backup Code' })
              }
              onPress={onGenerate}
              variant="primary"
              disabled={isGenerating}
              icon={
                isGenerating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Key size={18} color="white" />
                )
              }
            />
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              disabled={isGenerating}
            >
              <Text style={[styles.skipButtonText, isGenerating && styles.skipButtonTextDisabled]}>
                {t('mfa.recoveryCodes.firstTimeSetup.skipButton')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.gray[900],
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warning[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.warning[700],
    lineHeight: 18,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.gray[500],
  },
  skipButtonTextDisabled: {
    opacity: 0.5,
  },
});
