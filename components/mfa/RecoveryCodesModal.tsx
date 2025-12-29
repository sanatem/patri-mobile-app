/**
 * RecoveryCodesModal Component
 *
 * Modal that displays recovery code to the user.
 * Shows a single recovery code that can be copied.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import { Copy, AlertTriangle, Check, ShieldCheck } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';

interface RecoveryCodesModalProps {
  visible: boolean;
  onClose: () => void;
  codes: string[];
  isNewCodes?: boolean;
}

export const RecoveryCodesModal: React.FC<RecoveryCodesModalProps> = ({
  visible,
  onClose,
  codes,
  isNewCodes = false,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Get the single code (we only have 1 now)
  const code = codes[0] || '';

  const handleCopyCode = () => {
    try {
      Clipboard.setString(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert(t('common.error'), t('mfa.recoveryCodes.copyError'));
    }
  };

  const handleSavedCode = () => {
    Alert.alert(
      t('mfa.recoveryCodes.confirmSaved.title', { defaultValue: 'Did you save your code?' }),
      t('mfa.recoveryCodes.confirmSaved.message', { defaultValue: 'Make sure you\'ve saved this code somewhere safe. You won\'t be able to see it again.' }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('mfa.recoveryCodes.confirmSaved.confirm', { defaultValue: 'Yes, I saved it' }),
          onPress: onClose,
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSavedCode}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <ShieldCheck size={32} color={Colors.success[500]} />
            </View>
            <Text style={styles.title}>
              {t('mfa.recoveryCodes.title')}
            </Text>
          </View>

          {/* Warning */}
          {isNewCodes && (
            <View style={styles.warningContainer}>
              <AlertTriangle size={18} color={Colors.warning[600]} />
              <Text style={styles.warningText}>
                {t('mfa.recoveryCodes.saveWarningSingle', { defaultValue: 'Save this code now! You won\'t be able to see it again.' })}
              </Text>
            </View>
          )}

          {/* Description */}
          <Text style={styles.description}>
            {t('mfa.recoveryCodes.subtitleSingle', { defaultValue: 'Use this code to access your account if you lose your phone or can\'t use your authenticator app.' })}
          </Text>

          {/* Single Code Display */}
          <TouchableOpacity
            style={styles.codeContainer}
            onPress={handleCopyCode}
            activeOpacity={0.7}
          >
            <Text style={styles.codeText}>{code}</Text>
            <View style={styles.copyButton}>
              {copied ? (
                <Check size={20} color={Colors.success[500]} />
              ) : (
                <Copy size={20} color={Colors.primary[500]} />
              )}
              <Text style={[styles.copyText, copied && styles.copyTextSuccess]}>
                {copied
                  ? t('mfa.recoveryCodes.codeCopied', { defaultValue: 'Copied!' })
                  : t('mfa.recoveryCodes.tapToCopy', { defaultValue: 'Tap to copy' })
                }
              </Text>
            </View>
          </TouchableOpacity>

          {/* Warning about single use */}
          <Text style={styles.warningNote}>
            {t('mfa.recoveryCodes.warningSingle', { defaultValue: 'This code can only be used once.' })}
          </Text>

          {/* Action Button */}
          <View style={styles.actions}>
            <Button
              title={t('mfa.recoveryCodes.iSavedMyCode', { defaultValue: 'I saved my code' })}
              onPress={handleSavedCode}
              variant="primary"
              icon={<Check size={18} color="white" />}
            />
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
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.success[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray[900],
    textAlign: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10,
    width: '100%',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.warning[700],
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  codeContainer: {
    backgroundColor: Colors.gray[50],
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  codeText: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: Colors.gray[900],
    letterSpacing: 2,
    marginBottom: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyText: {
    fontSize: 13,
    color: Colors.primary[500],
    fontWeight: '500',
  },
  copyTextSuccess: {
    color: Colors.success[500],
  },
  warningNote: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  actions: {
    width: '100%',
  },
});
